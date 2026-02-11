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
    /**
     * With row layout, `height` both ensure the icon and summary panels are the same size.
     * With column layout, the summary won't overflow despite having a defined `height`,
     * setting `max-height` ensures the card doesn't grow too large with narrow displays
     * and causes the summary to overflow when necessary.
     */
    height: var(--project-card-item-height);
    max-height: var(--project-card-item-height);
  }

  & .icon {
    align-self: center;
    aspect-ratio: 1;
  }

  & .icon {
    padding: 0;
    & .button {
      height: 100%;
      aspect-ratio: 1;
      padding: 0;
      & :deep(a.button-link) {
        padding: 0;
      }
    }
    & .button {
      transition: scale var(--anim-transition);
      scale: 85%;
    }
    &:hover .button { scale: 100%; }
  }

  & > .panel {
    /**
     * If the summary is less than 1 line, ensures the
     * panel fills any remaining space in the parent.
     */
    flex: 1;
    padding: 0;
    gap: var(--padding-normal);
  }

  & .panel .button {
    padding: 0 var(--component-layer-padding);

    & .project-label {
      flex: 1;
    }
  }

  & .summary {
    overflow-y: auto;
    padding: var(--component-layer-padding);
    padding-top: 0;
  }
}

@container article (max-width: 35rem) {
  .project-card {
    flex-direction: column;
  }
}
</style>
