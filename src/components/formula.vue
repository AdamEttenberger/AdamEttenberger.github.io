<script setup lang="ts">
import { useTemplateRef, ref, onMounted, useSlots } from 'vue'
import Figure from '@/components/figure.vue'
import Layer from '@/components/layer.vue'
import { ThemeColor } from '@/composables/theme'
import Note from '@/components/note.vue'
import { useScrollAffectingContentWaiterStore } from '@/stores/scroll_affecting_content_waiter'

const scrollAffectingContentWaiter = useScrollAffectingContentWaiterStore();

const slots = useSlots();
const mathml_parent = useTemplateRef('mathml_parent');
const init_failed = ref(false);

const props = defineProps({
  color: { type: [null, String, ThemeColor] as PropType<null|String|ThemeColor>, default: null },
  text: { type: String, default: null },
  file: { type: String, default: null },
  caption: { type: String, required: true },
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
  var task = getTextAsync().then((text) => {
    mathml_parent.value.replaceChildren(TeXZilla.toMathML(text));
  }).catch((e) => {
    console.log(e)
    init_failed.value = true
  });
  scrollAffectingContentWaiter.add(task);
});
</script>

<template>
  <Figure :caption="caption">
    <Note v-if="init_failed" :color="ThemeColor.Error">
      Error loading math view
    </Note>
    <Layer :color>
      <div ref="mathml_parent" class="math"></div>
    </Layer>
  </Figure>
</template>

<style scoped>
.math {
  text-align: center;
  font-size: x-large;
  overflow-x: auto;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: none;
}
</style>