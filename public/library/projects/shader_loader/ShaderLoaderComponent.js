ShaderLoaderComponent.prototype = new GameObjectComponent();
ShaderLoaderComponent.prototype.constructor = ShaderLoaderComponent;

ShaderLoaderComponent.UniformType = {
  // Vertex Uniforms
  mMatrix: 0,
  vMatrix: 1,
  pMatrix: 2,

  // Fragment Uniforms
  resolution: 3, // vec3 {width, height, aspect}
  time: 4,  // float {seconds}
};

function ShaderLoaderComponent( )
{
  var startTime = Date.now();

  this.shader = null;

  this.init = function() {
    if (!ShaderLoaderComponent.buffers) {
      ShaderLoaderComponent.buffers = [
        new Buffer(gl, Buffer.POSITION, gl.ARRAY_BUFFER, [
          [-1.0, -1.0, 0.0],
          [1.0, -1.0, 0.0],
          [1.0, 1.0, 0.0],
          [-1.0, 1.0, 0.0],
        ].flat(), 3),
        new Buffer(gl, Buffer.TEXTURE, gl.ARRAY_BUFFER, [
          [0.0, 0.0],
          [1.0, 0.0],
          [1.0, 1.0],
          [0.0, 1.0],
        ].flat(), 2),
        new Buffer(gl, Buffer.INDEX, gl.ELEMENT_ARRAY_BUFFER, [
          [0, 1, 2],
          [0, 2, 3],
        ].flat(), 1),
      ];
    }
  }

  this.draw = function( gl )
  {
    gl.clearColor( 0.0, 0.0, 0.0, 0.0 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    if (!this.shader?.apply()) {
      return;
    }

    var numItems = 0;
    ShaderLoaderComponent.buffers.forEach(element => {
      this.shader.bindBuffer(element)
      if (element.BufferType === Buffer.INDEX) {
        numItems = element.numItems;
      }
    });

    // Vertex Uniforms
    this.shader.setUniformMat4(ShaderLoaderComponent.UniformType.mMatrix, Game.mMatrix);
    this.shader.setUniformMat4(ShaderLoaderComponent.UniformType.vMatrix, Game.vMatrix);
    this.shader.setUniformMat4(ShaderLoaderComponent.UniformType.pMatrix, Game.pMatrix);

    // Fragment Uniforms
    this.shader.setUniform3f(ShaderLoaderComponent.UniformType.resolution, gl.viewportWidth, gl.viewportHeight, gl.viewportWidth / gl.viewportHeight);
    this.shader.setUniform1f(ShaderLoaderComponent.UniformType.time, (Date.now() - startTime) / 1000.0);

    gl.drawElements(gl.TRIANGLES, numItems, gl.UNSIGNED_BYTE, 0);

    ShaderLoaderComponent.buffers.forEach(element => this.shader.unbindBuffer(element));
  }

  this.loadShaderProgram = function( overrides ) {
    var files = {
      vert: "/library/projects/shader_loader/shaders/default.vert",
      frag: "/library/projects/shader_loader/shaders/default.frag",
    };
    if (overrides) {
      for (var slot in files) {
        if (files[slot] && overrides[slot]) {
          files[slot] = overrides[slot];
        }
      }
    }

    var shader = new ShaderProgram( );
    Promise.all([
      shader.attachShader(files.vert, gl.VERTEX_SHADER),
      shader.attachShader(files.frag, gl.FRAGMENT_SHADER),
    ])
    .then(() => {
      shader.linkProgram();
      shader.apply();
      shader.registerVertexAttributes(new Map([
        [Buffer.POSITION, "aVertexPosition"],
        [Buffer.TEXTURE, "aTextureCoord"],
      ]));
      shader.registerUniformLocations(new Map([
        // Vertex Uniforms
        [ShaderLoaderComponent.UniformType.mMatrix, "mMatrix"],
        [ShaderLoaderComponent.UniformType.vMatrix, "vMatrix"],
        [ShaderLoaderComponent.UniformType.pMatrix, "pMatrix"],
        // Fragment Uniforms
        [ShaderLoaderComponent.UniformType.resolution, "uResolution"],
        [ShaderLoaderComponent.UniformType.time, "uTime"],
      ]));

      this.shader = shader;
    });
  }

  this.handleMessage = function( message ) {
    this.loadShaderProgram( message );
  }

  this.serialize = async function() {
    return {
      "type": "ShaderLoaderComponent",
    };
  }

  this.deserialize = function(jsonObject) {
    if (jsonObject.type !== "ShaderLoaderComponent") {
      return;
    }
    return this;
  }

  this.init();
}
