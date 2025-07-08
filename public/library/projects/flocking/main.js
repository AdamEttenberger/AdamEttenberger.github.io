window.addEventListener("load", main, true);
window.addEventListener("message", handleMessage);

var game;

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
    new Buffer( gl, Buffer.TEXTURE, gl.ARRAY_BUFFER, cubeUV, 2 ),
    new Buffer( gl, Buffer.INDEX, gl.ELEMENT_ARRAY_BUFFER, cubeIndices, 1 ),
  ];

  //
  game.m_managers.push( FlockManager.Instance() );

  game.m_root.addComponent(new RotateComponent().pushEuler(0, 15, 0));

  var cube = new GameObject();
  vec3.multiply( cube.m_transform.scale, cube.m_transform.scale, vec3.fromValues( 65, 65, 65 ) )
  vec3.add( cube.m_transform.position, cube.m_transform.position, [ 0, 0, 0 ] );
  cube.addComponent( new TextureModelComponent().setTexture(Game.loadTexture("/library/projects/flocking/images/glass.png")).setBuffers(cubeBuffers) );

  game.m_root.addChildGameObject( cube );

  FlockManager.Instance().spawn(150);
}

function handleMessage( event ) {
  if (event.origin !== window.location.origin) {
    return;
  }
  if (event.data.reload || event.data.count) {
    var old_count = FlockManager.Instance().count();
    var new_count = event.data.count ?? old_count;
    FlockManager.Instance().despawn(event.data.reload ? old_count : old_count - new_count);
    FlockManager.Instance().spawn(new_count - FlockManager.Instance().count());
  }
  if (event.data.speed !== undefined) {
    FlockerComponent.maxSpeed = event.data.speed;
  }
  if (event.data.force !== undefined) {
    FlockerComponent.maxForce = event.data.force;
  }
  if (event.data.alignment !== undefined) {
    FlockerComponent.alignmentScale = event.data.alignment;
  }
  if (event.data.separation !== undefined) {
    FlockerComponent.separationScale = event.data.separation;
  }
  if (event.data.cohesion !== undefined) {
    FlockerComponent.cohesionScale = event.data.cohesion;
  }
  if (event.data.containment !== undefined) {
    FlockerComponent.containmentScale = event.data.containment;
  }
  if (event.data.sight_radius !== undefined) {
    FlockerComponent.sightRadius = event.data.sight_radius;
  }
  if (event.data.separation_radius !== undefined) {
    FlockerComponent.separationRadius = event.data.separation_radius;
  }
  if (event.data.containment_radius !== undefined) {
    FlockerComponent.containmentRadius = event.data.containment_radius;
  }
}