#version 300 es
#ifdef GL_ES
precision highp float;
#endif

in vec3 aVertexPosition;
in vec2 aTextureCoord;

out vec2 UV;

uniform mat4 mMatrix; // World ( Model-View ) Matrix
uniform mat4 vMatrix; // View Matrix
uniform mat4 pMatrix; // Projection Matrix

void main() {
  gl_Position = pMatrix * vMatrix * mMatrix * vec4(aVertexPosition, 1.0);
  UV = aTextureCoord;
}
