<script setup lang="ts">
import { useTemplateRef, ref, toRaw } from 'vue'
import Code from '@/components/code.vue'
import Column from '@/components/column.vue'
import Details from '@/components/details.vue'
import ExternalLink from '@/components/external_link.vue'
import Figure from '@/components/figure.vue'
import Math from '@/components/math.vue'
import Player from '@/components/player.vue'
import PropertyBuilder, { PropertyNumberRangeBuilder, PropertyComboBoxBuilder } from '@/util/property_editor/property_builder'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import Section from '@/components/section.vue'
//
import UnderConstruction from '@/components/under_construction.vue'

const main_player = useTemplateRef('main_player_ref');
function getMainPlayerFrame() {
  return main_player.value?.player_frame;
}

defineProps({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  lastmod: { type: Date },
  frame: { type: String, required: true },
})

const shader_selection = ref(new PropertyBuilder()
    .addProperty('shaders', new PropertyComboBoxBuilder().setLabel('Shader').setModel('default').setValues({
      "default": {
        label: "Default",
      },
      "circle": {
        label: "Circle",
        overrides: {
          frag: '/library/projects/sdf/circle.frag'
        },
      },
      "plane": {
        label: "Plane",
        overrides: {
          frag: '/library/projects/sdf/plane.frag'
        },
      },
    }))
    .build());

function getShaderOverrides(key) {
  var overrides = shader_selection.value.shaders.options.values[key]?.overrides;
  if (!overrides) {
    return {};
  }
  return toRaw(overrides);
}

function postMessageToFrame(frame, data) {
  frame?.contentWindow?.postMessage(data, window.location.origin);
}

function onPropertyChanged(name, new_value) {
  if (name === 'shaders') {
    postMessageToFrame(getMainPlayerFrame(), getShaderOverrides(new_value));
  }
}

function onPlayerLoaded(frame) {
  postMessageToFrame(frame, getShaderOverrides(shader_selection.value.shaders.model));
}
</script>

<template>
  <Player ref="main_player_ref"
          :title="title"
          :date="date"
          :lastmod="lastmod"
          :frame="frame"
          :paused="false"
          @load="(e) => onPlayerLoaded(e)" />
  <Column>
    <Section heading="Controls">
      <PropertyEditor :properties="shader_selection"
                      @property-changed="onPropertyChanged" />
    </Section>
  </Column>
  <Column>
    <UnderConstruction />
  </Column>
</template>
