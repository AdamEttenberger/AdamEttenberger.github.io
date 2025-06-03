<script setup>
import ProjectLabel from './ProjectLabel.vue'

const props = defineProps({
  image: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  lastmod: { type: Date, required: true },
})
</script>

<template>
  <div class="item">
    <img class="icon" :src="image" :alt="title" />
    <div class="details">
      <ProjectLabel :title="title" :date="date" />
      <div class="summary">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style setup>
:root {
  --project-card-item-height: 12rem;
  --project-card-item-image-size: var(--project-card-item-height);
}
</style>

<style scoped>
.item {
  display: grid;
  grid-template-columns: min-content auto;
  grid-template-rows: var(--project-card-item-height);

  margin: 0.33rem 0;
  overflow: hidden;

  & > .icon {
    grid-column: 1 / 2;
    height: var(--project-card-item-image-size);
    width: var(--project-card-item-image-size);
    border-radius: 25px;
  }

  & > .details {
    grid-column: 2 / 3;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin: 0px 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 25px;
    background-color: var(--color-background-soft);

    & > .summary {
      flex: 1;
      overflow-y: auto;
    }
  }
}
</style>
