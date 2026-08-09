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

function onConsentDialogComplete(consent_given: boolean, remember_choice: boolean) {
  dialog_state.value = ConsentDialogState.Hidden;
  if (remember_choice) {
    consent.onUserGrantHideConsent();
  }
  if (!consent_given) {
    return;
  }
  consent.onUserGrantConsent();
}

function onUserConsentRejectAllRememberMeOption(remember_choice: boolean) {
  onConsentDialogComplete(/*consent_given=*/false, remember_choice);
}

function onUserConsentGiven() {
  onConsentDialogComplete(/*consent_given=*/true, /*remember_choice=*/true);
}
</script>

<template>
  <div>
  <Layer v-if="dialog_state == ConsentDialogState.Default" class="dialog">
    <p>
      This website does not intentionally use cookies for analytics, advertising, behavioral profiling, or cross-site tracking.
      Some features may store preferences or other feature data in your browser's local storage.
      Games on this website may also use local storage to save game data, such as high scores or save files.
    </p>
    <p>
      Embedded <b>YouTube</b> videos may also cause <b>Google</b> and <b>YouTube</b> to access or store information on your device, including through cookies, local storage, and other storage technologies.
      This behavior is controlled by <b>Google</b> and <b>YouTube</b> and is subject to their privacy practices.
    </p>
    <p>See the Privacy Policy for more information about how this website handles information.</p>
    <div class="button-list columns gap">
      <Button class="button" text="Learn More" to="/privacy" />
      <Button class="button" text="Required Only" @click="dialog_state = ConsentDialogState.ShowAskToRememberChoice" :color="ThemeColor.Error" />
      <Button class="button" text="Settings" to="/settings" />
      <Button class="button" text="Accept" @click="onUserConsentGiven" :color="ThemeColor.Accent" />
    </div>
  </Layer>

  <Layer v-if="dialog_state == ConsentDialogState.ShowAskToRememberChoice" class="dialog">
    <p>May this site <b>remember your choice</b> for future visits?</p>
    <p>If you choose not to remember your choice, your selection will only apply until you leave or reload the website.</p>
    <div class="button-list columns gap">
      <Button class="button" text="Decline" @click="onUserConsentRejectAllRememberMeOption(false)" :color="ThemeColor.Error" />
      <Button class="button" text="Remember My Choice" @click="onUserConsentRejectAllRememberMeOption(true)" :color="ThemeColor.Accent" />
    </div>
  </Layer>
  </div>
</template>

<style scoped>
.dialog {
  font-size: small;
  gap: var(--padding-normal);
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
