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

export class OceanMaterial extends MaterialBase<OceanMaterialData> {
  constructor(
    device: GPUDevice,
    shader_code: string,
  ) {
    const uniforms = new OceanMaterialData(device, 1);
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
      shader_code,
      uniforms,
      bindLayout,
      bindGroup,
    );
  }
}
