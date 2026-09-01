const kFrameCount: vec2f = vec2f(8.0, 8.0);
const kFrameRate: f32 = 7.0;
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
  texel_size: vec2f,
};

struct InstanceData {
  mMatrix: mat4x4f,
  normalMatrix: mat4x4f,
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
  @location(1) normal: vec3f,
  @location(2) tangent: vec4f,
  @location(3) uv: vec2f,
};

struct VertexOutput {
  @builtin(position) clip_position: vec4f,
  @location(0) world_position: vec4f,
  @location(1) world_normal: vec3f,
  @location(2) world_tangent: vec3f,
  @location(3) world_bitangent: vec3f,
  @location(4) uv: vec2f,
  @location(5) @interpolate(flat) material_id: u32,
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
  let local_uv = fract(uv);
  let pad_uv = kMipMapSafeTexelInset * material.texel_size;
  let cell_local_uv = (pad_uv + local_uv * (1.0 - 2.0 * pad_uv)) / material.grid_size;

  let frame: f32 = floor(global.iTime * kFrameRate);
  let uv_frame_1: vec2f = frame_to_uv(frame, material.grid_size);
  let uv_frame_2: vec2f = frame_to_uv(frame + 1.0, material.grid_size);

  return FlipbookFrameCoords(
    uv_frame_1 + cell_local_uv,
    uv_frame_2 + cell_local_uv
  );
}

fn get_surface_sample(material: MaterialData, frame_coords: FlipbookFrameCoords) -> vec4f {
  let a: vec4f = textureSampleLevel(global_texture_bucket, s_linear_repeat, frame_coords.uv1, material.normal_height_texture, 0.0);
  let b: vec4f = textureSampleLevel(global_texture_bucket, s_linear_repeat, frame_coords.uv2, material.normal_height_texture, 0.0);
  let value = mix(a, b, fract(global.iTime * kFrameRate)) * 2.0 - 1.0;
  return vec4f(normalize(value.rgb), value.a * 0.5);
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
  displacedPosition.y += get_surface_sample(material, frame_coords).w;

  let normalMatrix3x3 = mat3x3f(
    instance.normalMatrix[0].xyz,
    instance.normalMatrix[1].xyz,
    instance.normalMatrix[2].xyz,
  );

  let N = normalize(normalMatrix3x3 * input.normal);
  let Traw = normalize((instance.mMatrix * vec4f(input.tangent.xyz, 0.0)).xyz);
  let T = normalize(Traw - N * dot(N, Traw));
  let B = cross(N, T) * input.tangent.w;

  out.world_position = instance.mMatrix * displacedPosition;
  out.clip_position = global.pMatrix * global.vMatrix * out.world_position;
  out.world_normal = N;
  out.world_tangent = T;
  out.world_bitangent = B;
  out.uv = input.uv;
  out.material_id = instance.material_id;
  return out;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let material = materials[input.material_id];
  let frame_coords: FlipbookFrameCoords = get_flipbook_coords(material, input.uv);

  let N = normalize(input.world_normal);
  let T = normalize(input.world_tangent);
  let B = normalize(input.world_bitangent);
  let TBN = mat3x3f(T, B, N);

  let local_normal_displacement: vec4f = get_surface_sample(material, frame_coords);
  let world_normal: vec3f = normalize(TBN * local_normal_displacement.xyz);
  let view_direction: vec3f = normalize(global.iCameraPosition - input.world_position.xyz);
  let light_direction: vec3f = normalize(-global.iLightDirection);

  var albedo_color: vec3f = material.albedo_color;
  let scalar_displacement = smoothstep(-0.5, 0.5, local_normal_displacement.w);
  albedo_color = mix(vec3f(0.0), albedo_color, smoothstep(0.25, 1.0, scalar_displacement));
  albedo_color = mix(albedo_color, vec3f(0.8), smoothstep(0.75, 0.9, scalar_displacement));

  // PBR material properties; bidirectional reflectance distribution function.
  let reflectance: CookTorranceReflectance = cook_torrance_reflectance(world_normal, view_direction, light_direction);
  let BRDF: vec3f = reflectance.diffuse_ratio * (albedo_color / PI) + reflectance.specular;

  // light intensity / attenuated light, incoming light energy arriving at the surface,
  // before scattering or reflection towards the camera.
  let irradiance: vec3f = calculate_irradiance(world_normal, light_direction);

  // total light leaving the surface towards the camera.
  let outgoing_radiance: vec3f = BRDF * irradiance;

  // Color grading so waves look "deeper" at their shallowest and closer to "foam" for peaking wave crests.

  var ambient: vec3f = albedo_color * 0.125;
  let color: vec3f = ambient + outgoing_radiance;
  return vec4f(linearToSRGB(aces_tonemap(color)), 1.0);
}
