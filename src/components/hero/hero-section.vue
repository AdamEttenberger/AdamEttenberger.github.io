<script setup lang="ts">
import { useTemplateRef } from 'vue'
import HeroSectionWebGPU from '@/components/hero/hero-section-webgpu.vue'
import Layer from '@/components/layer.vue'
import type { IAuthor } from '@/content/author'

const renderer = useTemplateRef('renderer');

defineProps<{
  author: IAuthor;
}>();

defineEmits<{
  scrollToContent: [],
}>();

function onMouseMove(evt: MouseEvent) {
  // Handle mouse move from outside the renderer, rather directly on the <canvas>.
  // This is to allow the renderer to see mouse movement that happens over the
  // content and scroll-indicators elements.
  renderer.value?.handleMouseMoveEvent(evt);
}
</script>

<template>
  <section class="hero-section">
    <div class="overlay" @mousemove="onMouseMove">
      <HeroSectionWebGPU ref="renderer" />
      <div class="scroll-indicators" @click="$emit('scrollToContent')">
        <div>
          <div>Scroll</div>
          <font-awesome-icon class="fa-icon" :icon="['fas', 'chevron-down']" />
        </div>
        <div>
          <div>Scroll</div>
          <font-awesome-icon class="fa-icon" :icon="['fas', 'chevron-down']" />
        </div>
        <div>
          <div>Scroll</div>
          <font-awesome-icon class="fa-icon" :icon="['fas', 'chevron-down']" />
        </div>
      </div>
      <div class="content">
        <Layer class="info-card">
          <div class="headings">
            <h1>{{ author.name }}</h1>
            <br />
            <h2>{{ author.job_title }}</h2>
            <h3><span class="yoe theme-color-accent">{{ author.years_of_experience }}+</span> Years of experience</h3>
          </div>
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
      place-self: center;
      justify-self: center;
      place-content: center;
      width: 24rem;

      & > .info-card {
        gap: var(--padding-large);

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
    }

    & > .scroll-indicators {
      position: absolute;
      inset: auto 0 0 0;
      display: flex;
      flex-direction: row;
      align-items: end;
      font-size: 1.25rem;
      padding: var(--padding-normal) 0;
      color: var(--theme-accent-500);
      backdrop-filter: blur(8px);
      will-change: backdrop-filter;
      cursor: pointer;

      & > div {
        display: flex;
        flex-direction: column;
        width: 100%;
        align-items: center;
        justify-content: space-evenly;

        & > .fa-icon {
          font-size: 2rem;
        }
      }
    }
  }
}

ul:is(.specialties, .preferred-languages) {
  list-style: none;
  padding-inline-start: 0;
  display: flex;
  flex-flow: row wrap;
  gap: var(--padding-small);
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
