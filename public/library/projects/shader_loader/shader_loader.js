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
    var loader = new GameObject();
    this.shader_loader_component = new ShaderLoaderComponent();
    loader.addComponent(this.shader_loader_component);
    this.game.m_root.addChildGameObject( loader );
    return this;
  }

  setupCamera() {
    mat4.ortho(this.game.pMatrix, -1.0, 1.0, -1.0, 1.0, 0.1, 1000.0);
    mat4.fromRotationTranslationScale(this.game.vMatrix,
      quat.create(),
      vec3.fromValues(0.0, 0.0, -1.0),
      vec3.fromValues(1.0, 1.0, 1.0)
    );
    return this;
  }

  start() {
    this.game.start();
    return this;
  }

  handleMessage(e) {
    if (e.origin !== window.location.origin || !e.data) {
      return;
    }
    this.shader_loader_component.handleMessage(e.data);
  }
}
