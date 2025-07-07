<script setup>
import { onMounted } from 'vue'
import Player from '@/components/player.vue'
import UnderConstruction from '@/components/under_construction.vue'
defineProps({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  lastmod: { type: Date },
  frame: { type: String, required: true },
})

onMounted(() => {
  // Uninstall service workers to fix caching issue when re-visiting the page after updating.
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
