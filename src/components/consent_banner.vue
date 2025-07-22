<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Column from '@/components/column.vue'
import Button from '@/components/button.vue';
import userPrefsStore from '@/stores/local_storage/user_prefs'
import UserPreferences from '@/types/user_preferences'

const user_prefs = userPrefsStore();

enum MenuState {
  Default,
  ShowAskToRememberChoice,
  Hidden,
};
const menu_state = ref(MenuState.Default);

function onUserConsentGiven() {
  user_prefs.do_not_show_consent_banner = true;
  user_prefs.allow_saving_preferences = true;
  user_prefs.preferences.value = new UserPreferences();
  user_prefs.preferences.value.allow_first_party_tracking = true;
  menu_state.value = MenuState.Hidden;
}

function onUserConsentRejectAll() {
  menu_state.value = MenuState.ShowAskToRememberChoice;
}

function onUserConsentRejectAllRememberMeOption(remember_me) {
  if (remember_me) {
    user_prefs.do_not_show_consent_banner = true;
  }
  menu_state.value = MenuState.Hidden;
}

onMounted(() => {
  menu_state.value = user_prefs.do_not_show_consent_banner
      ? MenuState.Hidden
      : MenuState.Default;
});
</script>

<template>
  <Column v-if="menu_state == MenuState.Default" class="banner">
    <div class="split">
      <div>
        This website is designed to be cookie-free and will not collect personal data beyond what's required for the site to function, but would like to collect anonymized first-party analytics to monitor performance over time.
        This website may write a small amount of data to device local storage to ensure a good user experience, for example to honor your selected preferences.
        Games played on this website may write to device local storage for behavior such as a personal high-scores or save files.
      </div>
      <div class="row">
        <Button class="button" text="Learn More" route="/privacy_statement" />
        <Button class="button" text="Reject All" @click="onUserConsentRejectAll" />
        <Button class="button" text="Settings" route="/settings" />
        <Button class="button" text="Ok" @click="onUserConsentGiven" />
      </div>
    </div>
  </Column>

  <Column v-if="menu_state == MenuState.ShowAskToRememberChoice" class="banner">
    <div class="split">
      <div>
        May this site remember your choice if you visit again?
        Otherwise your selection will only be remembered until you leave or reload the website.
      </div>
      <div class="row">
        <Button class="button" text="Hide" @click="onUserConsentRejectAllRememberMeOption(false)" />
        <Button class="button" text="Remember choice" @click="onUserConsentRejectAllRememberMeOption(true)" />
      </div>
    </div>
  </Column>
</template>

<style scoped>
.banner {
  font-size: small;
}

.split {
  display: flex;
  flex-direction: column;
  gap: var(--size-padding-round);
}

.row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: stretch;
  gap: var(--size-padding-round);
}

.row > .button {
  max-width: initial;
}

@media only screen and (max-width: 30rem) {
  .row {
    flex-direction: column-reverse;
  }
}
</style>
