const kSharpness: f32 = 20.0;

struct GlobalUniforms {
  vMatrix: mat4x4f,
  pMatrix: mat4x4f,
  vMatrixInverse: mat4x4f,
  pMatrixInverse: mat4x4f,
  iResolution: vec4f, // {physicalWidth, physicalHeight, devicePixelRatio, aspect}
  iCameraPosition: vec3f,
  iTime: f32, // (seconds)
  iMouse: vec2f, // normalized range: [0, 1]
  iSunDirection: vec3f,
  iSunLightColor: vec3f,
};

struct MaterialData {
  darkMode: u32,
  sunColor: vec3f,
  skyColor: vec3f,
};

struct SkyboxUniforms {
  material_id: u32,
};

@group(0) @binding(0) var<uniform> global: GlobalUniforms;
@group(0) @binding(1) var global_texture_bucket: texture_2d_array<f32>;
@group(0) @binding(2) var s_linear_repeat: sampler;
@group(0) @binding(3) var s_linear_clamp: sampler;
@group(0) @binding(4) var s_nearest_repeat: sampler;
@group(0) @binding(5) var s_nearest_clamp: sampler;
@group(0) @binding(6) var s_shadow_compare: sampler_comparison;

@group(1) @binding(0) var<storage, read> materials: array<MaterialData>;
@group(2) @binding(0) var<uniform> active_skybox: SkyboxUniforms;

struct VertexInput {
  @builtin(vertex_index) vertex_index: u32
};

struct VertexOutput {
  @builtin(position) clip_position: vec4f,
  @location(0) ndc: vec2f,
  @location(1) @interpolate(flat) view_sun_direction: vec3f,
};

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var out: VertexOutput;

  let positions = array<vec2f, 3>(
    vec2f(-1.0, -1.0),
    vec2f( 3.0, -1.0),
    vec2f(-1.0,  3.0)
  );

  let position = positions[input.vertex_index];
  out.clip_position = vec4f(position, 1.0, 1.0);
  out.ndc = position;
  out.view_sun_direction = normalize((global.vMatrix * vec4f(-global.iSunDirection, 0.0)).xyz);
  return out;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let material = materials[active_skybox.material_id];

  let clip = vec4f(input.ndc, 1.0, 1.0);
  let view: vec4f = global.pMatrixInverse * clip;
  let view_direction: vec3f = normalize(view.xyz / view.w);
  let sun_alignment: f32 = max(dot(view_direction, input.view_sun_direction), 0.0);
  let sun_mask: f32 = clamp(pow(sun_alignment, 256.0) * kSharpness, 0.0, 1.0);

  return vec4f(mix(material.skyColor, material.sunColor, sun_mask), 1.0);
}
