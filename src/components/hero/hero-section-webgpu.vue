<script setup lang="ts">
import { useTemplateRef, onMounted, onUnmounted } from 'vue'
import { vec2, vec3, mat4, quat, type Vec3Like, type QuatLike, type Mat4Like, vec4 } from 'ts-gl-matrix'
import shader_code from '@/assets/shaders/hero-section/shader.wgsl?raw'

const kToRadianScalar = Math.PI / 180.0;
function toRadian(degrees: number) {
  return degrees * kToRadianScalar;
}

enum ViewportState {
  Idle,
  Playing,
  Stopping,
};

/**
 * Helper which manages the Viewport state tied to a Canvas.
 * Automatically responds to display size and resolution changes.
 * Automatically starts/stops rendering depending on whether the Canvas is visible.
 */
class Viewport {
  private _container: WeakRef<Element>;
  private _canvas: WeakRef<HTMLCanvasElement>;
  private _onResizeEvent: ((viewport: Viewport) => void)|null;
  private _onAnimationFrame: ((timestamp: number) => void)|null;

  private _intersectionObserver: IntersectionObserver|null;
  private _resizeObserver: ResizeObserver|null = null;
  private _resolutionMediaQuery: MediaQueryList|null = null;

  private _logicalWidth: number = 0;
  private _logicalHeight: number = 0;
  private _physicalWidth: number = 0;
  private _physicalHeight: number = 0;
  private _aspect: number = 0;
  private _devicePixelRatio: number = 0;
  private _state: ViewportState = ViewportState.Idle;

  /**
   * @param container The container around the canvas element which the canvas is intended to fill.
   * @param canvas The canvas element used for rendering the scene.
   * @param onAnimationFrame Callback executed to render a new frame.
   */
  constructor(container: Element, canvas: HTMLCanvasElement, onResizeEvent: ((viewport: Viewport) => void)|null, onAnimationFrame: ((timestamp: number) => void)|null) {
    this._container = new WeakRef(container);
    this._canvas = new WeakRef(canvas);
    this._onResizeEvent = onResizeEvent;
    this._onAnimationFrame = onAnimationFrame;
    this._intersectionObserver = new IntersectionObserver(this.onIntersectionObserver);
    this._resizeObserver = new ResizeObserver(this.onDisplayChanged);
    this._resizeObserver.observe(container);
    this._intersectionObserver.observe(canvas);
    this.onDisplayChanged();
  }

  public get logicalWidth(): number { return this._logicalWidth; }
  public get logicalHeight(): number { return this._logicalHeight; }
  public get physicalWidth(): number { return this._physicalWidth; }
  public get physicalHeight(): number { return this._physicalHeight; }
  public get aspect(): number { return this._aspect; }
  public get devicePixelRatio(): number { return this._devicePixelRatio; }
  public get state(): ViewportState { return this._state; }

  public destroy() {
    if (this._resizeObserver) {
      this._resizeObserver?.disconnect();
      this._resizeObserver = null;
    }
    if (this._resolutionMediaQuery) {
      this._resolutionMediaQuery?.removeEventListener('change', this.onDisplayChanged);
      this._resolutionMediaQuery = null;
    }
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
      this._intersectionObserver = null;
    }
    this._onResizeEvent = null;
    this._onAnimationFrame = null;
  }

  private onDisplayChanged = () => {
    const currentDevicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    if (this.devicePixelRatio != currentDevicePixelRatio) {
      this._resolutionMediaQuery?.removeEventListener('change', this.onDisplayChanged);
      this._devicePixelRatio = currentDevicePixelRatio;
      this._resolutionMediaQuery = window.matchMedia(`(resolution: ${currentDevicePixelRatio}dppx)`),
      this._resolutionMediaQuery.addEventListener('change', this.onDisplayChanged);
    }
    const box = this._container.deref()?.getBoundingClientRect();
    this._logicalWidth = box?.width ?? 0;
    this._logicalHeight = box?.height ?? 0;
    this._physicalWidth = Math.max(1, Math.round(this.logicalWidth * this.devicePixelRatio));
    this._physicalHeight = Math.max(1, Math.round(this.logicalHeight * this.devicePixelRatio));
    this._aspect = this.physicalWidth / this.physicalHeight;

    let canvas = this._canvas.deref();
    if (canvas) {
      canvas.style.width = `${this.logicalWidth}px`;
      canvas.style.height = `${this.logicalHeight}px`;
      canvas.width = Math.floor(this.physicalWidth);
      canvas.height = Math.floor(this.physicalHeight);
    }
    this._onResizeEvent?.(this);
  }

  private onIntersectionObserver = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    const isVisible: boolean = entries[0]?.isIntersecting ?? false;
    if (this.state === ViewportState.Idle && isVisible) {
      this._state = ViewportState.Playing;
      requestAnimationFrame(this.onRequestAnimationFrame);
    } else if (this.state === ViewportState.Playing && !isVisible) {
      this._state = ViewportState.Stopping;
    }
  }

  private onRequestAnimationFrame = (timestamp: number) => {
    if (this.state !== ViewportState.Playing) {
      this._state = ViewportState.Idle;
      return;
    }
    this._onAnimationFrame?.(timestamp);
    if (this.state === ViewportState.Playing) {
      requestAnimationFrame(this.onRequestAnimationFrame);
    }
  }
}

