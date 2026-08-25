<script setup lang="ts">
import { useTemplateRef, onMounted, onUnmounted } from 'vue'
import WebGPULogo from '@/components/webgpu-logo.vue'
import { vec2, vec3, mat4, quat, type Vec3Like, type QuatLike, vec4, Vec3 } from 'ts-gl-matrix'
import ocean_simulation_material_code from '@/assets/shaders/hero-section/ocean_simulation_material.wgsl?raw'
import ocean_simulation_flipbook_normal_height_map_src from '@/assets/textures/hero-section/normal_height_map_256_64f.webp'
import { WebGPUStruct } from '@/util/webgpu/webgpu_struct'
import { useUserPreferencesStore } from '@/stores/user_preferences'
import Viewport from '@/wgpu/core/viewport'
import TextureRegistry, { getTextureGroupSize, TextureGroup } from '@/wgpu/resource/texture'
const user_preferences = useUserPreferencesStore();

const kAnimationGridSize = vec2.fromValues(8, 8); // Number of animation frame [columns, rows]

const kInstanceTileScale = vec3.fromValues(200, 20, 200);
const kInstanceTileArea = vec4.fromValues(-5, -3, 5, 0);

const kOceanAlbedo: Vec3 = vec3.fromValues(0.0, 0.467, 0.745);

const kCameraPosition = vec3.fromValues(0, 150, 200);
const kCameraRotation = quat.fromEuler(quat.create(), -15, 0, 0);
const kLightDirection = vec3.normalize(vec3.create(), vec3.transformQuat(vec3.create(), vec3.fromValues(0, 0, -1), quat.fromEuler(quat.create(), 220, 15, 0)));

const kToRadianScalar = Math.PI / 180.0;
function toRadian(degrees: number) {
  return degrees * kToRadianScalar;
}

enum BindGroupIndex {
  Global,
  Material,
  Instance,
}

enum MeshKey {
  OceanSimulation
};

enum TextureLayerKey {
  OceanSimulation,
};
const TextureLayerKey_Count = Object.keys(TextureLayerKey).length / 2;

interface IGlobalUniforms {
  vMatrix:          Float32Array<ArrayBuffer>;
  pMatrix:          Float32Array<ArrayBuffer>;
  iResolution:      Float32Array<ArrayBuffer>;
  iCameraPosition:  Float32Array<ArrayBuffer>;
  iTime:            Float32Array<ArrayBuffer>;
  iMouse:           Float32Array<ArrayBuffer>;
  iLightDirection:  Float32Array<ArrayBuffer>;
  iLightColor:      Float32Array<ArrayBuffer>;
}

class GlobalUniforms extends WebGPUStruct<IGlobalUniforms>
{
  public constructor(
    device: GPUDevice,
  ) {
    super(device, {
      vMatrix:          { type: 'mat4x4f' },
      pMatrix:          { type: 'mat4x4f' },
      iResolution:      { type: 'vec4f'   },
      iCameraPosition:  { type: 'vec3f'   },
      iTime:            { type: 'f32'     },
      iMouse:           { type: 'vec2f'   },
      iLightDirection:  { type: 'vec3f'   },
      iLightColor:      { type: 'vec3f'   },
    }, 1, GPUBufferUsage.UNIFORM);
  }
}

interface IMaterialData {
  normal_height_texture: Uint32Array<ArrayBuffer>;
  albedo: Float32Array<ArrayBuffer>;
  grid_size: Float32Array<ArrayBuffer>;
  cell_size: Float32Array<ArrayBuffer>;
}

class MaterialData extends WebGPUStruct<IMaterialData>
{
  public constructor(
    device: GPUDevice,
    instances: number,
  ) {
    super(device, {
      normal_height_texture:  { type: 'u32'   },
      albedo:                 { type: 'vec3f' },
      grid_size:              { type: 'vec2f' },
      cell_size:              { type: 'vec2f' },
  }, instances, GPUBufferUsage.STORAGE);
  }
}

