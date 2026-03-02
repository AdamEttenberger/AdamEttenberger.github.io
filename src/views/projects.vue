<script setup lang="ts">
import Divider from '@/components/divider.vue'
import { type IProjectInfo } from '@/types/project_types'
import ProjectItem from '@/components/cards/project-item.vue'
defineProps<{
  projects: Array<IProjectInfo>;
}>();
</script>

<template>
  <article>
    <Divider heading="Projects" />

    <div class="projects-list">
      <ProjectItem v-for="item in projects"
                  :key="item.subpath"
                  :title="item.title"
                  :image="item.icon"
                  :to="`/projects/${item.subpath}/`"
                  :date="item.date"
                  :color="item.color">
      </ProjectItem>
    </div>
  </article>
</template>

<style scoped>
.projects-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
  gap: var(--padding-xxlarge);
}
</style>