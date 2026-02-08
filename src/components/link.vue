<script setup lang="ts">
import { computed, PropType, unref } from 'vue'
import { RouterLink } from 'vue-router'
import EmailTemplate from '@/types/email_template'
import LinkUtil, { LinkType } from '@/util/link';

defineEmits(['click']);

const props = defineProps({
  kind: { type: [String, LinkType] as PropType<String | LinkType>, default: null },
  to: { type: [null, String, EmailTemplate] as PropType<null | String | EmailTemplate>, default: null },
  alt: { type: String, default: null },
  hide_ext: { type: Boolean, default: false },

  icon: { type: [null, String, Array] as PropType<null | String | Array>, default: null },
  button: { type: Boolean, default: false },
  public: { type: Boolean, default: false },
})
const kind = computed(() => {
  if (unref(props.public)) {
    return LinkType.External;
  }
  return unref(props.kind) ?? LinkUtil.type(props.to);
});

const icon_file = computed(() => {
  var icon = unref(props.icon);
  if (typeof icon === 'string' && icon.length) {
    return icon.startsWith('/') || icon.startsWith('http:') || icon.startsWith('https:') || icon.startsWith('data:');
  }
  return false;
});

const destination = computed(() => {
  if (kind.value === LinkType.Email) {
    return (unref(props.to) as EmailTemplate).toString();
  }
  return props.to;
});

const component_type = computed(() => (destination.value || !unref(props.button)) ? 'a' : 'button');
</script>

<template>
  <router-link v-if="kind === LinkType.Route" :to="to" custom v-slot="{ href, route, navigate, isActive }">
    <component class="link" :is="component_type" :active="isActive" :href="href" @click="() => { navigate($event); $emit('click', $event); }">
      <slot>
        <img v-if="icon_file" :src="icon" :alt />
        <font-awesome-icon v-else-if="icon" class="fa-icon" :icon />
        <span v-else>{{ route.fullPath }}</span>
      </slot>
    </component>
  </router-link>

  <component v-else-if="button || kind != LinkType.Empty" :is="component_type" class="link" :href="destination" target="_blank" rel="noopener noreferrer" @click="$emit('click', $event)">
    <slot>
      <img v-if="icon_file" :src="icon" :alt />
      <font-awesome-icon v-else-if="icon" class="fa-icon" :icon />
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
</style>
