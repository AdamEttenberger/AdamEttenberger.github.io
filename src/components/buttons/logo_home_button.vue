<script setup lang="ts">
import Button from '@/components/buttons/button.vue'
import LogoIcon from '@/assets/logo.svg'
</script>

<template>
  <Button route="/" :src="LogoIcon" alt="Logo" :transparent="true" />
</template>
