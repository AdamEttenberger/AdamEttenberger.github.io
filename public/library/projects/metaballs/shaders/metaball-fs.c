precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float uAlpha;
uniform float uThreshold;

void main(void)
{
  vec4 result = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
  if (result.a < uThreshold)
    gl_FragColor = vec4(result.rgb, result.a * uAlpha);
  else
    discard;
}