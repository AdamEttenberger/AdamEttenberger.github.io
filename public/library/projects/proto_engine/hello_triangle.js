window.addEventListener("load", main, true);

function main()
{
  var canvas = document.querySelector("canvas");
  canvas.style.minWidth = 800;
  canvas.style.minHeight = 500;

  var game = new Game(canvas);
  Game.clearColor = vec4.fromValues( 0.0, 0.0, 0.0, 1.0 );

  var v1 = vec3.fromValues(0, 1, 0);
  var v2 = vec3.rotateZ(/*dest=*/vec3.create(),
                        /*src=*/v1,
                        /*origin=*/vec3.create(),
                        /*radians=*/(2/3) * Math.PI);
  var v3 = vec3.rotateZ(/*dest=*/vec3.create(),
                        /*src=*/v1,
                        /*origin=*/vec3.create(),
                        /*radians=*/-(2/3) * Math.PI);

  var buffers = [
    new Buffer( gl, Buffer.POSITION, gl.ARRAY_BUFFER,
      [
        Array.from(v1),
        Array.from(v2),
        Array.from(v3),
      ].flat(),
      3),
    new Buffer( gl, Buffer.COLOR, gl.ARRAY_BUFFER,
      [
        1, 0, 0, 1, // red   #FF0000FF
        0, 1, 0, 1, // green #00FF00FF
        0, 0, 1, 1, // blue  #0000FFFF
      ],
      4),
    new Buffer( gl, Buffer.INDEX, gl.ELEMENT_ARRAY_BUFFER,
      [
        0, 1, 2,
      ],
      1),
  ];

  var triangle = new GameObject();
  triangle.addComponent(new ModelComponent().setBuffers(buffers));
  triangle.addComponent(new RotateComponent().fromEuler(0, 0, -0.025));
  game.m_root.addChildGameObject(triangle);

  // Setup the camera (move the world forward 5 units).
  mat4.perspective(Game.pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 1.0, 1000.0);
  mat4.fromTranslation(Game.mMatrix, vec3.fromValues(0.0, 0.0, -5.0));

  game.start();
}