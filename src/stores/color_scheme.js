import { defineStore } from 'pinia'

export const colorSchemeStore = defineStore('colorScheme', {
  state: () => ({ colorScheme: "normal" }),
  getters: {
    isDarkMode: (state) => (state.colorScheme === "normal" && window.matchMedia("(prefers-color-scheme: dark)")) ||
                           state.colorScheme === "dark",
  },
  actions: {
    toggleColorScheme() {
      this.colorScheme = this.isDarkMode ? "light" : "dark";
      return this.colorScheme;
    },
  },
})
