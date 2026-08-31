const kFrameCount: vec2f = vec2f(8.0, 8.0);
const kFrameRate: f32 = 8.0;
const kMipMapSafeTexelInset: f32 = 4.0; // mipLevelCount: 3
const PI: f32 = 3.14159265359;

struct GlobalUniforms {
  vMatrix: mat4x4f,
  pMatrix: mat4x4f,
  iResolution: vec4f, // {physicalWidth, physicalHeight, devicePixelRatio, aspect}
  iCameraPosition: vec3f,
  iTime: f32, // (seconds)
  iMouse: vec2f, // normalized range: [0, 1]
  iLightDirection: vec3f,
  iLightColor: vec3f,
};

struct MaterialData {
  normal_height_texture: u32,
  albedo_color: vec3f,
  grid_size: vec2f,
  cell_size: vec2f,
};

struct InstanceData {
  mMatrix: mat4x4f,
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
@group(2) @binding(0) var<storage, read> instances: array<InstanceData>;

struct VertexInput {
  @builtin(instance_index) instance_id: u32,
  @location(0) position: vec3f,
  @location(1) uv: vec2f,
};

struct VertexOutput {
  @builtin(position) clip_position: vec4f,
  @location(0) world_position: vec4f,
  @location(1) uv: vec2f,
  @location(2) @interpolate(flat) material_id: u32,
};

struct FlipbookFrameCoords {
  uv1: vec2f, // The upper-left uv coodinate of the *current* frame.
  uv2: vec2f, // The upper-left uv coodinate of the *next* frame.
};

struct CookTorranceReflectance {
  specular: vec3f,
  fresnel: vec3f,
  diffuse_ratio: vec3f,
};

struct DirectionDerivative {
  dx: vec2f,
  dy: vec2f,
};

fn distribution_ggx(NoH: f32, roughness: f32) -> f32 {
    let a = roughness * roughness;
    let a2 = a * a;
    let n_dot_h2 = NoH * NoH;
    let denom = n_dot_h2 * (a2 - 1.0) + 1.0;
    return a2 / (PI * denom * denom + 1e-7);
}

fn geometry_schlick_ggx(NoV: f32, roughness: f32) -> f32 {
    let r = roughness + 1.0;
    let k = (r * r) / 8.0;
    return NoV / (NoV * (1.0 - k) + k);
}

fn geometry_smith(NoV: f32, NoL: f32, roughness: f32) -> f32 {
    return geometry_schlick_ggx(NoV, roughness) * geometry_schlick_ggx(NoL, roughness);
}

fn fresnel_schlick(cos_theta: f32, f0: vec3f) -> vec3f {
    return f0 + (vec3f(1.0) - f0) * pow(clamp(1.0 - cos_theta, 0.0, 1.0), 5.0);
}

fn cook_torrance_reflectance(world_normal: vec3f, view_direction: vec3f, light_direction: vec3f) -> CookTorranceReflectance {
  var result: CookTorranceReflectance;

  let reflectivity: vec3f = get_reflectivity();
  let roughness: f32 = get_roughness();
  let half_vector: vec3f = normalize(view_direction + light_direction);

  let NoV: f32 = max(dot(world_normal, view_direction), 0.0);   // view falloff / fresnel incident
  let NoL: f32 = max(dot(world_normal, light_direction), 0.0);  // light attenuation / Lambertian factor.
  let NoH: f32 = max(dot(world_normal, half_vector), 0.0);      // microfacet alignment / NDF density
  let VoH: f32 = max(dot(view_direction, half_vector), 0.0);    // microfacet reflection angle / fresnel alignment

  let D: f32 = distribution_ggx(NoH, roughness);
  let G: f32 = geometry_smith(NoV, NoL, roughness);
  let F: vec3f = fresnel_schlick(VoH, reflectivity);

  result.specular = (D * G * F) / max(4.0 * NoV * NoL, 1e-4);
  result.fresnel = F;
  // Water doesn't really have a Lambertian diffuse term, light either
  // reflects off the surface or scatters below it. Approximate that
  // subsurface look by tinting the albedo directly instead.
  result.diffuse_ratio = vec3f(1.0) - F;
  return result;
}

fn frame_to_uv(frame: f32, grid_size: vec2f) -> vec2f {
  return fract(vec2f(frame, floor(frame / grid_size.x)) / grid_size);
}

fn get_flipbook_coords(material: MaterialData, uv: vec2f) -> FlipbookFrameCoords {
  let local_uv = clamp(fract(uv), vec2f(0.0001), vec2f(0.9999));
  let pad_uv = kMipMapSafeTexelInset / material.cell_size;
  let cell_local_uv = (pad_uv + local_uv * (1.0 - 2.0 * pad_uv)) / material.grid_size;

  let frame: f32 = floor(global.iTime * kFrameRate);
  let uv_frame_1: vec2f = frame_to_uv(frame, material.grid_size);
  let uv_frame_2: vec2f = frame_to_uv(frame + 1.0, material.grid_size);

  return FlipbookFrameCoords(
    uv_frame_1 + cell_local_uv,
    uv_frame_2 + cell_local_uv
  );
}

fn fs_get_direction_derivative(uv: vec2f) -> DirectionDerivative {
  let tiled_frame: vec2f = uv / kFrameCount;
  return DirectionDerivative(dpdx(tiled_frame), dpdy(tiled_frame));
}

fn fs_get_world_normal(material: MaterialData, frame_coords: FlipbookFrameCoords, derivative: DirectionDerivative) -> vec3f {
  let n1: vec3f = textureSampleGrad(global_texture_bucket, s_linear_repeat, frame_coords.uv1, material.normal_height_texture, derivative.dx, derivative.dy).rgb * 2.0 - 1.0;
  let n2: vec3f = textureSampleGrad(global_texture_bucket, s_linear_repeat, frame_coords.uv2, material.normal_height_texture, derivative.dx, derivative.dy).rgb * 2.0 - 1.0;
  let value = mix(n1, n2, fract(global.iTime * kFrameRate));
  return normalize(value);
}

fn get_surface_height(material: MaterialData, frame_coords: FlipbookFrameCoords) -> f32 {
  let h1: f32 = textureSampleLevel(global_texture_bucket, s_linear_repeat, frame_coords.uv1, material.normal_height_texture, 0.0).a * 2.0 - 1.0;
  let h2: f32 = textureSampleLevel(global_texture_bucket, s_linear_repeat, frame_coords.uv2, material.normal_height_texture, 0.0).a * 2.0 - 1.0;
  let value: f32 = mix(h1, h2, fract(global.iTime * kFrameRate));
  return value;
}

fn get_reflectivity() -> vec3f {
  // Water is a dielectric, base reflectivity range: [0.02, 0.05]
  return vec3f(0.035);
}

fn get_roughness() -> f32 {
  // - Mirror-like / Glassy Bay: [0.01, 0.03]
  // - Gentle Open Ocean: [0.05, 0.10]
  // - Windy / Choppy Sea: [0.15, 0.25]
  // - Stormy / Whitecaps: [0.30, 0.40]
  return 0.2;
}

fn calculate_irradiance(world_normal: vec3f, light_direction: vec3f) -> vec3f {
  return global.iLightColor * max(dot(world_normal, light_direction), 0.0);
}

fn aces_tonemap(color: vec3f) -> vec3f {
  const a: f32 = 2.51;
  const b: f32 = 0.03;
  const c: f32 = 2.43;
  const d: f32 = 0.59;
  const e: f32 = 0.14;
  return clamp((color * (a * color + b)) / (color * (c * color + d) + e), vec3f(0.0), vec3f(1.0));
}

fn reinhard_tonemap(color: vec3f) -> vec3f {
  return color / (color + vec3f(1.0));
}

/**
 * Linear to sRGB color space gamma correction.
 * @param linear_color The linear RGB color space value to correct.
 * @return The gamma corrected color in sRGB color space.
 */
fn linearToSRGB(linear_color: vec3f) -> vec3f {
  return pow(linear_color, vec3f(1.0 / 2.2));
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var out: VertexOutput;

  let instance = instances[input.instance_id];
  let material = materials[instance.material_id];

  let frame_coords: FlipbookFrameCoords = get_flipbook_coords(material, input.uv);
  let sample_blend: f32 = fract(global.iTime * kFrameRate);

  var displacedPosition: vec4f = vec4f(input.position, 1.0);
  displacedPosition.y += get_surface_height(material, frame_coords);

  out.world_position = instance.mMatrix * displacedPosition;
  out.clip_position = global.pMatrix * global.vMatrix * out.world_position;
  out.uv = input.uv;
  out.material_id = instance.material_id;
  return out;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let material = materials[input.material_id];
  let frame_coords: FlipbookFrameCoords = get_flipbook_coords(material, input.uv);

  let world_normal: vec3f = fs_get_world_normal(material, frame_coords, fs_get_direction_derivative(input.uv));
  let view_direction: vec3f = normalize(global.iCameraPosition - input.world_position.xyz);
  let light_direction: vec3f = normalize(-global.iLightDirection);

  // PBR material properties; bidirectional reflectance distribution function.
  let reflectance: CookTorranceReflectance = cook_torrance_reflectance(world_normal, view_direction, light_direction);
  let BRDF: vec3f = reflectance.diffuse_ratio * (material.albedo_color / PI) + reflectance.specular;

  // light intensity / attenuated light, incoming light energy arriving at the surface,
  // before scattering or reflection towards the camera.
  let irradiance: vec3f = calculate_irradiance(world_normal, light_direction);

  // total light leaving the surface towards the camera.
  let outgoing_radiance: vec3f = BRDF * irradiance;

  let ambient: vec3f = vec3f(0.1) * material.albedo_color;

  var color: vec3f = ambient + outgoing_radiance;
  return vec4f(linearToSRGB(aces_tonemap(color)), 1.0);
}
