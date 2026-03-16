import { type ComponentPublicInstance, type Ref, ref } from 'vue'
import { type Variadic } from '@/util/generic'

export type GenericElement = (abstract new (...args: any) => Element);
export type GenericComponent = (abstract new (...args: any) => any);

export type ValidRefItem = GenericElement | GenericComponent;
export type RefItemGeneric<T extends ValidRefItem> = T extends GenericElement ? InstanceType<T>
  : T extends GenericComponent ? InstanceType<T>
  : never;

type VueFunctionRefHandler = (element: null|Element|ComponentPublicInstance) => void;
export type WeakElement = WeakRef<Element|ComponentPublicInstance>;

export function isValidRefItem<T extends ValidRefItem>(
  value: unknown,
  type: T
): value is RefItemGeneric<T> {
  return isComponent(value, type) || isElement(value, type);
}

export function isElement<T extends GenericElement>(
  value: unknown,
  element_type: T
): value is RefItemGeneric<T> {
  return value instanceof element_type;
}

export function isComponent<T extends GenericComponent>(
  value: unknown,
  component: T
): value is RefItemGeneric<T> {
  return (typeof value === 'object') && value !== null &&
         '$' in value && typeof value.$ === 'object' && value.$ !== null &&
         'type' in value.$ && value.$.type === component;
}

export function toComponent<T extends GenericComponent>(
  weak: undefined|WeakElement,
  component: T
): undefined|RefItemGeneric<T> {
  const strong = weak?.deref();
  if (!isComponent(strong, component)) {
    return;
  }
  return strong;
}

export function toElement<T extends GenericElement>(
  weak: undefined|WeakElement,
  element_type: T
): undefined|RefItemGeneric<T> {
  const strong = weak?.deref();
  if (!isElement(strong, element_type)) {
    return;
  }
  return strong as RefItemGeneric<T>;
}

interface IFunctionRefRecord<TArgs extends Variadic> {
  handler: VueFunctionRefHandler;
  args: TArgs;
  element?: WeakElement;
}

interface IFunctionRef<TKey extends string|number|symbol, TArgs extends Variadic> {
  ref(element: undefined|WeakElement, key: TKey, ...args: TArgs): void;
}

export interface IUseFunctionRef<TKey extends string|number|symbol, TArgs extends Variadic> {
  ref(key: TKey, ...args: TArgs): VueFunctionRefHandler;

  /**
   * Returns the specified reference by `key` only when it derives from the type `item_type`.
   * Beware this matches any types that derive from `item_type` as well.
   *
   * @param key The reference key to find.
   * @param type The type the element must derive from to yield a result.
   */
  castItem<T extends ValidRefItem>(key: TKey, type: T): undefined|RefItemGeneric<T>;

  /**
   * Returns all elements that derives from the type `item_type`.
   * Beware this matches any types that derive from `item_type` as well.
   *
   * @param item_type The type the element must derive from to yield a result.
   */
  entries<T extends ValidRefItem>(item_type: T): Record<TKey, RefItemGeneric<T>>

  /**
   * `forEach` iterator for a specific subset of Element or Component types.
   * Beware this matches any types that derive from `item_type` as well.
   *
   * @param item_type The type the element must derive from to yield a result.
   * @param callback The callback to execute for each element found to derive from `item_type`.
   */
  forEach<T extends ValidRefItem>(item_type: T, callback: (item: RefItemGeneric<T>, key: TKey) => void): void;

  /**
   * `reduce` accumulator for a specific subset of Element or Component types.
   * Beware this matches types that derive from `item_type` as well.
   *
   * @param item_type The type the element must derive from to yield a result.
   * @param callback The callback to execute for each element found to derive from `item_type`.
   * @param initial_value The initial value for the accumulator.
   */
  reduce<U, T extends ValidRefItem>(item_type: T, callback: (result: U, component: RefItemGeneric<T>, key: TKey) => U, initial_value: U): U;
};

