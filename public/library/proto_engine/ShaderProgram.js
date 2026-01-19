class ShaderProgram {
  #program = null;
  #loaded = false;
  #vertex_attributes = null;
  #uniform_locations = null;

  constructor() {
    this.#program = gl.createProgram();
    this.#vertex_attributes = new Map([]);
    this.#uniform_locations = new Map([]);
  }

  /**
   * @param {[BufferType,name]} type_name_mapping
   */
  registerVertexAttributes(type_name_mapping) {
    this.#vertex_attributes = new Map(type_name_mapping.entries().map(pair => [pair[0], gl.getAttribLocation(this.#program, pair[1])]));
  }

  /**
   * @param {[UniformType,name]} type_name_mapping
   */
  registerUniformLocations(type_name_mapping) {
    this.#uniform_locations = new Map(type_name_mapping.entries().map(pair => [pair[0], gl.getUniformLocation(this.#program, pair[1])]));
  }

  getUniformLocation(key) {
    return this.#uniform_locations.get(key);
  }

  setUniform1f(key, value) {
    gl.uniform1f(this.getUniformLocation(key), value);
  }
  setUniform2f(key, value1, value2) {
    gl.uniform2f(this.getUniformLocation(key), value1, value2);
  }
  setUniform3f(key, value1, value2, value3) {
    gl.uniform3f(this.getUniformLocation(key), value1, value2, value3);
  }
  setUniform4f(key, value1, value2, value3, value4) {
    gl.uniform4f(this.getUniformLocation(key), value1, value2, value3, value4);
  }

  setUniform1i(key, value) {
    gl.uniform1i(this.getUniformLocation(key), value);
  }
  setUniform2i(key, value1, value2) {
    gl.uniform2i(this.getUniformLocation(key), value1, value2);
  }
  setUniform3i(key, value1, value2, value3) {
    gl.uniform3i(this.getUniformLocation(key), value1, value2, value3);
  }
  setUniform4i(key, value1, value2, value3, value4) {
    gl.uniform4i(this.getUniformLocation(key), value1, value2, value3, value4);
  }

  setUniform1ui(key, value) {
    gl.uniform1ui(this.getUniformLocation(key), value);
  }
  setUniform2ui(key, value1, value2) {
    gl.uniform2ui(this.getUniformLocation(key), value1, value2);
  }
  setUniform3ui(key, value1, value2, value3) {
    gl.uniform3ui(this.getUniformLocation(key), value1, value2, value3);
  }
  setUniform4ui(key, value1, value2, value3, value4) {
    gl.uniform4ui(this.getUniformLocation(key), value1, value2, value3, value4);
  }

  setUniformMat4(key, value) {
    gl.uniformMatrix4fv(this.getUniformLocation(key), false, value);
  }

  bindBuffer(buffer) {
    buffer.bindBuffer();
    var attribute = this.#vertex_attributes.get(buffer.BufferType);
    if (attribute !== undefined) {
      gl.enableVertexAttribArray(attribute);
      gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
    }
  }
  bindBuffers(bufferArray) {
    bufferArray.forEach(element => this.bindBuffer(element));
  }

  unbindBuffer(buffer) {
    var attribute = this.#vertex_attributes.get(buffer.BufferType);
    if (attribute !== undefined) {
      gl.disableVertexAttribArray(attribute);
    }
    buffer.unbindBuffer();
  }
  unbindBuffers(bufferArray) {
    bufferArray.forEach(element => this.unbindBuffer(element));
  }

  attachShaderSource(source_code, shader_type) {
    var shader = gl.createShader(shader_type);
    gl.shaderSource(shader, source_code);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(shader));
      throw "GL_SHADER_ERROR";
    }
    gl.attachShader(this.#program, shader);
  }

  attachShader(filename, shader_type) {
    return LoadFileAsync('GET', filename)
    .then(xhr => this.attachShaderSource(xhr.responseText, shader_type))
    .catch(e => g_game.onException(e));
  }

  linkProgram() {
    gl.linkProgram(this.#program);

    if (!gl.getProgramParameter(this.#program, gl.LINK_STATUS)) {
      console.log(gl.getProgramInfoLog(this.#program));
      throw "GL_SHADER_PROGRAM_ERROR";
    }

    this.#loaded = true;
  }

  apply() {
    if (!this.#loaded) {
      return false;
    }
    gl.useProgram(this.#program);
    return true;
  }
}
