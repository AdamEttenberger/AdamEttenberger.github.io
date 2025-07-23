<script setup>
import { ref } from 'vue'
import Code from '@/components/code.vue'
import Column from '@/components/column.vue'
import ExternalLink from '@/components/external_link.vue'
import Figure from '@/components/figure.vue'
import Math from '@/components/math.vue'
import Player from '@/components/player.vue'
import PropertyBuilder from '@/util/property_builder'
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

const editorProperties = ref(new PropertyBuilder()
    .addButton('reload', 'Reload', 'Restart Scene')
    .addRange('count', 'Count', 150, /*min=*/1, /*max=*/500, /*step=*/1)
    .addRange('speed', 'Max Speed', 12, /*min=*/1, /*max=*/100, /*step=*/1)
    .addRange('force', 'Max Steer Force', 20, /*min=*/10, /*max=*/30, /*step=*/1)
    .addRange('alignment', 'Alignment', 9, /*min=*/0, /*max=*/20, /*step=*/1)
    .addRange('separation', 'Separation', 15, /*min=*/0, /*max=*/20, /*step=*/1)
    .addRange('cohesion', 'Cohesion', 7, /*min=*/0, /*max=*/20, /*step=*/1)
    .addRange('containment', 'Containment', 100, /*min=*/0, /*max=*/100, /*step=*/1)
    .addRange('sight_radius', 'Sight Radius', 8, /*min=*/0, /*max=*/35, /*step=*/1)
    .addRange('separation_radius', 'Separation Radius', 3, /*min=*/0, /*max=*/35, /*step=*/1)
    .addRange('containment_radius', 'Containment Radius', 30, /*min=*/0, /*max=*/35, /*step=*/1)
    .build());

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
    alignment: editorProperties.value.alignment.model,
    separation: editorProperties.value.separation.model,
    cohesion: editorProperties.value.cohesion.model,
    containment: editorProperties.value.containment.model,
    sight_radius: editorProperties.value.sight_radius.model,
    separation_radius: editorProperties.value.separation_radius.model,
    containment_radius: editorProperties.value.containment_radius.model,
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
  if (name !== 'reload') {
    return;
  }
  needs_reload.value = true;
  scheduleUpdate();
}
</script>

<template>
  <Player :title="title"
          :date="date"
          :lastmod="lastmod"
          :frame="frame"
          :paused="false"
          @load="onPlayerLoaded" />
  <UnderConstruction />
  <Column>
    <Section heading="Controls">
      <PropertyEditor :properties="editorProperties"
                      @property-changed="onPropertyChanged"
                      @property-click="onPropertyButtonClick" />
    </Section>
  </Column>
</template>
