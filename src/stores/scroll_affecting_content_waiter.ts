import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useScrollAffectingContentWaiterStore = defineStore('scrollAffectingContentWaiter', () => {
  const pending = ref(new Set([]));

  /**
   * Only intended to be called from a single observer, the Vue router.
   * Meant to delay restoring the scroll offset until dynamically loaded layout
   * affecting content, like documents, images, and code blocks have been loaded.
   * Prevents scroll from being restored before the page is ready, which caused the
   * scroll offset to be different when refreshing the page.
   * @param {*} state
   * @returns Promise that waits until all pending loaders are resolved.
   */
  const wait = computed(() => {
    return new Promise(async (resolve) => {
      while (pending.value.size > 0) {
        var snapshot = pending.value;
        pending.value = new Set([]);
        await Promise.all(snapshot);
      }
      resolve();
    });
  });

  function add(promise) {
    pending.value.add(promise);
  }

  return {
    // State
    pending,
    // Getters
    wait,
    // Actions
    add,
  };
})
