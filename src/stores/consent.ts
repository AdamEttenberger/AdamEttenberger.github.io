import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useConsentStore = defineStore('consent', () => {
  const allow_hiding_consent_banner = ref(false);
  const allow_saving_user_preferences = ref(false);
  const allow_saving_match_three_scorecard = ref(false);

  function $reset() {
    allow_hiding_consent_banner.value = false;
    allow_saving_user_preferences.value = false;
    allow_saving_match_three_scorecard.value = false;
  }

  return {
    // State
    allow_hiding_consent_banner,
    allow_saving_user_preferences,
    allow_saving_match_three_scorecard,
    // Actions
    $reset,
  };
});
