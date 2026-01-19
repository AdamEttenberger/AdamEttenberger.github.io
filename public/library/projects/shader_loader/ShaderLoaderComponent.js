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
    this.shader.setUniformMat4(ShaderLoaderComponent.UniformType.mMatrix, g_game.mMatrix);
    this.shader.setUniformMat4(ShaderLoaderComponent.UniformType.vMatrix, g_game.vMatrix);
    this.shader.setUniformMat4(ShaderLoaderComponent.UniformType.pMatrix, g_game.pMatrix);

    // Fragment Uniforms
    this.shader.setUniform3f(ShaderLoaderComponent.UniformType.resolution, g_game.canvas_width, g_game.canvas_height, g_game.aspect);
    this.shader.setUniform1f(ShaderLoaderComponent.UniformType.time, (Date.now() - startTime) / 1000.0);

    gl.drawElements(gl.TRIANGLES, numItems, gl.UNSIGNED_BYTE, 0);

    ShaderLoaderComponent.buffers.forEach(element => this.shader.unbindBuffer(element));
  }

  /**
   *
   * @param {Object} sources Object containing any keys to override ['vert', 'frag'] with Object containing a string with either key ['file', 'source']. 'file' streams the source from a URL, 'source' compiles the string as-is.
   */
  this.loadShaderProgram = async function(sources, additional_uniform_key_entries) {
    this.shader = new ShaderProgram();
    for (const [shader_type, args] of sources) {
      if (args.file) {
        await this.shader.attachShader(args.file, shader_type);
      } else if (args.source) {
        await this.shader.attachShaderSource(args.source, shader_type);
      }
    }
    this.shader.linkProgram();
    this.shader.apply();
    this.shader.registerVertexAttributes(new Map([
      [Buffer.POSITION, "aVertexPosition"],
      [Buffer.TEXTURE, "aTextureCoord"],
    ]));
    additional_uniform_key_entries = additional_uniform_key_entries ?? new Map();
    this.shader.registerUniformLocations(new Map([
      // Vertex Uniforms
      [ShaderLoaderComponent.UniformType.mMatrix, "mMatrix"],
      [ShaderLoaderComponent.UniformType.vMatrix, "vMatrix"],
      [ShaderLoaderComponent.UniformType.pMatrix, "pMatrix"],
      // Fragment Uniforms
      [ShaderLoaderComponent.UniformType.resolution, "uResolution"],
      [ShaderLoaderComponent.UniformType.time, "uTime"],

      ...additional_uniform_key_entries,
    ]));
  }

  this.bulkUpdateUniforms = function(updates) {
    for (const [key, uniform] of updates) {
      switch (uniform.type) {
        case 'float': this.shader.setUniform1f(key, uniform.value); break;
        case 'vec2': this.shader.setUniform2f(key, uniform.value[0], uniform.value[1]); break;
        case 'vec3': this.shader.setUniform3f(key, uniform.value[0], uniform.value[1], uniform.value[2]); break;
        case 'vec4': this.shader.setUniform4f(key, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3]); break;

        case 'bool':
        case 'int': this.shader.setUniform1i(key, uniform.value); break;
        case 'bvec2':
        case 'ivec2': this.shader.setUniform2i(key, uniform.value[0], uniform.value[1]); break;
        case 'bvec3':
        case 'ivec3': this.shader.setUniform3i(key, uniform.value[0], uniform.value[1], uniform.value[2]); break;
        case 'bvec4':
        case 'ivec4': this.shader.setUniform4i(key, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3]); break;

        case 'uint': this.shader.setUniform1u(key, uniform.value); break;
        case 'uvec2': this.shader.setUniform2u(key, uniform.value[0], uniform.value[1]); break;
        case 'uvec3': this.shader.setUniform3u(key, uniform.value[0], uniform.value[1], uniform.value[2]); break;
        case 'uvec4': this.shader.setUniform4u(key, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3]); break;

        case 'mat4': this.shader.setUniformMat4(key, uniform.value); break;
      }
    }
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
