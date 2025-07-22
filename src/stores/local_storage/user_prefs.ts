import { watch } from 'vue'
import { defineStore } from 'pinia'
import useLocalStorage from '@/composables/use_local_storage'
import UserPreferences from '@/types/user_preferences'

export default defineStore('user', {
  state: () => {
    var do_not_show_consent_banner = useLocalStorage<Boolean>('user.do_not_show_consent_banner', undefined);
    var allow_saving_preferences = useLocalStorage<Boolean>('user.allow_saving_preferences', undefined);
    var preferences = useLocalStorage<UserPreferences>('user.preferences', undefined);
    watch(allow_saving_preferences, (new_value) => {
      if (new_value === true) {
        return;
      }
      preferences.value = undefined;
    });
    return {
      do_not_show_consent_banner,
      allow_saving_preferences,
      preferences,
    }
  },
  getters: {
    allowFirstPartyTracking: (state) => state.preferences?.value?.allow_first_party_tracking === true,
    getColorScheme: (state) => state.preferences?.value?.color_scheme ?? "normal",
    useDarkMode: (state) => (state.preferences?.value?.color_scheme === "normal" && window.matchMedia("(prefers-color-scheme: dark)")) ||
                             state.preferences?.value?.color_scheme === "dark",
  },
  actions: {
    clear: () => {
      this.do_not_show_consent_banner.value = undefined;
      this.allow_saving_preferences.value = undefined;
      this.preferences.value = undefined;
    },
  },
});
