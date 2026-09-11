const kFrameRate: f32 = 7.0;
const kMinDielectricF0 = 4e-2;

struct MaterialData {
  normal_height_texture: u32,
  albedo_color: vec3f,
  grid_size: vec2f,
  cell_size: vec2f,
  texel_size: vec2f,
  texel_margin: f32,
};

@group(1) @binding(0) var<storage, read> materials: array<MaterialData>;

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

struct ShadingContext {
  NoV: f32, // View direction dot normal (cos_theta_v). view falloff / fresnel incident
  NoL: f32, // Light direction dot normal (cos_theta_l). light attenuation / Lambertian factor.
  NoH: f32, // Halfway vector dot normal (cos_theta_h). microfacet alignment / NDF density.
  LoH: f32, // Light direction dot halfway vector (cos_theta_d). microfacet reflection angle / fresnel alignment.
  N: vec3f, // world normal
  L: vec3f, // world light direction
  V: vec3f, // world view direction
  H: vec3f, // half light|view vector
};

fn makeShadingContext(N: vec3f, V: vec3f, L: vec3f) -> ShadingContext {
  let H = normalize(V + L);
  return ShadingContext(
    max(dot(N, V), 0.0),
    max(dot(N, L), 0.0),
    max(dot(N, H), 0.0),
    max(dot(L, H), 0.0),
    N,
    L,
    V,
    H,
  );
}

struct CookTorranceReflectance {
  specular: vec3f,
  fresnel: vec3f,
  diffuse_ratio: vec3f,
};

fn distribution_ggx(NoH: f32, roughness: f32) -> f32 {
    let a = roughness * roughness;
    let a2 = a * a;
    let n_dot_h2 = NoH * NoH;
    let denom = n_dot_h2 * (a2 - 1.0) + 1.0;
    return a2 / (PI * max(denom * denom, 1e-7));
}

// The {k} term for geometry_smith for direct lighting calculations.
fn geometry_schlick_ggx_roughness_direct(roughness: f32) -> f32 {
  let a = roughness * roughness;
  return ((a + 1) * (a + 1)) / 8.0;
}

// The {k} term for geometry_smith for Image-based lighting (IBL) calculations.
fn geometry_schlick_ggx_roughness_ibl(roughness: f32) -> f32 {
  let a = roughness + 1.0;
  return (a * a) / 2.0;
}

// Helper to compute the {G1} and {G2} terms for geometry_smith.
fn geometry_schlick_ggx(NoV: f32, k: f32) -> f32 {
    return NoV / (NoV * (1.0 - k) + k);
}

fn geometry_smith(NoV: f32, NoL: f32, k: f32) -> f32 {
    return geometry_schlick_ggx(NoV, k) * geometry_schlick_ggx(NoL, k);
}

fn fresnel_schlick(cos_theta: f32, f0: vec3f) -> vec3f {
    return f0 + (vec3f(1.0) - f0) * pow(clamp(1.0 - cos_theta, 0.0, 1.0), 5.0);
}

fn cook_torrance_reflectance(
  context: ShadingContext,
  albedo: vec3f,
  metallic: f32,
  roughness: f32,
) -> CookTorranceReflectance {
  var result: CookTorranceReflectance;

  let specular_reflectance: vec3f = mix(vec3f(kMinDielectricF0), albedo, metallic);
  let D: f32 = distribution_ggx(context.NoH, roughness);
  let G: f32 = geometry_smith(context.NoV, context.NoL, geometry_schlick_ggx_roughness_direct(roughness));
  let F: vec3f = fresnel_schlick(context.LoH, specular_reflectance);

  result.specular = (D * G * F) / max(4.0 * context.NoV * context.NoL, 1e-4);
  result.fresnel = F;
  result.diffuse_ratio = (vec3f(1.0) - F) * (1.0 - metallic);
  return result;
}

fn frame_to_uv(frame: f32, grid_size: vec2f) -> vec2f {
  return fract(vec2f(frame, floor(frame / grid_size.x)) / grid_size);
}

