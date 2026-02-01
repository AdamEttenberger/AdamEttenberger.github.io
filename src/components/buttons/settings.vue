<script setup labg="ts">
import Button from '@/components/buttons/button.vue'
</script>

<template>
  <Button class="button"
          route="/settings"
          :icon="['fas', 'gear']"
          aria-label="settings" />
</template>
