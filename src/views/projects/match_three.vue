<script setup lang="ts">
import { onMounted } from 'vue'
import Player from '@/components/player.vue'
import UnderConstruction from '@/components/under_construction.vue'
import { useMatchThreeScorecardStore } from '@/stores/match_three_scorecard'
const scorecard = useMatchThreeScorecardStore();

defineProps({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  lastmod: { type: Date },
  frame: { type: String, required: true },
})

onMounted(() => {
  // Uninstall service workers to fix caching issue when re-visiting the page
  // after the game had been updated on the server.
  navigator.serviceWorker.getRegistrations().then(registrations => registrations.forEach(item => item.unregister()));
});
</script>

<template>
  <Player :title="title"
          :date="date"
          :lastmod="lastmod"
          :frame="frame" />
  <UnderConstruction />
</template>
