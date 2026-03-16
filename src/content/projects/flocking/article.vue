<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import Link from '@/components/link.vue'
import Note from '@/components/note.vue'
import Player from '@/components/player.vue'
import { PlayerState } from '@/types/player_state'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import Section from '@/components/section.vue'
import { ThemeColor } from '@/composables/theme'
import {
  ButtonRow,
  NumberRangeRow,
} from '@/util/property_editor/property_types'
import { type IProjectInfo } from '@/types/project_types'
import usePropertyEditorModel from '@/composables/property_editor_model'
import { PropertyEmits, PropertyEmitsHandler } from '@/util/property_editor/property_interfaces'
import usePostMessage from '@/composables/post_message'
import type { IFrameContainer } from '@/types/frame_container'

defineProps<IProjectInfo>();

const main_player = useTemplateRef<InstanceType<typeof Player>>('main_player_ref');


const editor = usePropertyEditorModel(
  [
    new ButtonRow('reload', 'Restart Scene'),
    new NumberRangeRow('count', 'Count', 150, 0, 500, 1),
    new NumberRangeRow('speed', 'Max Speed', 12, 0, 100, 1).asScalar(),
    new NumberRangeRow('force', 'Max Steer Force', 20, 10, 30, 1).asScalar(),
    new NumberRangeRow('alignment', 'Alignment', 9, 0, 20, 1).asScalar(),
    new NumberRangeRow('separation', 'Separation', 15, 0, 20, 1).asScalar(),
    new NumberRangeRow('cohesion', 'Cohesion', 7, 0, 20, 1).asScalar(),
    new NumberRangeRow('containment', 'Containment', 100, 0, 100, 1).asScalar(),
    new NumberRangeRow('sight_radius', 'Sight Radius', 8, 0, 35, 1).asScalar(),
    new NumberRangeRow('separation_radius', 'Separation Radius', 3, 0, 35, 1).asScalar(),
    new NumberRangeRow('containment_radius', 'Containment Radius', 30, 0, 35, 1).asScalar(),
  ],
  new PropertyEmitsHandler((kind: PropertyEmits, name: string): void => {
    switch (kind) {
      case PropertyEmits.Click: {
        if (name === 'reload') {
          needs_reload.value = true;
          update();
        }
        break;
      }
      case PropertyEmits.Changed:
      case PropertyEmits.Reset: {
        update();
        break;
      }
      case PropertyEmits.Changing: {
        break;
      }
    }
  })
);

type FlockingPayload = {
  reload?: boolean;
  count?: number;
  speed?: number;
  force?: number;
  alignment?: number;
  separation?: number;
  cohesion?: number;
  containment?: number;
  sight_radius?: number;
  separation_radius?: number;
  containment_radius?: number;
};

const { post } = usePostMessage<FlockingPayload>(post_update);

const needs_reload = ref(false);
const payload = computed<FlockingPayload>(() => ({
  reload: needs_reload.value,
  count: editor.get<number>('count'),
  speed: editor.get<number>('speed'),
  force: editor.get<number>('force'),
  alignment: editor.get<number>('alignment'),
  separation: editor.get<number>('separation'),
  cohesion: editor.get<number>('cohesion'),
  containment: editor.get<number>('containment'),
  sight_radius: editor.get<number>('sight_radius'),
  separation_radius: editor.get<number>('separation_radius'),
  containment_radius: editor.get<number>('containment_radius'),
}));

function update() {
  post(main_player.value as IFrameContainer, payload.value);
}

function post_update(_snapshot: FlockingPayload) {
  needs_reload.value = false;
}
</script>

<template>
  <article>
    <Player ref="main_player_ref"
            :title="title"
            :date="date"
            :lastmod="lastmod"
            frame="/library/projects/flocking/main.html"
            :state="PlayerState.Playing"
            @load="update()" />

    <Section heading="Controls">
      <PropertyEditor v-bind:rows="editor.rows" v-model="editor.models" v-on="editor.onPropertyEmit" />
    </Section>

    <Note :color="ThemeColor.Todo">
      Future plans to briefly describe Craig Reynolds' <Link to="https://www.red3d.com/cwr/boids/">Boids Algorithm</Link>.
      The plan is for a short high-level explanation comparable to the short <RouterLink to="/projects/proto_engine">WebGL Proto-Engine</RouterLink> and <RouterLink to="/projects/metaballs">WebGL Metaballs</RouterLink> articles.
      The article will include many high-quality demo frames like in the <b>Compositing a Heart</b> section of <RouterLink to="/projects/heart_sdf">Anatomy of a Heart (SDF)</RouterLink> to help illustrate the effects of each step in the process.
    </Note>
  </article>
</template>
