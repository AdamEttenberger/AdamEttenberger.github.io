<script setup lang="ts">
import { computed, PropType } from 'vue'
import Button from '@/components/buttons/button.vue'
import Layer from '@/components/layer.vue'

const emit = defineEmits([
  'tab-changed' // (key: Number|String): void
]);

const props = defineProps({
  entries: { type: Object, required: true },
});

const selected_tab = defineModel('selected_tab', {
  type: [null, Number, String, Object] as PropType<null|Number|String|Object>,
  default: null,
});

const first_tab_key = computed(() => props.entries?.at(0)?.at(0));
const selected_tab_key = computed({
  get() {
    return selected_tab.value ?? first_tab_key.value;
  },
  set(new_value) {
    selected_tab.value = new_value;
  }
});

function onTabButtonClicked(key) {
  selected_tab.value = key;
  emit('tab-changed', key);
}

if (selected_tab.value === null) {
  selected_tab.value = first_tab_key.value;
}
</script>

<template>
  <div class="tab-list">
    <Layer class="tab-items-layer" transparent>
      <div class="tab-items-wrapper">
        <Layer v-for="([key, value]) in entries" :key="key" :depth="(selected_tab_key==key) ? 1 : 1"
               :class="['tab-button', (selected_tab_key==key)?'selected':'']">
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