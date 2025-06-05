<script setup>
import ProjectLabel from './project_label.vue'

const props = defineProps({
  image: { type: String, required: true },
  title: { type: String, required: true },
  route: { type: String, required: true },
  date: { type: Date, required: true },
  lastmod: { type: Date },
})
</script>

<template>
  <article class="container">
    <div class="icon">
      <RouterLink :to="route">
        <img :src="image" :alt="title" />
      </RouterLink>
    </div>
    <div class="label">
      <RouterLink :to="route">
        <ProjectLabel :title="title" :date="date" :lastmod="lastmod" />
      </RouterLink>
    </div>
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
    display: block;
    aspect-ratio: 1;
    grid-column: 1 / 2;
    grid-row: 1 / 3;

    overflow: hidden;
    padding: 0;
    margin-right: 0.5rem;
    padding: 5%;
    transition: padding var(--anim-transition);
    &:hover {
      padding: 0;
    }

    & img {
      border-radius: var(--size-border-radius);
      overflow: hidden;
      width: 100%;
      height: 100%;
    }
  }

  & > .label {
    background-color: var(--color-background-soft);
    grid-column: 2 / 3;
    grid-row: 1 / 2;
    padding: 0.5rem 1rem;
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
    padding: 0.5rem 1rem;
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
</style>