fn get_flipbook_coords(material: MaterialData, uv: vec2f) -> FlipbookFrameCoords {
  let local_uv = fract(uv);
  let pad_uv = material.texel_margin * material.texel_size;
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
  let a: vec4f = textureSampleLevel(textures_2k, s_linear_repeat, frame_coords.uv1, material.normal_height_texture, 0.0);
  let b: vec4f = textureSampleLevel(textures_2k, s_linear_repeat, frame_coords.uv2, material.normal_height_texture, 0.0);
  let value = mix(a, b, fract(global.iTime * kFrameRate)) * 2.0 - 1.0;
  return vec4f(normalize(value.rgb), value.a * 0.5);
}

fn calculate_irradiance(context: ShadingContext) -> vec3f {
  return global.iSunLightColor * context.NoL;
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

  let instance = instances[input.instance_id];
  let material = materials[instance.material_id];

  let frame_coords: FlipbookFrameCoords = get_flipbook_coords(material, input.uv);
  let local_normal_displacement: vec4f = get_surface_sample(material, frame_coords);

  var position: vec3f = input.position;
  let disp = local_normal_displacement.w;
  position += input.normal * disp;

  let normalMatrix3x3 = mat3x3f(
    instance.normalMatrix[0].xyz,
    instance.normalMatrix[1].xyz,
    instance.normalMatrix[2].xyz,
  );

  let N = normalize(normalMatrix3x3 * input.normal);
  let Traw = normalize((instance.mMatrix * vec4f(input.tangent.xyz, 0.0)).xyz);
  let T = normalize(Traw - N * dot(N, Traw));
  let B = cross(N, T) * input.tangent.w;

  var out: VertexOutput;
  out.world_position = instance.mMatrix * vec4f(position, 1.0);
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
  let local_normal_displacement: vec4f = get_surface_sample(material, frame_coords);
  var N = normalize(input.world_normal);
  {
    let T = normalize(input.world_tangent);
    let B = normalize(input.world_bitangent);
    let TBN = mat3x3f(T, B, N);
    N = normalize(TBN * local_normal_displacement.xyz);
  }
  let V: vec3f = normalize(global.iCameraPosition - input.world_position.xyz);
  let L: vec3f = normalize(-global.iSunDirection);
  
  let context: ShadingContext = makeShadingContext(N, V, L);

  var albedo: vec3f = material.albedo_color;
  // Color grading so waves look "deeper" at their shallowest and closer to "foam" for peaking wave crests.
  let scalar_displacement = smoothstep(-0.5, 0.5, local_normal_displacement.w);
  albedo = mix(vec3f(0.0), albedo, smoothstep(0.25, 1.0, scalar_displacement));
  albedo = mix(albedo, vec3f(0.8), smoothstep(0.75, 0.9, scalar_displacement));

  let metallic: f32 = 0.0;

  // - Mirror-like / Glassy Bay: [0.01, 0.03]
  // - Gentle Open Ocean: [0.05, 0.10]
  // - Windy / Choppy Sea: [0.15, 0.25]
  // - Stormy / Whitecaps: [0.30, 0.40]
  let roughness: f32 = 0.2;

  // PBR material properties; bidirectional reflectance distribution function.
  let reflectance: CookTorranceReflectance = cook_torrance_reflectance(context, albedo, metallic, roughness);
  let diffuse: vec3f = reflectance.diffuse_ratio * (albedo / PI);
  let BRDF: vec3f = diffuse + reflectance.specular;

  // light intensity / attenuated light, incoming light energy arriving at the surface,
  // before scattering or reflection towards the camera.
  let irradiance: vec3f = calculate_irradiance(context);

  // total light leaving the surface towards the camera.
  let outgoing_radiance: vec3f = BRDF * irradiance;

  const globalAmbientLight = 0.125;
  let ambientDiffuseMask: f32 = mix(1.0 - kMinDielectricF0, 0.0, metallic);
  let ambient: vec3f = albedo * globalAmbientLight * ambientDiffuseMask;
  let color: vec3f = ambient + outgoing_radiance;
  return vec4f(linearToSRGB(aces_tonemap(color)), 1.0);
}
