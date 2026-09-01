import { WebGPUStruct } from '@/util/webgpu/webgpu_struct'
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
    }, instances, GPUBufferUsage.STORAGE);
  }
}

export class OceanMaterial implements IMaterial {
  public readonly hash: number;
  public readonly shader: GPUShaderModule;
  public readonly uniforms: OceanMaterialData;
  public readonly bindLayout: GPUBindGroupLayout;
  public readonly bindGroup: GPUBindGroup;

  constructor(
    device: GPUDevice,
    shader_code: string,
  ) {
    this.hash = Hash.cyrb53(['OceanMaterialData', Hash.cyrb53(shader_code)].join(','));
    this.shader = device.createShaderModule({ code: shader_code });
    this.uniforms = new OceanMaterialData(device, 1)
    this.bindLayout = device.createBindGroupLayout({
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
    this.bindGroup = device.createBindGroup({
      layout: this.bindLayout,
      entries: [
        { binding: 0, resource: { buffer: this.uniforms.gpuBuffer } },
      ],
    });
  }

  public destroy() {
    this.uniforms.destroy();
  }

}
