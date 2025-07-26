import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import posthog from 'posthog-js'
import { useConsentStore } from '@/stores/consent'
// https://posthog.com/docs/libraries/js/config
// https://posthog.com/docs/privacy/data-collection#autocapture
//
// `posthog.init` must be called before mounting the app to work
// reliably, configured to only allow op-in autocapture.
const posthogPlugin = {
  install(app) {
    app.config.globalProperties.$posthog = posthog.init(
      'phc_TnAcqAOOEzYHjz5SBY1FfoGYACyWuwIIsrDaAE2fqGl',
      {
        api_host: 'https://posthog-data.adamettenberger.com', // proxy to PostHog server
        ui_host: 'https://us.posthog.com',
        defaults: '2025-05-24',
        person_profiles: 'identified_only', // 'always' would create profiles for anonymous users as well
        persistence: 'memory', // avoid tracking across sessions by not persisting session data as a cookie or localStorage key.
        autocapture: true,
        capture_pageview: 'history_change', // with consent, captures vue-router changes automatically
        capture_pageleave: true,
        disable_session_recording: true,
        cross_subdomain_cookie: false,
        mask_all_text: true,
        mask_all_element_attributes: true,
        respect_dnt: true,
        opt_out_capturing_by_default: true, // opt users out of autocapture by default,
        opt_out_persistence_by_default: true,
        loaded: (posthog) => {
          const consent = useConsentStore();
          const { allow_first_party_tracking } = storeToRefs(consent);
          const updatePostHogState = (enable) => {
            if (enable) {
              posthog.opt_in_capturing();
            } else {
              posthog.opt_out_capturing();
            }
          };
          updatePostHogState(allow_first_party_tracking.value);
          watch(allow_first_party_tracking, (new_value) => {
            updatePostHogState(new_value);
          });
        },
        before_send: (event) => {
          // https://posthog.com/tutorials/hash-based-routing
          // PostHog doesn't handle hash based routing by default,
          // include the hash in the URL.
          if (event?.properties?.$current_url) {
            const parsed = new URL(event.properties.$current_url);
            if (parsed.hash) {
              event.properties.$pathname = parsed.pathname + parsed.hash;
            }
          }
          return event;
        },
      },
    );
  }
};

export {
  posthog,
  posthogPlugin,
};
