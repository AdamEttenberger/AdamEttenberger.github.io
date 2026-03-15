<script setup lang="ts">
import { ref } from 'vue'
import CodeMirror from '@/components/code-mirror.vue'
import ColorPalette from '@/content/experiments/color_palette.vue'
import Layer from '@/components/layer.vue'
import Details from '@/components/details.vue'
import Divider from '@/components/divider.vue'
import Formula from '@/components/formula.vue'
import Note from '@/components/note.vue'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import {
  NumberRangeRow,
} from '@/util/property_editor/property_types'
import Quote from '@/components/quote.vue'
import Section from '@/components/section.vue'
import { getNoteHeading, getThemeColorName, ThemeDepthGradient, NoteThemeColors, CoreThemeColors } from '@/composables/theme'
import TermList from '@/components/term_list.vue'
import Term from '@/components/term.vue'
import VarietyText from '@/components/placeholders/variety_text.vue'
import universal_gravitation from '@/assets/formulas/universal_gravitation.latex?raw'
import usePropertyEditorModel from '@/composables/property_editor_model'

const hue = ref<null|number>(null);
const saturation = ref<null|number>(null);
const editor = usePropertyEditorModel(
  [
    new NumberRangeRow('hue', 'Hue', 214, 0, 360, 1).setModel(hue),
    new NumberRangeRow('saturation', 'Saturation', 50, 0, 100, 1).setModel(saturation),
  ],
);
</script>

<template>
  <article>
    <Section heading="Color Palette">
      <ColorPalette />
    </Section>

    <Section heading="&quot;Lightness&quot; Gradients">
      <TermList heading="CSS 50-950 Gradients" class="lightness-gradients">
        <Term v-for="color_func in ['hsl', 'lch', 'oklch']" :key="color_func" :term="color_func">
          <div class="columns gradient color-frame">
            <div v-for="slot in ThemeDepthGradient" :key="slot"
                 class="color-cell" :style="{ 'background-color': `var(--${color_func}-${slot})` }">
            </div>
          </div>
        </Term>
      </TermList>

      <PropertyEditor v-bind:rows="editor.rows" v-model="editor.models" v-on="editor.onPropertyEmit" />
    </Section>

    <Section heading="Sample Content">
      <VarietyText paragraph />
      <Divider />
        <Quote name="Lorem Ipsum">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Modi repellat cupiditate reprehenderit optio, neque porro consectetur aut? Perspiciatis, animi odio!
        </Quote>
      <Divider />
      <Formula caption="Newton's law of universal gravitation" :content="universal_gravitation" />
      <Divider heading="Lorem Ipsum?" />
      <VarietyText paragraph />
      <VarietyText lorem />
      <div class="responsive-column columns gap-xxl">
        <Note v-for="note_color in NoteThemeColors" :key="note_color" :color="note_color" :text="`${getNoteHeading(note_color)}`" />
      </div>
      <VarietyText paragraph />
      <div class="responsive-column columns gap-xxl">
        <Layer v-for="color in CoreThemeColors" :key="color" :color>
          <h3><span>{{ getThemeColorName(color) }}</span> Layer</h3>
          <Formula caption="Mass-energy equivalence" content="E=mc^2" />
          <VarietyText lorem />
          <Details summary="Lorem Ipsum!"><VarietyText lorem /></Details>
        </Layer>
      </div>
      <Divider heading="Dolor sit"/>
      <div class="responsive-column columns gap-xxl">
        <VarietyText paragraph />
        <VarietyText paragraph />
      </div>
      <Details summary="Mass-energy equivalence">
        <CodeMirror lang="cpp"
                    caption="Mass-energy equivalence."
                    content="
          float energy(float m, float c) {
            return m * c * c;
          }
        " />
      </Details>
      <Formula caption="Mass-energy equivalence" content="E=mc^2" />
      <VarietyText paragraph />
      <div class="responsive-column columns gap-xxl">
        <VarietyText paragraph />
        <VarietyText paragraph />
        <VarietyText paragraph />
      </div>
    </Section>
  </article>
</template>

<style scoped>
.responsive-column {
  display: flex;
  flex-direction: row;
  flex: 1;
  & > * {
    flex: 1;
  }

  @container (max-width: 45rem) {
    flex-direction: column;
  }
}

.lightness-gradients {
  & .gradient {
    display: flex;
    flex-direction: row;
    border: var(--padding-small) outset grey;
  }
  & .color-cell {
    flex: 1 1 auto;
    aspect-ratio: 1;
    text-align: center;
    justify-content: center;
    height: 100%;
  }

  --base-color: hsl(v-bind(hue) v-bind(saturation) 50%);

  --oklch-50:   oklch(from var(--base-color) 95% c h);
  --oklch-100:  oklch(from var(--base-color) 90% c h);
  --oklch-200:  oklch(from var(--base-color) 80% c h);
  --oklch-300:  oklch(from var(--base-color) 70% c h);
  --oklch-400:  oklch(from var(--base-color) 60% c h);
  --oklch-500:  oklch(from var(--base-color) 50% c h);
  --oklch-600:  oklch(from var(--base-color) 40% c h);
  --oklch-700:  oklch(from var(--base-color) 30% c h);
  --oklch-800:  oklch(from var(--base-color) 20% c h);
  --oklch-900:  oklch(from var(--base-color) 10% c h);
  --oklch-950:  oklch(from var(--base-color) 5% c h);

  --hsl-50:   hsl(from var(--base-color) h s 95%);
  --hsl-100:  hsl(from var(--base-color) h s 90%);
  --hsl-200:  hsl(from var(--base-color) h s 80%);
  --hsl-300:  hsl(from var(--base-color) h s 70%);
  --hsl-400:  hsl(from var(--base-color) h s 60%);
  --hsl-500:  hsl(from var(--base-color) h s 50%);
  --hsl-600:  hsl(from var(--base-color) h s 40%);
  --hsl-700:  hsl(from var(--base-color) h s 30%);
  --hsl-800:  hsl(from var(--base-color) h s 20%);
  --hsl-900:  hsl(from var(--base-color) h s 10%);
  --hsl-950:  hsl(from var(--base-color) h s 5%);

  --lch-50:   lch(from var(--base-color) 95% c h);
  --lch-100:  lch(from var(--base-color) 90% c h);
  --lch-200:  lch(from var(--base-color) 80% c h);
  --lch-300:  lch(from var(--base-color) 70% c h);
  --lch-400:  lch(from var(--base-color) 60% c h);
  --lch-500:  lch(from var(--base-color) 50% c h);
  --lch-600:  lch(from var(--base-color) 40% c h);
  --lch-700:  lch(from var(--base-color) 30% c h);
  --lch-800:  lch(from var(--base-color) 20% c h);
  --lch-900:  lch(from var(--base-color) 10% c h);
  --lch-950:  lch(from var(--base-color) 5% c h);
}
</style>