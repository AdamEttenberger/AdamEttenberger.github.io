import { onBeforeMount, onBeforeUnmount, toValue, watch, type MaybeRefOrGetter, type WatchHandle } from 'vue'
import { type Store } from 'pinia'

export default function useLocalStorage() {
  const controller = new AbortController();
  const watch_handles = <WatchHandle[]>[];

  function _pull(store: Store): void {
    const cached_value = localStorage.getItem(store.$id);
    if (cached_value) {
      store.$state = JSON.parse(cached_value);
    } else {
      store.$reset();
    }
  }

  function _push(store: Store, predicate: MaybeRefOrGetter<boolean>): void {
    if (toValue(predicate)) {
      localStorage.setItem(store.$id, JSON.stringify(store.$state));
    } else {
      localStorage.removeItem(store.$id);
    }
  }

  function _on_storage_event(store: Store, event: StorageEvent): void {
    if (event.key && event.key !== store.$id) {
      return;
    }
    _pull(store);
  }

  /**
   * Conditionally binds a pinia store to the browser's localStorage.
   *
   * @param store The Pinia store to synchronize.
   * @param predicate Whether the store is allowed to write to local storage.
   */
  function bind(store: Store, predicate: MaybeRefOrGetter<boolean>): void {
    window.addEventListener('storage', _on_storage_event.bind(null, store), { signal: controller.signal });
    store.$subscribe(_push.bind(null, store, predicate));
    watch_handles.push(watch(() => toValue(predicate),
                             (new_state) => _push(store, new_state)));
    _pull(store);
  }

  onBeforeUnmount(() => {
    controller.abort();
    watch_handles.forEach((item) => item.stop());
    watch_handles.splice(0);
  });

  return {
    bind,
  }
}
