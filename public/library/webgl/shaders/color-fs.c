precision mediump float;

varying vec4 vColor;

uniform float uAlpha;

void main(void)
{
  gl_FragColor = vec4(vColor.rgb, vColor.a * uAlpha);
}