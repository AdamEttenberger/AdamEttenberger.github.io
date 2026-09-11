const kMinDielectricF0 = 4e-2;

struct BRDFMaterialData {
  albedo_color: vec3f,            // base color, or tint with texture 
  albedo_texture: u32,            // texture containing albedo color data
  metallic_scale: f32,            // [0, 1] : [non-metal, metal]
  metallic_texture: u32,          // texture containing metallic lighting data
  roughness_scale: f32,           // [0, 1] : [mirror, blurry]
  roughness_texture: u32,         // texture containing roughness lighting data
  normal_scale: f32,              // [0, 1] : [flat-lighting, directional-lighting]
  normal_texture: u32,            // texture containing normal lighting data
  displacement_scale: f32,        // [0, 1] : [flat-geometry, displaced-geometry]
  displacement_texture: u32,      // texture containing vertex height/displacement data
  emissive_color: vec3f,          // base emissive color, or multiplicative tint with texture
  emissive_scale: f32,            // [0, 16] : multiplier for light emitted
  emissive_texture: u32,          // texture containing emissive lighting data
  ambient_occlusion_scale: f32,   // [0, 1] : [no-shadows, self-shadows]
  ambient_occlusion_texture: u32, // texture containing self-occluded shadows
};

@group(1) @binding(0) var<storage, read> materials: array<BRDFMaterialData>;

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
  let a = roughness + 1.0;
  return (a * a) / 8.0;
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

  var position: vec3f = input.position;
  if (material.displacement_texture != 0u) {
    var disp: vec3f = textureSampleLevel(textures_1k, s_linear_repeat, input.uv, material.displacement_texture, 0.0).xyz;
    position += input.normal * disp * material.displacement_scale;
  }

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

  var albedo: vec3f = material.albedo_color;
  if (material.albedo_texture != 0u) {
    albedo *= textureSampleLevel(textures_1k_srgb, s_linear_repeat, input.uv, material.albedo_texture, 0.0).rgb;
  }
  var metallic: f32 = material.metallic_scale;
  if (material.metallic_texture != 0u) {
    metallic *= textureSampleLevel(textures_1k, s_linear_repeat, input.uv, material.metallic_texture, 0.0).r;
  }
  var roughness: f32 = material.roughness_scale;
  if (material.roughness_texture != 0u) {
    roughness *= textureSampleLevel(textures_1k, s_linear_repeat, input.uv, material.roughness_texture, 0.0).r;
  }
  var ambient_occlusion: f32 = material.ambient_occlusion_scale;
  if (material.ambient_occlusion_texture != 0u) {
    ambient_occlusion *= textureSampleLevel(textures_1k, s_linear_repeat, input.uv, material.ambient_occlusion_texture, 0.0).r;
  }
  var emissive: vec3f = material.emissive_color * material.emissive_scale;
  if (material.emissive_texture != 0u) {
    emissive *= textureSampleLevel(textures_1k_srgb, s_linear_repeat, input.uv, material.emissive_texture, 0.0).rgb;
  }

  var N: vec3f = normalize(input.world_normal);
  if (material.normal_texture != 0u) {
    let T = normalize(input.world_tangent);
    let B = normalize(input.world_bitangent);
    let TBN = mat3x3f(T, B, N);

    var local_normal: vec3f = textureSampleLevel(textures_1k, s_linear_repeat, input.uv, material.normal_texture, 0.0).rgb;
    local_normal = local_normal * 2.0 - 1.0;
    local_normal.x *= material.normal_scale;
    local_normal.y *= material.normal_scale;
    local_normal = normalize(local_normal);
    N = normalize(TBN * local_normal);
  }

  let V: vec3f = normalize(global.iCameraPosition - input.world_position.xyz);
  let L: vec3f = normalize(-global.iSunDirection);

  let context: ShadingContext = makeShadingContext(N, V, L);

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
  let ambient: vec3f = albedo * ambient_occlusion * globalAmbientLight * ambientDiffuseMask;
  let color: vec3f = ambient + outgoing_radiance + emissive;
  return vec4f(linearToSRGB(aces_tonemap(color)), 1.0);
}
