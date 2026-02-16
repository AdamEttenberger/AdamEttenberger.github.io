<script setup lang="ts">
import { computed, PropType, unref } from 'vue'
import Link from '@/components/link.vue'
import EmailTemplate from '@/types/email_template'
import Layer from '@/components/layer.vue'
import { ThemeColor } from '@/composables/theme'

defineEmits(['click']);

const props = defineProps({
  color: { type: [null, String, ThemeColor] as PropType<null|String|ThemeColor>, default: null },
  depth: { type: [null, Number] as PropType<null|Number>, default: null },
  absolute: { type: Boolean, default: false },
  transparent: { type: Boolean, default: false },

  to: { type: [String, EmailTemplate] as PropType<String|EmailTemplate>, default: null },
  alt: { type: String, default: null },
  icon: { type: [null, String, Array] as PropType<null|String|Array>, default: null },
  text: { type: String, default: null },
  disabled: { type: [Boolean, Object] as PropType<Boolean|Object>, default: false },
})
const tabindex = computed(() => unref(props.disabled) ? -1 : undefined);
</script>

<template>
  <Layer :class="['button-background-layer', unref(disabled)?'disabled':'']" :color :depth :absolute :transparent :disabled show_hover>
    <Link class="button-link" :to :icon :alt :disabled hide_ext button :tabindex @click="$emit('click', $event)">
      <template v-if="$slots.default || text" #default>
        <slot>{{ text }}</slot>
      </template>
    </Link>
  </Layer>
</template>

<style scoped>
.button-background-layer {
  /**
   * Default behavior is to act similar to an intrinsic <button>; centering <slot/>
   * contents both vertically and horizontally, and sizing laying out <slot/>
   * contents sized to fit-content (i.e., doesn't stretch to fill the <Button>).
   * i.e., approx. the child box doesn't automatically fill the button.
   * To make the default behavior predictable and easy to override by callers.
   */
  display: inline-flex;
  text-align: center;
  cursor: pointer;
  box-sizing: border-box;
  letter-spacing: normal;
  word-spacing: normal;
  line-height: normal;
  text-rendering: auto;
  text-transform: none;
  text-indent: 0px;
  text-shadow: none;
  user-select: none;
  padding: 0;

  &.disabled {
    pointer-events: none;
  }

  & > .button-link {
    /**
     * Default behavior behaves similar to the intrinsic <button>.
     * The <Link> is made to fit the containing <Layer> so the entire area of the
     * <Layer> is clickable, delegating activation logic to <Link>.
     * However, the <slot/> contents inside should be centered and "fit-content".
     * i.e., approx. the child box doesn't automatically fill the button.
     * This makes the default behavior predictable and easy to override by callers.
     */
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: inherit;
    background-color: inherit;
    font-size: inherit;
    text-decoration: none;
    &:not([disabled]) { cursor: pointer; }

    /**
     * Add a 'normal' amount of padding to push the contents in from the
     * edge of the button. This should work for most used cases.
     */
    padding: var(--padding-normal);
  }
}
</style>
