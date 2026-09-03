import { WebGPUStruct } from '@/wgpu/resource/buffer'
import { MaterialBase } from '@/wgpu/resource/material'
import skybox_material_code from '@/assets/shaders/hero-section/skybox_material.wgsl?raw'
import { vec3 } from 'ts-gl-matrix';

export enum SkyboxMaterialSlot {
  DarkMode,
  LightMode,
}

interface ISkyboxMaterialData {
  sunColor: Float32Array<ArrayBuffer>;
  skyColor: Float32Array<ArrayBuffer>;
}

interface ISkyboxUniforms {
  material_id: Uint32Array<ArrayBuffer>;
}

class SkyboxMaterialData extends WebGPUStruct<ISkyboxMaterialData> {
  constructor(
    device: GPUDevice,
    instances: number,
  ) {
    super(device, {
      sunColor: { type: "vec3f" },
      skyColor: { type: "vec3f" },
    }, instances, GPUBufferUsage.STORAGE);
  }
}

export class SkyboxMaterial extends MaterialBase<SkyboxMaterialData> {
  constructor(
    device: GPUDevice,
  ) {
    const uniforms = new SkyboxMaterialData(device, 2);
    vec3.set(uniforms.value[SkyboxMaterialSlot.DarkMode].sunColor, 0.5647, 0.5647, 0.5647);
    vec3.set(uniforms.value[SkyboxMaterialSlot.DarkMode].skyColor, 0.016, 0.075, 0.18);
    vec3.set(uniforms.value[SkyboxMaterialSlot.LightMode].sunColor, 1.0, 0.875, 0.133);
    vec3.set(uniforms.value[SkyboxMaterialSlot.LightMode].skyColor, 0.42, 0.6, 0.718);
    uniforms.submit();
    const bindLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: {
            type: 'read-only-storage',
            hasDynamicOffset: false,
          },
        },
      ],
    });
    const bindGroup = device.createBindGroup({
      layout: bindLayout,
      entries: [
        { binding: 0, resource: { buffer: uniforms.gpuBuffer } },
      ],
    });

    super(
      device,
      skybox_material_code,
      uniforms,
      bindLayout,
      bindGroup,
    );
  }
}

class SkyboxUniforms extends WebGPUStruct<ISkyboxUniforms> {
  constructor(
    device: GPUDevice,
  ) {
    super(device, {
      material_id: { type: "u32" },
    }, 1, GPUBufferUsage.UNIFORM);
  }
}

export default class Skybox {
  public readonly bindGroupLayout: GPUBindGroupLayout;
  public readonly bindGroup: GPUBindGroup;
  public readonly material: SkyboxMaterial;
  public readonly uniforms: SkyboxUniforms;

  constructor(
    device: GPUDevice,
  ) {
    this.material = new SkyboxMaterial(device);
    this.uniforms = new SkyboxUniforms(device);
    this.uniforms.value[0].material_id[0] = SkyboxMaterialSlot.DarkMode;

    this.bindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        },
      ]
    });
    this.bindGroup = device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.uniforms.gpuBuffer } },
      ],
    });
  }

  public destroy(): void {
    this.material.destroy();
    this.uniforms.destroy();
  }
}
