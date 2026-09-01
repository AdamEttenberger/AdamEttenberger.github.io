import { WebGPUStruct } from '@/util/webgpu/webgpu_struct'
import { Plane, VertexLayout, type IGeometry } from '@/wgpu/resource/geometry'
import type { IMaterial } from '@/wgpu/resource/material';

export interface IMeshInstance {
  mMatrix: Float32Array<ArrayBuffer>;
  normalMatrix: Float32Array<ArrayBuffer>;
  material_id: Uint32Array<ArrayBuffer>;
}

export class MeshInstance extends WebGPUStruct<IMeshInstance> {
  public readonly bindGroupLayout: GPUBindGroupLayout;
  public readonly bindGroup: GPUBindGroup;
  private readonly _geometry: IGeometry;
  public readonly material: IMaterial;

  public get vertexLayout(): VertexLayout {
    return this._geometry.vertexLayout;
  }

  public get gpuVertexLayout(): GPUVertexBufferLayout {
    return this._geometry.vertexLayout.gpuLayout;
  }

  public get gpuIndexFormat(): GPUIndexFormat {
    return this._geometry.indexFormat;
  }

  public get gpuVertexBuffer(): GPUBuffer {
    return this._geometry.vertexBuffer;
  }

  public get gpuIndexBuffer(): GPUBuffer {
    return this._geometry.indexBuffer;
  }

  constructor(
    device: GPUDevice,
    instances: number,
    bindGroupLayout: GPUBindGroupLayout,
    geometry: IGeometry,
    material: IMaterial,
  ) {
    super(device, {
      mMatrix:      { type: 'mat4x4f' },
      normalMatrix: { type: 'mat4x4f' },
      material_id:  { type: 'u32'     },
    }, instances, GPUBufferUsage.STORAGE);
    this.bindGroupLayout = bindGroupLayout;
    this.bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.gpuBuffer } },
      ],
    });
    this._geometry = geometry;
    this.material = material;
  }
}

export class OceanMeshes extends MeshInstance {
  constructor(
    device: GPUDevice,
    instance_count: number,
    bindGroupLayout: GPUBindGroupLayout,
    material: IMaterial,
    gridsize: number = 1) {
    super(
      device,
      instance_count,
      bindGroupLayout,
      new Plane(device, gridsize),
      material,
    );
  }
}
