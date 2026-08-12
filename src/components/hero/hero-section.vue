<script setup lang="ts">
import HeroSectionViewport from '@/components/hero/hero-section-viewport.vue';
import type { IAuthor } from '@/content/author';

defineProps<{
  author: IAuthor;
}>();
</script>

<template>
  <section class="hero-section">
    <div class="overlay" ref="overlay">
      <HeroSectionViewport />
      <!-- <canvas ref="canvas"></canvas> -->
      <div class="content">
        <div class="info-card">
          <h1>{{ author.name }}</h1>
          <h2>{{ author.job_title }}</h2>
          <h3>{{ author.years_of_experience }}+ Years of experience</h3>
        </div>
      </div>
      <div class="scroll-indicator">
        <div>Scroll</div>
        <font-awesome-icon class="fa-icon" :icon="['fas', 'chevron-down']" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  /**
   * Pushes article contents below the hero section and
   * prevents overlapping with the header.
   */
  margin-top: calc(var(--padding-xxlarge) * -1);
  height: calc(100dvh - var(--size-header-height));

  /**
   * Overlay which fills the page.
   */
  & > .overlay {
    position: absolute;
    inset: var(--size-header-height) 0 0 0;

    & > .content {
      position: absolute;
      inset: 0;
      justify-self: center;
      place-content: center;

      & > .info-card {
        background-color: var(--theme-primary-50);
        border-radius: 2rem;
        padding: var(--padding-xxlarge);
      }
    }

    & > .scroll-indicator {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      place-content: end;
      font-size: 2rem;
      padding-bottom: var(--padding-xxlarge);
      color: var(--theme-accent-500);

      & > .fa-icon {
        font-size: 2em;
      }
    }
  }
}
</style>
