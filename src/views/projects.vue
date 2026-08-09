<script setup lang="ts">
import Divider from '@/components/divider.vue'
import Section from '@/components/section.vue'
import { type IProjectInfo } from '@/types/project_types'
import ProjectItem from '@/components/cards/project-item.vue'
import YouTubeItem from '@/components/cards/youtube-item.vue'
defineProps<{
  projects: Array<IProjectInfo>;
}>();
</script>

<template>
  <article>
    <Section heading="Featured Work" transparent>
      <YouTubeItem :title="['Call of Duty', 'WWII']"
                   :role="['Tools Engineer', 'UI Engineer']"
                   youtube_id="D4Q_XYVescc" />
      <YouTubeItem :title="['Call of Duty', 'Advanced Warfare']"
                   :role="['Tools Engineer', 'UI Engineer']"
                   youtube_id="sFu5qXMuaJU" />
    </Section>

    <Section heading="Personal Projects" transparent>
      <div class="projects-list">
        <ProjectItem v-for="item in projects"
                    :key="item.subpath"
                    :title="item.title"
                    :image="item.icon"
                    :to="`/projects/${item.subpath}/`"
                    :date="item.date"
                    :color="item.color" />
      </div>
    </Section>
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