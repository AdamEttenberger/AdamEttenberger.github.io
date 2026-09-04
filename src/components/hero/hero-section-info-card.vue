<script setup lang="ts">
import Layer from '@/components/layer.vue';
import type { IAuthor } from '@/content/author'

defineProps<{
  author: IAuthor;
}>();
</script>

<template>
  <Layer class="info-card">
    <div class="headings">
      <h1 class="theme-color-accent">{{ author.name }}</h1>
      <h2>{{ author.job_title }}</h2>
      <h3><span class="yoe theme-color-accent">{{ author.years_of_experience }}+</span> Years of experience</h3>
    </div>
    <hr>
    <h4>
      <ul class="specialties theme-color-secondary">
        <li>Browsers</li>
        <li>Games</li>
        <li>Tools</li>
        <li>UI</li>
        <li>UX</li>
        <li>Layout</li>
        <li>Rendering</li>
        <li>Systems</li>
      </ul>
    </h4>
    <hr>
    <h4>
      <ul class="preferred-languages theme-color-secondary">
        <li>C++</li>
        <li>C#</li>
        <li>JS &middot; TS</li>
        <li>Lua</li>
      </ul>
    </h4>
  </Layer>
</template>

<style scoped>
.info-card {
  padding: var(--padding-large);
  gap: var(--padding-normal);

  background-color: rgb(from var(--theme-primary-50) r g b / 0.75);
  border: 3px solid var(--theme-border);
  border-radius: 2rem;

  backdrop-filter: blur(4px);
  will-change: backdrop-filter;

  & > .headings {
    display: flex;
    flex-direction: column;
  }

  & :is(h1, h2, h3) {
    text-align: center;
  }
}

ul:is(.specialties, .preferred-languages) {
  list-style: none;
  padding-inline-start: 0;
  display: flex;
  flex-flow: row wrap;
  gap: var(--padding-small);
  justify-content: center;
}

.yoe, li {
  color: var(--theme-text);
  background-color: var(--theme-background);
  border: 3px solid var(--theme-border);
  border-radius: var(--size-border-radius);
  padding: var(--padding-xxsmall) var(--padding-normal);
}

.yoe {
  font-weight: bold;
}
</style>