interface IMeshInstance {
  mMatrix: Float32Array<ArrayBuffer>;
  material_id: Uint32Array<ArrayBuffer>;
}

class MeshInstance extends WebGPUStruct<IMeshInstance> {
  public readonly bindGroup: GPUBindGroup;
  public readonly vertexBuffer: GPUBuffer;
  public readonly indexBuffer: GPUBuffer;

  public constructor(
    device: GPUDevice,
    instances: number,
    bindGroupLayout: GPUBindGroupLayout,
    vertices: Float32Array,
    indices: Uint32Array,
  ) {
    super(device, {
      mMatrix:      { type: 'mat4x4f' },
      material_id:  { type: 'u32'     },
    }, instances, GPUBufferUsage.STORAGE);
    this.bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.gpuBuffer } },
      ],
    });
    this.vertexBuffer = device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    this.indexBuffer = device.createBuffer({
      size: indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(this.vertexBuffer, 0, vertices);
    device.queue.writeBuffer(this.indexBuffer, 0, indices);
  }
}

class OceanMeshes extends MeshInstance {
  constructor(device: GPUDevice, instance_count: number, bindGroupLayout: GPUBindGroupLayout, gridsize: number = 1) {
    const vert_width = gridsize + 1;
    const vert_stride = 5; // {x, y, z, u, v}
    const vert_distance = 1 / gridsize;

    const vertices = new Float32Array(vert_width * vert_width * vert_stride);
    const indices = new Uint32Array(gridsize * gridsize * 6);

    // Begin in the "top-left" corner, right-handed coordinate space,
    // (-Z) into screen, UV [0, 0]
    let vert_index = 0;
    for (let row = 0; row <= gridsize; ++row) {
      let dy = row * vert_distance;
      for (let col = 0; col <= gridsize; ++col) {
        let dx = col * vert_distance;
        /*x=*/ vertices[vert_index]     = dx - 0.5;
        /*y=*/ vertices[vert_index + 1] = 0;
        /*z=*/ vertices[vert_index + 2] = dy - 0.5;
        /*u=*/ vertices[vert_index + 3] = dx;
        /*v=*/ vertices[vert_index + 4] = dy;
        vert_index += vert_stride;
      }
    }

    let quad_index = 0;
    for (let row = 0; row < gridsize; ++row) {
      let quad_tl = row * vert_width;
      for (let col = 0; col < gridsize; ++col) {
        let quad_br = quad_tl + vert_width + 1;
        /*tl=*/ indices[quad_index]     = quad_tl;
        /*bl=*/ indices[quad_index + 1] = quad_br - 1;
        /*br=*/ indices[quad_index + 2] = quad_br;
        /*tl=*/ indices[quad_index + 3] = quad_tl;
        /*br=*/ indices[quad_index + 4] = quad_br;
        /*tr=*/ indices[quad_index + 5] = quad_tl + 1;
        quad_index += 6;
        ++quad_tl;
      }
    }

    super(
      device,
      instance_count,
      bindGroupLayout,
      vertices,
      indices,
    );
  }
}

interface Camera {
  position: Vec3Like;
  rotation: QuatLike;
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
  global_uniforms: GlobalUniforms;
  materials: MaterialData,
  pipeline: GPURenderPipeline;
  bindGroupLayouts: {
    [K in BindGroupIndex]: GPUBindGroupLayout;
  };
  globalBindGroups: {
    [BindGroupIndex.Global]: GPUBindGroup;
    [BindGroupIndex.Material]: GPUBindGroup;
  };
  meshes: {
    [K in MeshKey]: MeshInstance;
  };
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

  const texture_registry = new TextureRegistry(device, new Map<TextureGroup, number>([
    [TextureGroup._2k, 1]
  ]));

  const global_uniforms = new GlobalUniforms(device);
  const materials = new MaterialData(device, 1);

