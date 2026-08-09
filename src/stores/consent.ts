import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useConsentStore = defineStore('consent', () => {
  const consent_options = {
    allow_hiding_consent_banner: ref(false),
    allow_embedded_youtube_videos: ref(false),
    allow_saving_user_preferences: ref(false),
    allow_saving_match_three_scorecard: ref(false),
  };

  function $reset() {
    Object.values(consent_options).forEach((option) => {
      option.value = false;
    });
  }

  function onUserGrantConsent() {
    Object.values(consent_options).forEach((option) => {
      option.value = true;
    });
  }

  function onUserGrantHideConsent() {
    consent_options.allow_hiding_consent_banner.value = true;
  }

  return {
    // State
    ...consent_options,
    // Actions
    $reset,
    onUserGrantConsent,
    onUserGrantHideConsent,
  };
});
