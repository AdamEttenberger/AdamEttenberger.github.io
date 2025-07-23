<script setup lang="ts">
import { ref } from 'vue'
import Column from '@/components/column.vue'
import PropertyBuilder from '@/util/property_builder'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import Section from '@/components/section.vue'

const editorProperties = ref(new PropertyBuilder()
    .build());

function onPropertyButtonClick(name) {

}

function onPropertyChanged(name, new_value) {

}
</script>

<template>
  <Column>
    <Section heading="Preferences">
      <PropertyEditor :properties="editorProperties"
                      @property-changed="onPropertyChanged"
                      @property-click="onPropertyButtonClick" />
    </Section>
    <Section heading="Match-3 Game">
      <PropertyEditor :properties="editorProperties"
                      @property-changed="onPropertyChanged"
                      @property-click="onPropertyButtonClick" />
    </Section>
  </Column>
</template>
