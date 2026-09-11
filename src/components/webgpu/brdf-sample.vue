<script setup lang="ts">
import type App from '@/wgpu/core/app';
import BootstrapWebGpu from '@/components/webgpu/bootstrap-web-gpu.vue';
import Camera from '@/wgpu/core/camera';
import { MeshInstanceRenderNode } from '@/wgpu/core/render-node';
import type Viewport from '@/wgpu/core/viewport';
import { Plane } from '@/wgpu/resource/geometry';
import { BRDFMaterial } from '@/wgpu/resource/material';
import { MeshInstance } from '@/wgpu/resource/mesh';
import { TextureGroup } from '@/wgpu/resource/texture';
import { toRadian } from '@/wgpu/util/math';
import { mat4, quat, vec3, type Vec3Like } from 'ts-gl-matrix';

// Shaders
import global_shader_code from '@/assets/shaders/wgpu/global.wgsl?raw'
import mesh_instance_shader_code from '@/assets/shaders/wgpu/mesh-instance.wgsl?raw'
import brdf_shader_code from '@/assets/shaders/wgpu/brdf-material.wgsl?raw'

// Textures
import albedo_src from '@/assets/textures/3dtextures.me/sci-fi-wall-016/albedo.jpg'
import metallic_src from '@/assets/textures/3dtextures.me/sci-fi-wall-016/metallic.jpg'
import roughness_src from '@/assets/textures/3dtextures.me/sci-fi-wall-016/roughness.jpg'
import normal_src from '@/assets/textures/3dtextures.me/sci-fi-wall-016/normal.jpg'
import displacement_src from '@/assets/textures/3dtextures.me/sci-fi-wall-016/displacement.jpg'
import ambient_occlusion_src from '@/assets/textures/3dtextures.me/sci-fi-wall-016/ambient-occlusion.jpg'
import emissive_src from '@/assets/textures/3dtextures.me/sci-fi-wall-016/emissive.jpg'

let quad: MeshInstance; 
let plane: MeshInstance;

function updateMeshInstance(meshes: MeshInstance, instance_id: number, offset: Vec3Like, t: number) {
  mat4.fromRotationTranslationScale(meshes.value[instance_id].mMatrix,
    quat.fromEuler(quat.create(), 90 + Math.sin(toRadian(t * 6)) * 30, Math.sin(toRadian(t * 8)) * 30, t * 3),
    offset,
    vec3.fromValues(1, 1, 1));
  mat4.invert(meshes.value[instance_id].normalMatrix, meshes.value[instance_id].mMatrix)
  mat4.transpose(meshes.value[instance_id].normalMatrix, meshes.value[instance_id].normalMatrix);
}

