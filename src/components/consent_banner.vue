<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/buttons/button.vue'
import Layer from '@/components/layer.vue'
import { useConsentStore } from '@/stores/consent'
import { ThemeColor } from '@/composables/theme'

const consent = useConsentStore();

enum ConsentDialogState {
  Default,
  ShowAskToRememberChoice,
  Hidden,
};

const dialog_state = ref(ConsentDialogState.Default);

function onConsentDialogComplete(consent_given: Boolean, remember_choice: Boolean) {
  dialog_state.value = ConsentDialogState.Hidden;
  if (remember_choice) {
    consent.allow_hiding_consent_banner = true;
  }
  if (!consent_given) {
    return;
  }
  consent.allow_first_party_tracking = true;
  consent.allow_saving_user_preferences = true;
}

function onUserConsentRejectAllRememberMeOption(remember_choice) {
  onConsentDialogComplete(/*consent_given=*/false, remember_choice);
}

function onUserConsentGiven() {
  onConsentDialogComplete(/*consent_given=*/true, /*remember_choice=*/true);
}
</script>

<template>
  <Layer v-if="dialog_state == ConsentDialogState.Default" class="dialog">
    <div class="split gap">
      <div>
        This website is designed to be cookie-free and will not collect personal data beyond what's required for the site to function, but would like to collect anonymized first-party analytics to monitor performance over time.
        This website may write a small amount of data to device local storage to ensure a good user experience, for example to honor your selected preferences.
        Games played on this website may write to device local storage for behavior such as a personal high-scores or save files.
      </div>
      <div class="button-list columns gap">
        <Button class="button" text="Learn More" to="/privacy" />
        <Button class="button" text="Reject All" @click="dialog_state = ConsentDialogState.ShowAskToRememberChoice" :color="ThemeColor.Error" />
        <Button class="button" text="Settings" to="/settings" />
        <Button class="button" text="Ok" @click="onUserConsentGiven" :color="ThemeColor.Accent" />
      </div>
    </div>
  </Layer>

  <Layer v-if="dialog_state == ConsentDialogState.ShowAskToRememberChoice" class="dialog">
    <div class="split gap">
      <div>
        May this site remember your choice if you visit again?
        Otherwise your selection will only be remembered until you leave or reload the website.
      </div>
      <div class="button-list columns gap">
        <Button class="button" text="Hide" @click="onUserConsentRejectAllRememberMeOption(false)" />
        <Button class="button" text="Remember choice" @click="onUserConsentRejectAllRememberMeOption(true)" />
      </div>
    </div>
  </Layer>
</template>

<style scoped>
.dialog {
  font-size: small;
}

.split {
  display: flex;
  flex-direction: column;
}

.button-list {
  align-items: stretch;
  justify-content: stretch;
}

.button-list > .button {
  flex: 1;
}

@media only screen and (max-width: 35rem) {
  .button-list {
    flex-direction: column-reverse;
  }
}
</style>
