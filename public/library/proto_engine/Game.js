const { mat2, mat2d, mat3, mat4, quat, quat2, vec2, vec3, vec4 } = glMatrix;
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

function Game(canvas)
{
  this.m_canvas = canvas;
  this.m_managers = new Array();
  this.m_root = new GameObject();
  this.m_intervalID = null;
  this.running = false;
  this.fps = 50;

  var _frame_time = performance.now();

  try
  {
    gl = this.m_canvas.getContext("webgl2");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    gl.depthFunc(gl.LEQUAL);
  }
  catch(e)
  {
    console.log("Could not initialize WebGL Context");
    Game.ExceptionHandler("GL_INITIALIZATION");
  }
  if ( !gl )
  {
    console.log("Could not initialize WebGL Context");
    Game.ExceptionHandler("GL_INITIALIZATION");
  }

  this.update = function(dt)
  {
    var new_time = performance.now();
    var dt = (new_time - _frame_time) * 0.001;
    _frame_time = new_time;

    this.m_managers.forEach(manager => manager.update(dt));
    this.m_root.update(dt);
  }

  this.draw = function()
  {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor( Game.clearColor[0], Game.clearColor[1], Game.clearColor[2], Game.clearColor[3] );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    this.m_managers.forEach(manager => manager.draw(gl));
    this.m_root.draw(gl);
  }

  this.run = function()
  {
    this.update();
    this.draw();
  }

  this.start = function()
  {
    if (!this.running)
    {
      // this.serialize().then(jsonObject => console.log(JSON.stringify(jsonObject)));
      var _this = this;
      this.m_intervalID = setInterval(function(){_this.run();}, 1000 / this.fps);
      this.running = true;
    }
  }

  this.exit = function()
  {
    if (this.running)
    {
      clearInterval(this.m_intervalID);
      this.running = false;
    }
  }

  this.serialize = async function() {
    return {
      "managers": await Promise.all(this.m_managers.map(Game.serializeComponent)),
      "root": await Game.serializeGameObject(this.m_root),
    };
  }

  this.deserialize = async function(jsonSceneRoot) {
    this.m_managers = await Promise.all(jsonSceneRoot.managers.map(Game.deserializeComponent));
    this.m_root = await Game.deserializeGameObject(jsonSceneRoot.root);
    return this;
  }
}

Game.clearColor = vec4.fromValues( 0.392156862745098, 0.5843137254901961, 0.9294117647058824, 1.0 );
Game.mMatrix = mat4.create();
Game.vMatrix = mat4.create();
Game.pMatrix = mat4.create();

Game.matrixStack = new Array();

Game.pushMatrix = function()
{
  var copy = mat4.copy(mat4.create(), Game.mMatrix);
  Game.matrixStack.push( copy );
}

Game.popMatrix = function()
{
  if ( Game.matrixStack.length == 0 )
    throw "Invalid popMatrix";
  Game.mMatrix = Game.matrixStack.pop();
}

Game.stringToFunction = function(str) {
  var arr = str.split(".");
  var fn = (window || this);
  for (var i = 0, len = arr.length; i < len; i++)
    fn = fn[arr[i]];
  if (typeof fn !== "function")
    throw new Error("function not found");
  return  new fn();
};

Game.serializeTexture = async function(texture) {
  await texture.loader;
  const canvas = document.createElement('canvas');
  canvas.width = texture.image.width;
  canvas.height = texture.image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(texture.image, 0, 0);
  return canvas.toDataURL('image/png', 1.0);
}

Game.textures = [];
Game.loadTexture = function(path) {
  if (Game.textures[path] != null) return Game.textures[path];

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
  Game.textures[path] = tex;
  return tex;
}

Game.ExceptionHandler = (function() {
  var replacedGame = false;
  return function(e) {
    if (!replacedGame) {
      var gameElement = document.querySelector("canvas.game");
      if (!gameElement)
        return;
      var message = Game.ExceptionToMessage(e)
      if (message == null)
        return;

      gameElement.html(message);
      replacedGame = true;
    }
  }
})();

Game.ExceptionToMessage = function(e) {
    switch (e) {
        case "GL_INITIALIZATION":
        {
            return "<div class='error'><img src='/images/html5_white.png' width='128' height='128' /><h1>Error initializing WebGL</h1><h2>This page requires support for HTML5 Canvas and WebGL</h2></div>";
        }
        case "GL_SHADER_ERROR":
        case "GL_SHADER_PROGRAM_ERROR":
        {
            return "<div class='error'><img src='/images/html5_white.png' width='128' height='128' /><h1>Error initializing WebGL Shaders</h1><h2>This page requires support for HTML5 Canvas and WebGL</h2></div>";
        }
        default:
        {
            return `<div class='error'><img src='/images/html5_white.png' width='128' height='128' /><h1>Exception '${e}'</h1><h2>This page requires support for HTML5 Canvas and WebGL</h2></div>`;
        }
        return null;
    }
}

/**
 * Creates a JSON object representing the given GameObject and all
 * of its components and children which can be passed to JSON.stringify
 * then restored with Game.deserializeGameObject after JSON.parse.
 */
Game.serializeGameObject = function(obj) {
  return new Promise(async (resolve) => {
    var result = {};
    if (obj.components) {
      result.components = await Promise.all(obj.components.map(Game.serializeComponent));
    }
    if (obj.children) {
      result.children = await Promise.all(obj.children.map(Game.serializeGameObject));
    }
    resolve(result);
  });
}

/**
 * Creates a JSON object representing the given GameObjectComponent which
 * can be passed to JSON.stringify then restored with Game.deserializeComponent
 * after JSON.parse.
 */
Game.serializeComponent = function(component) {
  return new Promise(async (resolve, reject) => {
    var result = await component.serialize();
    result ? resolve(result) : reject();
  });
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
Game.deserializeGameObject = async function(jsonGameObject) {
  var obj = new GameObject();
  await Promise.all([
    Promise.all(jsonGameObject.components?.map(Game.deserializeComponent)).then(new_components => {
      new_components.forEach(component => obj.addComponent(component));
    }),
    Promise.all(jsonGameObject.children?.map(Game.deserializeGameObject)).then(new_children => {
      new_children.forEach(child => obj.addChildGameObject(child));
    }),
  ]);
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
Game.deserializeComponent = function(jsonComponent) {
  if (!Game.ComponentTypes) {
    Game.ComponentTypes = new Map(AllowedComponentNames.map(name => [name, window[name]]));
  }
  return new Promise(async (resolve, reject) => {
    var TComponent = Game.ComponentTypes.get(jsonComponent.type);
    return TComponent
        ? resolve(await new TComponent().deserialize(jsonComponent))
        : reject();
  });
}
