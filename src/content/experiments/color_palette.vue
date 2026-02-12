<script setup lang="ts">
import Term from '@/components/term.vue';
import TermList from '@/components/term_list.vue';
import { ThemeColor, ThemeGradientSlots } from '@/composables/theme';
</script>

<template>
  <div class="color-palette">
    <TermList heading="Palette Gradients" class="gradients">
      <Term term="60-30-10">
        <div class="columns palette-distribution color-frame">
          <div class="palette-60" style="background-color: var(--_primary)"></div>
          <div class="palette-30" style="background-color: var(--_secondary)"></div>
          <div class="palette-10" style="background-color: var(--_accent)"></div>
        </div>
      </Term>
      <Term v-for="property in ThemeColor" :key="property" :term="property">
        <div class="columns row">
          <div class="base-color color-frame">
            <div class="color-cell" :style="{ 'background-color': `var(--_${property.toLowerCase()})` }"></div>
          </div>
          <div class="columns gradient color-frame">
            <div v-for="slot in ThemeGradientSlots" :key="slot"
                class="color-cell" :style="{ 'background-color': `var(--theme-${property.toLowerCase()}-${slot})` }">
            </div>
          </div>
        </div>
      </Term>
    </TermList>
  </div>
</template>

<style scoped>
.color-palette {
  padding: var(--padding-normal);
}
.palette-distribution {
  display: grid;
  grid-template-columns: 60% 30% 10%;

  & > .palette-60,
  & > .palette-30,
  & > .palette-10 {
    height: 2rem;
  }
}
.row {
  width: 100%;
}
.color-frame {
  border: var(--padding-small) outset grey;
}
.base-color {
  flex: 1 1 auto;
}
.gradient {
  flex: 11 1 auto;
}

.color-cell {
  display: flex;
  flex-direction: column;
  aspect-ratio: 1;
  text-align: center;
  justify-content: center;
}
</style>