var gl = null;

function Game(canvas)
{
  this.m_canvas = canvas;
  try
  {
    gl = this.m_canvas.getContext("webgl") || this.m_canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

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

  this.textures = [];

  this.m_managers = new Array();
  this.m_root = new GameObject();
  this.m_intervalID = null;

  this.running = false;
  this.fps = 50;
  this.update = function()
  {
    var i;
    for(i in this.m_managers)
      this.m_managers[i].update();
    this.m_root.update();
  }

  this.draw = function()
  {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor( Game.clearColor[0], Game.clearColor[1], Game.clearColor[2], Game.clearColor[3] );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    var i;
    for(i in this.m_managers)
      this.m_managers[i].draw(gl);
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
      var _this = this;
      this.m_intervalID = setInterval(function(){_this.run();}, 1000 / this.fps);
      this.running = true;
    }
  }

  this.loadTexture = function(path)
  {
    if (this.textures[path] != null) return this.textures[path];

    var tex = gl.createTexture( );
    tex.loaded = false;
    tex.image = new Image();
    tex.image.onload = function() { handleLoadedTexture(tex, tex.image); };
    tex.image.src = path;
    this.textures[path] = tex;
    return tex;
  }

  var handleLoadedTexture = function(texture, image)
  {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    texture.loaded = true;
    }

  this.loadShaderProgramAsync = function(vertexShaderFile, fragmentShaderFile)
  {
    var loadVSContent = LoadFileAsync('GET', vertexShaderFile)
    .then(xhr => {
      var vsContents = xhr.responseText;
      var vs_shader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs_shader, vsContents);
      gl.compileShader(vs_shader);
      if ( !gl.getShaderParameter(vs_shader, gl.COMPILE_STATUS) )
      {
        console.log(gl.getShaderInfoLog(vs_shader));
        throw "GL_SHADER_ERROR";
      }
      return vs_shader;
        })
        .catch( e => Game.ExceptionHandler(e) );

    var loadFSContent = LoadFileAsync('GET', fragmentShaderFile)
    .then(xhr => {
      var fsContents = xhr.responseText;
      var fs_shader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fs_shader, fsContents);
      gl.compileShader(fs_shader);
      if ( !gl.getShaderParameter(fs_shader, gl.COMPILE_STATUS) )
      {
        console.log(gl.getShaderInfoLog(fs_shader));
        throw "GL_SHADER_ERROR";
      }
      return fs_shader;
        })
        .catch( e => Game.ExceptionHandler(e) );;

    return Promise.all([loadVSContent, loadFSContent])
    .then(function(values) {
      var vs_shader = values[0];
      var fs_shader = values[1];
      var shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vs_shader);
      gl.attachShader(shaderProgram, fs_shader);
      gl.linkProgram(shaderProgram);

      if ( !gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) )
      {
        console.log("Could not initialise shaders");
        throw "GL_SHADER_PROGRAM_ERROR";
      }

      gl.useProgram(shaderProgram);

      return shaderProgram;
        })
        .catch( e => Game.ExceptionHandler(e) );;
  }

  this.loadPrefab = function(prefab)
  {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", prefab, false);
    xmlhttp.send();
    var xmlDoc = xmlhttp.responseXML;
    for(var i in xmlDoc.childNodes)
    {
      if ( xmlDoc.childNodes[i].tagName != undefined )
      {
        if ( xmlDoc.childNodes[i].tagName == "GameObject" )
        {
          var obj = Game.stringToFunction( xmlDoc.childNodes[i].tagName );
          obj.deserialize( xmlDoc.childNodes[i] );
          //obj.m_transform.position.x = context.width / 2;
          //obj.m_transform.position.y = context.height * 0.25;
          this.m_root.addChildGameObject(obj);
        }
        else
          throw new Error("Only GameObject's are supported in Prefabs right now");
      }
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
}

Game.shaderProgram = null;
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
            return `<div class='error'><img src='/images/html5_white.png' width='128' height='128' /><h1>Exception '%{e}'</h1><h2>This page requires support for HTML5 Canvas and WebGL</h2></div>`;
        }
        return null;
    }
}
