window.addEventListener("load", main, true);
window.addEventListener("message", handleMessage);

var game;

function main()
{
  var canvas = document.querySelector("canvas");
  canvas.style.minWidth = 800;
  canvas.style.minHeight = 500;

  game = new Game(canvas);

  gl.disable(gl.BLEND);
  gl.enable(gl.DEPTH_TEST);
  Game.clearColor = vec4.fromValues( 0.0, 0.0, 0.0, 1.0 );

  // Setup the camera.
  mat4.perspective(Game.pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 1.0, 1000.0);
  mat4.fromTranslation(Game.mMatrix, vec3.fromValues(0.0, 0.0, -5.0));

  game.start();
}

function handleMessage( event ) {
  if (event.origin !== window.location.origin) {
    return;
  }

  if (event.data.file) {
    LoadFileAsync('GET', event.data.file)
          .then(xhr => game.deserialize(JSON.parse(xhr.responseText)))
          .catch(e => Game.ExceptionHandler(e))
  }
}