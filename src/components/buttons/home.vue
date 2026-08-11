<script setup lang="ts">
import Button from '@/components/buttons/button.vue'
import { ThemeColor } from '@/composables/theme'
</script>

<template>
  <Button to="/"
          :icon="['fas', 'house']"
          aria-label="home" />
</template>
