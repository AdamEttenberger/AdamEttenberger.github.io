<script setup lang="ts">
import { useTemplateRef, onMounted, onUnmounted } from 'vue'
import { vec3, mat4, quat, type Mat4Like, type Vec3Like, type QuatLike } from 'ts-gl-matrix'

const kToRadianScalar = Math.PI / 180.0;
function toRadian(degrees: number) {
  return degrees * kToRadianScalar;
}

function isPowerOf2(value: number) {
  return value > 0 && (value & (value - 1)) === 0;
}

enum FMSState {
  Idle,
  Playing,
  Stopping,
};

type Range<N extends number, A extends number[] = []> =
  A["length"] extends N ? A[number] : Range<N, [...A, A["length"]]>;
type TextureUnit =
  WebGL2RenderingContext[`TEXTURE${Range<32>}`];
type TextureTarget = WebGL2RenderingContext[
  | "TEXTURE_2D"
  | "TEXTURE_CUBE_MAP"
  | "TEXTURE_3D"
  | "TEXTURE_2D_ARRAY"
];

interface TextureInfo {
  unit: TextureUnit;
  target: TextureTarget;
  texture: WebGLTexture;
};

interface CanvasState {
  size?: {
    cssWidth: number;
    cssHeight: number;
    displayWidth: number;
    displayHeight: number;
    aspect: number;
  };
  devicePixelRatio?: number;
  context?: WebGL2RenderingContext|null;
  intersectionObserver?: IntersectionObserver;
  resizeObserver?: ResizeObserver;
  resolutionQuery?: MediaQueryList;
  camera?: {
    position: Vec3Like;
    rotation: QuatLike;
    scale: Vec3Like;
    cached?: {
      vMatrix: Mat4Like; // View matrix: camera orientation in 3D space.
      pMatrix: Mat4Like; // Projection matrix: perspective / orthographic projection.
    };
  };
  shaderProgram?: WebGLProgram;
  textures?: TextureInfo[];
  buffers?: ({
    type: WebGL2RenderingContext["ARRAY_BUFFER"]|WebGL2RenderingContext["ELEMENT_ARRAY_BUFFER"];
    value: WebGLBuffer;
  })[];
  uniforms?: {
    mMatrix: WebGLUniformLocation|null;
    vMatrix: WebGLUniformLocation|null;
    pMatrix: WebGLUniformLocation|null;
    uResolution: WebGLUniformLocation|null;
    uTime: WebGLUniformLocation|null;
    uSampler0: WebGLUniformLocation|null;
  };
  fsm: FMSState;
};

const vertices = new Float32Array([
  -1,  1, 0,  // Top-left (0)
  -1, -1, 0,  // Bottom-left (1)
   1, -1, 0,  // Bottom-right (2)
   1,  1, 0,  // Top-right (3)
]);
const uvs = new Float32Array([
  0, 1, // Top-left (0)
  0, 0, // Bottom-left (1)
  1, 0, // Bottom-right (2)
  1, 1, // Top-right (3)
]);
const indices = new Uint16Array([
  0, 1, 2, // First triangle
  0, 2, 3  // Second triangle
]);

function getCurrentDevicePixelRatio(): number {
  return Math.min(window.devicePixelRatio || 1, 2);
}

const container = useTemplateRef('container');
const canvas = useTemplateRef('canvas');
let state: CanvasState = {
  fsm: FMSState.Idle,
  devicePixelRatio: getCurrentDevicePixelRatio(),
};

function onIntersectionObserver(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
  const isVisible: boolean = entries[0]?.isIntersecting ?? false;
  if (state.fsm === FMSState.Idle && isVisible) {
    state.fsm = FMSState.Playing;
    requestAnimationFrame(onAnimationFrame);
  } else if (state.fsm === FMSState.Playing && !isVisible) {
    state.fsm = FMSState.Stopping;
  }
}

