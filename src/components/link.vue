<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type EmailTemplate from '@/types/email_template';
import { LinkType, link_type } from '@/util/link';
import useTheme, { type IThemeProps, type ThemeOptions } from '@/composables/theme';

defineEmits(['click']);

const props = defineProps<IThemeProps & {
  kind?: LinkType;
  to?: string|EmailTemplate;
  alt?: string;
  hide_ext?: boolean;

  icon?: string|Array<string>;
  public?: boolean;
  button?: boolean;

  disabled?: boolean;
}>();

const kind = computed<LinkType>(() => {
  if (props.public) {
    return LinkType.External;
  }
  return props.kind ?? link_type(props.to);
});

const fontawesome_src = computed<undefined|Array<string>>(() => {
  if (!Array.isArray(props.icon)) {
    return;
  }
  return props.icon;
});

const image_src = computed<undefined|string>(() => {
  if (Array.isArray(props.icon)) {
    return;
  }
  return props.icon;
});

const destination = computed<string>(() => {
  return (kind.value === LinkType.Email)
      ? (props.to as EmailTemplate).toString()
      : props.to as string;
});

const component_type = computed(() => (destination.value || !props.button) ? 'a' : 'button');
const tabindex = computed(() => props.disabled ? -1 : undefined);

const { theme } = useTheme(() => ({
  color: props.color,
  depth: props.depth,
  absolute: props.absolute,
} as ThemeOptions));
</script>

<template>
  <RouterLink v-if="kind === LinkType.Route" :to="destination" custom v-slot="{ href, route, navigate, isActive }">
    <component :class="['link', disabled?'disabled':'', ...theme.classNames]" :is="component_type" :active="isActive" :href="href" :tabindex @click="(event: MouseEvent) => { $emit('click', event); navigate(event); }">
      <slot>
        <font-awesome-icon v-if="fontawesome_src" class="fa-icon" :icon="fontawesome_src" />
        <img v-else-if="image_src" :src="image_src" :alt />
        <span v-else>{{ route.fullPath }}</span>
      </slot>
    </component>
  </RouterLink>

  <component v-else-if="button || kind != LinkType.Empty" :is="component_type" :class="['link', disabled?'disabled':'', ...theme.classNames]" :href="destination" :tabindex target="_blank" rel="noopener noreferrer" @click="$emit('click', $event)">
    <slot>
      <font-awesome-icon v-if="fontawesome_src" class="fa-icon" :icon="fontawesome_src" />
      <img v-else-if="image_src" :src="image_src" :alt />
      <span v-else-if="kind === LinkType.Email"><font-awesome-icon class="fa-icon ext-icon" :icon="['fas', 'envelope']" />&nbsp;{{ (to as EmailTemplate).address }}</span>
      <span v-else>{{ to }}</span>
    </slot>
    <span v-if="kind === LinkType.External && !hide_ext">&nbsp;<font-awesome-icon class="ext-icon" :icon="['fas', 'up-right-from-square']" /></span>
  </component>
</template>

<style scoped>
:is(a, button, img, svg) {
  border-radius: var(--size-border-radius);
}

.ext-icon {
  font-size: small;
  padding-right: var(--padding-small);
}

img {
  width: 100%;
  height: 100%;
}

:is(img, svg) {
  aspect-ratio: 1;
}

.fa-icon {
  aspect-ratio: 1;
}

.link.disabled {
  pointer-events: none;
}
</style>
