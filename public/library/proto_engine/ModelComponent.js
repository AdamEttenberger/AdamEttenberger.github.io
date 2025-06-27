ModelComponent.prototype = new GameObjectComponent();
ModelComponent.prototype.constructor = ModelComponent;
ModelComponent.Shader = null;
ModelComponent.UniformType = {
  alpha: 0,
  mMatrix: 1,
  vMatrix: 2,
  pMatrix: 3,
};

function ModelComponent() {
  this.buffers = null;

  // Initialize Default Vertex and Fragment shaders.
  if (gl && !ModelComponent.Shader) {
    ModelComponent.Shader = new ShaderProgram( );
    Promise.all([
      ModelComponent.Shader.attachShader( "/library/proto_engine/shaders/color-vs.c", gl.VERTEX_SHADER ),
      ModelComponent.Shader.attachShader( "/library/proto_engine/shaders/color-fs.c", gl.FRAGMENT_SHADER ),
    ])
    .then(() => {
      ModelComponent.Shader.linkProgram( );
      ModelComponent.Shader.apply( );

      ModelComponent.Shader.registerVertexAttributes(new Map([
        [Buffer.POSITION, "aVertexPosition"],
        [Buffer.COLOR, "aVertexColor"],
      ]));
      ModelComponent.Shader.registerUniformLocations(new Map([
          [ModelComponent.UniformType.alpha, "uAlpha"],
          [ModelComponent.UniformType.mMatrix, "mMatrix"],
          [ModelComponent.UniformType.vMatrix, "vMatrix"],
          [ModelComponent.UniformType.pMatrix, "pMatrix"],
      ]));

      ModelComponent.Shader.setUniform1f(ModelComponent.UniformType.alpha, 1.0);
    })
    .catch( e => Game.ExceptionHandler(e) );
  }

  this.setBuffers = function(buffers) {
    this.buffers = buffers;
    return this;
  }

  this.draw = function(gl) {
    if (!this.buffers ||
        !ModelComponent.Shader?.apply()) {
      return;
    }

    var numItems = 0;
    this.buffers.forEach(element => {
      ModelComponent.Shader.bindBuffer(element);
      if (element.BufferType === Buffer.INDEX) {
        numItems = element.numItems;
      }
    });

    ModelComponent.Shader.setUniformMat4(ModelComponent.UniformType.mMatrix, Game.mMatrix);
    ModelComponent.Shader.setUniformMat4(ModelComponent.UniformType.vMatrix, Game.vMatrix);
    ModelComponent.Shader.setUniformMat4(ModelComponent.UniformType.pMatrix, Game.pMatrix);

    gl.drawElements(gl.TRIANGLES, numItems, gl.UNSIGNED_BYTE, 0);

    this.buffers.forEach(element => ModelComponent.Shader.unbindBuffer(element));
  }

  this.serialize = async function() {
    return {
      "type": "ModelComponent",
      "buffers": await Promise.all(this.buffers.map(element => element.serialize())),
    };
  }

  this.deserialize = function(jsonObject) {
    if (jsonObject.type !== "ModelComponent") {
      return;
    }

    return new Promise((resolve, reject) => {
      if (!jsonObject.buffers) {
        reject();
      }
      this.setBuffers(jsonObject.buffers.map(element => new Buffer(gl, element.buffer_type, element.gl_array_type, element.buff, element.item_size)));
      resolve(this);
    });
  }
}
