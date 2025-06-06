<script setup>
import ProjectLabel from './project_label.vue'
import ImageButton from './image_button.vue'

const props = defineProps({
  image: { type: String, required: true },
  title: { type: String, required: true },
  route: { type: String, required: true },
  date: { type: Date },
  lastmod: { type: Date },
})
</script>

<template>
  <article class="container">
    <ImageButton class="icon" :src="image" :alt="title" :route="route" />
    <ProjectLabel class="label" :title="title" :date="date" :route="route" />
    <section class="summary">
      <div class="scroller">
        <slot></slot>
      </div>
    </section>
  </article>
</template>

<style setup>
:root {
  --project-card-item-height: 12rem;
}
</style>

<style scoped>
.container {
  display: grid;
  grid-template-columns: var(--project-card-item-height) auto;
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-areas: "image header"
                       "image content";
  margin: 0.33rem 0;
  overflow: hidden;
  max-height: var(--project-card-item-height);

  & > .icon {
    aspect-ratio: 1;
    grid-column: 1 / 2;
    grid-row: 1 / 3;
  }

  & > .label {
    background-color: var(--color-background-soft);
    grid-column: 2 / 3;
    grid-row: 1 / 2;
    padding: var(--size-padding-round);
    border-radius: var(--size-border-radius) var(--size-border-radius) 0 0;
    transition: background-color var(--anim-transition);
    &:hover {
      background-color: var(--color-link-hover);
    }
    &:active {
      background-color: var(--color-link-active);
    }
  }

  & > .summary {
    background-color: var(--color-background-soft);
    grid-column: 2 / 3;
    grid-row: 2 / 3;
    padding: var(--size-padding-round);
    border-radius: 0 0 var(--size-border-radius) var(--size-border-radius);
    justify-content: stretch;
    & > .scroller {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      overflow-y: auto;
      height: 100%;
    }
  }
}

@media only screen and (max-width: 740px) {
  .container {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    grid-template-areas: "image header"
                         "content content";

    max-height: calc(var(--project-card-item-height) * 2);

    & > .icon {
      max-height: calc(var(--project-card-item-height) / 2);
      grid-column: 1 / 2;
      grid-row: 1 / 2;
    }

    & > .label {
      grid-column: 2 / 3;
      grid-row: 1 / 2;
    }

    & > .summary {
      grid-column: 1 / 3;
      grid-row: 2 / 3;
      border-radius: var(--size-border-radius) 0 var(--size-border-radius) var(--size-border-radius);
    }
  }
}

</style>
