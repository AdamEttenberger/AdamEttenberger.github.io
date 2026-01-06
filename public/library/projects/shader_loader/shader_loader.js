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
    this.shader_api_key_map = new Map([
      ['vert', gl.VERTEX_SHADER],
      ['frag', gl.FRAGMENT_SHADER],
    ]);
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

  async handleMessage(e) {
    if (e.origin !== window.location.origin || !e.data) {
      return;
    }
    var sources = e.data.sources;
    var uniforms = e.data.uniforms;
    if (sources) {
      // Need to convert from API string to gl.*_SHADER keys.
      sources = Object.entries(sources).map(([key, value]) => [this.shader_api_key_map.get(key), value]);
      var additional_uniform_key_entries = uniforms ? new Map(uniforms.map(([key, value]) => [key, key])) : null;
      await this.shader_loader_component.loadShaderProgram(sources, additional_uniform_key_entries);
    }
    if (uniforms) {
      this.shader_loader_component.bulkUpdateUniforms(uniforms);
    }
  }
}
