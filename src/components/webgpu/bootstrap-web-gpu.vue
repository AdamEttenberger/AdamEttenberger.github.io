<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, useTemplateRef } from 'vue'
import App from '@/wgpu/core/app'
import WebGpuLogo from '@/components/web-gpu-logo.vue'
import { TextureGroup } from '@/wgpu/resource/texture'
import type Viewport from '@/wgpu/core/viewport';

const props = defineProps<{
  fillContainer?: boolean;
  showWebGPULogo?: boolean;
  textureBudgets?: Partial<Record<TextureGroup, number>>;
}>();

const canvas = useTemplateRef<HTMLCanvasElement>('canvas');
let startupError = ref(false);
let exposedApp = shallowRef<App|null>(null);

function handleMouseClickEvent(event: PointerEvent) {
  if (exposedApp.value?.handleMouseClickEvent(event)) {
    emits('click', event);
  }
}

function handleContextMenuEvent(event: PointerEvent) {
  if (exposedApp.value?.handleContextMenuEvent(event)) {
    emits('contextmenu', event);
  }
}

function handleMouseDownEvent(event: MouseEvent) {
  if (exposedApp.value?.handleMouseDownEvent(event)) {
    emits('mousemove', event);
  }
}

function handleMouseUpEvent(event: MouseEvent) {
  if (exposedApp.value?.handleMouseUpEvent(event)) {
    emits('mousemove', event);
  }
}

function handleMouseMoveEvent(event: MouseEvent) {
  if (exposedApp.value?.handleMouseMoveEvent(event)) {
    emits('mousemove', event);
  }
}

function handleUpdate(app: App, viewport: Viewport, timestamp: number) {
  emits('update', app, viewport, timestamp);
}

onMounted(async () => {
  if (!canvas.value) {
    throw new Error('Cannot find canvas element.')
  }
  try {
    const app = new App(canvas.value, props.textureBudgets);
    exposedApp.value = app;
    app.on_update.subscribe(handleUpdate);
    await app.ready;
    if (!app.isReady ||
        !app.device ||
        !app.textureRegistry ||
        !app.instanceBindGroupLayout ||
        !app.deviceFormat) {
      throw new Error('Failed to initialize WebGPU App.')
    }

    emits('startup', app);
  } catch (error) {
    startupError.value = true;
  }
});

onUnmounted(async () => {
  if (!exposedApp.value) {
    return;
  }
  await exposedApp.value.ready;
  if (!exposedApp.value.isReady) {
    return;
  }
  emits('shutdown', exposedApp.value);
  exposedApp.value.destroy();
});

defineExpose({
  app: exposedApp,
  handleMouseClickEvent,
  handleMouseDownEvent,
  handleMouseUpEvent,
  handleMouseMoveEvent,
  handleContextMenuEvent,
});
const emits = defineEmits<{
  click: [event: PointerEvent],
  contextmenu: [event: PointerEvent],
  mousedown: [event: PointerEvent],
  mouseup: [event: PointerEvent],
  mousemove: [event: MouseEvent],
  update: [app: App, viewport: Viewport, timestamp: number],
  startup: [app: App],
  shutdown: [app: App],
}>();
</script>

<template>
  <div :class="['webgpu-bootstrap', fillContainer?'':'player']">
    <canvas ref="canvas"
            @click.capture.prevent="handleMouseClickEvent"
            @contextmenu.capture.prevent="handleContextMenuEvent"
            @mousedown.capture="handleMouseDownEvent"
            @mouseup.capture="handleMouseUpEvent"
            @mousemove.capture="handleMouseMoveEvent">
    </canvas>
    <div v-if="startupError" class='error'>
      <WebGpuLogo type="standard" :width='128' :height='128' />
      <h2>This page requires support for HTML5 Canvas and WebGPU</h2>
    </div>
    <div v-else-if="showWebGPULogo" class="overlay">
      <WebGpuLogo type="horizontal" />
    </div>
  </div>
</template>

<style scoped>
.webgpu-bootstrap {
  position: relative;
  width: 100%;
  height: 100%;

  &.player {
    aspect-ratio: 4/3;
  }

  & > canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background-color: black;
  }

  & > .error {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  & > .overlay img {
    position: absolute;
    inset: 0 0 auto auto;
    height: 5rem;
    pointer-events: none;
  }
}
</style>
