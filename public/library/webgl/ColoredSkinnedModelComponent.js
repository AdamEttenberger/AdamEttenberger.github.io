ColoredSkinnedModelComponent.prototype = new GameObjectComponent();
ColoredSkinnedModelComponent.prototype.constructor = ColoredSkinnedModelComponent;
ColoredSkinnedModelComponent.UniformType = {
  alpha: 0,
  sampler: 1,
  mMatrix: 2,
  vMatrix: 3,
  pMatrix: 4,
};
ColoredSkinnedModelComponent.Shader = null;

function ColoredSkinnedModelComponent() {
  this.texture = null;
  this.buffers = null;

  // Initialize Default Vertex and Fragment shaders.
  if (gl && !ColoredSkinnedModelComponent.Shader) {
    ColoredSkinnedModelComponent.Shader = new ShaderProgram( );
    Promise.all([
      ColoredSkinnedModelComponent.Shader.attachShader( "/library/webgl/shaders/color-texture-vs.c", gl.VERTEX_SHADER ),
      ColoredSkinnedModelComponent.Shader.attachShader( "/library/webgl/shaders/color-texture-fs.c", gl.FRAGMENT_SHADER ),
    ])
    .then(() => {
      ColoredSkinnedModelComponent.Shader.linkProgram( );
      if ( !ColoredSkinnedModelComponent.Shader.apply() ) {
        throw "GL_SHADER_ERROR";
      }

      ColoredSkinnedModelComponent.Shader.registerVertexAttributes(new Map([
        [Buffer.POSITION, "aVertexPosition"],
        [Buffer.COLOR, "aVertexColor"],
        [Buffer.TEXTURE, "aTextureCoord"],
      ]));
      ColoredSkinnedModelComponent.Shader.registerUniformLocations(new Map([
          [ColoredSkinnedModelComponent.UniformType.alpha, "uAlpha"],
          [ColoredSkinnedModelComponent.UniformType.sampler, "uSampler"],
          [ColoredSkinnedModelComponent.UniformType.mMatrix, "mMatrix"],
          [ColoredSkinnedModelComponent.UniformType.vMatrix, "vMatrix"],
          [ColoredSkinnedModelComponent.UniformType.pMatrix, "pMatrix"],
      ]));

      ColoredSkinnedModelComponent.Shader.setUniform1f(ColoredSkinnedModelComponent.UniformType.alpha, 1.0);
    })
    .catch( e => Game.ExceptionHandler(e) );
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
    if (!(this.texture && this.texture.loaded) ||
        !this.buffers ||
        !ColoredSkinnedModelComponent.Shader?.apply()) {
      return;
    }

    var numItems = 0;
    this.buffers.forEach(element => {
      ColoredSkinnedModelComponent.Shader.bindBuffer(element)
      if (element.BufferType === Buffer.INDEX) {
        numItems = element.numItems;
      }
    });

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    ColoredSkinnedModelComponent.Shader.setUniformMat4(ColoredSkinnedModelComponent.UniformType.mMatrix, Game.mMatrix);
    ColoredSkinnedModelComponent.Shader.setUniformMat4(ColoredSkinnedModelComponent.UniformType.vMatrix, Game.vMatrix);
    ColoredSkinnedModelComponent.Shader.setUniformMat4(ColoredSkinnedModelComponent.UniformType.pMatrix, Game.pMatrix);

    gl.drawElements(gl.TRIANGLES, numItems, gl.UNSIGNED_BYTE, 0);

    this.buffers.forEach(element => ColoredSkinnedModelComponent.Shader.unbindBuffer(element));
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}
