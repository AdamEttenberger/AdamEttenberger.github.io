precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform float uAlpha;

void main(void)
{
  vec4 result = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)) * vColor;
  gl_FragColor = vec4(result.rgb, result.a * uAlpha);
}