  const ocean_simulation_datamap = await texture_registry.get(ocean_simulation_flipbook_normal_height_map_src);
  if (ocean_simulation_datamap === undefined) {
    throw new Error(`Cannot locate texture: ${ocean_simulation_flipbook_normal_height_map_src}`);
  }

  materials.value[0].normal_height_texture[0] = ocean_simulation_datamap.layer;
  vec3.copy(materials.value[0].albedo, kOceanAlbedo)
  vec2.copy(materials.value[0].grid_size, kAnimationGridSize);
  vec2.set(materials.value[0].cell_size,
    getTextureGroupSize(ocean_simulation_datamap.group) / kAnimationGridSize.x,
    getTextureGroupSize(ocean_simulation_datamap.group) / kAnimationGridSize.y
  );
  materials.submit();

  const global_texture_view: GPUTextureView|undefined = texture_registry.get_group(ocean_simulation_datamap.group);
  if (global_texture_view === undefined) {
    throw new Error(`Cannot find texture group: ${ocean_simulation_datamap.group}`);
  }

  const global_sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
    addressModeU: 'repeat',
    addressModeV: 'repeat',
  });

  const shaderModule = device.createShaderModule({ code: ocean_simulation_material_code });

  const bindGroupLayouts: { [K in BindGroupIndex]: GPUBindGroupLayout } = {
    [BindGroupIndex.Global]: device.createBindGroupLayout({
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
      ]
    }),
    [BindGroupIndex.Material]: device.createBindGroupLayout({
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
    }),
    [BindGroupIndex.Instance]: device.createBindGroupLayout({
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
    }),
  };

  const globalBindGroups = {
    [BindGroupIndex.Global]: device.createBindGroup({
      layout: bindGroupLayouts[BindGroupIndex.Global],
      entries: [
        { binding: 0, resource: { buffer: global_uniforms.gpuBuffer } },
        {
          binding: 1,
          resource: global_texture_view,
        },
        { binding: 2, resource: global_sampler },
      ],
    }),
    [BindGroupIndex.Material]: device.createBindGroup({
      layout: bindGroupLayouts[BindGroupIndex.Material],
      entries: [
        { binding: 0, resource: { buffer: materials.gpuBuffer } },
      ],
    }),
  };

  const ocean_tiles = new OceanMeshes(
    device,
    /*instance_count=*/(kInstanceTileArea.z - kInstanceTileArea.x + 1) * (kInstanceTileArea.w - kInstanceTileArea.y + 1),
    bindGroupLayouts[BindGroupIndex.Instance],
    /*gridsize=*/100,
  );
  let row_stride = (kInstanceTileArea.z - kInstanceTileArea.x + 1);
  for (var y = kInstanceTileArea.y; y <= kInstanceTileArea.w; ++y) {
    for (var x = kInstanceTileArea.x; x <= kInstanceTileArea.z; ++x) {
      let instance_id = (x - kInstanceTileArea.x) + ((y - kInstanceTileArea.y) * row_stride);
      mat4.fromRotationTranslationScale(ocean_tiles.value[instance_id].mMatrix,
       quat.create(),
       vec3.fromValues(x * kInstanceTileScale.x, 0, y * kInstanceTileScale.z),
       kInstanceTileScale);
      ocean_tiles.value[instance_id].material_id[0] = 0;
    }
  }
  ocean_tiles.submit();

  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: Object.values(bindGroupLayouts) }),
    depthStencil: {
      format: 'depth24plus-stencil8',
      depthWriteEnabled: true,
      depthCompare: 'less',
    },
    vertex: {
      module: shaderModule,
      entryPoint: 'vs_main',
      buffers: [
        {
          stepMode: 'vertex',
          arrayStride: 5 * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x3' },
            { shaderLocation: 1, offset: 3 * Float32Array.BYTES_PER_ELEMENT, format: 'float32x2' },
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      targets: [{ format }],
    },
    primitive: {
      topology: 'triangle-list',
      frontFace: 'ccw',
      cullMode: 'back',
    }
  });

  state = {
    viewport: new Viewport(device, container.value, canvas.value, resize, render),
    context,
    adapter,
    device,
    format,
    global_uniforms,
    materials,
    pipeline,
    bindGroupLayouts,
    globalBindGroups,
    meshes: {
      [MeshKey.OceanSimulation]: ocean_tiles,
    },
    camera: {
      position: kCameraPosition,
      rotation: kCameraRotation,
      projection: {
        type: "perspective",
        fovy: toRadian(60),
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
  const cameraWorldMatrix = mat4.fromRotationTranslationScale(mat4.create(), state.camera.rotation, state.camera.position, vec3.fromValues(1, 1, 1));
  mat4.invert(state.global_uniforms.value[0].vMatrix, cameraWorldMatrix);

  switch (state.camera.projection.type) {
    case 'perspective':
      mat4.perspectiveZO(state.global_uniforms.value[0].pMatrix, state.camera.projection.fovy, state.viewport.aspect, state.camera.projection.near, state.camera.projection.far);
      break;
    case 'orthogonal':
      mat4.orthoZO(state.global_uniforms.value[0].pMatrix, state.camera.projection.left, state.camera.projection.right, state.camera.projection.bottom, state.camera.projection.top, state.camera.projection.near, state.camera.projection.far);
      break;
  }
  vec3.copy(state.global_uniforms.value[0].iCameraPosition, state.camera.position);
}

function resize(viewport: Viewport) {
  if (!state) {
    return;
  }
  vec4.set(state.global_uniforms.value[0].iResolution,
      viewport.physicalWidth,
      viewport.physicalHeight,
      viewport.devicePixelRatio,
      viewport.aspect);
}

function render(timestamp: number) {
  if (!state || !state.viewport.depthStencilTextureView) {
    return;
  }
  const useDarkMode = user_preferences.useDarkMode;
  let sky_color = useDarkMode
    ? vec3.fromValues(0.016, 0.102, 0.251)
    : vec3.fromValues(0.529, 0.808, 0.922);

  updateCameraMatrix();

  vec3.copy(state.global_uniforms.value[0].iLightDirection, kLightDirection);
  vec3.copy(state.global_uniforms.value[0].iLightColor, sky_color);
  state.global_uniforms.value[0].iTime[0] = timestamp * 0.001;
  state.global_uniforms.submit();

  const encoder = state.device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: state.context.getCurrentTexture().createView(),
        clearValue: { r: sky_color.r, g: sky_color.g, b: sky_color.b, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      },
    ],
    depthStencilAttachment: {
      view: state.viewport.depthStencilTextureView,
      depthClearValue: 1,
      stencilClearValue: 0,
      depthLoadOp: 'clear',
      depthStoreOp: 'store',
      stencilLoadOp: 'clear',
      stencilStoreOp: 'store',
    },
  });

  pass.setPipeline(state.pipeline);
  pass.setBindGroup(BindGroupIndex.Global, state.globalBindGroups[BindGroupIndex.Global]);
  pass.setBindGroup(BindGroupIndex.Material, state.globalBindGroups[BindGroupIndex.Material]);
  Object.values(state.meshes).forEach(mesh => {
    pass.setBindGroup(BindGroupIndex.Instance, mesh.bindGroup);
    pass.setVertexBuffer(0, mesh.vertexBuffer);
    pass.setIndexBuffer(mesh.indexBuffer, 'uint32');
    pass.drawIndexed(mesh.indexBuffer.size / 4, mesh.count);
  });
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
  vec2.set(state.global_uniforms.value[0].iMouse, x, y);
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
    <div class="webgpu-container">
      <WebGPULogo />
    </div>
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

.webgpu-container img {
  position: absolute;
  inset: 0 0 auto auto;
  height: 5rem;
  pointer-events: none;
}
</style>
