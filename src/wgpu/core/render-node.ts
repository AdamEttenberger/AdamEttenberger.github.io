import type App from '@/wgpu/core/app'
import { BindGroupIndex } from '@/wgpu/core/app'
import type { MeshInstance } from '@/wgpu/resource/mesh'
import type Skybox from '@/wgpu/resource/skybox'
import Hash from '@/wgpu/util/hash'

export interface IRenderNode {
  get hash(): number;
  createRenderPipeline(app: App, targetFormat: GPUTextureFormat): GPURenderPipeline;
  draw(pass: GPURenderPassEncoder): void;
  destroy(): void;
}

export class MeshInstanceRenderNode implements IRenderNode {
  public readonly mesh: MeshInstance;

  constructor(
    mesh: MeshInstance,
  ) {
    this.mesh = mesh;
  }

  public get hash(): number {
    return Hash.cyrb53([this.mesh.material.hash, this.mesh.vertexLayout.hash].join(','));
  }

  public createRenderPipeline(app: App, targetFormat: GPUTextureFormat): GPURenderPipeline {
    const pipelineLayout = app.device!.createPipelineLayout({
      bindGroupLayouts: [
        app.global_bind_group_layout,
        this.mesh.material.bindLayout,
        this.mesh.bindGroupLayout,
      ]
    });
    return app.device!.createRenderPipeline({
      layout: pipelineLayout,
      depthStencil: {
        format: 'depth24plus-stencil8',
        depthWriteEnabled: true,
        depthCompare: 'less',
      },
      vertex: {
        module: this.mesh.material.shader,
        entryPoint: 'vs_main',
        buffers: [this.mesh.gpuVertexLayout],
      },
      fragment: {
        module: this.mesh.material.shader,
        entryPoint: 'fs_main',
        targets: [{ format: targetFormat }],
      },
      primitive: {
        topology: 'triangle-list',
        frontFace: 'ccw',
        cullMode: 'back',
      }
    });
  }

  public draw(pass: GPURenderPassEncoder): void {
    pass.setBindGroup(BindGroupIndex.Material, this.mesh.material.bindGroup);
    pass.setBindGroup(BindGroupIndex.Instance, this.mesh.bindGroup);
    pass.setVertexBuffer(0, this.mesh.gpuVertexBuffer);
    pass.setIndexBuffer(this.mesh.gpuIndexBuffer, this.mesh.gpuIndexFormat);
    pass.drawIndexed(this.mesh.gpuIndexBuffer.size / (this.mesh.gpuIndexFormat === 'uint16' ? 2 : 4), this.mesh.count);
  }

  public destroy(): void {
    this.mesh.destroy();
  }
}

export class SkyboxRenderNode implements IRenderNode {
  private readonly _skybox: Skybox;

  constructor(
    skybox: Skybox,
  ) {
    this._skybox = skybox;
  }

  public get hash(): number {
    return this._skybox.material.hash;
  }

  public createRenderPipeline(app: App, targetFormat: GPUTextureFormat): GPURenderPipeline {
    const pipelineLayout = app.device!.createPipelineLayout({
      bindGroupLayouts: [
        app.global_bind_group_layout,
        this._skybox.material.bindLayout,
        this._skybox.bindGroupLayout,
      ]
    });
    return app.device!.createRenderPipeline({
      layout: pipelineLayout,
      depthStencil: {
        format: 'depth24plus-stencil8',
        depthWriteEnabled: false,
        depthCompare: 'less-equal',
      },
      vertex: {
        module: this._skybox.material.shader,
        entryPoint: 'vs_main',
      },
      fragment: {
        module: this._skybox.material.shader,
        entryPoint: 'fs_main',
        targets: [{ format: targetFormat }],
      },
      primitive: {
        topology: 'triangle-list',
        frontFace: 'ccw',
        cullMode: 'back',
      }
    });
  }

  public draw(pass: GPURenderPassEncoder): void {
    pass.setBindGroup(BindGroupIndex.Material, this._skybox.material.bindGroup);
    pass.setBindGroup(BindGroupIndex.Instance, this._skybox.bindGroup);
    pass.draw(3);
  }

  public destroy(): void {
    this._skybox.destroy();
  }
}