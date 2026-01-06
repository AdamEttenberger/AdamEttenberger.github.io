const { mat2, mat2d, mat3, mat4, quat, quat2, vec2, vec3, vec4 } = glMatrix;
var g_game = null;
var gl = null;

const AllowedComponentNames = [
  "Transform",
  "Buffer",
  "ParticleManager",
  "ModelComponent",
  "TextureModelComponent",
  "ColorTextureModelComponent",
  "RotateComponent",
  "MetaballComponent",
  "FlockManager",
  "FlockerComponent",
];

class Game {
  constructor(canvas) {
    g_game = this;
    this.m_canvas = canvas;
    this.canvas_width = canvas.width;
    this.canvas_height = canvas.height;
    this.m_managers = new Array();
    this.m_root = new GameObject();
    this.m_intervalID = null;
    this.running = false;
    this.fps = 50;

    this.clear_color = vec4.fromValues( 0.392156862745098, 0.5843137254901961, 0.9294117647058824, 1.0 );
    this.mMatrix = mat4.create();
    this.vMatrix = mat4.create();
    this.pMatrix = mat4.create();
    this.matrix_stack = new Array();
    this.textures = new Map(); // Map<URL, WeakRef<WebGLTexture>>
    this.component_types = new Map(AllowedComponentNames.map(name => [name, window[name]]));

    this.frame_time = performance.now();

    try {
      gl = this.m_canvas.getContext("webgl2");

      gl.disable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.frontFace(gl.CCW);
      gl.cullFace(gl.BACK);
      gl.depthFunc(gl.LEQUAL);
    } catch(e) {
      console.log("Could not initialize WebGL Context");
      this.onException("GL_INITIALIZATION");
    }
    if ( !gl ) {
      console.log("Could not initialize WebGL Context");
      this.onException("GL_INITIALIZATION");
    }
  }

  get aspect() {
    return this.canvas_width / this.canvas_height;
  }

  update(dt) {
    var new_time = performance.now();
    var dt = (new_time - this.frame_time) * 0.001;
    this.frame_time = new_time;

    this.m_managers.forEach(manager => manager.update(dt));
    this.m_root.update(dt);
  }

  draw() {
    gl.viewport(0, 0, this.canvas_width, this.canvas_height);
    gl.clearColor( this.clear_color[0], this.clear_color[1], this.clear_color[2], this.clear_color[3] );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    this.m_managers.forEach(manager => manager.draw(gl));
    this.m_root.draw(gl);
  }

  tick() {
    this.update();
    this.draw();
  }

  start() {
    if (!this.running) {
      // this.serialize().then(jsonObject => console.log(JSON.stringify(jsonObject)));
      this.m_intervalID = setInterval(() => this.tick(), 1000 / this.fps);
      this.running = true;
    }
  }

  exit() {
    if (this.running) {
      clearInterval(this.m_intervalID);
      this.running = false;
    }
  }

  async serialize() {
    return {
      "managers": await Promise.all(this.m_managers.map(this.serializeComponent, this)),
      "root": await this.serializeGameObject(this.m_root),
    };
  }

  async deserialize(jsonSceneRoot) {
    this.m_managers = await Promise.all(jsonSceneRoot.managers.map(this.deserializeComponent, this));
    this.m_root = await this.deserializeGameObject(jsonSceneRoot.root);
    return this;
  }

  pushMatrix() {
    var copy = mat4.copy(mat4.create(), this.mMatrix);
    this.matrix_stack.push( copy );
  }

  popMatrix() {
    if ( this.matrix_stack.length == 0 ) {
      throw "Invalid popMatrix";
    }
    this.mMatrix = this.matrix_stack.pop();
  }

  stringToFunction(str) {
    var arr = str.split(".");
    var fn = (window || this);
    for (var i = 0, len = arr.length; i < len; i++)
      fn = fn[arr[i]];
    if (typeof fn !== "function") {
      throw new Error("function not found");
    }
    return  new fn();
  }

