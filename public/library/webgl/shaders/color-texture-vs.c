#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aVertexColor;

uniform mat4 mMatrix; // World ( Model-View ) Matrix
uniform mat4 vMatrix; // View Matrix
uniform mat4 pMatrix; // Projection Matrix

varying vec2 vTextureCoord;
varying vec4 vColor;

void main(void)
{
  gl_Position = pMatrix * vMatrix * mMatrix * vec4(aVertexPosition, 1.0);
  vTextureCoord = aTextureCoord;
  vColor = aVertexColor;
}