import { onBeforeUnmount, toValue, watch, type MaybeRefOrGetter, type WatchHandle } from 'vue'

type IntersectionObserverEntryCallback<TKey extends string|number|symbol> = (key: TKey, entry: IntersectionObserverEntry, index: number, array: IntersectionObserverEntry[]) => void;

interface IUseIntersectionObserver<TKey extends string|number|symbol> {
  observe(key: TKey, target_element: MaybeRefOrGetter<undefined|Element>): void;
}

export default function useIntersectionObserver<
    TKey extends string|number|symbol
>(
  entry_callback: IntersectionObserverEntryCallback<TKey>,
  observer_init?: IntersectionObserverInit
) : IUseIntersectionObserver<TKey> {
  const handles = <Record<TKey, WatchHandle>>{};
  const key_to_target = new Map<TKey, WeakRef<Element>>();
  const target_to_key = new WeakMap<Element, TKey>();

  function _on_observe_entry(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry, index, array) => {
      const key = target_to_key.get(entry.target);
      if (key === undefined) {
        return;
      }
      entry_callback(key, entry, index, array);
    });
  }

  const observer = new IntersectionObserver(_on_observe_entry, observer_init);

  function _observe(key: TKey, target_element?: Element) {
    const old_target = key_to_target.get(key)?.deref();
    if (old_target !== undefined) {
      if (target_element === old_target) {
        return;
      }
      key_to_target.delete(key);
      target_to_key.delete(old_target);
      observer.unobserve(old_target);
    }
    if (!target_element) {
      return;
    }

    key_to_target.set(key, new WeakRef(target_element));
    target_to_key.set(target_element, key);
    observer.observe(target_element);
  }

  function observe(key: TKey, target_element: MaybeRefOrGetter<undefined|Element>) {
    handles[key]?.stop();
    handles[key] = watch(() => toValue(target_element), _observe.bind(null, key), { immediate: true });
  }

  function disconnect() {
    Object.values<WatchHandle>(handles).forEach(x => x.stop());
    observer.disconnect();
  }

  onBeforeUnmount(disconnect);

  return {
    observe,
  };
};
