<script setup lang="ts">
import Button from '@/components/buttons/button.vue'
import { useEmailTemplateStore } from '@/stores/email_template'

defineProps({
  type: { type: String, required: true },
  text: { type: String, default: null },
})

const emails = useEmailTemplateStore();
</script>

<template>
  <Button v-if="type === 'linkedin'" title="LinkedIn"
          to="https://www.linkedin.com/in/adamettenberger/"
          alt="LinkedIn" :icon="['fab', 'linkedin-in']" />
  <Button v-else-if="type === 'github'" title="GitHub"
          to="https://github.com/AdamEttenberger/"
          alt="GitHub" :icon="['fab', 'github']" />
  <Button v-else-if="type === 'hire-me'" title="E-mail, hire me!"
          alt="E-mail, hire me!" :icon="['fas', 'envelope']"
          :mailto="emails.hiring" />
  <Button v-else-if="type === 'about'" title="About me"
          alt="About me" :icon="['fas', 'question']"
          route="/about" />
</template>
