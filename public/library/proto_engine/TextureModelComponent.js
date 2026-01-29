TextureModelComponent.prototype = new GameObjectComponent();
TextureModelComponent.prototype.constructor = TextureModelComponent;
TextureModelComponent.UniformType = {
  alpha: 0,
  sampler: 1,
  mMatrix: 2,
  vMatrix: 3,
  pMatrix: 4,
};
TextureModelComponent.Shader = null;

function TextureModelComponent() {
  this.texture = null;
  this.buffers = null;

  // Initialize Default Vertex and Fragment shaders.
  if (gl && !TextureModelComponent.Shader)
  {
    TextureModelComponent.Shader = new ShaderProgram( );
    Promise.all([
      TextureModelComponent.Shader.attachShader( "/library/proto_engine/shaders/texture-vs.c", gl.VERTEX_SHADER ),
      TextureModelComponent.Shader.attachShader( "/library/proto_engine/shaders/texture-fs.c", gl.FRAGMENT_SHADER ),
    ])
    .then(() => {
      TextureModelComponent.Shader.linkProgram( );
      TextureModelComponent.Shader.apply( );

      TextureModelComponent.Shader.registerVertexAttributes(new Map([
        [Buffer.POSITION, "aVertexPosition"],
        [Buffer.TEXTURE, "aTextureCoord"],
      ]));
      TextureModelComponent.Shader.registerUniformLocations(new Map([
          [TextureModelComponent.UniformType.alpha, "uAlpha"],
          [TextureModelComponent.UniformType.sampler, "uSampler"],
          [TextureModelComponent.UniformType.mMatrix, "mMatrix"],
          [TextureModelComponent.UniformType.vMatrix, "vMatrix"],
          [TextureModelComponent.UniformType.pMatrix, "pMatrix"],
      ]));
      TextureModelComponent.Shader.setUniform1f(TextureModelComponent.UniformType.alpha, 1.0);
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
    if (!this.texture?.loaded ||
        !this.buffers ||
        !TextureModelComponent.Shader?.apply()) {
      return;
    }

    var numItems = 0;
    this.buffers.forEach(element => {
      TextureModelComponent.Shader.bindBuffer(element);
      if (element.BufferType === Buffer.INDEX) {
        numItems = element.numItems;
      }
    });

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    TextureModelComponent.Shader.setUniformMat4(TextureModelComponent.UniformType.mMatrix, g_game.mMatrix);
    TextureModelComponent.Shader.setUniformMat4(TextureModelComponent.UniformType.vMatrix, g_game.vMatrix);
    TextureModelComponent.Shader.setUniformMat4(TextureModelComponent.UniformType.pMatrix, g_game.pMatrix);

    gl.drawElements(gl.TRIANGLES, numItems, gl.UNSIGNED_BYTE, 0);

    this.buffers.forEach(element => TextureModelComponent.Shader.unbindBuffer(element));
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  this.serialize = async function() {
    return {
      "type": "TextureModelComponent",
      "texture": await Game.serializeTexture(this.texture),
      "buffers": await Promise.all(this.buffers.map(element => element.serialize())),
    };
  }

  this.deserialize = function(jsonObject) {
    if (jsonObject.type !== "TextureModelComponent") {
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
