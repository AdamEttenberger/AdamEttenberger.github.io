function Buffer( gl, bufferType, GL_ARRAY_TYPE, arr, itemSize ) {
  var type = GL_ARRAY_TYPE;
  this.BufferType = bufferType;
  this.buff = gl.createBuffer();
  this.itemSize = itemSize;
  this.numItems = arr.length / itemSize;

  if ( type == gl.ARRAY_BUFFER ) {
    gl.bindBuffer( type, this.buff );
    gl.bufferData( type, new Float32Array(arr), gl.STATIC_DRAW );
  } else if ( type == gl.ELEMENT_ARRAY_BUFFER ) {
    gl.bindBuffer( type, this.buff );
    gl.bufferData( type, new Uint16Array(arr), gl.STATIC_DRAW );
  } else {
    throw new Error("Must supply ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER as GL_ARRAY_TYPE");
  }

  this.bindBuffer = function() {
    gl.bindBuffer( type, this.buff );
  }

  this.unbindBuffer = function() {
    gl.bindBuffer( type, null );
  }

  this.getBufferData = function() {
    var result = null;
    if (type == gl.ARRAY_BUFFER) {
      result = new Float32Array(this.numItems * this.itemSize);
    } else if (type == gl.ELEMENT_ARRAY_BUFFER) {
      result = new Uint16Array(this.numItems * this.itemSize);
    } else {
      throw new Error("Must supply ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER as GL_ARRAY_TYPE");
    }

    this.bindBuffer();
    gl.getBufferSubData(type, 0, result);
    this.unbindBuffer();
    return result;
  }

  this.serialize = function() {
    return {
      "gl_array_type": type,
      "buffer_type": this.BufferType,
      "buff": Array.from(this.getBufferData()),
      "item_size": this.itemSize,
    };
  }
}

Buffer.INDEX    = 0;
Buffer.POSITION = 1;
Buffer.COLOR    = 2;
Buffer.TEXTURE  = 4;
Buffer.NORMAL   = 8;
