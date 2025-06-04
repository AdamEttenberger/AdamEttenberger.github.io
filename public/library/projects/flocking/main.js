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
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    initScene();

  mat4.perspective(Game.pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 1.0, 1000.0);
  mat4.fromTranslation(Game.mMatrix, vec3.fromValues(0.0, 0.0, -100.0));

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
    -0.5,  0.5, -0.5,

    // Inner Front face
    -0.5, -0.5,  0.5,
    0.5, -0.5,  0.5,
    0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,

    // Inner Back face
    -0.5, -0.5, -0.5,
    -0.5,  0.5, -0.5,
    0.5,  0.5, -0.5,
    0.5, -0.5, -0.5,

    // Inner Top face
    -0.5,  0.5, -0.5,
    -0.5,  0.5,  0.5,
    0.5,  0.5,  0.5,
    0.5,  0.5, -0.5,

    // Inner Bottom face
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, -0.5,  0.5,
    -0.5, -0.5,  0.5,

    // Inner Right face
    0.5, -0.5, -0.5,
    0.5,  0.5, -0.5,
    0.5,  0.5,  0.5,
    0.5, -0.5,  0.5,

    // Inner Left face
    -0.5, -0.5, -0.5,
    -0.5, -0.5,  0.5,
    -0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5
  ];

  var cubeUV = [
    0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5, // Front face
    0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.0, 0.0, // Back face
    0.5, 0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 0.5, // Top face
    0.5, 1.0, 0.0, 1.0, 0.0, 0.5, 0.5, 0.5, // Bottom face
    0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.0, 0.0, // Right face
    0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5, // Left face

    0.5, 0.5, 1.0, 0.5, 1.0, 1.0, 0.5, 1.0, // Inner Front face
    1.0, 0.5, 1.0, 1.0, 0.5, 1.0, 0.5, 0.5, // Inner Back face
    0.5, 0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 0.5, // Inner Top face
    0.5, 1.0, 0.0, 1.0, 0.0, 0.5, 0.5, 0.5, // Inner Bottom face
    1.0, 0.5, 1.0, 1.0, 0.5, 1.0, 0.5, 0.5, // Inner Right face
    0.5, 0.5, 1.0, 0.5, 1.0, 1.0, 0.5, 1.0, // Inner Left face
    ];

  var cubeIndices = [
    24, 26, 25,   24, 27, 26, // Inner Front face
    28, 30, 29,   28, 31, 30, // Inner Back face
    32, 34, 33,   32, 35, 34, // Inner Top face
    36, 38, 37,   36, 39, 38, // Inner Bottom face
    40, 42, 41,   40, 43, 42, // Inner Right face
    44, 46, 45,   44, 47, 46, // Inner Left face

    0,  1,  2,    0,  2,  3,  // Front face
    4,  5,  6,    4,  6,  7,  // Back face
    8,  9,  10,   8,  10, 11, // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23, // Left face
    ];

  var cubeBuffers = [
    new Buffer( gl, Buffer.POSITION, gl.ARRAY_BUFFER, cubeVertices, 3 ),
    new Buffer( gl, Buffer.TEXTURE, gl.ARRAY_BUFFER, cubeUV, 2 )
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

  var triUV = [
        0.5, 0.5,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
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
    new Buffer( gl, Buffer.TEXTURE, gl.ARRAY_BUFFER, triUV, 2 )
  ];
  var triIBuff = new Buffer( gl, null, gl.ELEMENT_ARRAY_BUFFER, triIndices, 1 );

  //
  game.m_managers.push( FlockManager.Instance() );

  game.m_root.addComponent( new RotateComponent( quat.setAxisAngle( quat.create(), vec3.fromValues( 0, 1, 0 ), 0.005 ) ) );

  var cube = new GameObject();
  vec3.multiply( cube.m_transform.scale, cube.m_transform.scale, vec3.fromValues( 50, 50, 50 ) )
  vec3.add( cube.m_transform.position, cube.m_transform.position, [ 0, 0, 0 ] );
  cube.addComponent( new SkinnedModelComponent( game.loadTexture("/library/projects/flocking/images/glass.png"), cubeBuffers, cubeIBuff ) );

  for(var i = 0; i < 150; i++)
  {
    var tri = new GameObject();
    var v = vec3.fromValues( (Math.random()*50)-25, (Math.random()*50)-25, (Math.random()*50)-25 );
    var v = vec3.normalize( v, v );
    vec3.scale( v, v, 25 );
    vec3.add( tri.m_transform.position, tri.m_transform.position, v );
    tri.addComponent( new SkinnedModelComponent( game.loadTexture("/library/projects/flocking/images/ship.png"), triBuffers, triIBuff ) );
    tri.addComponent( new FlockerComponent( ) );
    FlockManager.Instance().m_members.push( tri );
    game.m_root.addChildGameObject( tri );
  }

  game.m_root.addChildGameObject( cube );
}