<script setup>
import { ref } from 'vue'
import Code from '@/components/code.vue'
import Column from '@/components/column.vue'
import ExternalLink from '@/components/external_link.vue'
import Figure from '@/components/figure.vue'
import Math from '@/components/math.vue'
import Player from '@/components/player.vue'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import Quote from '@/components/quote.vue'
import Section from '@/components/section.vue'
import UnderConstruction from '@/components/under_construction.vue'
const props = defineProps({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  lastmod: { type: Date },
  frame: { type: String, required: true },
})

const editorProperties = ref({
  reload: {
    label: "Reload",
    type: "button",
  },
  count: {
    label: "Count",
    type: "range",
    model: 150,
    options: {min_value: 1, max_value: 500, step_value: 1},
  },
  speed: {
    label: "Max Speed",
    type: "range",
    model: 40,
    options: {min_value: 1, max_value: 100, step_value: 1},
  },
  force: {
    label: "Max Steer Force",
    type: "range",
    model: 5,
    options: {min_value: 1, max_value: 10, step_value: 1},
  },
  cohesion: {
    label: "Cohesion",
    type: "range",
    model: 0.5,
    options: {min_value: 0, max_value: 1, step_value: 0.1},
  },
  separation: {
    label: "Separation",
    type: "range",
    model: 0.75,
    options: {min_value: 0, max_value: 1, step_value: 0.1},
  },
  alignment: {
    label: "Alignment",
    type: "range",
    model: 1.0,
    options: {min_value: 0, max_value: 1, step_value: 0.1},
  },
  sight_radius: {
    label: "Sight Radius",
    type: "range",
    model: 20.0,
    options: {min_value: 0, max_value: 35, step_value: 0.1},
  },
  separation_radius: {
    label: "Separation Radius",
    type: "range",
    model: 10.0,
    options: {min_value: 0, max_value: 35, step_value: 0.1},
  },
});

const needs_reload = ref(false);

function onPlayerLoaded(target_frame) {
  postMessageToFrame(target_frame);
}

function postMessageToFrame(target_frame) {
  target_frame.contentWindow.postMessage({
    reload: needs_reload.value,
    count: editorProperties.value.count.model,
    speed: editorProperties.value.speed.model,
    force: editorProperties.value.force.model,
    cohesion: editorProperties.value.cohesion.model,
    separation: editorProperties.value.separation.model,
    alignment: editorProperties.value.alignment.model,
    sight_radius: editorProperties.value.sight_radius.model,
    separation_radius: editorProperties.value.separation_radius.model,
  }, window.location.origin);
  needs_reload.value = false;
}

var pending_update = null;
function scheduleUpdate() {
  if (pending_update) {
    return;
  }
  clearTimeout(pending_update);
  pending_update = setTimeout(() => {
    document.querySelectorAll('iframe').forEach(postMessageToFrame);
    pending_update = null;
  }, 300);
}

function onPropertyChanged(name, new_value) {
  scheduleUpdate();
}
function onPropertyButtonClick(name) {
  if (name === 'reload') {
    needs_reload.value = true;
  }
  scheduleUpdate();
}
</script>

<template>
  <Player :title="title"
          :date="date"
          :lastmod="lastmod"
          :frame="frame"
          :paused="false" />
  <UnderConstruction />
  <Column>
    <Section heading="Controls">
      <PropertyEditor :properties="editorProperties"
                      @property-changed="onPropertyChanged"
                      @property-click="onPropertyButtonClick" />
    </Section>
  </Column>
</template>
