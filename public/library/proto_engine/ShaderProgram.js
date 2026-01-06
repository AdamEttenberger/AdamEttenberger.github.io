function ShaderProgram() {
  var _program = gl.createProgram();
  var _loaded = false;
  var _vertex_attributes = new Map([]);
  var _uniform_locations = new Map([]);

  /**
   * @param {[BufferType,name]} type_name_mapping
   */
  this.registerVertexAttributes = function(type_name_mapping) {
    _vertex_attributes = new Map(type_name_mapping.entries().map(pair => [pair[0], gl.getAttribLocation(_program, pair[1])]));
  }

  /**
   * @param {[UniformType,name]} type_name_mapping
   */
  this.registerUniformLocations = function(type_name_mapping) {
    _uniform_locations = new Map(type_name_mapping.entries().map(pair => [pair[0], gl.getUniformLocation(_program, pair[1])]));
  }

  this.getUniformLocation = function(key) {
    return _uniform_locations.get(key);
  }

  this.setUniform1f = function(key, value) {
    gl.uniform1f(this.getUniformLocation(key), value);
  }
  this.setUniform2f = function(key, value1, value2) {
    gl.uniform2f(this.getUniformLocation(key), value1, value2);
  }
  this.setUniform3f = function(key, value1, value2, value3) {
    gl.uniform3f(this.getUniformLocation(key), value1, value2, value3);
  }
  this.setUniform4f = function(key, value1, value2, value3, value4) {
    gl.uniform4f(this.getUniformLocation(key), value1, value2, value3, value4);
  }
  this.setUniformMat4 = function(key, value) {
    gl.uniformMatrix4fv(this.getUniformLocation(key), false, value);
  }

  this.bindBuffer = function(buffer) {
    buffer.bindBuffer();
    var attribute = _vertex_attributes.get(buffer.BufferType);
    if (attribute !== undefined) {
      gl.enableVertexAttribArray(attribute);
      gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
    }
  }
  this.bindBuffers = (bufferArray) => bufferArray.forEach(element => this.bindBuffer(element));

  this.unbindBuffer = function(buffer) {
    var attribute = _vertex_attributes.get(buffer.BufferType);
    if (attribute !== undefined) {
      gl.disableVertexAttribArray(attribute);
    }
    buffer.unbindBuffer();
  }
  this.unbindBuffers = (bufferArray) => bufferArray.forEach(element => this.unbindBuffer(element));

  this.attachShader = function(filename, shaderType)
  {
    return LoadFileAsync('GET', filename)
    .then(xhr => {
      var contents = xhr.responseText;
      var shader = gl.createShader(shaderType);
      gl.shaderSource(shader, contents);
      gl.compileShader(shader);
      if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) )
      {
        console.log(gl.getShaderInfoLog(shader));
        throw "GL_SHADER_ERROR";
      }
      gl.attachShader(_program, shader);
    })
    .catch(e => g_game.onException(e));
  }

  this.linkProgram = function( )
  {
    gl.linkProgram(_program);

    if (!gl.getProgramParameter(_program, gl.LINK_STATUS))
    {
      console.log("Could not initialise shaders");
      throw "GL_SHADER_PROGRAM_ERROR";
    }

    _loaded = true;
  }

  this.apply = function()
  {
    if (!_loaded) {
      return false;
    }
    gl.useProgram(_program);
    return true;
  }

  this.isLoaded = function() {
    return _loaded;
  }
}
