<script setup>
import { ref } from 'vue'
import Code from '@/components/code.vue'
import Column from '@/components/column.vue'
import ExternalLink from '@/components/external_link.vue'
import Figure from '@/components/figure.vue'
import Player from '@/components/player.vue'
import PropertyBuilder, { PropertyButtonBuilder, PropertyNumberRangeBuilder } from '@/util/property_editor/property_builder'
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
    .addProperty('reload', new PropertyButtonBuilder().setLabel('Reload').setText('Restart Scene'))
    .addProperty('count', new PropertyNumberRangeBuilder().setLabel('Count').setModel(150).setMin(1).setMax(500).setStep(1))
    .addProperty('speed', new PropertyNumberRangeBuilder().setLabel('Max Speed').setModel(12).setMin(1).setMax(100).setStep(1))
    .addProperty('force', new PropertyNumberRangeBuilder().setLabel('Max Steer Force').setModel(20).setMin(10).setMax(30).setStep(1))
    .addProperty('alignment', new PropertyNumberRangeBuilder().setLabel('Alignment').setModel(9).setMin(0).setMax(20).setStep(1))
    .addProperty('separation', new PropertyNumberRangeBuilder().setLabel('Separation').setModel(15).setMin(0).setMax(20).setStep(1))
    .addProperty('cohesion', new PropertyNumberRangeBuilder().setLabel('Cohesion').setModel(7).setMin(0).setMax(20).setStep(1))
    .addProperty('containment', new PropertyNumberRangeBuilder().setLabel('Containment').setModel(100).setMin(0).setMax(100).setStep(1))
    .addProperty('sight_radius', new PropertyNumberRangeBuilder().setLabel('Sight Radius').setModel(8).setMin(0).setMax(35).setStep(1))
    .addProperty('separation_radius', new PropertyNumberRangeBuilder().setLabel('Separation Radius').setModel(3).setMin(0).setMax(35).setStep(1))
    .addProperty('containment_radius', new PropertyNumberRangeBuilder().setLabel('Containment Radius').setModel(30).setMin(0).setMax(35).setStep(1))
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
