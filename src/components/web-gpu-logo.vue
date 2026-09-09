<script setup lang="ts">
import { computed } from 'vue'
import horizontal_logo from '@/assets/images/logos/webgpu/webgpu-horizontal-responsive.svg'
import standard_logo from '@/assets/images/logos/webgpu/webgpu-responsive.svg'

type LogoType = 'horizontal'|'standard';
const SRC_MAP: Record<LogoType, string> = {
  horizontal: horizontal_logo,
  standard: standard_logo,
};

const props = defineProps<{
  type: LogoType;
  width?: number;
  height?: number;
}>();
const src = computed<string>(() => SRC_MAP[props.type]);
</script>

<template>
  <img alt="WebGPU logo by W3C" :src :width :height />
</template>
