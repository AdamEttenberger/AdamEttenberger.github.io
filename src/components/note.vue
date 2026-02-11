<script setup lang="ts">
import { PropType, unref } from 'vue'
import useTheme, { ThemeColor, NoteKindDisplayStrings } from '@/composables/theme'

const props = defineProps({
  color: { type: [null, String, ThemeColor] as PropType<null|String|ThemeColor>, default: ThemeColor.Info },
  heading: { type: String, default: null },
  text: { type: String, default: null },
})
const { theme } = useTheme(() => ({
  color: unref(props.color),
  depth: 6,
  absolute: true,
}));
</script>

<template>
  <aside :class="[...theme.classNames]">
    <div class="note round">
      <div class="heading">
        <font-awesome-icon class="icon" v-if="color === ThemeColor.Error" :icon="['fas', 'circle-exclamation']" />
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
  color: var(--theme-text);
  background-color: var(--theme-background);
  border-radius: var(--size-border-radius);
  padding: var(--padding-normal);

  & .icon {
    padding-right: var(--padding-normal);
  }

  & .heading {
    font-size: larger;
  }

  & .message {
    font-size: smaller;
  }
}
</style>