async function onStartup(app: App) {
  if (
    !app.device ||
    !app.instanceBindGroupLayout ||
    !app.textureRegistry ||
    !app.globalUniforms
  ) {
    return;
  }

  const bundle = await app.textureRegistry.getBundle({
    albedo: albedo_src,
    metallic: metallic_src,
    roughness: roughness_src,
    normal: normal_src,
    displacement: displacement_src,
    ambient_occlusion: ambient_occlusion_src,
    emissive: emissive_src,
  });

  const brdf_material = new BRDFMaterial(
    app.device,
    global_shader_code + mesh_instance_shader_code + brdf_shader_code,
    2
  );
  // Without Displacement (Quad)
  vec3.set(brdf_material.uniforms.value[0].albedo_color, 1, 1, 1);
  brdf_material.uniforms.value[0].albedo_texture[0] = bundle.albedo.layer;
  brdf_material.uniforms.value[0].metallic_scale[0] = 1.0;
  brdf_material.uniforms.value[0].metallic_texture[0] = bundle.metallic.layer;
  brdf_material.uniforms.value[0].roughness_scale[0] = 1.0;
  brdf_material.uniforms.value[0].roughness_texture[0] = bundle.roughness.layer;
  brdf_material.uniforms.value[0].normal_scale[0] = 1.0;
  brdf_material.uniforms.value[0].normal_texture[0] = bundle.normal.layer;
  brdf_material.uniforms.value[0].displacement_scale[0] = 0.0;
  brdf_material.uniforms.value[0].displacement_texture[0] = bundle.displacement.layer;
  brdf_material.uniforms.value[0].ambient_occlusion_scale[0] = 1.0;
  brdf_material.uniforms.value[0].ambient_occlusion_texture[0] = bundle.ambient_occlusion.layer;
  brdf_material.uniforms.value[0].emissive_scale[0] = 10.0;
  brdf_material.uniforms.value[0].emissive_texture[0] = bundle.emissive.layer;
  vec3.set(brdf_material.uniforms.value[0].emissive_color, 1, 1, 1);

  // With Displacement (Plane)
  vec3.set(brdf_material.uniforms.value[1].albedo_color, 1, 1, 1);
  brdf_material.uniforms.value[1].albedo_texture[0] = bundle.albedo.layer;
  brdf_material.uniforms.value[1].metallic_scale[0] = 1.0;
  brdf_material.uniforms.value[1].metallic_texture[0] = bundle.metallic.layer;
  brdf_material.uniforms.value[1].roughness_scale[0] = 1.0;
  brdf_material.uniforms.value[1].roughness_texture[0] = bundle.roughness.layer;
  brdf_material.uniforms.value[1].normal_scale[0] = 1.0;
  brdf_material.uniforms.value[1].normal_texture[0] = bundle.normal.layer;
  brdf_material.uniforms.value[1].displacement_scale[0] = 0.1;
  brdf_material.uniforms.value[1].displacement_texture[0] = bundle.displacement.layer;
  brdf_material.uniforms.value[1].ambient_occlusion_scale[0] = 1.0;
  brdf_material.uniforms.value[1].ambient_occlusion_texture[0] = bundle.ambient_occlusion.layer;
  brdf_material.uniforms.value[1].emissive_scale[0] = 10.0;
  brdf_material.uniforms.value[1].emissive_texture[0] = bundle.emissive.layer;
  vec3.set(brdf_material.uniforms.value[1].emissive_color, 1, 1, 1);
  brdf_material.uniforms.submit();

  quad = new MeshInstance(
    app.device,
    1,
    app.instanceBindGroupLayout,
    new Plane(app.device),
    brdf_material,
  );
  
  plane = new MeshInstance(
    app.device,
    1,
    app.instanceBindGroupLayout,
    new Plane(app.device, 100),
    brdf_material,
  );

  quad.value[0].material_id[0] = 0;
  plane.value[0].material_id[0] = 1;

  updateMeshInstance(quad, 0, vec3.fromValues(0, 0, 0), 0);
  updateMeshInstance(plane, 0, vec3.fromValues(0, 0, 0), 0);
  plane.submit();
  quad.submit();

  vec3.normalize(app.globalUniforms.value[0].iSunDirection, vec3.fromValues(0, 0, -1));
  vec3.set(app.globalUniforms.value[0].iSunLightColor, 1, 1, 1);

  app.camera = Camera.makePerspectiveCamera(vec3.fromValues(0, 0, 1.75), quat.create(), toRadian(60));
  app.add(new MeshInstanceRenderNode(quad));
  app.add(new MeshInstanceRenderNode(plane));
}

function onUpdate(app: App, viewport: Viewport, timestamp: number) {
  if (
    !app.globalUniforms ||
    !app.camera
  ) {
    return;
  }

  const r = 0.00625;
  const d = 360 / r;
  const t = (timestamp % d) * r;

  updateMeshInstance(quad, 0, vec3.fromValues(-0.6, 0, 0), t);
  updateMeshInstance(plane, 0, vec3.fromValues(0.6, 0, 0), t);
  plane.submit();
  quad.submit();
}
</script>

<template>
  <BootstrapWebGpu class="player"
                    :textureBudgets="{
                      [TextureGroup._1k]: 7,
                    }"
                    @startup="onStartup"
                    @update="onUpdate" />
</template>

<style scoped>

</style>