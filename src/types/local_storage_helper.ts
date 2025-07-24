import { onScopeDispose, watch } from 'vue'

export default class LocalStorageHelper {
  static pull(store: any, prereq_ref): void {
    const cached_value = localStorage.getItem(store.$id);
    if (!cached_value) {
      store.$reset();
    }
    store.$state = JSON.parse(cached_value);
  }

  static push(store: any, prereq_ref): void {
    if (prereq_ref.value) {
      localStorage.setItem(store.$id, JSON.stringify(store.$state));
    } else {
      localStorage.removeItem(store.$id);
    }
  }

  static bind(store: any, prereq_ref): void {
    var on_storage_event = (event) => {
      if (event.key !== null && event.key !== store.$id) {
        return;
      }
      LocalStorageHelper.pull(store, prereq_ref);
    };
    addEventListener('storage', on_storage_event);
    onScopeDispose(() => removeEventListener('storage', on_storage_event));
    store.$subscribe((_mutation, state) => LocalStorageHelper.push(store, prereq_ref));
    watch(prereq_ref, () => LocalStorageHelper.push(store, prereq_ref));
    LocalStorageHelper.pull(store, prereq_ref);
  }
}
