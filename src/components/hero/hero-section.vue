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
      <div class="scroll-indicators">
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
        gap: var(--padding-xlarge);
        background-color: rgb(from var(--theme-primary-50) r g b / 0.65);
        border-radius: 2rem;
        padding: var(--padding-xxlarge);

        backdrop-filter: blur(24px);
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
      backdrop-filter: blur(24px);
      will-change: backdrop-filter;

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
  gap: var(--padding-normal);
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
