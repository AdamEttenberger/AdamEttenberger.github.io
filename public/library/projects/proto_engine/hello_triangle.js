window.addEventListener("load", main, true);

function main() {
  // Expects to be run from an iframe.
  // e.g., <iframe src="/library/projects/metaballs/main.html?mode=WebFigure1"></iframe>
  new App(document.querySelector("canvas"))
    .initScene()
    .setupCamera()
    .start();
}

class App {
  constructor(canvas) {
    this.game = new Game(canvas);
    this.game.clear_color = vec4.fromValues( 0.0, 0.0, 0.0, 1.0 );
  }

  initScene() {
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
    triangle.addComponent(new RotateComponent().pushEuler(0, 0, -120));
    this.game.m_root.addChildGameObject(triangle);
    return this;
  }

  setupCamera() {
    // Setup the camera (move the world forward 5 units).
    mat4.perspective(this.game.pMatrix, 45, this.game.aspect, 1.0, 1000.0);
    mat4.fromTranslation(this.game.mMatrix, vec3.fromValues(0.0, 0.0, -5.0));
    return this;
  }

  start() {
    this.game.start();
    return this;
  }
}
