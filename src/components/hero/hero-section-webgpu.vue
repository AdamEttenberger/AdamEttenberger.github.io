<script setup lang="ts">
import { useTemplateRef, onMounted, onUnmounted } from 'vue'
import WebGPULogo from '@/components/webgpu-logo.vue'
import { vec2, vec3, mat4, quat, vec4, Vec3 } from 'ts-gl-matrix'
import ocean_simulation_material_code from '@/assets/shaders/hero-section/ocean_simulation_material.wgsl?raw'
import ocean_simulation_flipbook_normal_height_map_src from '@/assets/textures/hero-section/normal_height_map_256_64f.webp'
import { useUserPreferencesStore } from '@/stores/user_preferences'
import { getTextureGroupSize } from '@/wgpu/resource/texture'
import App from '@/wgpu/core/app'
import { OceanMaterial } from '@/wgpu/resource/material'
import Camera from '@/wgpu/core/camera'
import { OceanMeshes } from '@/wgpu/resource/mesh'
import Skybox, { SkyboxMaterialSlot } from '@/wgpu/resource/skybox'
import { MeshInstanceRenderNode, SkyboxRenderNode } from '@/wgpu/core/render-node'
import type Viewport from '@/wgpu/core/viewport'
const user_preferences = useUserPreferencesStore();

const kAnimationGridSize = vec2.fromValues(8, 8); // Number of animation frame [columns, rows]

const kOceanGridSize = 50;
const kInstanceTileScale = vec3.fromValues(600, 200, 600);
const kInstanceTileArea = vec4.fromValues(-2, -1, 2, 0);

const kOceanAlbedo: Vec3 = vec3.fromValues(0.0, 0.425, 0.725);

const kCameraPosition = vec3.fromValues(0, 200, 350);
const kCameraRotation = quat.fromEuler(quat.create(), -20, 0, 0);

const kToRadianScalar = Math.PI / 180.0;
function toRadian(degrees: number) {
  return degrees * kToRadianScalar;
}

let app: App|null = null;

