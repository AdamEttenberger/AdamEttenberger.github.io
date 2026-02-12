<script setup lang="ts">
import { computed, defineAsyncComponent, unref } from 'vue'
import ProjectItem from '@/components/cards/project-item.vue';
import Divider from '@/components/divider.vue';
import { IProjectInfo } from '@/types/project_types';
const props = defineProps({
  projects: { type: Array<IProjectInfo>, required: true },
})
const summary_components = computed(() => unref(props.projects).map(item => defineAsyncComponent(item.summary)));
</script>

<template>
  <article>
    <Divider heading="Projects" />

    <div class="projects-list">
      <ProjectItem v-for="(item, index) in projects"
                  :key="item.subpath"
                  :title="item.title"
                  :image="item.icon"
                  :to="`/projects/${item.subpath}/`"
                  :date="item.date"
                  :lastmod="item.lastmod">
        <template #summary>
          <component :is="summary_components[index]" />
        </template>
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