function updateCameraMatrix() {
  if (!state.size) {
    return;
  }
  if (!state.camera) {
    // TODO: Better defeault camera values and initialization process.
    state.camera = {
      position: vec3.fromValues(0.0, 5.0, 20.0),
      rotation: quat.fromEuler(quat.create(), toRadian(-15.0), 0.0, 0.0),
      scale: vec3.fromValues(1.0, 1.0, 1.0),
    };
  }
  const fovy = toRadian(45.0);
  const near = 0.1;
  const far = 100.0;
  const cameraWorldMatrix = mat4.fromRotationTranslationScale(mat4.create(), state.camera.rotation, state.camera.position, state.camera.scale);
  state.camera.cached = {
    vMatrix: mat4.invert(mat4.create(), cameraWorldMatrix),
    pMatrix: mat4.perspectiveZO(mat4.create(), fovy, state.size.aspect, near, far),
  };
}

function onCanvasSizeChanged() {
  if (!container.value || !state.devicePixelRatio || !state?.context) {
    return;
  }
  const box = container.value.getBoundingClientRect();
  state.size = {
    cssWidth: box.width,
    cssHeight: box.height,
    displayWidth: Math.max(1, Math.round(box.width * state.devicePixelRatio)),
    displayHeight: Math.max(1, Math.round(box.height * state.devicePixelRatio)),
    aspect: box.width / box.height,
  };
  updateCameraMatrix();
}

function onDisplayResolutionChanged() {
  if (!state) {
    return;
  }
  state.resolutionQuery?.removeEventListener('change', onDisplayResolutionChanged);
  state.devicePixelRatio = getCurrentDevicePixelRatio();
  state.resolutionQuery = window.matchMedia(`(resolution: ${state.devicePixelRatio}dppx)`),
  state.resolutionQuery.addEventListener('change', onDisplayResolutionChanged);
  onCanvasSizeChanged();
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader|null {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

async function loadTexture2D(gl: WebGL2RenderingContext, src: string, unit: TextureUnit): Promise<TextureInfo> {
  return new Promise<TextureInfo|null>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const texture = gl.createTexture();
      const level = 0;
      const internalFormat = gl.RGBA;
      const srcFormat = gl.RGBA;
      const srcType = gl.UNSIGNED_BYTE;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
      resolve({
        unit,
        target: gl.TEXTURE_2D,
        texture
      });
    };
    image.src = src;
  });
}

async function initializeTextures(gl: WebGL2RenderingContext) {
  state.textures = [
    await loadTexture2D(gl, perlin_noise, gl.TEXTURE0)
  ].filter(x => x !== null);
}

function initializeShaders(gl: WebGL2RenderingContext) {
  const shaders: (WebGLShader|null)[] = [
    createShader(gl, gl.VERTEX_SHADER, `#version 300 es
      #ifdef GL_ES
      precision highp float;
      #endif

      in vec3 aVertexPosition;
      in vec2 aTextureCoord;

      out vec2 UV;

      uniform mat4 mMatrix; // World ( Model-View ) Matrix
      uniform mat4 vMatrix; // View Matrix
      uniform mat4 pMatrix; // Projection Matrix

      void main() {
        gl_Position = pMatrix * vMatrix * mMatrix * vec4(aVertexPosition, 1.0);
        UV = aTextureCoord;
      }
    `),
    createShader(gl, gl.FRAGMENT_SHADER, `#version 300 es
      precision mediump float;

      in vec2 UV;

      out vec4 vColor;

      uniform vec3 uResolution; // = {width, height, aspect}
      /**
       * Time needs to be high precision to avoid a bug
       * on mobile devices which caused the renderer to appear
       * sluggish over time once a certain threshold was reached.
       * e.g., a few minutes on screen caused choppy simulations.
       */
      uniform highp float uTime;

      void main() {
        vec2 p = UV;
        p -= vec2(0.5);       // move the origin to the center of the view.
        p.x *= uResolution.z; // scale to the aspect ratio of the container, to fit vertically.

        vColor = vec4(UV.x, UV.y, 0.5+0.5*cos(uTime), 1.0);
      }
    `)
  ];
  if (shaders.includes(null)) {
    return;
  }
  const program = gl.createProgram();
  shaders.forEach((item) => gl.attachShader(program, item!));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
  }
  
  state.uniforms = {
    mMatrix: gl.getUniformLocation(program, 'mMatrix'),
    vMatrix: gl.getUniformLocation(program, 'vMatrix'),
    pMatrix: gl.getUniformLocation(program, 'pMatrix'),
    uResolution: gl.getUniformLocation(program, 'uResolution'),
    uTime: gl.getUniformLocation(program, 'uTime'),
    uSampler0: gl.getUniformLocation(program, 'uSampler0'),
  };
  state.shaderProgram = program;
}

