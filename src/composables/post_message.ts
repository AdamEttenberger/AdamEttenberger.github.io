import { ref, type Ref } from 'vue'
import { fps } from '@/util/time'
import { throttle } from '@/util/rate_limit'
import { type Variadic, type VariadicFunction } from '@/util/generic'
import { FrameContainerSymbol, type IFrameContainer } from '@/types/frame_container'

export interface IUsePostMessage<TPayload, TArgs extends Variadic> {
  post: (frame: IFrameContainer, payload: TPayload, ...args: TArgs) => void;
};

class PostItem<TPayload> {
  constructor(public frame: WeakRef<HTMLIFrameElement>,
              public payload: TPayload) {}
}

export default function usePostMessage<
    TPayload,
    TCallbackArgs extends Variadic = []
>(
  callback?: VariadicFunction<[TPayload, ...TCallbackArgs]>,
  frequency_ms: number = fps(30)
): IUsePostMessage<TPayload, TCallbackArgs> {
  const records = ref({}) as Ref<Record<string, VariadicFunction<[PostItem<TPayload>, ...TCallbackArgs]>>>;

  function on_throttle(item: PostItem<TPayload>, ...args: TCallbackArgs): void {
    const frame = item.frame.deref();
    if (!frame) {
      return;
    }
    frame.contentWindow?.postMessage(JSON.parse(JSON.stringify(item.payload)), window.location.origin);
    callback?.(item.payload, ...args);
  }

  function post(frame: IFrameContainer, payload: TPayload, ...args: TCallbackArgs): void {
    if (!frame.inner_frame) {
      return;
    }
    let handler: undefined|VariadicFunction<[PostItem<TPayload>, ...TCallbackArgs]> = records.value[frame[FrameContainerSymbol]];
    if (!handler) {
      handler = throttle(on_throttle, frequency_ms);
      records.value[frame[FrameContainerSymbol]] = handler;
    }
    handler(new PostItem(new WeakRef(frame.inner_frame), payload), ...args);
  }

  return {
    post,
  }
}
