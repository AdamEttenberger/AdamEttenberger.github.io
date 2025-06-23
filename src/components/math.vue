<script setup>
import { ref, onMounted, useSlots } from 'vue'

const slots = useSlots();
const mathml_parent = ref();
const init_failed = ref(false);

const props = defineProps({
  text: { type: String, default: null },
  file: { type: String, default: null },
})

function readFileProp(resolve, reject) {
  return fetch(props.file)
    .then(response => response.text())
    .then(resolve)
    .catch(reject);
}

function readDefaultSlot() {
  return slots.default().reduce((accumulator, currentValue) => {
    if (typeof currentValue.children == 'string') {
      accumulator += currentValue.children;
    }
    return accumulator;
  }, /*initialValue=*/ "");
}

function getTextAsync() {
  return new Promise((resolve, reject) => {
    if (props.file) {
      readFileProp(resolve, reject);
    } else if (props.text) {
      resolve(props.text);
    } else if (slots.default) {
      resolve(readDefaultSlot());
    } else {
      reject();
    }
  });
}

onMounted(() => {
  getTextAsync().then((text) => {
    mathml_parent.value.replaceChildren(TeXZilla.toMathML(text));
  }).catch((e) => {
    console.log(e)
    init_failed.value = true
  })
});
</script>

<template>
  <div v-if="init_failed" class="error framed">
    <font-awesome-icon :icon="['fas', 'file-circle-xmark']" />
    <br />
    <div>Error loading math view</div>
  </div>
  <div v-else ref="mathml_parent" class="math framed"></div>
</template>

<style scoped>
.math {
  text-align: center;
  font-size: x-large;
  padding: var(--size-padding-round);
  overflow-x: auto;
}

.error {
  text-align: center;
  font-size: xx-large;
}
</style>