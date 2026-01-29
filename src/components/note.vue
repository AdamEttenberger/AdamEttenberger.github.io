<script setup lang="ts">
import { computed, PropType } from 'vue'
import { NoteKind } from '@/types/note_kind'
const props = defineProps({
  kind: { type: String as PropType<NoteKind>, default: NoteKind.Info },
  heading: { type: String, default: null },
  text: { type: String, default: null },
})
const note_classes = computed(() => ({
  note: true,
  info: [NoteKind.Info, NoteKind.Question].includes(props.kind),
  warn: props.kind === NoteKind.Warning,
  error: props.kind === NoteKind.Error,
}));
const fallback_heading = computed(() => {
  switch (props.kind) {
    case NoteKind.Error:    return 'Error';
    case NoteKind.Info:     return 'Note';
    case NoteKind.Question: return 'Question';
    case NoteKind.Warning:  return 'Warning';
  }
  return null;
});
</script>

<template>
  <aside :class="note_classes">
    <div class="heading">
      <font-awesome-icon class="icon" v-if="kind === NoteKind.Error" :icon="['fas', 'circle-exclamation']" />
      <font-awesome-icon class="icon" v-else-if="kind === NoteKind.Info" :icon="['fas', 'circle-info']" />
      <font-awesome-icon class="icon" v-else-if="kind === NoteKind.Question" :icon="['fas', 'circle-question']" />
      <font-awesome-icon class="icon" v-else-if="kind === NoteKind.Warning" :icon="['fas', 'triangle-exclamation']" />

      <span v-if="$slots.heading"><slot></slot></span>
      <span v-else-if="heading">{{ heading }}</span>
      <span v-else>{{ fallback_heading }}</span>
    </div>
    <div class="message">
      <p v-if="$slots.default"><slot></slot></p>
      <p v-else-if="text">{{ text }}</p>
    </div>
  </aside>
</template>

<style scoped>
.error {
  background-color: var(--color-background-error);
  color: var(--color-text-error);
  & > .heading {
    color: var(--color-text-heading-error);
  }
}
.info {
  background-color: var(--color-background-info);
  color: var(--color-text-info);
  & > .heading {
    color: var(--color-text-heading-info);
  }
}
.warn {
  background-color: var(--color-background-warn);
  color: var(--color-text-warn);
  & > .heading {
    color: var(--color-text-heading-warn);
  }
}

aside.note {
  padding: var(--size-padding-hard) var(--size-padding-round);
  border-radius: var(--size-border-radius);
}

.icon {
  padding-right: var(--size-padding-hard);
}

.heading {
  font-size: larger;
}

.message {
  font-size: smaller;
}
</style>