type WebGPUUniformType =
    'f32' | 'i32' | 'u32' |
    'vec2f' | 'vec2i' | 'vec2u' |
    'vec3f' | 'vec3i' | 'vec3u' |
    'vec4f' | 'vec4i' | 'vec4u' |
    'mat2x2f' | 'mat3x3f' | 'mat4x4f';

interface WebGPUUniformTypeSpec {
  size: number;
  align: number;
}

const TYPE_SPECS: Record<WebGPUUniformType, WebGPUUniformTypeSpec> = {
  f32:      { size: 4,  align: 4 },
  i32:      { size: 4,  align: 4 },
  u32:      { size: 4,  align: 4 },
  vec2f:    { size: 8,  align: 8 },
  vec2i:    { size: 8,  align: 8 },
  vec2u:    { size: 8,  align: 8 },
  vec3f:    { size: 12, align: 16 },
  vec3i:    { size: 12, align: 16 },
  vec3u:    { size: 12, align: 16 },
  vec4f:    { size: 16, align: 16 },
  vec4i:    { size: 16, align: 16 },
  vec4u:    { size: 16, align: 16 },
  mat2x2f:  { size: 16, align: 8 },
  mat3x3f:  { size: 48, align: 16 },
  mat4x4f:  { size: 64, align: 16 },
};

interface WebGPUUniformFieldDefinition {
  name: string;
  type: WebGPUUniformType;
}

class WebGPUStruct {
  public readonly gpuBuffer: GPUBuffer;
  public readonly arrayBuffer: ArrayBuffer;
  protected readonly fieldSizes: Record<string, number> = {};
  protected readonly fieldOffsets: Record<string, number> = {};
  private readonly _device: GPUDevice;

