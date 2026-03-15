<script setup lang="ts">
import { computed } from 'vue'
import Button from '@/components/buttons/button.vue'
import Layer from '@/components/layer.vue'

type TabKey = number|string;
type TabValue = string;

const emit = defineEmits([
  'tab-changed' // (key: TabKey): void
]);

const props = defineProps<{
  entries: Array<[TabKey, TabValue]>
}>();

const selected_tab = defineModel<undefined|TabKey>('selected_tab');
const first_tab_key = computed<undefined|TabKey>(() => props.entries.at(0)?.[0]);
if (selected_tab.value === undefined) {
  selected_tab.value = first_tab_key.value;
}

function onTabButtonClicked(key: TabKey) {
  selected_tab.value = key;
  emit('tab-changed', key);
}
</script>

<template>
  <div class="tab-list">
    <Layer class="tab-items-layer" transparent>
      <div class="tab-items-wrapper">
        <Layer v-for="([key, value]) in entries" :key="key" :depth="(selected_tab===key) ? 1 : 1"
               :class="['tab-button', (selected_tab===key)?'selected':'']">
          <slot name="tab-item" :key="key" :value="value" :handle-click="() => onTabButtonClicked(key)">
            <Button :text="value" transparent @click.prevent="onTabButtonClicked(key)" />
          </slot>
        </Layer>
      </div>
    </Layer>
    <Layer class="tab-content-layer">
      <div class="tab-content-wrapper">
        <slot />
      </div>
    </Layer>
  </div>
</template>

<style scoped>
.tab-list {
  & > :is(.tab-items-layer, .tab-content-layer) {
    padding: 0;
    & > .tab-items-wrapper {
      display: flex;
      flex-direction: row;
      gap: var(--padding-small);
      & > .tab-button {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        padding: 0;

        &:not(.selected) {
          color:            var(--theme-text-shade);
          background-color: var(--theme-background-shade);

          &:hover {
            color:            var(--theme-text-tint);
            background-color: var(--theme-background-tint);
          }
        }
      }
    }
    & > .tab-content-wrapper {
      padding: var(--component-layer-padding);
    }
  }
  & > .tab-content-layer {
    border-top-left-radius: 0;
  }

  padding: 0;
  & > :is(.tab-items, .tab-content) {
    padding: var(--component-layer-padding);
  }
}
.tab-items {
  display: flex;
  flex-direction: row;
  justify-items: flex-start;
  align-items: center;
}

.tab-items, .tab-content {
  & .tab-items-wrapper {
    padding: var(--component-layer-padding);
  }
  & .tab-content-wrapper {
    padding: var(--component-layer-padding);
  }
}
</style>