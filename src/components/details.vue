<script setup lang="ts">
import { PropType } from 'vue'
import Layer from '@/components/layer.vue'
import { ThemeColor } from '@/composables/theme'

defineProps({
  color: { type: [null, String, ThemeColor] as PropType<null|String|ThemeColor>, default: null },
  transparent: { type: Boolean, default: false },
  summary: { type: String, default: 'Details' },
  thin: { type: Boolean, default: false },
});
const open = defineModel({
  type: Boolean,
  default: false,
});
</script>

<template>
  <Layer class="details-layer" :color :transparent :show_hover="!open">
    <details :open="open">
      <summary :class="{ thin }" @click.prevent="open = !open">
        <slot v-if="!summary" name="summary"></slot>
        <span v-else>{{ summary }}</span>
      </summary>
      <div class="contents" v-if="$slots.default && open">
        <slot></slot>
      </div>
    </details>
  </Layer>
</template>

<style scoped>
.details-layer {
  padding: 0;

  & summary {
    user-select: none;
    cursor: pointer;
    border-radius: var(--size-border-radius);
    &:not(.thin) {
      padding: var(--padding-large);
    }
    &.thin {
      padding: var(--padding-small);
    }
  }

  & .contents {
    display: flex;
    flex-direction: column;
    padding: 0 var(--component-layer-padding);
    gap: var(--component-layer-gap);
  }
}
</style>