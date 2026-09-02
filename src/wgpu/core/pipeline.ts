import type App from '@/wgpu/core/app'
import type { IRenderNode } from '@/wgpu/core/render-node';
import Hash from '@/wgpu/util/hash';

export default class Pipeline {
  public readonly device: GPUDevice;
  public readonly render_pipelines = new Map<number, GPURenderPipeline>();

  constructor(
    device: GPUDevice,
  ) {
    this.device = device;
  }

  public getRenderPipeline(app: App, targetFormat: GPUTextureFormat, node: IRenderNode): GPURenderPipeline {
    const hash: number = Hash.cyrb53([node.hash, targetFormat].join(','));
    const cached = this.render_pipelines.get(hash);
    if (cached !== undefined) {
      return cached;
    }

    const pipeline = node.createRenderPipeline(app, targetFormat);
    this.render_pipelines.set(hash, pipeline);
    return pipeline;
  }

  public destroy() {
    this.render_pipelines.clear();
  }
}