async function setup() {
  if (!canvas.value) {
    throw new Error('Cannot find canvas element.')
  }
  app = new App(canvas.value);
  await app.ready;
  if (!app.device ||
      !app.texture_registry ||
      !app.global_bind_group_layout ||
      !app.instance_bind_group_layout ||
      !app.deviceFormat) {
    throw new Error('Failed to initialize WebGPU App.')
  }

  app.camera = Camera.makePerspectiveCamera(kCameraPosition, kCameraRotation, toRadian(60));

  const ocean_simulation_datamap = await app.texture_registry.get(ocean_simulation_flipbook_normal_height_map_src);
  if (ocean_simulation_datamap === undefined) {
    throw new Error(`Cannot locate texture: ${ocean_simulation_flipbook_normal_height_map_src}`);
  }

  const ocean_simulation_material = new OceanMaterial(
    app.device,
    ocean_simulation_material_code,
  );
  ocean_simulation_material.uniforms.value[0].normal_height_texture[0] = ocean_simulation_datamap.layer;
  vec3.copy(ocean_simulation_material.uniforms.value[0].albedo_color, kOceanAlbedo)
  vec2.copy(ocean_simulation_material.uniforms.value[0].grid_size, kAnimationGridSize);
  vec2.set(ocean_simulation_material.uniforms.value[0].cell_size,
    getTextureGroupSize(ocean_simulation_datamap.group) / kAnimationGridSize.x,
    getTextureGroupSize(ocean_simulation_datamap.group) / kAnimationGridSize.y
  );
  vec2.div(ocean_simulation_material.uniforms.value[0].texel_size, vec2.fromValues(1, 1), ocean_simulation_material.uniforms.value[0].cell_size);
  ocean_simulation_material.uniforms.value[0].texel_margin[0] = 4.0;
  ocean_simulation_material.uniforms.submit();

  const ocean_tiles = new OceanMeshes(
    app.device,
    /*instance_count=*/(kInstanceTileArea.z - kInstanceTileArea.x + 1) * (kInstanceTileArea.w - kInstanceTileArea.y + 1),
    app.instance_bind_group_layout,
    ocean_simulation_material,
    /*gridsize=*/kOceanGridSize,
  )
  let row_stride = (kInstanceTileArea.z - kInstanceTileArea.x + 1);
  for (var y = kInstanceTileArea.y; y <= kInstanceTileArea.w; ++y) {
    for (var x = kInstanceTileArea.x; x <= kInstanceTileArea.z; ++x) {
      let instance_id = (x - kInstanceTileArea.x) + ((y - kInstanceTileArea.y) * row_stride);
      mat4.fromRotationTranslationScale(ocean_tiles.value[instance_id].mMatrix,
        quat.create(),
        vec3.fromValues(x * kInstanceTileScale.x, 0, y * kInstanceTileScale.z),
        kInstanceTileScale);
      mat4.invert(ocean_tiles.value[instance_id].normalMatrix, ocean_tiles.value[instance_id].mMatrix)
      mat4.transpose(ocean_tiles.value[instance_id].normalMatrix, ocean_tiles.value[instance_id].normalMatrix);
      ocean_tiles.value[instance_id].material_id[0] = 0;
    }
  }
  ocean_tiles.submit();

  const skybox = new Skybox(app.device);

  app.add(new MeshInstanceRenderNode(ocean_tiles));
  app.add(new SkyboxRenderNode(skybox));

  app.on_update.subscribe((app: App, _viewport: Viewport, timestamp: number): void => {
    if (!app.global_uniforms) {
      return;
    }
    const r1 = 0.025;
    const r2 = r1 * 5;
    const d1 = 180 / r1;
    const d2 = 180 / r2;
    const t = timestamp % (d1 + d2);
    let sun_yaw = (t < d1)
      ? t * r1
      : 180 + (t - d1) * r2;
    sun_yaw -= 90;

    const darkMode = user_preferences.useDarkMode;
    const skyboxMaterialSlot = darkMode ? SkyboxMaterialSlot.DarkMode : SkyboxMaterialSlot.LightMode;
    vec3.normalize(app.global_uniforms.value[0].iSunDirection, vec3.transformQuat(vec3.create(), vec3.fromValues(0, 0, -1), quat.fromEuler(quat.create(), 190, sun_yaw, 0)));
    vec3.copy(app.global_uniforms.value[0].iSunLightColor, 
              skybox.material.uniforms.value[skyboxMaterialSlot].sunColor);
    skybox.uniforms.value[0].material_id[0] = skyboxMaterialSlot;
    skybox.uniforms.submit();
  });
}

async function shutdown() {
  if (!app) {
    return;
  }
  await app?.ready;
  app?.destroy();
}

function handleMouseMoveEvent(evt: MouseEvent) {
  if (!app?.global_uniforms) {
    return;
  }
  const box = (evt.currentTarget as HTMLCanvasElement).getBoundingClientRect();
  const x = (evt.clientX - box.left) / box.width;
  const y = (evt.clientY - box.top) / box.height;
  vec2.set(app.global_uniforms.value[0].iMouse, x, y);
}

function onContextMenu(evt: PointerEvent) {
  evt.preventDefault();
}

const canvas = useTemplateRef<HTMLCanvasElement>('canvas');

onMounted(() => setup());
onUnmounted(() => shutdown());
defineExpose({
  handleMouseMoveEvent
});
</script>

<template>
  <div class="hero-section-viewport-container">
    <canvas ref="canvas" @contextmenu="onContextMenu">
      <div class='error'><img src='/images/html5_white.png' width='128' height='128' /><h2>This page requires support for HTML5 Canvas and WebGPU</h2></div>
    </canvas>
    <div class="webgpu-container">
      <WebGPULogo />
    </div>
  </div>
</template>

<style scoped>
.hero-section-viewport-container {
  position: relative;
  width: 100%;
  height: 100%;

  & > canvas {
    width: 100%;
    height: 100%;
    background-color: black;
  }
}

.webgpu-container img {
  position: absolute;
  inset: 0 0 auto auto;
  height: 5rem;
  pointer-events: none;
}
</style>
