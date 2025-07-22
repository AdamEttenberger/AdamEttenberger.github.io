<script setup>
import Button from '@/components/button.vue'

const emit = defineEmits([
  'property-changed', // (name: String, new_value: boolean)
]);

const props = defineProps({
  name: { type: String, required: true },
  disabled: { type: Boolean, required: true },
  icon: { type: Array, default: null },
});

const model = defineModel({
  type: Boolean,
  required: true,
  default: false,
  set(value) {
    emit('property-changed', props.name, value);
    return value;
  },
});
</script>

<template>
  <div class="toggle">
    <div class="container">
      <Button v-if="model" class="button"
              :icon="(icon && model) ?? ['fas', 'check']"
              @click="$emit('click')" />
    </div>
  </div>
</template>

<style scoped>
.toggle {
  display: flex;
  flex-direction: row-reverse;
  height: 1lh;
}

.toggle > .container {
  width: auto;
}

.background {
  background-color: var(--color-background-button);
}

.foreground {
  background-color: var();
}

.dot {
  background-color: var(--color-background-);
}
</style>