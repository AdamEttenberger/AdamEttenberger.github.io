<script setup lang="ts">
import Button from '@/components/buttons/button.vue'
import { ThemeColor } from '@/composables/theme'
</script>

<template>
  <Button to="/settings"
          :icon="['fas', 'gear']"
          aria-label="settings"
          :color="ThemeColor.Accent" />
</template>
