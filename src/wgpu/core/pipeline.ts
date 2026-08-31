import type App from '@/wgpu/core/app'
import type { MeshInstance } from '@/wgpu/resource/mesh';
import Hash from '@/wgpu/util/hash';

export default class Pipeline {
  public readonly device: GPUDevice;
  public readonly render_pipelines = new Map<number, GPURenderPipeline>();

  constructor(
    device: GPUDevice,
  ) {
    this.device = device;
  }

  public getRenderPipeline(app: App, targetFormat: GPUTextureFormat, mesh: MeshInstance): GPURenderPipeline {
    const hash: number = Hash.cyrb53([mesh.material.hash, mesh.vertexLayout.hash, targetFormat].join(','));
    const cached = this.render_pipelines.get(hash);
    if (cached !== undefined) {
      return cached;
    }

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [
        app.global_bind_group_layout,
        mesh.material.bindLayout,
        mesh.bindGroupLayout,
      ]
    });
    const pipeline = this.device.createRenderPipeline({
      layout: pipelineLayout,
      depthStencil: {
        format: 'depth24plus-stencil8',
        depthWriteEnabled: true,
        depthCompare: 'less',
      },
      vertex: {
        module: mesh.material.shader,
        entryPoint: 'vs_main',
        buffers: [mesh.gpuVertexLayout],
      },
      fragment: {
        module: mesh.material.shader,
        entryPoint: 'fs_main',
        targets: [{ format: targetFormat }],
      },
      primitive: {
        topology: 'triangle-list',
        frontFace: 'ccw',
        cullMode: 'back',
      }
    });

    this.render_pipelines.set(hash, pipeline);
    return pipeline;
  }
}
