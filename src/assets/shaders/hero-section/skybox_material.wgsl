const PI: f32 = 3.14159265359;
const TAU: f32 = PI * 2.0;
const PI9: f32 = PI * 100000000.0;
const JITTER: f32 = 0.123456789;
const kF32Max: f32 = 0x7F7FFFFF;
const kSharpness: f32 = 20.0;
const kStarColorCount: u32 = 5;
const kStarColors = array<vec3f, kStarColorCount>(
  vec3f(1.0),
  vec3f(1.0, 0.49, 0.14),
  vec3f(1.0, 0.43, 0.0),
  vec3f(0.353, 0.482, 1.000),
  vec3f(1.0, 0.875, 0.133),
);
// For a value V in range [0, 1], search the array in-order and
// select the index where (V <= entry).
const kStarColorCumulativeWeights = array<f32, kStarColorCount>(
  0.84, // ~84%
  0.88, // ~4%
  0.92, // ~4%
  0.96, // ~4%
  1.00, // ~4%
);

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

struct MaterialData {
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

fn hash11(v: f32) -> f32 {
  let a = bitcast<u32>((v + JITTER) * PI9);
  return fract(f32(a * a) / PI9);
}
fn hash21(v: vec2f) -> f32 {
  let a = bitcast<vec2u>((v + JITTER) * PI9);
  return fract(f32(a.x * a.y) / PI9);
}
fn hash22(v: vec2f) -> vec2f {
  let a = bitcast<vec2u>((v + JITTER) * PI9);
  return fract(vec2f(
    f32(a.x * a.y * a.x) / PI9,
    f32(a.x * a.y * a.y) / PI9
  ));
}
fn hash31(v: vec3f) -> f32 {
  let a = bitcast<vec3u>((v + JITTER) * PI9);
  return fract(f32(a.x * a.y * a.z) / PI9);
}
fn hash32(v: vec3f) -> vec2f {
  let a = bitcast<vec3u>((v + JITTER) * PI9);
  return fract(vec2f(
    f32(a.x * a.y * a.z * a.x) / PI9,
    f32(a.x * a.y * a.z * a.y) / PI9
  ));
}
fn hash33(v: vec3f) -> vec3f {
  let a = bitcast<vec3u>((v + JITTER) * PI9);
  return fract(vec3f(
    f32(a.x * a.y * a.z * a.x) / PI9,
    f32(a.x * a.y * a.z * a.y) / PI9,
    f32(a.x * a.y * a.z * a.z) / PI9
  ));
}

struct Voronoi2Output {
  f1: f32,              // Distance to closest seed point
  f2: f32,              // Distance to second closest seed point
  border: f32,          // distance to border
  closest_cell: vec2f,  // nearest cell id
}

fn voronoi2(v: vec2f, time: f32) -> Voronoi2Output {
  let base_cell = floor(v);
  let fractional_pos = fract(v);
  
  var f1 = kF32Max;
  var f2 = kF32Max;
  var closest_cell = vec2f(0.0);

  // Search the 3x3 neighborhood of cells
  for (var y = -1; y <= 1; y++) {
    for (var x = -1; x <= 1; x++) {
      let neighbor = vec2f(f32(x), f32(y));
      let cell_id = base_cell + neighbor;
      let rand_offset = hash22(cell_id);
      let animated_point = 0.5 + 0.5 * sin(time + rand_offset * TAU);
      let diff = neighbor + animated_point - fractional_pos;
      let dist = length(diff);

      if (dist < f1) {
        f2 = f1;
        f1 = dist;
        closest_cell = cell_id;
      } else if (dist < f2) {
        f2 = dist;
      }
    }
  }

  var out: Voronoi2Output;
  out.f1 = f1;
  out.f2 = f2;
  out.border = f2 - f1;
  out.closest_cell = closest_cell;
  return out;
}

struct Voronoi3Output {
  f1: f32,              // Distance to closest seed point
  f2: f32,              // Distance to second closest seed point
  border: f32,          // Cell boundary distance (F2 - F1)
  closest_cell: vec3f,  // Unique identifier for the closest cell
}

fn voronoi3(p: vec3f, time: f32) -> Voronoi3Output {
    let base_cell = floor(p);
    let fractional_pos = fract(p);

    var f1 = kF32Max;
    var f2 = kF32Max;
    var closest_cell = vec3f(0.0);

    // Search the 3x3x3 neighborhood
    for (var z = -1; z <= 1; z++) {
      for (var y = -1; y <= 1; y++) {
        for (var x = -1; x <= 1; x++) {
          let neighbor = vec3f(f32(x), f32(y), f32(z));
          let cell_id = base_cell + neighbor;
          let rand_offset = hash33(cell_id);
          let animated_point = 0.5 + 0.5 * sin(time + rand_offset * TAU);
          let diff = neighbor + animated_point - fractional_pos;
          let dist = length(diff);

          if (dist < f1) {
            f2 = f1;
            f1 = dist;
            closest_cell = cell_id;
          } else if (dist < f2) {
            f2 = dist;
          }
        }
      }
    }

    var out: Voronoi3Output;
    out.f1 = f1;
    out.f2 = f2;
    out.border = f2 - f1;
    out.closest_cell = closest_cell;
    return out;
}

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
  let world_direction = normalize((global.vMatrixInverse * vec4f(view_direction, 0.0)).xyz);
  let sun_alignment: f32 = max(dot(view_direction, input.view_sun_direction), 0.0);
  let sun_mask: f32 = clamp(pow(sun_alignment, 256.0) * kSharpness, 0.0, 1.0);

  var background: vec3f = material.skyColor;
  if (global.iDarkMode == 1) {
    let s: f32 = 80.0;// * max(global.iResolution.w, 1.0 / global.iResolution.w);
    let noise = voronoi3(world_direction * s, 0.0);
    if (noise.f1 < 0.125) {
      let star_color_rand: f32 = hash31(noise.closest_cell);
      var star_color_index: u32 = 0;
      for (var i: u32 = 0; i < kStarColorCount; i++) {
        if (star_color_rand <= kStarColorCumulativeWeights[i]) {
          star_color_index = i;
          break;
        }
      }
      background = kStarColors[star_color_index];
    }
  }

  return vec4f(mix(background, material.sunColor, sun_mask), 1.0);
}