  constructor(device: GPUDevice, schema: WebGPUUniformFieldDefinition[]) {
    this._device = device;

    let currentOffset = 0;
    for (const field of schema) {
      const { size, align } = TYPE_SPECS[field.type];
      currentOffset = Math.ceil(currentOffset / align) * align;
      this.fieldSizes[field.name] = size;
      this.fieldOffsets[field.name] = currentOffset;
      currentOffset += size;
    }
    this.arrayBuffer = new ArrayBuffer(Math.ceil(currentOffset / 16) * 16);
    this.gpuBuffer = device.createBuffer({
      size: this.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  public get byteLength(): number { return this.arrayBuffer.byteLength; }

  public submit = () => {
    this._device.queue.writeBuffer(this.gpuBuffer, 0, this.arrayBuffer);
  }

  protected getFloatField(name: string): Float32Array<ArrayBuffer> {
    return new Float32Array<ArrayBuffer>(
      this.arrayBuffer,
      this.fieldOffsets[name]!,
      this.fieldSizes[name]! / 4
    );
  }

  protected getUIntField(name: string): Uint32Array<ArrayBuffer> {
    return new Uint32Array<ArrayBuffer>(
      this.arrayBuffer,
      this.fieldOffsets[name]!,
      this.fieldSizes[name]! / 4
    );
  }
}

class HeroSectionUniforms extends WebGPUStruct {
  public mMatrix: Float32Array<ArrayBuffer>;
  public vMatrix: Float32Array<ArrayBuffer>;
  public pMatrix: Float32Array<ArrayBuffer>;
  public iResolution: Float32Array<ArrayBuffer>;
  public iMouse: Float32Array<ArrayBuffer>;
  private _iTime: Float32Array<ArrayBuffer>;

  public get iTime(): number { return this._iTime[0]!; }
  public set iTime(value: number) { this._iTime[0] = value; }

  constructor(device: GPUDevice) {
    super(device, [
      { name: 'mMatrix',      type: 'mat4x4f' },
      { name: 'vMatrix',      type: 'mat4x4f' },
      { name: 'pMatrix',      type: 'mat4x4f' },
      { name: 'iResolution',  type: 'vec4f'   },
      { name: 'iMouse',       type: 'vec2f'   },
      { name: 'iTime',        type: 'f32'     },
    ]);

    this.mMatrix = this.getFloatField('mMatrix');
    this.vMatrix = this.getFloatField('vMatrix');
    this.pMatrix = this.getFloatField('pMatrix');
    this.iResolution = this.getFloatField('iResolution');
    this.iMouse = this.getFloatField('iMouse');
    this._iTime = this.getFloatField('iTime');
  }
}

interface Camera {
  position: Vec3Like;
  rotation: QuatLike;
  scale: Vec3Like;
  projection: ({
    type: 'perspective',
    fovy: number;
    near: number;
    far: number;
  } | {
    type: 'orthogonal',
    left: number;
    right: number;
    bottom: number;
    top: number;
    near: 0.1,
    far: 1000.0,
  });
}

interface MainState {
  viewport: Viewport;
  context: GPUCanvasContext;
  adapter: GPUAdapter;
  device: GPUDevice;
  format: GPUTextureFormat;
  uniforms: HeroSectionUniforms;
  pipeline: GPURenderPipeline;
  bindGroup: GPUBindGroup;
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
  camera: Camera;
};

async function setup() {
  if (!container.value || !canvas.value) {
    throw new Error('Cannot find canvas containers.')
  }
  if (!navigator.gpu) {
    throw new Error('WebGPU is not supported by this browser.');
  }

  const context = canvas.value.getContext('webgpu') as GPUCanvasContext | null;
  if (!context) {
    throw new Error('WebGPU Context not available.');
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('WebGPU Adapter not available.');
  }
  const device = await adapter.requestDevice();
  if (!device) {
    throw new Error('WebGPU Device not available.');
  }
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format,
    alphaMode: 'opaque',
  });

  const vertices = new Float32Array([
    // position   // uv   // color
    -1,  1, 0,    0, 0,   1, 0, 0, 1, // top-left
    -1, -1, 0,    0, 1,   0, 1, 0, 1, // bottom-left
     1, -1, 0,    1, 1,   0, 0, 1, 1, // bottom-right
     1,  1, 0,    1, 0,   1, 1, 1, 1, // top-right
  ]);
  const indices = new Uint32Array([
    0, 1, 2,
    0, 2, 3,
  ]);
  const uniforms = new HeroSectionUniforms(device);

  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  const indexBuffer = device.createBuffer({
    size: indices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
  });

  const shaderModule = device.createShaderModule({ code: shader_code });
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform' },
      }
    ]
  });
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: uniforms.gpuBuffer } },
    ],
  });
  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
    vertex: {
      module: shaderModule,
      entryPoint: 'vs_main',
      buffers: [
        {
          arrayStride: 9 * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x3' },
            { shaderLocation: 1, offset: 3 * Float32Array.BYTES_PER_ELEMENT, format: 'float32x2' },
            { shaderLocation: 2, offset: 5 * Float32Array.BYTES_PER_ELEMENT, format: 'float32x4' }
          ],
        }
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      targets: [{ format }],
    },
    primitive: {
      topology: 'triangle-list',
    }
  });

  device.queue.writeBuffer(vertexBuffer, 0, vertices);
  device.queue.writeBuffer(indexBuffer, 0, indices);

  state = {
    viewport: new Viewport(container.value, canvas.value, resize, render),
    context,
    adapter,
    device,
    format,
    uniforms,
    pipeline,
    bindGroup,
    vertexBuffer,
    indexBuffer,
    camera: {
      position: vec3.fromValues(0, 0, 1),
      rotation: quat.create(),
      // position: vec3.fromValues(0.0, 5.0, 20.0),
      // rotation: quat.fromEuler(quat.create(), toRadian(-15.0), 0.0, 0.0),
      scale: vec3.fromValues(1, 1, 1),
      projection: {
        type: "orthogonal",
        left: -1,
        right: 1,
        bottom: -1,
        top: 1,
        near: 0.1,
        far: 1000.0,
      }
    },
  };
}

