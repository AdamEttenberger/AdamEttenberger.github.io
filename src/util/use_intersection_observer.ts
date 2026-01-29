import { onUnmounted } from 'vue'

export type IntersectionObserverEntryCallback = (key: string, entry: IntersectionObserverEntry, index: number, array: IntersectionObserverEntry[]) => void;

export default function useIntersectionObserver(entry_callback: IntersectionObserverEntryCallback, observer_init?: IntersectionObserverInit) {
  const key_to_target = new Map();
  const target_to_key = new Map();

  const observer = new IntersectionObserver((entries, _observer) => {
      entries.forEach((entry, index, array) => {
        const key = target_to_key.get(entry.target);
        if (key === undefined) {
          return;
        }
        entry_callback.call(null, key, entry, index, array);
      });
    }, observer_init ?? undefined);

  function observe(key: any, target_element: Element) {
    const old_target = key_to_target.get(key);
    if (old_target !== undefined) {
      if (target_element === old_target) {
        return;
      }
      if (old_target !== null) {
        key_to_target.delete(key);
        target_to_key.delete(old_target);
        observer.unobserve(old_target);
      }
    }
    if (!target_element) {
      return;
    }

    key_to_target.set(key, target_element);
    target_to_key.set(target_element, key);
    observer.observe(target_element);
  }

  onUnmounted(() => {
    observer.disconnect();
  });

  return {
    observe,
  };
};
