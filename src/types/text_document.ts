import { string_trimIndent } from '@/util/string'
import { computed, type MaybeRefOrGetter, ref, toValue, watch, onWatcherCleanup, isRef, onBeforeUnmount } from 'vue'

export interface ITextDocumentParam {
  file?: string|TextDocumentSourceFunc|AsyncDocumentLoader;
  content?: MaybeRefOrGetter<string>;
};

/**
 * Signature of the object returned when importing an asset file.
 * e.g., () => import('@/assets/path/to/file.text?raw')
 */
export type ImportAssetResponse = {
  [Symbol.toStringTag]: 'Module';
  default: string;
};
export type FetchPathGetterFunc = () => string;
export type AsyncStringGetterFunc = () => Promise<undefined|string>;
export type ImportAssetFunc = () => Promise<ImportAssetResponse>;
export type CancellableFetchFunc = (controller: AbortController) => Promise<Response>;
export type TextDocumentSourceFunc = FetchPathGetterFunc|AsyncStringGetterFunc|ImportAssetFunc|CancellableFetchFunc;

export type TextDocumentSource = string|ITextDocumentParam|TextDocumentSourceFunc|AsyncDocumentLoader;
export type TextDocumentResponse = undefined|string|Response|ImportAssetResponse;

export function isRawContents(value: unknown): value is string {
  return typeof value === 'string';
}

export function isPublicFileImportResponse(value: unknown): value is Response {
  return value instanceof Response;
}

export function isAssetFileImportResponse(value: unknown): value is ImportAssetResponse {
  return (typeof value === 'object' &&
          value !== null &&
          Symbol.toStringTag in value &&
          'default' in value &&
          value[Symbol.toStringTag] === 'Module' &&
          typeof value.default === 'string');
}

export class AsyncDocumentLoader {
  #cached_source: undefined|TextDocumentSource;
  #promise: Promise<TextDocumentResponse>;

  constructor(public source: MaybeRefOrGetter<undefined|TextDocumentSource>,
              public controller: AbortController = new AbortController()) {
    this.#promise = this.#ensure_promise();
  }

  #create_fetch(source: string): Promise<TextDocumentResponse> {
    return fetch(source, { signal: this.controller.signal });
  }

  #bad_request(context?: unknown): Promise<never> {
    console.error(context);
    return Promise.reject(new Error('bad request'));
  }

  #ensure_promise(): Promise<TextDocumentResponse> {
    const new_source = toValue(this.source);
    if (this.#cached_source === new_source) {
      return this.#promise;
    }
    this.#cached_source = new_source;

    const param: ITextDocumentParam = isTextDocumentParam(new_source) ? new_source : { file: new_source };
    if (param.file instanceof AsyncDocumentLoader) {
      this.#promise = param.file.content;
    } else if (typeof param.file === 'function') {
      const func_result = param.file(this.controller);
      if (func_result instanceof Promise) {
        this.#promise = func_result;
      } else if (typeof func_result === 'string') {
        this.#promise = this.#create_fetch(func_result);
      } else {
        this.#promise = this.#bad_request(new_source);
      }
    } else if (typeof param.file === 'string') {
      this.#promise = this.#create_fetch(param.file);
    } else if (param.content) {
      this.#promise = new Promise<undefined|string>((resolve) => { resolve(toValue(param.content)); });
    } else {
      this.#promise = this.#bad_request(new_source);
    }

    return this.#promise;
  }

  get response(): Promise<TextDocumentResponse> {
    return this.#ensure_promise();
  }

  get content(): Promise<undefined|string> {
    return this.response.then(async (response) => {
      let result: undefined|string;
      if (isAssetFileImportResponse(response)) {
        result = response.default;
      } else if (isPublicFileImportResponse(response)) {
        result = await response.text();
      } else if (isRawContents(response)) {
        result = string_trimIndent(response);
      }
      return result?.trimEnd();
    });
  }
};

export enum AsyncDocumentLoaderStatus {
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
  Empty = 'empty',
};

function isTextDocumentParam(value: unknown): value is ITextDocumentParam {
  return typeof value === 'object' && value !== null && (
          ('file' in value && (
            typeof value.file === 'string' ||
            typeof value.file === 'function' ||
            value.file instanceof AsyncDocumentLoader
          ))
          ||
          ('content' in value && (
            typeof value.content === 'string' ||
            typeof value.content === 'function' ||
            isRef<string>(value.content)
          ))
        );
}

export default function useTextDocument(input: MaybeRefOrGetter<undefined|TextDocumentSource>) {
  const controller = ref<AbortController>();
  const status = ref<AsyncDocumentLoaderStatus>(AsyncDocumentLoaderStatus.Loading);
  const content = ref<string>();
  const ready = computed<boolean>(() => status.value === AsyncDocumentLoaderStatus.Ready);

  function _is_current(loader: AsyncDocumentLoader): boolean {
    return !loader.controller.signal.aborted && loader.controller === controller.value;
  }

  const watch_handle = watch(() => toValue(input), (source: undefined|TextDocumentSource) => {
    if (!source) {
      status.value = AsyncDocumentLoaderStatus.Empty;
      return;
    }
    const loader: AsyncDocumentLoader = (source instanceof AsyncDocumentLoader)
        ? source
        : new AsyncDocumentLoader(source);

    controller.value = loader.controller;
    status.value = AsyncDocumentLoaderStatus.Loading;
    content.value = undefined;

    void loader.content.then((plaintext) => {
      content.value = string_trimIndent(plaintext);
    })
    .catch((reason: unknown) => {
      if (!_is_current(loader)) {
        return;
      }
      status.value = AsyncDocumentLoaderStatus.Error;
      console.error(reason);
    })
    .finally(() => {
      if (!_is_current(loader)) {
        return;
      }
      controller.value = undefined;
      if (status.value === AsyncDocumentLoaderStatus.Loading) {
        status.value = content.value?.length
            ? AsyncDocumentLoaderStatus.Ready
            : AsyncDocumentLoaderStatus.Empty;
      }
    });

    onWatcherCleanup(() => {
      loader.controller.abort();
    });
  }, { immediate: true });

  onBeforeUnmount(watch_handle);

  return {
    controller,
    status,
    ready,
    content,
  }
}