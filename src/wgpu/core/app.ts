import { WebGPUStruct } from '@/wgpu/resource/buffer'
import type { ICamera } from '@/wgpu/core/camera';
import Pipeline from '@/wgpu/core/pipeline';
import Viewport from '@/wgpu/core/viewport'
import { TextureGroup } from '@/wgpu/resource/texture';
import TextureRegistry from '@/wgpu/resource/texture';
import { vec2, vec4 } from 'ts-gl-matrix';
import { type IRenderNode } from '@/wgpu/core/render-node';
import OnAppUpdateHandler from '@/wgpu/event/app/on-app-update';

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

class AppState {
  public readonly pipeline: Pipeline;
  public readonly render_nodes = new Array<IRenderNode>();

  constructor(
    public readonly context: GPUCanvasContext,
    public readonly adapter: GPUAdapter,
    public readonly device: GPUDevice,
    public readonly viewport: Viewport,
    public readonly global_uniforms: GlobalUniforms,
    public readonly global_bind_group_layout: GPUBindGroupLayout,
    public readonly instance_bind_group_layout: GPUBindGroupLayout,
    public readonly global_bind_group: GPUBindGroup,
    public readonly texture_registry: TextureRegistry,
  ) {
    this.pipeline = new Pipeline(device);
  }

  public destroy() {
    this.viewport.destroy();
    this.render_nodes.forEach(node => node.destroy());
    this.render_nodes.length = 0;
    this.global_uniforms?.destroy();
    this.pipeline?.destroy();
    this.texture_registry?.destroy();
    this.device?.destroy();
  }
}

export default class App {
  public readonly on_update = new OnAppUpdateHandler();

  private _initializing: Promise<void>;
  private _state: AppState|null = null;

  public camera: ICamera|null = null;

  // TODO: Remove escape hatches
  public get isReady(): boolean { return this._state !== null; }
  public get device(): GPUDevice|undefined { return this._state?.device; }
  public get globalBindGroupLayout(): GPUBindGroupLayout|undefined { return this._state?.global_bind_group_layout; }
  public get instanceBindGroupLayout(): GPUBindGroupLayout|undefined { return this._state?.instance_bind_group_layout; }
  public get deviceFormat(): GPUTextureFormat|undefined { return this._state?.viewport.deviceFormat; }
  public get textureRegistry(): TextureRegistry|undefined { return this._state?.texture_registry; }
  public get globalUniforms(): GlobalUniforms|undefined { return this._state?.global_uniforms; }

  constructor(
    canvas: HTMLCanvasElement,
    texture_group_budgets: Map<TextureGroup, number>,
  ) {
    if (!navigator.gpu) {
      throw new TypeError('WebGPU is not supported by this browser.');
    }
    this._initializing = this.initAsync(canvas, texture_group_budgets);
  }

  public get ready(): Promise<void> {
    return this._initializing;
  }

