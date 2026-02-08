<script setup lang="ts">
import { PropType } from 'vue'
import Button from '@/components/buttons/button.vue'
import Layer from '@/components/layer.vue'
import ProjectLabel from '@/components/project_label.vue'
import { ThemeColor } from '@/composables/theme'

defineProps({
  color: { type: [null, String, ThemeColor] as PropType<null|String|ThemeColor>, default: null },
  image: { type: String, required: true },
  title: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: Date },
})
</script>

<template>
  <div class="project-card gap">
    <div class="icon">
      <Button class="button" :to :icon="image" :alt="title" transparent />
    </div>
    <Layer class="panel" :color>
      <Button class="button" :to>
        <ProjectLabel class="project-label" :title="title" :date="date" />
      </Button>
      <div class="summary">
        <div class="scroller">
          <slot />
        </div>
      </div>
    </Layer>
  </div>
</template>

<style setup>
:root {
  --project-card-item-height: 12rem;
}
</style>

<style scoped>
.project-card {
  display: flex;
  flex-direction: row;

  & :is(.icon, .panel) {
    max-height: var(--project-card-item-height);
  }

  & .icon {
    align-self: center;
    aspect-ratio: 1;
    height: var(--project-card-item-height);
  }

  & .icon {
    transition: padding var(--anim-transition);
    padding: var(--padding-large);
    &:hover {
      padding: 0;
    }
  }

  & > .panel {
    /**
     * If the summary is less than 1 line, ensures the
     * panel fills any remaining space in the parent.
     */
    flex: 1;
  }

  & .panel .button {
    /**
     * See comment in '@/components/layer.vue' for details.
     * Make the button overlap the entire visual area of the project
     * label by inflating (subtracting the margin  equal to the padding
     * of the containing layer.
     */
    margin: var(--inverse-component-layer-padding);

    & .project-label {
      flex: 1; /* Fill the container */
      padding: 0 var(--padding-large);
    }
  }

  & .summary {
    overflow: hidden;
    /**
     * Negative margin on `.summary` with an equivalent positive padding on `.scroller`
     * child leaves the layout of <slot/> contents of .scroller unaffected while pushing
     * the scrollbar (when visible) into gutter of the layer, maximizing <slot/> area.
     */
    margin-right: calc(-1 * var(--padding-normal));
    & .scroller {
      overflow-y: auto;
      height: 100%;
      padding-right: var(--padding-normal);
    }
  }
}

@container article (max-width: 35rem) {
  .project-card {
    flex-direction: column;
  }
}
</style>