function shutdown() {
  state?.viewport.destroy();
}

function updateCameraMatrix() {
  if (!state) {
    return;
  }
  const cameraWorldMatrix = mat4.fromRotationTranslationScale(mat4.create(), state.camera.rotation, state.camera.position, state.camera.scale);
  mat4.invert(state.uniforms.vMatrix, cameraWorldMatrix);
  switch (state.camera.projection.type) {
    case 'perspective':
      mat4.perspectiveZO(state.uniforms.pMatrix, state.camera.projection.fovy, state.viewport.aspect, state.camera.projection.near, state.camera.projection.far);
      break;
    case 'orthogonal':
      mat4.orthoZO(state.uniforms.pMatrix, state.camera.projection.left, state.camera.projection.right, state.camera.projection.bottom, state.camera.projection.top, state.camera.projection.near, state.camera.projection.far);
      break;
  }
}

function resize(viewport: Viewport) {
  if (!state) {
    return;
  }
  vec4.set(state.uniforms.iResolution,
      viewport.physicalWidth,
      viewport.physicalHeight,
      viewport.devicePixelRatio,
      viewport.aspect);
}

function render(timestamp: number) {
  if (!state) {
    return;
  }

  mat4.identity(state.uniforms.mMatrix);
  updateCameraMatrix();
  state.uniforms.iTime = timestamp * 0.001;
  state.uniforms.submit();

  const encoder = state.device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: state.context.getCurrentTexture().createView(),
        clearValue: { r: 0.3922, g: 0.5843, b: 0.9294, a: 1.0 },
        loadOp: 'clear',
        storeOp: 'store',
      },
    ],
  });

  pass.setPipeline(state.pipeline);
  pass.setBindGroup(0, state.bindGroup);
  pass.setVertexBuffer(0, state.vertexBuffer);
  pass.setIndexBuffer(state.indexBuffer, 'uint32');
  pass.drawIndexed(state.indexBuffer.size / 4);
  pass.end();

  state.device.queue.submit([encoder.finish()]);
}

function handleMouseMoveEvent(evt: MouseEvent) {
  if (!state) {
    return;
  }
  const box = (evt.currentTarget as HTMLCanvasElement).getBoundingClientRect();
  const x = (evt.clientX - box.left) / box.width;
  const y = (evt.clientY - box.top) / box.height;
  vec2.set(state.uniforms.iMouse, x, y);
}

function onContextMenu(evt: PointerEvent) {
  evt.preventDefault();
}

const container = useTemplateRef<Element>('container');
const canvas = useTemplateRef<HTMLCanvasElement>('canvas');
let state: MainState|null;

onMounted(() => setup());
onUnmounted(() => shutdown());
defineExpose({
  handleMouseMoveEvent
});
</script>

<template>
  <div class="hero-section-viewport-container" ref="container">
    <canvas ref="canvas" @contextmenu="onContextMenu">
      <div class='error'><img src='/images/html5_white.png' width='128' height='128' /><h2>This page requires support for HTML5 Canvas and WebGPU</h2></div>
    </canvas>
  </div>
</template>

<style scoped>
.hero-section-viewport-container {
  position: relative;
  width: 100%;
  height: 100%;

  & > canvas {
    width: 100%;
    height: 100%;
    background-color: black;
  }
}
</style>
