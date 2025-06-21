import { defineStore } from 'pinia'

export const scrollAffectingContentWaiterStore = defineStore('scrollAffectingContentWaiter', {
  state: () => ({ pending: new Set([]) }),
  getters: {
    /**
     * Only intended to be called from a single observer, the Vue router.
     * Meant to delay restoring the scroll offset until dynamically loaded layout
     * affecting content, like documents, images, and code blocks have been loaded.
     * Prevents scroll from being restored before the page is ready, which caused the
     * scroll offset to be different when refreshing the page.
     * @param {*} state
     * @returns Promise that waits until all pending loaders are resolved.
     */
    wait(state) {
      return new Promise(async (resolve) => {
        while (this.pending.size > 0) {
          var snapshot = this.pending;
          this.pending = new Set([]);
          await Promise.all(snapshot);
        }
        resolve();
      });
    },
  },
  actions: {
    add(promise) {
      this.pending.add(promise);
    }
  },
})
