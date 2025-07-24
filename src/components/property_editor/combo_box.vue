<script setup>
/**
 * Emits `name: String, new_value: String`
 */
const emit = defineEmits(['property-changed']);

const props = defineProps({
  name: { type: String, required: true },
  disabled: { type: Boolean, required: true },
  options: { type: Object, required: true },
});

const model = defineModel({
  type: String,
  required: true,
  set(value) {
    emit('property-changed', props.name, value);
    return value;
  },
});
</script>

<template>
  <select :name="name" :disabled="disabled" v-model="model">
    <option v-for="(option, key) in options"
            :value="key">
      {{ option.label }}
    </option>
  </select>
</template>

<style scoped>
select,
::picker(select) {
  appearance: base-select;
  border-radius: var(--size-border-radius);
}
option::checkmark {
  display: none;
}

select {
  font-size: 1rem;
  border-radius: var(--size-border-radius);
  padding: 0 var(--size-padding-round);
  align-items: center;

  transition-property: background-color;
  transition-duration: var(--anim-transition-duration);
  transition-timing-function: var(--anim-transition-timing-function);

  color: var(--color-text-button);
  background-color: var(--color-background-button);
  &:hover,
  &:focus {
    background-color: var(--color-background-button-hover);
  }
  &:active {
    background-color: var(--color-background-button-active);
  }
}

option {
  transition-property: background-color;
  transition-duration: var(--anim-transition-duration);
  transition-timing-function: var(--anim-transition-timing-function);
  padding: 0 var(--size-padding-round);

  color: var(--color-text-button);
  background-color: var(--color-background-button);

  &:hover,
  &:focus {
    background-color: var(--color-background-button-hover);
  }
  &:checked {
    background-color: var(--color-background-button-selected);
  }
}
</style>
