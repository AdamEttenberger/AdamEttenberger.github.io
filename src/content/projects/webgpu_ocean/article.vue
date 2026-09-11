<script setup lang="ts">
import WebPageCitation from '@/components/citation/web-page-citation.vue'
import HeroSectionWebGpu from '@/components/hero/hero-section-web-gpu.vue'
import Note from '@/components/note.vue'
import Section from '@/components/section.vue'
import TableOfContents from '@/components/table-of-contents.vue'
import BrdfSample from '@/components/webgpu/brdf-sample.vue'
import { ThemeColor } from '@/composables/theme'
import { useUserPreferencesStore } from '@/stores/user_preferences'
import { type IProjectInfo } from '@/types/project_types'
defineProps<IProjectInfo>();
const user_preferences = useUserPreferencesStore();
</script>

<template>
  <article>
    <HeroSectionWebGpu class="player" :title :date :lastmod />

    <Note :color="ThemeColor.Info">
      Try switching to <b>{{user_preferences.oppositeColorScheme}} theme</b> using the lightbulb in the upper-right corner to change between day and night in the scene.
    </Note>

    <TableOfContents />

    <Note :color="ThemeColor.Todo">
      Article planned for a future date.
    </Note>

    <Section heading="BRDF Sample">
      <BrdfSample />
    </Section>

    <Section heading="References">
      <WebPageCitation firstname='João' lastname='Paulo'
                       websiteTitle='3DTextures.me' webpageTitle='Sci-Fi Wall 016'
                       :datePublished="new Date('2025/03/18')"
                       url='https://3dtextures.me/2025/03/18/sci-fi-wall-016/' />

      <WebPageCitation firstname="Stephen" lastname="Hill"
                       websiteTitle='Self Shadow' webpageTitle='SIGGRAPH 2025 Course: Physically Based Shading in Theory and Practice'
                       :yearPublished="new Date('2025')"
                       url="https://blog.selfshadow.com/publications/s2025-shading-course/" />

      <WebPageCitation firstname="Stephen" lastname="Hill"
                       websiteTitle='Self Shadow' webpageTitle='SIGGRAPH 2013 Course: Physically Based Shading in Theory and Practice'
                       :yearPublished="new Date('2013')"
                       url="https://blog.selfshadow.com/publications/s2013-shading-course/" />

      <WebPageCitation firstname="Brian" lastname="Karis"
                       websiteTitle="SIGGRAPH 2013" documentTitle="Real Shading in Unreal Engine 4"
                       :yearPublished="new Date('2013')"
                       url="https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf" />
    </Section>
  </article>
</template>

<style scoped>

</style>
