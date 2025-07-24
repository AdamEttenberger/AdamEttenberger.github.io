<script setup>
import EmailTemplate from '@/types/email_template'

defineProps({
  mailto: { type: EmailTemplate, required: true },
  label: { type: String, default: null },
});
</script>

<template>
  <a :href="mailto">{{ label ?? mailto?.address }}</a>
</template>
