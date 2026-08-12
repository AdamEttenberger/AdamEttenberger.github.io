<script setup lang="ts">
import HeroSectionViewport from '@/components/hero/hero-section-viewport.vue';
import Layer from '@/components/layer.vue';
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
        <Layer class="info-card">
          <h1>{{ author.name }}</h1>
          <h2>{{ author.job_title }}</h2>
          <h3><span class="yoe theme-color-accent">{{ author.years_of_experience }}+</span> Years of experience</h3>
          <hr>
          <h4>
            <ul class="specialties theme-color-secondary">
              <li>Rendering</li>
              <li>Layout</li>
              <li>UI</li>
              <li>UX</li>
              <li>Systems</li>
              <li>Tools</li>
              <li>Browsers</li>
              <li>Games</li>
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
      width: 24rem;

      & > .info-card {
        gap: var(--padding-xlarge);
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

ul:is(.specialties, .preferred-languages) {
  list-style: none;
  padding-inline-start: 0;
  display: flex;
  flex-flow: row wrap;
  gap: var(--padding-normal);
}

.yoe, li {
  color: var(--theme-text);
  background-color: var(--theme-background);
  border: 3px solid var(--theme-border);
  border-radius: var(--size-border-radius);
  padding: var(--padding-small) var(--padding-normal);
}

.yoe {
  border-radius: 50%;
}
</style>