/**
 *
 * Example:
 * <script setup lang="ts">
 * // ...
 * const frames = useFunctionRef<string>();
 *
 * const my_components = useFunctionRef<string>([
 *   {
 *     ref(e: undefined|WeakElement, key: string): void {
 *       const comp = toComponent(e, MyComponent);
 *       if (!comp) {
 *         return;
 *       }
 *       // ...
 *     }
 *   }
 * ]);
 *
 * onMounted(() => {
 *   console.assert(frames.castItem('unique-frame', HTMLIFrameElement));
 *   console.assert(frames.castItem('unique-frame', HTMLElement));
 *   console.assert(!frames.castItem('unique-frame', HTMLParagraphElement));
 *
 *   const component_instance = my_components.castItem('unique-component', MyComponent);
 *   console.assert(component_instance);
 *   console.assert('an_exposed_var' in component_instance &&
 *                  component_instance.an_exposed_var instanceof ExpectedVarTypeExposedByMyComponent);
 *   console.assert(!my_components.castItem('unique-component', AnotherComponent));
 * })
 *
 * </script>
 * <template>
 *   <MyComponent :ref="my_components.ref('unique-component')" />
 *   <iframe :ref=frames.ref('unique-frame')></iframe>
 * </template>
 *
 * @param plugin_modules
 * @returns
 */
export default function useFunctionRef<
    TKey extends string|number|symbol,
    TArgs extends Variadic = []
>(plugin_modules?: IFunctionRef<TKey, TArgs>[]): IUseFunctionRef<TKey, TArgs> {
  const plugins = new Set<IFunctionRef<TKey, TArgs>>(plugin_modules);
  const records = ref({}) as Ref<Record<TKey, IFunctionRefRecord<TArgs>>>;

  function _ref(key: TKey, element?: null|Element|ComponentPublicInstance): void {
    const record: IFunctionRefRecord<TArgs> = records.value[key];
    const args: TArgs = records.value[key].args;
    record.element = (element) ? new WeakRef(element) : undefined;
    plugins.forEach(item => item.ref(record.element, key, ...args));
  }

  /**
   * Meant to be bound directly to a Vue `:ref`.
   *
   * e.g., A
   * setup: const function_ref = useFunctionRef<string>();
   * template: <MyComponent :ref="function_ref.ref('unique-ref-key')" />
   *
   * e.g., B
   * setup: const function_ref = useFunctionRef<DemoKey, [ShaderKey, string]>([
   *   {
   *     ref(e: undefined|WeakElement, demo_key: DemoKey, shader_key: ShaderKey, some_string: string): void {
   *       // ...
   *     }
   *   }
   * ]);
   * template: <MyComponent :ref="function_ref.ref('unique-ref-key', shader_key, 'foo')" />
   *
   * @param key caller provided unique key used to identify the reference.
   * @param args additional arguments to provide callbacks passed to `useFunctionRef`.
   * @returns The vue function ref handler to pass to an Element or Component  `v-bind:ref`.
   */
  function makeRef(key: TKey, ...args: TArgs): VueFunctionRefHandler {
    if (records.value[key] === undefined) {
      records.value[key] = { handler: _ref.bind(null, key), args };
    } else {
      records.value[key].args = args;
    }
    return records.value[key].handler;
  }

  function castItem<T extends ValidRefItem>(key: TKey, type: T): undefined|RefItemGeneric<T> {
    const strong = records.value[key]?.element?.deref();
    if (isComponent(strong, type) || isElement(strong, type)) {
      return strong as RefItemGeneric<T>;
    }
  }

  function forEach<T extends ValidRefItem>(item_type: T, callback: (item: RefItemGeneric<T>, key: TKey) => void): void {
    return (Object.keys(records.value) as TKey[]).forEach(
      (key: TKey) => {
        const item = castItem(key, item_type);
        if (item) {
          callback(item, key);
        }
      }
    );
  }

  function reduce<U, T extends ValidRefItem>(item_type: T, callback: (result: U, component: RefItemGeneric<T>, key: TKey) => U, initial_value: U): U {
    return (Object.keys(records.value) as TKey[]).reduce(
      (result: U, key: TKey): U => {
        const item = castItem(key, item_type);
        return (item !== undefined)
            ? callback(result, item, key)
            : result;
      },
      initial_value
    );
  }

  function entries<T extends ValidRefItem>(item_type: T): Record<TKey, RefItemGeneric<T>> {
    return reduce(item_type, (result, comp: InstanceType<typeof item_type>, key: TKey) => {
      result[key] = comp as RefItemGeneric<T>;
      return result;
    }, <Record<TKey, RefItemGeneric<T>>>{})
  }

  return {
    ref: makeRef,

    castItem,

    entries,
    forEach,
    reduce,
  };
}