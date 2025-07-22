<script setup>
import ExternalLink from '@/components/external_link.vue'
import EmailTemplate from '@/types/email_template';

defineEmits(['click']);

defineProps({
  src: { type: String, default: null },
  icon: { type: Array, default: null },
  text: { type: String, defeault: null },
  alt: { type: String, default: null },
  route: { type: String, default: null },
  to: { type: String, default: null },
  mailto: { type: EmailTemplate, default: null },
  disabled: { type: Boolean, default: false },
  transparent: { type: Boolean, default: false },
})
</script>

<template>
  <button class="image_button" @click="$emit('click')">
    <RouterLink v-if="route" class="router" :to="route">
      <div :class="{'animator': true, 'transparent': transparent}">
        <slot v-if="$slots.default"></slot>
        <img v-else-if="src" :src="src" :alt="alt" />
        <font-awesome-icon v-else-if="icon" :icon="icon" class="image-button-fa-icon" />
        <div v-else-if="text" class="text">{{ text }}</div>
      </div>
    </RouterLink>
    <ExternalLink v-else-if="to ?? mailto" class="link" :to="to ?? mailto?.toString()" :show_ext="false">
      <div :class="{'animator': true, 'transparent': transparent}">
        <slot v-if="$slots.default"></slot>
        <img v-else-if="src" :src="src" :alt="alt" />
        <font-awesome-icon v-else-if="icon" :icon="icon" class="image-button-fa-icon" />
        <div v-else-if="text" class="text">{{ text }}</div>
        <div v-else-if="mailto" class="text">{{ mailto.address }}</div>
      </div>
    </ExternalLink>
    <div v-else :class="{'animator': true, 'transparent': transparent}">
      <slot v-if="$slots.default"></slot>
      <img v-else-if="src" :src="src" :alt="alt" />
      <font-awesome-icon v-else-if="icon" :icon="icon" class="image-button-fa-icon" />
      <div v-else-if="text" class="text">{{ text }}</div>
    </div>
  </button>
</template>

<style scoped>
.image_button {
  display: block;
  align-self: center;
  border: none;
  padding: 0;
  margin: 0;
  background-color: transparent;
  cursor: pointer;
  font-size: 1.2rem;
}

.animator {
  color: var(--color-text-button);
}

.image_button > .router,
.image_button > .link {
  display: contents;
}

.animator {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.image_button,
.animator,
.animator > img {
  align-content: center;
  width: 100%;
  height: 100%;
}

.animator,
.animator > :is(img, svg, :slotted(img), :slotted(svg)) {
  border-radius: var(--size-border-radius);
}

.animator:not(.transparent) {
  transition: background-color var(--anim-transition);
  background-color: var(--color-background-button);
  &:hover {
    background-color: var(--color-background-button-hover);
  }
  &:active {
    background-color: var(--color-background-button-active);
  }
}

.animator:has(*.image-button-fa-icon) {
  aspect-ratio: 1;
}

.image-button-fa-icon {
  font-size: 1.4rem;
}

.text {
  height: 2rem;
  align-content: center;
  padding: 0 var(--size-padding-round);
}
</style>
