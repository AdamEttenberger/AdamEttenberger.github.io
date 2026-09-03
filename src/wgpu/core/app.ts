import { WebGPUStruct } from '@/wgpu/resource/buffer'
import type { ICamera } from '@/wgpu/core/camera';
import Pipeline from '@/wgpu/core/pipeline';
import Viewport from '@/wgpu/core/viewport'
import { TextureGroup } from '@/wgpu/resource/texture';
import TextureRegistry from '@/wgpu/resource/texture';
import { vec4 } from 'ts-gl-matrix';
import { type IRenderNode } from '@/wgpu/core/render-node';
import OnAppUpdate from '@/wgpu/event/app/on-app-update';

export enum BindGroupIndex {
  Global,
  Material,
  Instance,
}

export interface IGlobalUniforms {
  vMatrix:          Float32Array<ArrayBuffer>;
  pMatrix:          Float32Array<ArrayBuffer>;
  vMatrixInverse:   Float32Array<ArrayBuffer>;
  pMatrixInverse:   Float32Array<ArrayBuffer>;
  iResolution:      Float32Array<ArrayBuffer>;
  iCameraPosition:  Float32Array<ArrayBuffer>;
  iTime:            Float32Array<ArrayBuffer>;
  iMouse:           Float32Array<ArrayBuffer>;
  iDarkMode:        Float32Array<ArrayBuffer>;
  iSunDirection:    Float32Array<ArrayBuffer>;
  iSunLightColor:   Float32Array<ArrayBuffer>;
}

class GlobalUniforms extends WebGPUStruct<IGlobalUniforms>
{
  public constructor(
    device: GPUDevice,
  ) {
    super(device, {
      vMatrix:          { type: 'mat4x4f' },
      pMatrix:          { type: 'mat4x4f' },
      vMatrixInverse:   { type: 'mat4x4f' },
      pMatrixInverse:   { type: 'mat4x4f' },
      iResolution:      { type: 'vec4f'   },
      iCameraPosition:  { type: 'vec3f'   },
      iTime:            { type: 'f32'     },
      iMouse:           { type: 'vec2f'   },
      iDarkMode:        { type: 'u32'     },
      iSunDirection:    { type: 'vec3f'   },
      iSunLightColor:   { type: 'vec3f'   },
    }, 1, GPUBufferUsage.UNIFORM);
  }
}

export default class App {
  public readonly on_update = new OnAppUpdate();

  private _initializing: Promise<void>;
  private _context: GPUCanvasContext|null = null;
  private _adapter: GPUAdapter|null = null;
  public device: GPUDevice|null = null;
  public deviceFormat: GPUTextureFormat|null = null;
  private _viewport: Viewport|null = null;

  public global_uniforms: GlobalUniforms|null = null;
  public global_bind_group_layout: GPUBindGroupLayout|null = null;
  public instance_bind_group_layout: GPUBindGroupLayout|null = null;

  public global_bind_group: GPUBindGroup|null = null;

  public texture_registry: TextureRegistry|null = null;

  public camera: ICamera|null = null;

  private _render_nodes = new Array<IRenderNode>();
  private _pipeline: Pipeline|null = null;

  constructor(
    canvas: HTMLCanvasElement,
  ) {
    if (!navigator.gpu) {
      throw new TypeError('WebGPU is not supported by this browser.');
    }
    this._initializing = this.initAsync(canvas);
  }

  public get ready(): Promise<void> {
    return this._initializing;
  }

