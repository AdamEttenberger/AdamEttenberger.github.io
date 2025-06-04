window.addEventListener("load", main, true);

var game;
var shaderProgram;
var buffers = new Array();

function main()
{
  var canvas = document.querySelector("canvas");

  canvas.style.minWidth = 800;
  canvas.style.minHeight = 500;

    game = new Game(canvas);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    //gl.enable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);

  Game.clearColor = vec4.fromValues( 0.0, 0.0, 0.0, 1.0 );

  initScene();

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

  var cubePosition = new Buffer( gl, Buffer.POSITION, gl.ARRAY_BUFFER, cubeVertices, 3 );
  var cubeColor = new Buffer( gl, Buffer.COLOR, gl.ARRAY_BUFFER, cubeColors, 4 );
  var cubeTexture = new Buffer( gl, Buffer.TEXTURE, gl.ARRAY_BUFFER, cubeUV, 2 );

  var colorCubeBuffers = [
    cubePosition,
    cubeColor
  ];

  var textureCubeBuffers = [
    cubePosition,
    cubeTexture
  ];

  var colorTextureCubeBuffers = [
    cubePosition,
    cubeColor,
    cubeTexture
  ];

  var cubeIBuff = new Buffer( gl, null, gl.ELEMENT_ARRAY_BUFFER, cubeIndices, 1 );

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
    new Buffer( gl, Buffer.POSITION, gl.ARRAY_BUFFER, triVertices, 3 ),
    new Buffer( gl, Buffer.COLOR, gl.ARRAY_BUFFER, triColors, 4 )
  ];
  var triIBuff = new Buffer( gl, null, gl.ELEMENT_ARRAY_BUFFER, triIndices, 1 );

  //

  game.m_root.addComponent( new RotateComponent( quat.setAxisAngle( quat.create(), vec3.fromValues( 1, 0, 0 ), -0.01 ) ) );

  var cubes = new GameObject();
  vec3.add( cubes.m_transform.position, cubes.m_transform.position, vec3.fromValues( 1.5, 0, 0 ) )
  cubes.addComponent( new RotateComponent( quat.setAxisAngle( quat.create(), vec3.fromValues( 0, 0, 1 ), 0.02 ) ) );

  var colorCube = new GameObject();
  colorCube.addComponent( new ModelComponent(colorCubeBuffers, cubeIBuff ) );
  colorCube.addComponent( new RotateComponent( quat.setAxisAngle( quat.create(), vec3.fromValues( 1, 0, 0 ), 0.04 ) ) );
  colorCube.addComponent( new RotateComponent( quat.setAxisAngle( quat.create(), vec3.fromValues( 0, 1, 0 ), -0.03 ) ) );

  var textureCube = new GameObject();
  textureCube.addComponent( new SkinnedModelComponent( game.loadTexture("/library/projects/webgl/images/metalcrate.png"), textureCubeBuffers, cubeIBuff ) );
  textureCube.addComponent( new RotateComponent( quat.setAxisAngle( quat.create(), vec3.fromValues( 1, 0, 0 ), -0.04, ) ) );
  textureCube.addComponent( new RotateComponent( quat.setAxisAngle( quat.create(), vec3.fromValues( 0, 1, 0 ), -0.03, ) ) );

  var colorTextureCube = new GameObject();
  colorTextureCube.addComponent( new ColoredSkinnedModelComponent( game.loadTexture("/library/projects/webgl/images/metalcrate.png"), colorTextureCubeBuffers, cubeIBuff ) );
  colorTextureCube.addComponent( new RotateComponent( quat.setAxisAngle( quat.create(), vec3.fromValues( 1, 0, 0 ), 0.04 ) ) );
  colorTextureCube.addComponent( new RotateComponent( quat.setAxisAngle( quat.create(), vec3.fromValues( 0, 1, 0 ), -0.03 ) ) );

  cubes.addChildGameObject( colorCube );
  cubes.addChildGameObject( textureCube );
  cubes.addChildGameObject( colorTextureCube );

  var r = 1.0;
  var dr = ( Math.PI * 2 ) / 3 ;
  var s = 0;

  for(var i in cubes.children)
  {
    vec3.add( cubes.children[i].m_transform.position, cubes.children[i].m_transform.position , vec3.fromValues( Math.cos(dr * i) * r, Math.sin(dr * i) * r, 0 ) )
  }

  var tri = new GameObject();
  vec3.add( tri.m_transform.position, tri.m_transform.position , vec3.fromValues( -1.5, 0, 0 ) )
  quat.multiply( tri.m_transform.rotation, tri.m_transform.rotation, quat.setAxisAngle( quat.create(),vec3.fromValues( 1, 0, 0 ), Math.PI / 4.0 ) );
  tri.addComponent( new ModelComponent( triBuffers, triIBuff ) );
  tri.addComponent( new RotateComponent( quat.setAxisAngle( quat.create(), vec3.fromValues( 0, 1, 0 ), 0.1 ) ) );

  game.m_root.addChildGameObject( cubes );
  game.m_root.addChildGameObject( tri );

}