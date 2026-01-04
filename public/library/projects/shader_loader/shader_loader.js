window.addEventListener("load", main, true);
window.addEventListener("message", handleMessage);

var game;
var shader_loader_component;

function main()
{
  var canvas = document.querySelector("canvas");

  canvas.style.minWidth = 800;
  canvas.style.minHeight = 600;

  try {
    game = new Game(canvas);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
  }
  catch(e)
  {
    document.querySelector("canvas.game").html(Game.ExceptionToMessage(e));
    return;
  }

  initScene();

  var scale = 1.0;
  mat4.ortho(Game.pMatrix, -1.0, 1.0, -1.0, 1.0, 0.1, 1000.0);
  mat4.fromRotationTranslationScale(Game.vMatrix,
    quat.create(),
    vec3.fromValues(0.0, 0.0, -1.0),
    vec3.fromValues(scale, scale, scale)
  );

  game.start();
}

function initScene()
{
  var loader = new GameObject();
  shader_loader_component = new ShaderLoaderComponent();
  loader.addComponent( shader_loader_component );

  game.m_root.addChildGameObject( loader );
}

function handleMessage( event ) {
  if (event.origin !== window.location.origin ||
      !event.data) {
    return;
  }

  shader_loader_component.handleMessage( event.data );
}