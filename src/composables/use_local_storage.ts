import { ref, onScopeDispose, watch } from 'vue'

export default function useLocalStorage<T>(key: String, default_value?: T) {
  const store = ref(default_value ?? null);
  const cached_value = localStorage.getItem(key);
  if (cached_value) {
    store.value = JSON.parse(cached_value);
  }
  var on_storage_event = (event) => {
    if (event.key !== key) {
      return;
    }
    store.value = JSON.parse(event.newValue ?? 'null');
  };
  addEventListener('storage', on_storage_event);
  onScopeDispose(() => removeEventListener('storage', on_storage_event));
  watch(store, (new_value) => {
    if (new_value === undefined || new_value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(new_value));
    }
  }, { deep: true });

  return store;
};