<script setup>
import Button from '@/components/button.vue'
import { emailTemplateStore } from '@/stores/email_template_store'

defineProps({
  type: { type: String, required: true },
  text: { type: String, default: null },
})

const emails = emailTemplateStore();
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
  <Button v-else-if="type === 'resume'" title="Resume"
          alt="Resume" :icon="['fas', 'file-pdf']"
          to="/docs/resume.pdf" />
  <Button v-else-if="type === 'about'" title="About me"
          alt="About me" :icon="['fas', 'question']"
          route="/about" />
</template>
