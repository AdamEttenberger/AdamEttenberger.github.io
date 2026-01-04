window.addEventListener("load", main, true);
window.addEventListener("message", handleMessage);

var game;

function main()
{
  var canvas = document.querySelector("canvas");
  canvas.style.minWidth = 800;
  canvas.style.minHeight = 500;

  game = new Game(canvas);
  Game.clearColor = vec4.fromValues( 0.0, 0.0, 0.0, 1.0 );

  // Setup the camera (move the world forward 5 units).
  mat4.perspective(Game.pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 1.0, 1000.0);
  mat4.fromTranslation(Game.vMatrix, vec3.fromValues(0.0, 0.0, -5.0));
}

function handleMessage( event ) {
    if (event.origin !== window.location.origin ||
        !event.data.file) {
      return;
    }
    LoadFileAsync('GET', event.data.file)
        .then(xhr => {
          game.deserialize(JSON.parse(xhr.responseText));
          game.start();
        })
        .catch(e => Game.ExceptionHandler(e));
}