import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useConsentStore = defineStore('consent', () => {
  const allow_hiding_consent_banner = ref(false);
  const allow_first_party_tracking = ref(false);
  const allow_saving_user_preferences = ref(false);
  const allow_saving_match_three_scorecard = ref(false);

  function toggleConsent(key) {
    if (this[key] === undefined) {
      return;
    }
    this[key].value = !this[key].value
  }

  return {
    // State
    allow_hiding_consent_banner,
    allow_first_party_tracking,
    allow_saving_user_preferences,
    allow_saving_match_three_scorecard,
    // Actions
    toggleConsent,
  };
});
