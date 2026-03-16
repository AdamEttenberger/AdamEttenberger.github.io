<script setup lang="ts">
import useTheme, { ThemeColor, type ThemeOptions, type IThemeProps, type NoteThemeColor, getNoteHeading, getNoteIcon } from '@/composables/theme'

const props = withDefaults(defineProps<IThemeProps & {
  color?: NoteThemeColor;
  heading?: string;
  text?: string;
}>(), {
  color: ThemeColor.Info
});

const { theme } = useTheme(() => ({
  color: props.color,
  depth: 6,
  absolute: true,
} as ThemeOptions));
</script>

<template>
  <aside :class="[...theme.classNames]">
    <div class="note round">
      <div class="heading">
        <font-awesome-icon class="icon" :icon="getNoteIcon(color)" />
        <span>
          <slot name="heading">{{ heading ?? getNoteHeading(color) }}</slot>
        </span>
      </div>
      <div class="message">
        <p>
          <slot>{{ text }}</slot>
        </p>
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

  & :any-link {
    font-weight: bolder;
    background-color: #efefef;
    padding: 0 var(--padding-normal);
    border-radius: var(--size-border-radius);
  }
}
</style>