  private async initAsync(canvas: HTMLCanvasElement) {
    this._context = canvas.getContext('webgpu') as GPUCanvasContext | null;
    if (!this._context) {
      throw new TypeError('WebGPU Context not available.');
    }
    this._adapter = await navigator.gpu.requestAdapter();
    if (!this._adapter) {
      throw new TypeError('WebGPU Adapter not available.');
    }
    this.device = await this._adapter.requestDevice();
    if (!this.device) {
      throw new TypeError('WebGPU Device not available.');
    }
    this.deviceFormat = navigator.gpu.getPreferredCanvasFormat();
    this._context.configure({
      device: this.device,
      format: this.deviceFormat,
      alphaMode: 'opaque',
    });
    this._viewport = new Viewport(this.device, canvas);
    this._viewport.on_display_changed.subscribe(this.onDisplayChanged);
    this._viewport.on_render.subscribe(this.onRender);

    this.texture_registry = new TextureRegistry(this.device, new Map<TextureGroup, number>([
      [TextureGroup._2k, 1]
    ]));
    const texture_group_2k: GPUTextureView|undefined = this.texture_registry.get_group(TextureGroup._2k);
    if (texture_group_2k === undefined) {
      throw new Error('WebGPU Texture group not available');
    }

    this.global_uniforms = new GlobalUniforms(this.device);
    this.global_bind_group_layout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: 'float',
            viewDimension: '2d-array',
            multisampled: false,
          },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          sampler: {},
        },
        {
          binding: 3,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          sampler: {},
        },
        {
          binding: 4,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          sampler: {},
        },
        {
          binding: 5,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          sampler: {},
        },
        {
          binding: 6,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          sampler: {},
        },
      ]
    });
    this.instance_bind_group_layout = this.device.createBindGroupLayout({
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
    this.global_bind_group = this.device.createBindGroup({
      layout: this.global_bind_group_layout,
      entries: [
        { binding: 0, resource: { buffer: this.global_uniforms.gpuBuffer } },
        {
          binding: 1,
          resource: texture_group_2k,
        },
        { binding: 2, resource: this.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
            addressModeU: 'repeat',
            addressModeV: 'repeat',
          })
        },
        { binding: 3, resource: this.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
          })
        },
        { binding: 4, resource: this.device.createSampler({
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            addressModeU: 'repeat',
            addressModeV: 'repeat',
          })
        },
        { binding: 5, resource: this.device.createSampler({
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
          })
        },
        { binding: 6, resource: this.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
          })
        },
      ],
    })
    this._pipeline = new Pipeline(this.device);
  }

  public destroy() {
    if (this._viewport) {
      this._viewport.destroy();
      this._viewport = null;
    }
    this._render_nodes.forEach(node => node.destroy());
    this._render_nodes = [];
    this.global_uniforms?.destroy();
    this._pipeline?.destroy();
    this.texture_registry?.destroy();
    this.device?.destroy();
    this.on_update.disconnect();
  }

  public add(node: IRenderNode): IRenderNode {
    this._render_nodes.push(node);
    return node;
  }

  public setDarkMode(value: boolean) {
    if (!this.global_uniforms) {
      return;
    }
    this.global_uniforms.value[0].iDarkMode[0] = value ? 1 : 0;
  }

  private readonly onDisplayChanged = (viewport: Viewport) => {
    if (!this.global_uniforms) {
      return;
    }
    vec4.set(this.global_uniforms.value[0].iResolution,
      viewport.physicalWidth,
      viewport.physicalHeight,
      viewport.devicePixelRatio,
      viewport.aspect);
  };

  private readonly onRender = (viewport: Viewport, timestamp: number) => {
    if (!this.device ||
        !this.deviceFormat ||
        !this._context ||
        !this.camera ||
        !this.global_uniforms ||
        !this._pipeline ||
        !viewport.depthStencilTextureView) {
      return;
    }
    this.on_update.emit(this, viewport, timestamp);

    this.camera.apply(viewport, this.global_uniforms.value[0]);
    this.global_uniforms.value[0].iTime[0] = timestamp * 0.001;
    this.global_uniforms.submit();

    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this._context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1},
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: viewport.depthStencilTextureView,
        depthClearValue: 1,
        stencilClearValue: 0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
        stencilLoadOp: 'clear',
        stencilStoreOp: 'store',
      },
    });

    for (const node of this._render_nodes) {
      pass.setPipeline(this._pipeline.getRenderPipeline(this, this.deviceFormat, node));
      pass.setBindGroup(BindGroupIndex.Global, this.global_bind_group);
      node.draw(pass);
    }
    pass.end();

    this.device.queue.submit([encoder.finish()]);
  }
}
