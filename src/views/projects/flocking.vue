<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import Column from '@/components/column.vue'
import Player from '@/components/player.vue'
import { PlayerState } from '@/types/player_state'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import Section from '@/components/section.vue'
import UnderConstruction from '@/components/under_construction.vue'
import {
  ButtonOptions,
  NumberRangeOptions,
} from '@/util/property_editor/property_types'

const main_editor = useTemplateRef('main_editor_ref');
const main_player = useTemplateRef('main_player_ref');

defineProps({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  lastmod: { type: Date },
  frame: { type: String, required: true },
})

const editor_properties = [
  new ButtonOptions('reload', 'Restart Scene'),
  new NumberRangeOptions('count', 'Count', 150, 0, 500, 1),
  new NumberRangeOptions('speed', 'Max Speed', 12, 0, 100, 1).asScalar(),
  new NumberRangeOptions('force', 'Max Steer Force', 20, 10, 30, 1).asScalar(),
  new NumberRangeOptions('alignment', 'Alignment', 9, 0, 20, 1).asScalar(),
  new NumberRangeOptions('separation', 'Separation', 15, 0, 20, 1).asScalar(),
  new NumberRangeOptions('cohesion', 'Cohesion', 7, 0, 20, 1).asScalar(),
  new NumberRangeOptions('containment', 'Containment', 100, 0, 100, 1).asScalar(),
  new NumberRangeOptions('sight_radius', 'Sight Radius', 8, 0, 35, 1).asScalar(),
  new NumberRangeOptions('separation_radius', 'Separation Radius', 3, 0, 35, 1).asScalar(),
  new NumberRangeOptions('containment_radius', 'Containment Radius', 30, 0, 35, 1).asScalar(),
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
    postMessageToFrame(main_player.value.inner_frame);
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
          :state="PlayerState.Playing"
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
