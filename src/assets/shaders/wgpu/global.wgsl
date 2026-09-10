const kF32Max: f32 = 0x7F7FFFFF;
const PI: f32 = 3.14159265359;
const TAU: f32 = PI * 2.0;

struct GlobalUniforms {
  vMatrix: mat4x4f,
  pMatrix: mat4x4f,
  vMatrixInverse: mat4x4f,
  pMatrixInverse: mat4x4f,
  iResolution: vec4f, // {physicalWidth, physicalHeight, devicePixelRatio, aspect}
  iCameraPosition: vec3f,
  iTime: f32, // (seconds)
  iMouse: vec2f, // normalized range: [0, 1]
  iDarkMode: u32,
  iSunDirection: vec3f,
  iSunLightColor: vec3f,
};

@group(0) @binding(0) var<uniform> global: GlobalUniforms;
@group(0) @binding(1) var s_linear_repeat: sampler;
@group(0) @binding(2) var s_linear_clamp: sampler;
@group(0) @binding(3) var s_nearest_repeat: sampler;
@group(0) @binding(4) var s_nearest_clamp: sampler;
@group(0) @binding(5) var s_shadow_compare: sampler_comparison;
@group(0) @binding(6) var textures_32: texture_2d_array<f32>;
@group(0) @binding(7) var textures_64: texture_2d_array<f32>;
@group(0) @binding(8) var textures_128: texture_2d_array<f32>;
@group(0) @binding(9) var textures_256: texture_2d_array<f32>;
@group(0) @binding(10) var textures_512: texture_2d_array<f32>;
@group(0) @binding(11) var textures_1k: texture_2d_array<f32>;
@group(0) @binding(12) var textures_2k: texture_2d_array<f32>;
