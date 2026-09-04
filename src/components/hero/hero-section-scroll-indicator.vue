<script setup lang="ts">
defineEmits<{
  scrollToContent: [],
}>();
</script>

<template>
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
</template>

<style scoped>
.scroll-indicators {
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
</style>