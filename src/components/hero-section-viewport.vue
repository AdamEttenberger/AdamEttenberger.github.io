<script setup lang="ts">
import { useTemplateRef, onMounted, onUnmounted } from 'vue'
import { debounce, throttle } from '@/util/rate_limit'

const RESIZE_VIEWPORT_THROTTLE = 300;

enum FMSState {
  Idle,
  Playing,
  Stopping,
};

interface CanvasState {
  size?: {
    cssWidth: number;
    cssHeight: number;
    displayWidth: number;
    displayHeight: number;
  };
  devicePixelRatio?: number;
  context?: WebGL2RenderingContext|null;
  intersectionObserver?: IntersectionObserver;
  resizeObserver?: ResizeObserver;
  resolutionQuery?: MediaQueryList;
  shaderProgram?: WebGLProgram;
  buffers?: ({
    type: WebGL2RenderingContext["ARRAY_BUFFER"]|WebGL2RenderingContext["ELEMENT_ARRAY_BUFFER"];
    value: WebGLBuffer;
  })[];
  uniforms?: {
    uResolution: WebGLUniformLocation;
    uTime: WebGLUniformLocation;
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

function onCanvasSizeChanged() {
  if (!container.value || !state.devicePixelRatio || !state?.context) {
    return;
  }
  const box = container.value.getBoundingClientRect();
  state.size = {
    cssWidth: box.width,
    cssHeight: box.height,
    displayWidth: Math.max(1, Math.round(box.width * state.devicePixelRatio)),
    displayHeight: Math.max(1, Math.round(box.height * state.devicePixelRatio))
  };
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

function requireUniform(gl: WebGL2RenderingContext, program: WebGLProgram, name: string): WebGLUniformLocation {
  const uniform = gl.getUniformLocation(program, name);
  if (!uniform) {
    throw new Error(`Failed to bind uniform ${name}`);
  }
  return uniform;
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

      void main() {
        gl_Position = vec4(aVertexPosition, 1.0);
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
  
  try {
    state.uniforms = {
      uResolution: requireUniform(gl, program, 'uResolution'),
      uTime: requireUniform(gl, program, 'uTime'),
    };
    state.shaderProgram = program;
  } catch { }
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
  gl.useProgram(state.shaderProgram);

  if (canvas.value.width !== state.size.cssWidth ||
      canvas.value.height !== state.size.cssHeight) {
    canvas.value.width = state.size.cssWidth;
    canvas.value.height = state.size.cssHeight;
    gl.viewport(0, 0, state.size.displayWidth, state.size.displayHeight);
    gl.uniform3f(state.uniforms.uResolution, state.size.displayWidth, state.size.displayHeight, state.size.displayWidth / state.size.displayHeight);
  }

  gl.uniform1f(state.uniforms.uTime, timestamp * 0.001);
  
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
  let resizeObserver = new ResizeObserver(throttle(onCanvasSizeChanged, RESIZE_VIEWPORT_THROTTLE));
  let intersectionObserver = new IntersectionObserver(onIntersectionObserver);
  state = {
    fsm: FMSState.Idle,
    context: gl,
    intersectionObserver,
    resizeObserver,
  };
  onDisplayResolutionChanged();
  onCanvasSizeChanged();
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
    <div class="scroll-slot">
      <slot name="scroll-indicator" />
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

  & > .scroll-slot {
    position: absolute;
    inset: auto 0 0 0;
  }
}

</style>
