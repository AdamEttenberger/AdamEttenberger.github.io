import { onScopeDispose, watch, unref } from 'vue'

export default class LocalStorageHelper {
  static pull(store: any): void {
    const cached_value = localStorage.getItem(store.$id);
    if (cached_value) {
      store.$state = JSON.parse(cached_value);
    } else {
      store.$reset();
    }
  }

  static push(store: any, prereq_ref): void {
    if (LocalStorageHelper.#eval_prereq(prereq_ref)) {
      localStorage.setItem(store.$id, JSON.stringify(store.$state));
    } else {
      localStorage.removeItem(store.$id);
    }
  }

  static bind(store: any, prereq_ref): void {
    var on_storage_event = (event) => {
      if (event.key && event.key !== store.$id) {
        return;
      }
      LocalStorageHelper.pull(store);
    };
    addEventListener('storage', on_storage_event);
    onScopeDispose(() => removeEventListener('storage', on_storage_event));
    store.$subscribe((_mutation, state) => LocalStorageHelper.push(store, prereq_ref));
    watch(prereq_ref, () => LocalStorageHelper.push(store, prereq_ref));
    LocalStorageHelper.pull(store);
  }

  static #eval_prereq(prereq_ref) {
    const prereq = unref(prereq_ref);
    if (typeof prereq === 'function') {
      return prereq();
    } else {
      return prereq;
    }
  }
}
