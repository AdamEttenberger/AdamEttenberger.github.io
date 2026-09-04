<script setup lang="ts">
import { useTemplateRef } from 'vue'
import HeroSectionInfoCard from '@/components/hero/hero-section-info-card.vue'
import HeroSectionScrollIndicator from '@/components/hero/hero-section-scroll-indicator.vue'
import HeroSectionWebGPU from '@/components/hero/hero-section-webgpu.vue'
import type { IAuthor } from '@/content/author'
import MobileRotateIcon from '@/assets/images/svg/mobile-rotate.svg?raw'

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
      <div class="mobile-rotate" v-html="MobileRotateIcon"></div>
      <HeroSectionScrollIndicator class="scroll-indicators" @scroll-to-content="$emit('scrollToContent')" />
      <div class="content">
        <HeroSectionInfoCard :author />
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
  height: calc(100lvh - var(--size-header-height));

  /**
   * Overlay which fills the page.
   */
  & > .overlay {
    position: absolute;
    inset: var(--size-header-height) 0 0 0;

    & > .mobile-rotate {
      display: none;
      position: absolute;
      inset: var(--padding-normal) 0 0 var(--padding-normal);
      height: 4rem;
      pointer-events: none;

      & :deep(svg) {
        height: 100%;
        color: light-dark(black, white);
        fill: currentColor;
      }
    }

    & > .content {
      position: absolute;
      inset: 0;
      place-self: center;
      justify-self: center;
      place-content: center;
      width: 24rem;
    }

    & > .scroll-indicators {
      position: absolute;
      inset: auto 0 0 0;
    }
  }
}

@media only screen and (max-width: 35rem) and (min-resolution: 192dpi) {
  .mobile-rotate {
    display: block !important;
  }
}
</style>