  static async serializeTexture(texture) {
    await texture.loader;
    const canvas = document.createElement('canvas');
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(texture.image, 0, 0);
    return canvas.toDataURL('image/png', 1.0);
  }

  loadTexture(path) {
    var cached = this.textures[path]?.deref();
    if (cached) {
      return cached;
    }

    var tex = gl.createTexture( );
    tex.image = new Image();
    tex.loader = new Promise((resolve) => {
      tex.image.addEventListener('load', () => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        tex.loaded = true;
        resolve();
      }, { once: true });
    });
    tex.image.src = path;
    this.textures[path] = new WeakRef(tex);
    return tex;
  }

  onException(e) {
    var gameElement = document.querySelector("canvas.game");
    if (!gameElement)
      return;
    var message;
    switch (e) {
      case "GL_INITIALIZATION":
        message = "<div class='error'><img src='/images/html5_white.png' width='128' height='128' /><h1>Error initializing WebGL</h1><h2>This page requires support for HTML5 Canvas and WebGL</h2></div>";
      case "GL_SHADER_ERROR":
      case "GL_SHADER_PROGRAM_ERROR":
        message = "<div class='error'><img src='/images/html5_white.png' width='128' height='128' /><h1>Error initializing WebGL Shaders</h1><h2>This page requires support for HTML5 Canvas and WebGL</h2></div>";
      default:
        console.log(`unhandled exception: ${e}`);
        message = `<div class='error'><img src='/images/html5_white.png' width='128' height='128' /><h1>Exception '${e}'</h1><h2>This page requires support for HTML5 Canvas and WebGL</h2></div>`;
        break;
    }
    gameElement.html(message);
  }

  /**
   * Creates a JSON object representing the given GameObject and all
   * of its components and children which can be passed to JSON.stringify
   * then restored with this.deserializeGameObject after JSON.parse.
   */
  async serializeGameObject(obj) {
    var result = {};
    if (obj.components) {
      result.components = await Promise.all(obj.components.map(this.serializeComponent, this));
    }
    if (obj.children) {
      result.children = await Promise.all(obj.children.map(this.serializeGameObject, this));
    }
    return result;
  }

  /**
   * Creates a JSON object representing the given GameObjectComponent which
   * can be passed to JSON.stringify then restored with this.deserializeComponent
   * after JSON.parse.
   */
  async serializeComponent(component) {
    return await component.serialize();
  }

  /**
   * Creates a new GameObject which reflects the state of jsonObject.
   * For example:
   *
   * {
   *   components: [ ... ]
   *   children: [ ... ],
   * }
   *
   * @param {*} jsonGameObject JSON object that represents the current node being deserialized and its descendants.
   */
  async deserializeGameObject(jsonGameObject) {
    var obj = new GameObject();
    // Ensure all components are added to the current object before deserializing children.
    await Promise.all(jsonGameObject.components?.map(this.deserializeComponent, this)).then(new_components => {
      new_components.forEach(component => obj.addComponent(component));
    });
    await Promise.all(jsonGameObject.children?.map(this.deserializeGameObject, this)).then(new_children => {
      new_children.forEach(child => obj.addChildGameObject(child));
    });
    return obj;
  }

  /**
   * Creates a new GameObject which reflects the state of jsonObject.
   * For example:
   *   { type: "Transform", position: [x,y,z], rotation: [x,y,z,w], scale:[x,y,z] }
   *   { type: "RotateComponent", rotation: [x,y,z,w] }
   *   { type: "ModelComponent", vertices: {position: [...], color: [...]}, indices: [...] }
   *   { type: "ModelComponent", file: "/path/to/some.obj" }
   *
   * @param {*} jsonGameObject JSON object that represents the current node being deserialized and its descendants.
   */
  async deserializeComponent(jsonComponent) {
      var TComponent = this.component_types.get(jsonComponent.type);
      return await new TComponent().deserialize(jsonComponent);
  }
}
