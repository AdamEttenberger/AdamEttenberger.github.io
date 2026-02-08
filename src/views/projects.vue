<script setup lang="ts">
import { computed, defineAsyncComponent, unref } from 'vue'
import ProjectCard from '@/components/project_card.vue'
import { IProjectInfo } from '@/types/project_types';
const props = defineProps({
  projects: { type: Array<IProjectInfo>, required: true },
})
const summary_components = computed(() => unref(props.projects).map(item => defineAsyncComponent(item.summary)));
</script>

<template>
  <article>
    <ProjectCard v-for="(item, index) in projects"
                :key="item.subpath"
                :title="item.title"
                :image="item.icon"
                :to="`/projects/${item.subpath}/`"
                :date="item.date"
                :lastmod="item.lastmod">
      <component :is="summary_components[index]" />
    </ProjectCard>
  </article>
</template>
