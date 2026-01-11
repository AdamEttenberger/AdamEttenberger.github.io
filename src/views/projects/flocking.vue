<script setup>
import { ref, useTemplateRef } from 'vue'
import Column from '@/components/column.vue'
import Player from '@/components/player.vue'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import Section from '@/components/section.vue'
import UnderConstruction from '@/components/under_construction.vue'
import { PropertyKind } from '@/util/property_editor/property_interfaces'

const main_editor = useTemplateRef('main_editor_ref');
const main_player = useTemplateRef('main_player_ref');

defineProps({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  lastmod: { type: Date },
  frame: { type: String, required: true },
})

const editor_properties = [
  {
    kind: PropertyKind.Button,
    name: 'reload',
    label: 'Reload',
    text: 'Restart Scene',
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'count',
    label: 'Count',
    min_value: 1,
    max_value: 500,
    step_value: 1,
    default_value: 150,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'speed',
    label: 'Max Speed',
    min_value: 1,
    max_value: 100,
    step_value: 1,
    as_scalar: true,
    default_value: 12,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'force',
    label: 'Max Steer Force',
    min_value: 10,
    max_value: 30,
    step_value: 1,
    as_scalar: true,
    default_value: 20,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'alignment',
    label: 'Alignment',
    min_value: 0,
    max_value: 20,
    step_value: 1,
    as_scalar: true,
    default_value: 9,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'separation',
    label: 'Separation',
    min_value: 0,
    max_value: 20,
    step_value: 1,
    as_scalar: true,
    default_value: 15,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'cohesion',
    label: 'Cohesion',
    min_value: 0,
    max_value: 20,
    step_value: 1,
    as_scalar: true,
    default_value: 7,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'containment',
    label: 'Containment',
    min_value: 0,
    max_value: 100,
    step_value: 1,
    as_scalar: true,
    default_value: 100,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'sight_radius',
    label: 'Sight Radius',
    min_value: 0,
    max_value: 35,
    step_value: 1,
    as_scalar: true,
    default_value: 8,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'separation_radius',
    label: 'Separation Radius',
    min_value: 0,
    max_value: 35,
    step_value: 1,
    as_scalar: true,
    default_value: 3,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'containment_radius',
    label: 'Containment Radius',
    min_value: 0,
    max_value: 35,
    step_value: 1,
    as_scalar: true,
    default_value: 30,
  },
];

function onPlayerLoaded(target_frame) {
  postMessageToFrame(target_frame);
}

const needs_reload = ref(false);
function postMessageToFrame(target_frame) {
  target_frame.contentWindow.postMessage({
    reload: needs_reload.value,
    count: main_editor.value.get('count'),
    speed: main_editor.value.get('speed'),
    force: main_editor.value.get('force'),
    alignment: main_editor.value.get('alignment'),
    separation: main_editor.value.get('separation'),
    cohesion: main_editor.value.get('cohesion'),
    containment: main_editor.value.get('containment'),
    sight_radius: main_editor.value.get('sight_radius'),
    separation_radius: main_editor.value.get('separation_radius'),
    containment_radius: main_editor.value.get('containment_radius'),
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
    postMessageToFrame(main_player.value.player_frame);
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
  <Player ref="main_player_ref"
          :title="title"
          :date="date"
          :lastmod="lastmod"
          :frame="frame"
          :paused="false"
          @load="onPlayerLoaded" />
  <UnderConstruction />
  <Column>
    <Section heading="Controls">
      <PropertyEditor ref="main_editor_ref"
                      :properties="editor_properties"
                      @property-changed="onPropertyChanged"
                      @property-click="onPropertyButtonClick" />
    </Section>
  </Column>
</template>
