<script setup lang="ts">
import { PropType } from 'vue'
import Layer from '@/components/layer.vue'
import { ThemeColor } from '@/composables/theme'

defineProps({
  color: { type: [null, String, ThemeColor] as PropType<null|String|ThemeColor>, default: null },
  transparent: { type: Boolean, default: false },
  summary: { type: String, default: 'Details' },
});
const open = defineModel({
  type: Boolean,
  default: false,
});
</script>

<template>
  <Layer :color :transparent :show_hover="!open">
    <details :open="open">
      <summary @click.prevent="open = !open">
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
summary {
  user-select: none;
  cursor: pointer;
  font-size: medium;
  border-radius: var(--size-border-radius);

  /**
   * Make the entire visual area of the collapsed <summary> clickable.
   * See comment in '@/components/layer.vue' for details.
   */
  margin: var(--inverse-component-layer-padding);
  padding: var(--padding-small) var(--padding-large);
}

.contents {
  display: flex;
  flex-direction: column;
  padding: var(--component-layer-padding);
  gap: var(--component-layer-gap);
}
</style>