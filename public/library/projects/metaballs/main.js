window.addEventListener("load", main, true);

function main() {
  // Expects to be run from an iframe.
  // e.g., <iframe src="/library/projects/metaballs/main.html?mode=WebFigure1"></iframe>
  const url_params = new URLSearchParams(window.location.search);
  new App(document.querySelector("canvas"))
    .initScene(url_params.get('mode'))
    .setupCamera()
    .start();
}

class App {
  constructor(canvas) {
    this.game = new Game(canvas);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    window.addEventListener("message", e => this.handleMessage(e));
  }

  initScene(mode) {
    this.game.m_managers.push( ParticleManager.Instance() );

    var plane = new GameObject();
    this.metaball_component = new MetaballComponent(mode);
    plane.addComponent(this.metaball_component);

    this.game.m_root.addChildGameObject( plane );
    return this;
  }

  setupCamera() {
    mat4.ortho(this.game.pMatrix, -2.0, 2.0, -2.0, 2.0, 0.0, 1000.0);
    mat4.fromTranslation(this.game.mMatrix, vec3.fromValues(0.0, 0.0, -100.0));
    return this;
  }

  start() {
    this.game.start();
    return this;
  }

  handleMessage(e) {
    if (e.origin !== window.location.origin) {
      return;
    }
    this.metaball_component.handleMessage( e.data );
  }
}
