<script setup lang="ts">
import HeroSectionWebgpu from '@/components/hero/hero-section-webgpu.vue'
import Note from '@/components/note.vue'
import TableOfContents from '@/components/table-of-contents.vue'
import { ThemeColor } from '@/composables/theme'
import { useUserPreferencesStore } from '@/stores/user_preferences'
import { type IProjectInfo } from '@/types/project_types'
import { computed } from 'vue'
defineProps<IProjectInfo>();
const user_preferences = useUserPreferencesStore();

const other_mode = computed<string>(() => user_preferences.useDarkMode ? "light" : "dark");
</script>

<template>
  <article>
    <HeroSectionWebgpu class="player" />
    <Note :color="ThemeColor.Info">
      Try switching to <b>{{other_mode}} theme</b> using the lightbulb in the upper-right corner to change between day and night in the scene.
    </Note>

    <TableOfContents />

    <Note :color="ThemeColor.Todo">
      Article planned for a future date.
    </Note>
  </article>
</template>

<style scoped>
.player {
  aspect-ratio: 4/3;
}
</style>
