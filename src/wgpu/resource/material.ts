import { WebGPUStruct } from '@/wgpu/resource/buffer'
import Hash from '@/wgpu/util/hash'

export interface IMaterial {
  readonly hash: number;
  readonly shader: GPUShaderModule;
  readonly bindLayout: GPUBindGroupLayout;
  readonly bindGroup: GPUBindGroup;

  destroy(): void;
}

interface IOceanMaterialData {
  normal_height_texture: Uint32Array<ArrayBuffer>;
  albedo_color: Float32Array<ArrayBuffer>;
  grid_size: Float32Array<ArrayBuffer>;
  cell_size: Float32Array<ArrayBuffer>;
  texel_size: Float32Array<ArrayBuffer>;
  texel_margin: Float32Array<ArrayBuffer>;
}

class OceanMaterialData extends WebGPUStruct<IOceanMaterialData> {
  constructor(
    device: GPUDevice,
    instances: number,
  ) {
    super(device, {
      normal_height_texture:  { type: 'u32'   },
      albedo_color:           { type: 'vec3f' },
      grid_size:              { type: 'vec2f' },
      cell_size:              { type: 'vec2f' },
      texel_size:             { type: 'vec2f' },
      texel_margin:           { type: 'f32' },
    }, instances, GPUBufferUsage.STORAGE);
  }
}

interface IBRDFMaterialData {
  albedo_color:               Float32Array<ArrayBuffer>;
  albedo_texture:             Uint32Array<ArrayBuffer>;
  metallic_scale:             Float32Array<ArrayBuffer>;
  metallic_texture:           Uint32Array<ArrayBuffer>;
  roughness_scale:            Float32Array<ArrayBuffer>;
  roughness_texture:          Uint32Array<ArrayBuffer>;
  normal_scale:               Float32Array<ArrayBuffer>;
  normal_texture:             Uint32Array<ArrayBuffer>;
  displacement_scale:         Float32Array<ArrayBuffer>;
  displacement_texture:       Uint32Array<ArrayBuffer>;
  emissive_color:             Float32Array<ArrayBuffer>;
  emissive_scale:             Float32Array<ArrayBuffer>;
  emissive_texture:           Uint32Array<ArrayBuffer>;
  ambient_occlusion_scale:    Float32Array<ArrayBuffer>;
  ambient_occlusion_texture:  Uint32Array<ArrayBuffer>;
}

class BRDFMaterialData extends WebGPUStruct<IBRDFMaterialData> {
  constructor(
    device: GPUDevice,
    instances: number,
  ) {
    super(device, {
      albedo_color:               { type: 'vec3f' },
      albedo_texture:             { type: 'u32'   },
      metallic_scale:             { type: 'f32'   },
      metallic_texture:           { type: 'u32'   },
      roughness_scale:            { type: 'f32'   },
      roughness_texture:          { type: 'u32'   },
      normal_scale:               { type: 'f32'   },
      normal_texture:             { type: 'u32'   },
      displacement_scale:         { type: 'f32'   },
      displacement_texture:       { type: 'u32'   },
      emissive_color:             { type: 'vec3f' },
      emissive_scale:             { type: 'f32'   },
      emissive_texture:           { type: 'u32'   },
      ambient_occlusion_scale:    { type: 'f32'   },
      ambient_occlusion_texture:  { type: 'u32'   },
    }, instances, GPUBufferUsage.STORAGE);
  }
}

export class MaterialBase<TUniformStruct extends WebGPUStruct<any>> implements IMaterial {
  public readonly hash: number;
  public readonly shader: GPUShaderModule;
  public readonly uniforms: TUniformStruct;
  public readonly bindLayout: GPUBindGroupLayout;
  public readonly bindGroup: GPUBindGroup;

  constructor(
    device: GPUDevice,
    shader_code: string,
    uniforms: TUniformStruct,
    bindLayout: GPUBindGroupLayout,
    bindGroup: GPUBindGroup,
  ) {
    this.hash = Hash.cyrb53([this.constructor.name, Hash.cyrb53(shader_code)].join(','));
    this.shader = device.createShaderModule({ code: shader_code });
    this.uniforms = uniforms;
    this.bindLayout = bindLayout;
    this.bindGroup  = bindGroup;
  }

  public destroy(): void {
    this.uniforms.destroy();
  }
}

export class BRDFMaterial extends MaterialBase<BRDFMaterialData> {
  constructor(
    device: GPUDevice,
    shader_code: string,
    instances: number = 1,
  ) {
    const uniforms = new BRDFMaterialData(device, instances);
    const bindLayout = device.createBindGroupLayout({
      label: "BDRFMaterial",
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
      shader_code,
      uniforms,
      bindLayout,
      bindGroup,
    );
  }
}

export class OceanMaterial extends MaterialBase<OceanMaterialData> {
  constructor(
    device: GPUDevice,
    shader_code: string,
  ) {
    const uniforms = new OceanMaterialData(device, 1);
    const bindLayout = device.createBindGroupLayout({
      label: "OceanMaterial",
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
      shader_code,
      uniforms,
      bindLayout,
      bindGroup,
    );
  }
}