  private async initAsync(
    canvas: HTMLCanvasElement,
    texture_group_budgets: Map<TextureGroup, number>,
  ) {
    const context: GPUCanvasContext | null = canvas.getContext('webgpu');
    if (!context) {
      throw new TypeError('WebGPU Context not available.');
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new TypeError('WebGPU Adapter not available.');
    }
    const device = await adapter.requestDevice();
    if (!device) {
      throw new TypeError('WebGPU Device not available.');
    }
    const viewport = new Viewport(device, canvas, context);

    const texture_registry = new TextureRegistry(device, texture_group_budgets);
    const texture_group_2k: GPUTextureView|undefined = texture_registry.get_group(TextureGroup._2k);
    if (texture_group_2k === undefined) {
      throw new Error('WebGPU Texture group not available');
    }

    const global_uniforms = new GlobalUniforms(device);
    const global_bind_group_layout = device.createBindGroupLayout({
      label: "Global",
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          sampler: { type: 'filtering' },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          sampler: { type: 'filtering' },
        },
        {
          binding: 3,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          sampler: { type: 'non-filtering' },
        },
        {
          binding: 4,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          sampler: { type: 'non-filtering' },
        },
        {
          binding: 5,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          sampler: { type: 'comparison' },
        },
        {
          binding: 6,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: 'float',
            viewDimension: '2d-array',
            multisampled: false,
          },
        },
      ]
    });
    const instance_bind_group_layout = device.createBindGroupLayout({
      label: "Instance",
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
    const global_bind_group = device.createBindGroup({
      layout: global_bind_group_layout,
      entries: [
        { binding: 0, resource: { buffer: global_uniforms.gpuBuffer } },
        { binding: 1, resource: device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
            addressModeU: 'repeat',
            addressModeV: 'repeat',
          })
        },
        { binding: 2, resource: device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
          })
        },
        { binding: 3, resource: device.createSampler({
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            addressModeU: 'repeat',
            addressModeV: 'repeat',
          })
        },
        { binding: 4, resource: device.createSampler({
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
          })
        },
        { binding: 5, resource: device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            compare: 'less-equal',
          })
        },
        {
          binding: 6,
          resource: texture_group_2k,
        },
      ],
    })
    
    this._state = new AppState(
      context,
      adapter,
      device,
      viewport,
      global_uniforms,
      global_bind_group_layout,
      instance_bind_group_layout,
      global_bind_group,
      texture_registry,
    );

    this._state.viewport.on_display_changed.subscribe(this.onDisplayChanged);
    this._state.viewport.on_render.subscribe(this.onRender);
  }

  public destroy() {
    if (this._state) {
      this._state.destroy();
      this._state = null;
    }
    this.on_update.disconnect();
    this.camera = null;
  }

  public add(node: IRenderNode): IRenderNode|undefined {
    if (!this._state) {
      return;
    }
    this._state.render_nodes.push(node);
    return node;
  }

  public setDarkMode(value: boolean) {
    if (!this._state) {
      return;
    }
    this._state.global_uniforms.value[0].iDarkMode[0] = value ? 1 : 0;
  }

  public handleMouseMoveEvent(event: MouseEvent): boolean {
    if (!this._state) {
      return false;
    }
    const box = this._state.viewport.boundingClientRect;
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    vec2.set(this._state.global_uniforms!.value[0].iMouse, x, y);
    event.stopPropagation();
    return true;
  }

  public handleMouseClickEvent(event: PointerEvent): boolean {
    if (!this._state) {
      return false;
    }
    event.stopPropagation();
    return true;
  }

  public handleContextMenuEvent(event: PointerEvent): boolean {
    if (!this._state) {
      return false;
    }
    event.stopPropagation();
    return true;
  }

  private readonly onDisplayChanged = (viewport: Viewport) => {
    if (!this._state) {
      return;
    }
    vec4.set(this._state.global_uniforms.value[0].iResolution,
      viewport.physicalWidth,
      viewport.physicalHeight,
      viewport.devicePixelRatio,
      viewport.aspect);
  };

  private readonly onRender = (viewport: Viewport, timestamp: number) => {
    if (!this._state ||
        !this._state.viewport.depthStencilTextureView ||
        !this.camera) {
      return;
    }
    this.on_update.emit(this, viewport, timestamp);

    this.camera.apply(viewport, this._state.global_uniforms.value[0]);
    this._state.global_uniforms.value[0].iTime[0] = timestamp * 0.001;
    this._state.global_uniforms.submit();

    const encoder = this._state.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this._state.viewport.createTextureView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1},
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: this._state.viewport.depthStencilTextureView,
        depthClearValue: 1,
        stencilClearValue: 0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
        stencilLoadOp: 'clear',
        stencilStoreOp: 'store',
      },
    });

    for (const node of this._state.render_nodes) {
      pass.setPipeline(this._state.pipeline.getRenderPipeline(this, this._state.viewport.deviceFormat, node));
      pass.setBindGroup(BindGroupIndex.Global, this._state.global_bind_group);
      node.draw(pass);
    }
    pass.end();

    this._state.device.queue.submit([encoder.finish()]);
  }
}
