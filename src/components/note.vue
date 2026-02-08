<script setup lang="ts">
import { PropType } from 'vue'
import { ThemeColor, NoteKindDisplayStrings } from '@/composables/theme'

const props = defineProps({
  color: { type: [null, String, ThemeColor] as PropType<null|String|ThemeColor>, default: ThemeColor.Info },
  heading: { type: String, default: null },
  text: { type: String, default: null },
})
</script>

<template>
  <aside :class="`note-${color}`">
    <div class="note round">
      <div class="heading">
        <font-awesome-icon class="icon" v-if="color === ThemeColor.Error" :icon="['fas', 'circle-exclamation']" />
        <font-awesome-icon class="icon" v-else-if="color === ThemeColor.Question" :icon="['fas', 'circle-question']" />
        <font-awesome-icon class="icon" v-else-if="color === ThemeColor.Warning" :icon="['fas', 'triangle-exclamation']" />
        <font-awesome-icon class="icon" v-else-if="color === ThemeColor.Todo" :icon="['fas', 'road-barrier']" />
        <font-awesome-icon class="icon" v-else :icon="['fas', 'circle-info']" />

        <span v-if="$slots.heading"><slot></slot></span>
        <span v-else-if="heading">{{ heading }}</span>
        <span v-else>{{ NoteKindDisplayStrings[color] }}</span>
      </div>
      <div class="message">
        <p v-if="$slots.default"><slot></slot></p>
        <p v-else-if="text">{{ text }}</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
aside {
  display: flex;
  flex-direction: column;
}
.note {
  --link-hue-rotation: 180deg;
  --note-background-saturation: 50%;
  --note-background-lightness: 65%;
  --note-heading-saturation: 65%;
  --note-heading-lightness: 15%;
  --note-link-saturation: 50%;
  --note-link-lightness: 65%;

  color: hsl(var(--hue-todo), var(--note-heading-saturation), calc(var(--note-heading-lightness) - 10%));
  padding: var(--padding-small) var(--padding-normal);

  & .icon {
    padding-right: var(--padding-normal);
  }

  & .heading {
    font-size: larger;
  }

  & .message {
    font-size: smaller;
  }

  :is(b, h1, h2, h3, h4, h5, h6, figcaption, .heading) {
    .note-todo      :deep(&)  { color: hsl(var(--hue-todo),     var(--note-heading-saturation), var(--note-heading-lightness)); }
    .note-info      :deep(&)  { color: hsl(var(--hue-info),     var(--note-heading-saturation), var(--note-heading-lightness)); }
    .note-question  :deep(&)  { color: hsl(var(--hue-question), var(--note-heading-saturation), var(--note-heading-lightness)); }
    .note-warning   :deep(&)  { color: hsl(var(--hue-warning),  var(--note-heading-saturation), var(--note-heading-lightness)); }
    .note-error     :deep(&)  { color: hsl(var(--hue-error),    var(--note-heading-saturation), var(--note-heading-lightness)); }
  }

  :any-link {
    .note-todo      .note :deep(&) { color: hsl(calc(var(--hue-todo)      + var(--link-hue-rotation)), var(--note-link-saturation), var(--note-link-lightness)); }
    .note-info      .note :deep(&) { color: hsl(calc(var(--hue-info)      + var(--link-hue-rotation)), var(--note-link-saturation), var(--note-link-lightness)); }
    .note-question  .note :deep(&) { color: hsl(calc(var(--hue-question)  + var(--link-hue-rotation)), var(--note-link-saturation), var(--note-link-lightness)); }
    .note-warning   .note :deep(&) { color: hsl(calc(var(--hue-warning)   + var(--link-hue-rotation)), var(--note-link-saturation), var(--note-link-lightness)); }
    .note-error     .note :deep(&) { color: hsl(calc(var(--hue-error)     + var(--link-hue-rotation)), var(--note-link-saturation), var(--note-link-lightness)); }
  }
}

.note-todo      .note { background-color: var(--background-todo); }
.note-error     .note { background-color: var(--background-error); }
.note-info      .note { background-color: var(--background-info); }
.note-question  .note { background-color: var(--background-question); }
.note-warning   .note { background-color: var(--background-warning); }
</style>
