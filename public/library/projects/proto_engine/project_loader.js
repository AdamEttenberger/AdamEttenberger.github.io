window.addEventListener("load", main, true);

function main() {
  new App(document.querySelector("canvas"))
    .initScene()
    .setupCamera()
    .start();
}

class App {
  constructor(canvas) {
    this.game = new Game(canvas);
    this.game.clear_color = vec4.fromValues( 0.0, 0.0, 0.0, 1.0 );
    window.addEventListener("message", e => this.handleMessage(e));
  }

  initScene() {
    return this;
  }

  setupCamera() {
    // Setup the camera (move the world forward 5 units).
    mat4.perspective(this.game.pMatrix, 45, this.game.aspect, 1.0, 1000.0);
    mat4.fromTranslation(this.game.vMatrix, vec3.fromValues(0.0, 0.0, -5.0));
    return this;
  }

  start() {
    this.game.start();
    return this;
  }

  handleMessage( event ) {
    if (event.origin !== window.location.origin ||
        !event.data.file) {
      return;
    }
    LoadFileAsync('GET', event.data.file)
        .then(xhr => {
          this.game.deserialize(JSON.parse(xhr.responseText));
          this.game.start();
        })
        .catch(e => this.game.onException(e));
  }
}
