window.addEventListener("load", main, true);

var game;

function main()
{
  var canvas = document.querySelector("canvas");

  canvas.style.minWidth = 800;
  canvas.style.minHeight = 500;

  game = new Game(canvas);
  Game.clearColor = vec4.fromValues(0.0, 0.0, 0.0, 1.0);

  initScene();

  // Setup the camera (move the world forward 5 units).
  mat4.perspective(Game.pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 1.0, 1000.0);
  mat4.fromTranslation(Game.mMatrix, vec3.fromValues(0.0, 0.0, -5.0));

  game.start();
}

function initScene()
{
  var cubeVertices = [
    // Front face
    -0.5, -0.5,  0.5,
    0.5, -0.5,  0.5,
    0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,

    // Back face
    -0.5, -0.5, -0.5,
    -0.5,  0.5, -0.5,
    0.5,  0.5, -0.5,
    0.5, -0.5, -0.5,

    // Top face
    -0.5,  0.5, -0.5,
    -0.5,  0.5,  0.5,
    0.5,  0.5,  0.5,
    0.5,  0.5, -0.5,

    // Bottom face
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, -0.5,  0.5,
    -0.5, -0.5,  0.5,

    // Right face
    0.5, -0.5, -0.5,
    0.5,  0.5, -0.5,
    0.5,  0.5,  0.5,
    0.5, -0.5,  0.5,

    // Left face
    -0.5, -0.5, -0.5,
    -0.5, -0.5,  0.5,
    -0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5
  ];

  var cubeColors = [
    1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, // Front face
    1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, // Back face
    0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, // Top face
    1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, 1.0, // Bottom face
    1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, // Right face
    0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0 // Left face
  ];

  var cubeUV = [
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, // Front face
    1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // Back face
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, // Top face
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // Bottom face
    1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // Right face
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0 // Left face
    ];

  var cubeIndices = [
    0, 1, 2,      0, 2, 3,    // Front face
    4, 5, 6,      4, 6, 7,    // Back face
    8, 9, 10,     8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face
    ];

  var cubePosition = new Buffer(gl, Buffer.POSITION, gl.ARRAY_BUFFER, cubeVertices, 3);
  var cubeColor = new Buffer(gl, Buffer.COLOR, gl.ARRAY_BUFFER, cubeColors, 4);
  var cubeTexture = new Buffer(gl, Buffer.TEXTURE, gl.ARRAY_BUFFER, cubeUV, 2);
  var cubeIBuff = new Buffer(gl, Buffer.INDEX, gl.ELEMENT_ARRAY_BUFFER, cubeIndices, 1);

  var colorCubeBuffers = [
    cubePosition,
    cubeColor,
    cubeIBuff,
  ];

  var textureCubeBuffers = [
    cubePosition,
    cubeTexture,
    cubeIBuff,
  ];

  var colorTextureCubeBuffers = [
    cubePosition,
    cubeColor,
    cubeTexture,
    cubeIBuff,
  ];

  //

  var triVertices = [
    0.0,  0.5,  0.0,
    -0.5,  -0.5,  -0.5,
    -0.5,  -0.5,  0.5,
    0.5,  -0.5,  0.5,
    0.5,  -0.5,  -0.5
  ];

  var triColors = [
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    0.0, 0.0, 0.0, 1.0
  ];

  var triIndices = [
    0, 1, 2,
    0, 2, 3,
    0, 3, 4,
    0, 4, 1,
    3, 2, 1,
    1, 4, 3
    ];

  var triBuffers = [
    new Buffer(gl, Buffer.POSITION, gl.ARRAY_BUFFER, triVertices, 3),
    new Buffer(gl, Buffer.COLOR, gl.ARRAY_BUFFER, triColors, 4),
    new Buffer(gl, Buffer.INDEX, gl.ELEMENT_ARRAY_BUFFER, triIndices, 1),
  ];

  //

  game.m_root.addComponent(new RotateComponent().pushEuler(-30, 0, 0));

  var cubes = new GameObject();
  vec3.add(cubes.m_transform.position, cubes.m_transform.position, vec3.fromValues(1.5, 0, 0))
  cubes.addComponent(new RotateComponent().pushEuler(0, 0, 60));

  var colorCube = new GameObject();
  colorCube.addComponent(new ModelComponent().setBuffers(colorCubeBuffers));
  colorCube.addComponent(new RotateComponent().pushEuler(120, -90, 0));

  var textureCube = new GameObject();
  textureCube.addComponent(new TextureModelComponent().setTexture(Game.loadTexture("/library/projects/proto_engine/images/metalcrate.png")).setBuffers(textureCubeBuffers));
  textureCube.addComponent(new RotateComponent().pushEuler(-120, -90, 0));

  var colorTextureCube = new GameObject();
  colorTextureCube.addComponent(new ColorTextureModelComponent().setTexture(Game.loadTexture("/library/projects/proto_engine/images/metalcrate.png")).setBuffers(colorTextureCubeBuffers));
  colorTextureCube.addComponent(new RotateComponent().pushEuler(120, -90, 0));

  cubes.addChildGameObject(colorCube);
  cubes.addChildGameObject(textureCube);
  cubes.addChildGameObject(colorTextureCube);

  var radius = 1.0;
  var step_rad = (Math.PI * 2) / 3;
  cubes.children.forEach((child, i) => vec3.add(child.m_transform.position, child.m_transform.position,
                                                vec3.fromValues(Math.cos(step_rad * i) * radius, Math.sin(step_rad * i) * radius, 0)));

  var tri = new GameObject();
  vec3.add(tri.m_transform.position, tri.m_transform.position, vec3.fromValues(-1.5, 0, 0))
  quat.multiply(tri.m_transform.rotation, tri.m_transform.rotation, quat.setAxisAngle(quat.create(), vec3.fromValues(1, 0, 0), Math.PI / 4.0));
  tri.addComponent(new ModelComponent().setBuffers(triBuffers));
  tri.addComponent(new RotateComponent().pushEuler(0, 360, 0));

  game.m_root.addChildGameObject(cubes);
  game.m_root.addChildGameObject(tri);

}
