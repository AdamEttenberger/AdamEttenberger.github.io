<script setup lang="ts">
import HeroSectionViewport from '@/components/hero-section-viewport.vue'
</script>

<template>
  <section class="hero-section">
    <div class="overlay">
      <HeroSectionViewport>
        <template v-slot:scroll-indicator>
          <div class="scroll-indicator">
            <div>Scroll</div>
            <font-awesome-icon class="fa-icon" :icon="['fas', 'chevron-down']" />
          </div>
        </template>
      </HeroSectionViewport>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  /**
   * Pushes article contents below the hero section.
   */
  height: 100vh;

  /**
   * Overlay which fills the page.
   */
  & > .overlay {
    position: absolute;
    inset: 0;
  }
}

.scroll-indicator {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 2rem;
  padding-bottom: var(--padding-xxlarge);
  color: var(--theme-accent-500);

  & > .fa-icon {
    font-size: 2em;
  }
}
</style>
