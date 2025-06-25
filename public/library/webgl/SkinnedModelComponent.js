SkinnedModelComponent.prototype = new GameObjectComponent();
SkinnedModelComponent.prototype.constructor = SkinnedModelComponent;
SkinnedModelComponent.UniformType = {
  alpha: 0,
  sampler: 1,
  mMatrix: 2,
  vMatrix: 3,
  pMatrix: 4,
};
SkinnedModelComponent.Shader = null;

function SkinnedModelComponent() {
  this.texture = null;
  this.buffers = null;

  // Initialize Default Vertex and Fragment shaders.
  if (gl && !SkinnedModelComponent.Shader)
  {
    SkinnedModelComponent.Shader = new ShaderProgram( );
    Promise.all([
      SkinnedModelComponent.Shader.attachShader( "/library/webgl/shaders/texture-vs.c", gl.VERTEX_SHADER ),
      SkinnedModelComponent.Shader.attachShader( "/library/webgl/shaders/texture-fs.c", gl.FRAGMENT_SHADER ),
    ])
    .then(() => {
      SkinnedModelComponent.Shader.linkProgram( );
      SkinnedModelComponent.Shader.apply( );

      SkinnedModelComponent.Shader.registerVertexAttributes(new Map([
        [Buffer.POSITION, "aVertexPosition"],
        [Buffer.TEXTURE, "aTextureCoord"],
      ]));
      SkinnedModelComponent.Shader.registerUniformLocations(new Map([
          [SkinnedModelComponent.UniformType.alpha, "uAlpha"],
          [SkinnedModelComponent.UniformType.sampler, "uSampler"],
          [SkinnedModelComponent.UniformType.mMatrix, "mMatrix"],
          [SkinnedModelComponent.UniformType.vMatrix, "vMatrix"],
          [SkinnedModelComponent.UniformType.pMatrix, "pMatrix"],
      ]));
      SkinnedModelComponent.Shader.setUniform1f(SkinnedModelComponent.UniformType.alpha, 1.0);
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
        !SkinnedModelComponent.Shader?.apply()) {
      return;
    }

    var numItems = 0;
    this.buffers.forEach(element => {
      SkinnedModelComponent.Shader.bindBuffer(element);
      if (element.BufferType === Buffer.INDEX) {
        numItems = element.numItems;
      }
    });

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    SkinnedModelComponent.Shader.setUniformMat4(SkinnedModelComponent.UniformType.mMatrix, Game.mMatrix);
    SkinnedModelComponent.Shader.setUniformMat4(SkinnedModelComponent.UniformType.vMatrix, Game.vMatrix);
    SkinnedModelComponent.Shader.setUniformMat4(SkinnedModelComponent.UniformType.pMatrix, Game.pMatrix);

    gl.drawElements(gl.TRIANGLES, numItems, gl.UNSIGNED_BYTE, 0);

    this.buffers.forEach(element => SkinnedModelComponent.Shader.unbindBuffer(element));
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}
