precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float uAlpha;
uniform float uThreshold;

void main(void)
{
  vec4 result = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  float g = (result.a - uThreshold) / (1.0 - uThreshold);
  if (g >= 0.4) {
    gl_FragColor = vec4(result.rgb, result.a * uAlpha);
  } else if (g >= 0.2) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, result.a * uAlpha);
  } else if (g >= 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, result.a * uAlpha);
  } else {
    discard;
  }
}
