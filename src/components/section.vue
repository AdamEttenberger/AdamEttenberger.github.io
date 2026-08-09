<script setup lang="ts">
import Divider from '@/components/divider.vue'
import Layer from '@/components/layer.vue'
import { type IThemeProps } from '@/composables/theme'
withDefaults(defineProps<IThemeProps & {
  heading?: string;
}>(), {
  transparent: true,
});
</script>

<template>
  <section>
    <Divider>
      <slot v-if="$slots.heading" name="heading"></slot>
      <div v-else-if="heading">{{ heading }}</div>
    </Divider>
    <Layer :color :transparent>
      <slot></slot>
    </Layer>
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  text-align: justify;
  gap: var(--padding-normal);
  padding: var(--padding-normal);
}
</style>
