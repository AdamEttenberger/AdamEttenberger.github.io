import { type ComponentPublicInstance } from 'vue'
import { type Variadic } from '@/util/generic'

type VueFunctionRefHandler = (element: null|Element|ComponentPublicInstance) => void;
export type WeakElement = WeakRef<Element|ComponentPublicInstance>;

export function isElement<T extends typeof Element>(
  value: unknown,
  element_type: T
): value is InstanceType<T> {
  return value instanceof element_type;
}

export function isComponent<T extends abstract new (...args: any) => any>(
  value: unknown,
  component: T
): value is InstanceType<T> {
  return (typeof value === 'object') && value !== null &&
         '$' in value && typeof value.$ === 'object' && value.$ !== null &&
         'type' in value.$ && value.$.type === component;
}

export function toComponent<T extends abstract new (...args: any) => any>(
  weak: undefined|WeakElement,
  component: T
): undefined|ComponentPublicInstance<T> {
  const strong = weak?.deref();
  if (!isComponent(strong, component)) {
    return;
  }
  return strong;
}

export function toElement<T extends typeof Element>(
  weak: undefined|WeakElement,
  element_type: T
): undefined|InstanceType<T> {
  const strong = weak?.deref();
  if (!isElement(strong, element_type)) {
    return;
  }
  return strong as InstanceType<T>;
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
  asElement<T extends typeof Element>(key: TKey, element_type: T): undefined|InstanceType<T>;
  asComponent<T extends abstract new (...args: any) => any>(key: TKey, component: T): undefined|ComponentPublicInstance<T>;

  forEachComponent<T extends abstract new (...args: any) => any>(component: T, callback: (element: T) => void): void;
  forEachElement<T extends typeof Element>(element_type: T, callback: (element: InstanceType<T>) => void): void;
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
 *   console.assert(frames.asElement('unique-frame', HTMLIFrameElement));
 *   console.assert(frames.asElement('unique-frame', HTMLElement));
 *   console.assert(!frames.asElement('unique-frame', HTMLParagraphElement));
 *
 *   const component_instance = my_components.asComponent('unique-component', MyComponent);
 *   console.assert(component_instance);
 *   console.assert('an_exposed_var' in component_instance &&
 *                  component_instance.an_exposed_var instanceof ExpectedVarTypeExposedByMyComponent);
 *   console.assert(!my_components.asComponent('unique-component', AnotherComponent));
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
  const records = <Record<TKey, IFunctionRefRecord<TArgs>>>{};

  function _ref(key: TKey, element?: null|Element|ComponentPublicInstance): void {
    const record: IFunctionRefRecord<TArgs> = records[key];
    const args: TArgs = records[key].args;
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
  function ref(key: TKey, ...args: TArgs): VueFunctionRefHandler {
    if (records[key] === undefined) {
      records[key] = { handler: _ref.bind(null, key), args };
    } else {
      records[key].args = args;
    }
    return records[key].handler;
  }

  /**
   *
   * @param key The key of the function ref.
   * @param component The Vue component type demanded
   * @returns The held `component`, or undefined.
   */
  function asComponent<T extends abstract new (...args: any) => any>(key: TKey, component: T): undefined|ComponentPublicInstance<T> {
    return toComponent(records[key].element, component);
  }

  /**
   *
   * @param key The key of the function ref.
   * @param element_type The DOM Element type demanded
   * @returns The held `element_type`, or undefined.
   */
  function asElement<T extends typeof Element>(key: TKey, element_type: T): undefined|InstanceType<T> {
    return toElement(records[key].element, element_type);
  }

  function forEachComponent<T extends abstract new (...args: any) => any>(component: T, callback: (element: T) => void): void {
    (Object.keys(records) as TKey[]).forEach((key) => {
      const comp = asComponent(key, component);
      if (!comp) {
        return;
      }
      callback(comp);
    });
  }

  function forEachElement<T extends typeof Element>(element_type: T, callback: (element: InstanceType<T>) => void): void {
    (Object.keys(records) as TKey[]).forEach((key) => {
      const element = asElement(key, element_type);
      if (!element) {
        return;
      }
      callback(element);
    });
  }

  return {
    ref,
    asComponent,
    asElement,

    forEachElement,
    forEachComponent,
  };
}