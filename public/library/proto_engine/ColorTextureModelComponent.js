ColorTextureModelComponent.prototype = new GameObjectComponent();
ColorTextureModelComponent.prototype.constructor = ColorTextureModelComponent;
ColorTextureModelComponent.UniformType = {
  alpha: 0,
  sampler: 1,
  mMatrix: 2,
  vMatrix: 3,
  pMatrix: 4,
};
ColorTextureModelComponent.Shader = null;

function ColorTextureModelComponent() {
  this.texture = null;
  this.buffers = null;

  // Initialize Default Vertex and Fragment shaders.
  if (gl && !ColorTextureModelComponent.Shader) {
    ColorTextureModelComponent.Shader = new ShaderProgram( );
    Promise.all([
      ColorTextureModelComponent.Shader.attachShader( "/library/proto_engine/shaders/color-texture-vs.c", gl.VERTEX_SHADER ),
      ColorTextureModelComponent.Shader.attachShader( "/library/proto_engine/shaders/color-texture-fs.c", gl.FRAGMENT_SHADER ),
    ])
    .then(() => {
      ColorTextureModelComponent.Shader.linkProgram( );
      if ( !ColorTextureModelComponent.Shader.apply() ) {
        throw "GL_SHADER_ERROR";
      }

      ColorTextureModelComponent.Shader.registerVertexAttributes(new Map([
        [Buffer.POSITION, "aVertexPosition"],
        [Buffer.COLOR, "aVertexColor"],
        [Buffer.TEXTURE, "aTextureCoord"],
      ]));
      ColorTextureModelComponent.Shader.registerUniformLocations(new Map([
          [ColorTextureModelComponent.UniformType.alpha, "uAlpha"],
          [ColorTextureModelComponent.UniformType.sampler, "uSampler"],
          [ColorTextureModelComponent.UniformType.mMatrix, "mMatrix"],
          [ColorTextureModelComponent.UniformType.vMatrix, "vMatrix"],
          [ColorTextureModelComponent.UniformType.pMatrix, "pMatrix"],
      ]));

      ColorTextureModelComponent.Shader.setUniform1f(ColorTextureModelComponent.UniformType.alpha, 1.0);
    })
    .catch(e => g_game.onException(e));
  }

  this.setTexture = function(texture) {
    this.texture = texture;
    return this;
  }

  this.setBuffers = function(buffers) {
    this.buffers = buffers;
    return this;
  }

  this.draw = function(gl)
  {
    if (!(this.texture?.loaded) ||
        !this.buffers ||
        !ColorTextureModelComponent.Shader?.apply()) {
      return;
    }

    var numItems = 0;
    this.buffers.forEach(element => {
      ColorTextureModelComponent.Shader.bindBuffer(element)
      if (element.BufferType === Buffer.INDEX) {
        numItems = element.numItems;
      }
    });

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    ColorTextureModelComponent.Shader.setUniformMat4(ColorTextureModelComponent.UniformType.mMatrix, g_game.mMatrix);
    ColorTextureModelComponent.Shader.setUniformMat4(ColorTextureModelComponent.UniformType.vMatrix, g_game.vMatrix);
    ColorTextureModelComponent.Shader.setUniformMat4(ColorTextureModelComponent.UniformType.pMatrix, g_game.pMatrix);

    gl.drawElements(gl.TRIANGLES, numItems, gl.UNSIGNED_BYTE, 0);

    this.buffers.forEach(element => ColorTextureModelComponent.Shader.unbindBuffer(element));
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  this.serialize = async function() {
    return {
      "type": "ColorTextureModelComponent",
      "texture": await Game.serializeTexture(this.texture),
      "buffers": await Promise.all(this.buffers.map(element => element.serialize())),
    };
  }

  this.deserialize = function(jsonObject) {
    if (jsonObject.type !== "ColorTextureModelComponent") {
      return;
    }

    return new Promise((resolve, reject) => {
      if (!jsonObject.texture || !jsonObject.buffers) {
        reject();
      }
      this.setBuffers(jsonObject.buffers.map(element => new Buffer(gl, element.buffer_type, element.gl_array_type, element.buff, element.item_size)));
      this.setTexture(g_game.loadTexture(jsonObject.texture));
      resolve(this);
    });
  }
}
