struct Uniforms {
  mMatrix: mat4x4f,
  vMatrix: mat4x4f,
  pMatrix: mat4x4f,
  iResolution: vec4f, // {physicalWidth, physicalHeight, devicePixelRatio, aspect}
  iMouse: vec2f, // normalized range: [0, 1]
  iTime: f32, // (seconds)
};

@group(0) @binding(0)
var<uniform> uniforms: Uniforms;

struct VertexInput {
  @location(0) position: vec3f,
  @location(1) uv: vec2f,
};

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var out: VertexOutput;
  out.position = uniforms.pMatrix * uniforms.vMatrix * uniforms.mMatrix * vec4f(input.position, 1.0);
  out.uv = input.uv;
  return out;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  var p: vec2f = input.uv;
  p -= uniforms.iMouse;
  p.x *= uniforms.iResolution.w;

  let stroke_px: f32 = (3.0 / uniforms.iResolution.y);
  let reticle_radius_px: f32 = (20.0 / uniforms.iResolution.y);

  let circle_sdf: f32 = length(p) - reticle_radius_px;
  let horizontal_vertical_ruler_sdf: f32 = min(
    abs(dot(p, vec2f(1.0, 0.0))) - stroke_px,
    abs(dot(p, vec2f(0.0, 1.0))) - stroke_px);

  let sdf: f32 = min(
    max(horizontal_vertical_ruler_sdf, -circle_sdf),
    abs(circle_sdf) - reticle_radius_px * 0.25
  );

  if (sdf <= 0.0) {
    return vec4f(vec3f(0.0), 1.0);
  }

  let color: vec3f = 0.5 + 0.5 * cos(uniforms.iTime + input.uv.xyx + vec3f(0.0, 2.0, 4.0));
  return vec4f(color, 1.0);
}
