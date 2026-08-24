<script setup lang="ts">
import Button from '@/components/buttons/button.vue'
import { type ISocialButton } from '@/types/social_buttons'
defineProps<ISocialButton>();
</script>

<template>
  <Button class="social-button"
          :title
          :alt="title"
          :to
          :icon />
</template>