function initializeGeometry(gl: WebGL2RenderingContext) {
  if (!state.shaderProgram) {
    return;
  }

  const aVertexPosition = gl.getAttribLocation(state.shaderProgram, 'aVertexPosition');
  if (aVertexPosition === -1) {
    console.error("Failed to bind aVertexPosition");
    return;
  }
  const aTextureCoord = gl.getAttribLocation(state.shaderProgram, 'aTextureCoord');
  if (aTextureCoord === -1) {
    console.error("Failed to bind aTextureCoord");
    return;
  }

  const position = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, position);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(aVertexPosition);
  gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  const uv = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uv);
  gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(aTextureCoord);
  gl.vertexAttribPointer(aTextureCoord, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  const index = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  state.buffers = [
    {
      type: gl.ARRAY_BUFFER,
      value: position,
    },
    {
      type: gl.ARRAY_BUFFER,
      value: uv,
    },
    {
      type: gl.ELEMENT_ARRAY_BUFFER,
      value: index,
    },
  ];
}

function onAnimationFrame(timestamp: number) {
  if (!canvas.value||
      state.fsm !== FMSState.Playing ||
      !state.camera ||
      !state.context ||
      !state.size ||
      !state.shaderProgram ||
      !state.buffers ||
      !state.uniforms) {
    state.fsm = FMSState.Idle;
    return;
  }

  const gl = state.context;
  gl.clearColor(0.3922, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  
  gl.useProgram(state.shaderProgram);

  // Reset the Model Matrix.
  gl.uniformMatrix4fv(state.uniforms.mMatrix, false, mat4.create());

  if (canvas.value.width !== state.size.displayWidth ||
      canvas.value.height !== state.size.displayHeight) {
    canvas.value.width = state.size.displayWidth;
    canvas.value.height = state.size.displayHeight;
    gl.viewport(0, 0, state.size.displayWidth, state.size.displayHeight);
    if (state.uniforms.uResolution) {
      gl.uniform3f(state.uniforms.uResolution, state.size.displayWidth, state.size.displayHeight, state.size.aspect);
    }
  }

  if (state.uniforms.vMatrix && state.uniforms.pMatrix && state.camera.cached) {
    gl.uniformMatrix4fv(state.uniforms.vMatrix, false, state.camera.cached.vMatrix);
    gl.uniformMatrix4fv(state.uniforms.pMatrix, false, state.camera.cached.pMatrix);
  }

  if (state.uniforms.uTime) {
    gl.uniform1f(state.uniforms.uTime, timestamp * 0.001);
  }
  
  state.textures?.forEach((item) => {
    gl.activeTexture(item.unit);
    gl.bindTexture(item.target, item.texture);
    switch (item.unit) {
      default:
        console.error("Unexpected texture unit");
        break;
      case WebGL2RenderingContext['TEXTURE0']:
        if (state.uniforms?.uSampler0) {
          gl.uniform1i(state.uniforms.uSampler0, 0);
        }
        break;
    }
  });
  state.buffers.forEach((item) => gl.bindBuffer(item.type, item.value));

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  requestAnimationFrame(onAnimationFrame);
}

onMounted(() => {
  if (!container.value || !canvas.value) {
    return;
  }
  const gl = canvas.value?.getContext('webgl2');
  if (!gl) {
    return;
  }
  let resizeObserver = new ResizeObserver(onCanvasSizeChanged);
  let intersectionObserver = new IntersectionObserver(onIntersectionObserver);
  state = {
    fsm: FMSState.Idle,
    context: gl,
    intersectionObserver,
    resizeObserver,
  };
  onDisplayResolutionChanged();
  onCanvasSizeChanged();
  initializeTextures(gl);
  initializeShaders(gl);
  initializeGeometry(gl);
  intersectionObserver.observe(canvas.value);
  resizeObserver.observe(container.value);
});

onUnmounted(() => {
  if (!state) {
    return;
  }
  state.intersectionObserver?.disconnect();
  state.resizeObserver?.disconnect();
  state.resolutionQuery?.removeEventListener('change', onDisplayResolutionChanged);
  state.fsm = FMSState.Stopping;
});
</script>

<template>
  <div class="hero-section-viewport-container" ref="container">
    <canvas ref="canvas"></canvas>
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
