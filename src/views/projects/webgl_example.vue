<script setup>
import Code from '@/components/code.vue'
import Column from '@/components/column.vue'
import Details from '@/components/details.vue'
import ExternalLink from '@/components/external_link.vue'
import Figure from '@/components/figure.vue'
import Math from '@/components/math.vue'
import Player from '@/components/player.vue'
import Section from '@/components/section.vue'
const props = defineProps({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  lastmod: { type: Date },
  frame: { type: String, required: true },
})

function onPlayerLoaded(target_frame, filepath) {
  postMessageToFrame(target_frame, filepath);
}

function postMessageToFrame(target_frame, filepath) {
  target_frame.contentWindow.postMessage({
    file: filepath,
  }, window.location.origin);
}
</script>

<template>
  <Player :title="title"
          :date="date"
          :lastmod="lastmod"
          :frame="frame"
          :paused="false" />
  <Column>
    <Section heading="What's this?">
      <p>
        This project is a simple proof-of-concept component based game engine, heavily inspired by Unity's component based <ExternalLink to="https://docs.unity3d.com/ScriptReference/GameObject.html">GameObject</ExternalLink> + <ExternalLink to="https://docs.unity3d.com/ScriptReference/MonoBehaviour.html">MonoBehavior</ExternalLink> model.
        This is the foundation for the WebGL Flocking and Metaballs projects which are projects I worked on while at college.
        The flocking demo was originally a ShockWave Flash application, and the Metaballs project was originally a Windows based C++ OpenGL application.
      </p>
      <br />
      <p>
        <ExternalLink to="https://en.wikipedia.org/wiki/Adobe_Flash">Adobe Flash</ExternalLink> was a powerful animation and media tool, and popular choice for browser games.
        However <ExternalLink to="https://en.wikipedia.org/wiki/WebGL">WebGL</ExternalLink>, a new experimental technology became available around the same time Flash's end-of-life discussions began.
        This project was driven by both a desire to learn a new technology and to get ahead of the deprecation of Flash.
        At this point in time I had some experience working with the native C++ OpenGL API on Windows, but browser support for WebGL was still in its infancy.
      </p>
    </Section>

    <Section heading="Goals">
      <ul>
        <li>Implement a basic 3D scene without importing a game engine or rendering framework.</li>
        <li>Interchangeable model rendering types (color, texture, color + texture).</li>
        <li>Easy to quickly prototype new behaviors.</li>
      </ul>
    </Section>

    <Section heading="Overview">
      <p>
        This program was designed to be a simple and minimal prototyping environment, and a quick way to migrate my Flocking demo away from a dying web technology. It consists of a few key objects:
      </p>
      <br />
      <ul class="list-none">
        <li>
          <Details summary="Game">
            <p>The core of the application which handles the main loop, resource loading, and owns the scene tree composed of GameObjects and their GameObjectComponents.</p>
          </Details>
        </li>
        <li>
          <Details summary="GameObject">
            <p>The main high-level primitive in the engine, a node within a tree of GameObject instances which may have a single parent and many children, a collection of GameObjectComponent instances and helpful methods.</p>
          </Details>
        </li>
        <li>
          <Details summary="GameObjectComponent">
            <p>Any atomic bundle of data which may be attached to a GameObject.</p>
          </Details>
        </li>
      </ul>
      <br />

      <p>
        This demo utilizes the following set of components:
      </p>
      <br />
      <ul class="list-none">
        <li>
          <Details summary="Transform">
            <p>Owns the local transformation matrix, and intermediary values to provide a GameObject with local position, rotation, and scale information.</p>
          </Details>
        </li>
        <li>
          <Details summary="RotateComponent">
            <p>Owns a relative angular velocity as a Quaternion which is applied to a GameObject Transform each frame.</p>
          </Details>
        </li>
        <li>
          <Details summary="ModelComponent">
            <p>Owns a VertexBuffer, IndexBuffer, ShaderProgram, and logic for rendering vertices with position and color data.</p>
          </Details>
        </li>
        <li>
          <Details summary="TextureModelComponent">
            <p>Owns a VertexBuffer, IndexBuffer, Texture, ShaderProgram, and logic for rendering vertices with position and texture data.</p>
          </Details>
        </li>
        <li>
          <Details summary="ColorTextureModelComponent">
            <p>Owns a VertexBuffer, IndexBuffer, Texture, ShaderProgram, and logic for rendering vertices with position, color, and texture data.</p>
          </Details>
        </li>
      </ul>
      <br />
      <Figure src="/images/projects/webgl_example/architecture.png"
              alt="UML-like class relationship diagram." />
      <Figure src="/images/projects/webgl_example/scene.png"
              alt="Scene hierarchy, the Game has 2 children, a triangular prism model and invisible pivot. The invisible pivot has 3 children, the colored, skinned, and colored + skinned cube models. All GameObject instances have a Transform and RotateComponent." />
    </Section>

    <Section heading="WebGL Tutorial?">
      <p>
        This isn't a WebGL tutorial, instead for a deeper dive I encourage checking out the excellent MDN <ExternalLink to="https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API">WebGL API documentation</ExternalLink> and <ExternalLink to="https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial">WebGL tutorial</ExternalLink> for modern best practices.
        Also check out <ExternalLink to="https://learnopengl.com/">https://learnopengl.com/</ExternalLink> which is a great primer for OpenGL and rendering concepts.
        Keep in mind that this project is fairly old and was quickly thrown together.
        Something to consider if you're starting a new WebGL project is <ExternalLink to="https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext">HTMLCanvasElement.getContext</ExternalLink> now supports more modern advanced OpenGL APIs like "webgl2" and "webgpu".
        This project originally targeted "webgl" and "experimental-webgl" APIs.
      </p>
    </Section>

    <Section heading="Building a Scene">
      <p>
        First the Game object is initialized:
      </p>
      <br />
      <Code lang="javascript"
            caption="Creates a new `Game` object."
            text="
        var canvas = document.querySelector('canvas');
        game = new Game(canvas);
      " />
      <br />
      <p>
        Then Model data is loaded:
      </p>
      <br />
      <Code lang="javascript"
            caption="Load vertex and index buffers for a cube into WebGL."
            text="
        var cubeVertexPositionData = [ ... ];
        var cubeVertexColorData = [ ... ];
        var cubeVertexIndices = [ ... ];

        var colorCubeBuffers = [
          new Buffer( gl, Buffer.POSITION, gl.ARRAY_BUFFER, cubeVertexPositionData, 3 ),
          new Buffer( gl, Buffer.COLOR, gl.ARRAY_BUFFER, cubeVertexColorData, 4 ),
          new Buffer( gl, Buffer.INDEX, gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndices, 1 )
        ];
      " />
      <br />
      <p>
        Then the scene is populated:
      </p>
      <br />
      <Code lang="javascript"
            caption="Creates a new parent and child GameObject then adds the parent to the scene root."
            text="
        var cube = new GameObject();
        cube.addComponent( new ModelComponent().setBuffers( colorCubeBuffers ) );
        cube.addComponent( new RotateComponent().fromEuler(0.05, 0, 0) );

        var container_node = new GameObject();
        container_node.addChildGameObject( cube );

        game.m_root.addChildGameObject( container_node );
      " />
      <br />
      <p>
        Then any globals like the camera position are set, which will later be provided as shader uniform values.
        Finally, the core game loop is started and following this point game updates should mostly be driven by GameObjectComponent logic.
      </p>
      <br />
      <Code lang="javascript"
            caption="Setup the camera and begin the core game loop."
            text="
        mat4.perspective(Game.pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 1.0, 1000.0);
        mat4.fromTranslation(Game.mMatrix, vec3.fromValues(0.0, 0.0, -5.0));
        game.start();
      " />
    </Section>

    <Section heading="Component Examples">
      <p>
        All components implement the same interface, GameObjectComponent, which contains an update and draw method which are called by the Game instance.
      </p>
      <br />
      <Code lang="javascript" file="/library/webgl/GameObjectComponent.js" />
      <br />
      <Code lang="javascript" file="/library/webgl/RotateComponent.js" />
      <br />
      <Code lang="javascript" file="/library/webgl/ColorTextureModelComponent.js" />
    </Section>

    <Section heading="Serialization/Deserialization">
      <p>
        The following demo frame loads the minimum environment necessary to run the Proto-Engine, then waits until the host page provides a JSON file to present.
        This scene was created by serializing two demos, the one at the top of this page and the one at the top of the <RouterLink to="/projects/webgl_flocking">WebGL Flocking</RouterLink> project page.
        I took the export fromm this page and copied the giant aquarium box from the flocking demo into it.
      </p>
      <br />
      <Code lang="javascript" file="/library/projects/webgl/deserialization_demo.js" />
      <br />
      <p>
        The JSON scene file for this demo can be found here:
        <ExternalLink to="/library/webgl/scenes/deserialization_example.json">deserialization_example.json</ExternalLink>
      </p>
      <br />
      <Player title="JSON Deserialization"
              :date="new Date('2025/06/25')"
              :lastmod="new Date('2025/06/25')"
              frame="/library/projects/webgl/project_loader.html"
              @load="(e) => onPlayerLoaded(e, '/library/webgl/scenes/deserialization_example.json')" />
      <br />
      <p>
        While JSON isn't the most space efficient file format for this type of content, it is very flexible for prototyping and very easy to work with in JavaScript.
      </p>
      <br />
      <Code lang="javascript"
            caption="High-level deserialization logic."
            text="
        Game.deserializeGameObject = async function(jsonGameObject) {
          var obj = new GameObject();
          await Promise.all([
            Promise.all(jsonGameObject.components?.map(Game.deserializeComponent)).then(new_components => {
              new_components.forEach(component => obj.addComponent(component));
            }),
            Promise.all(jsonGameObject.children?.map(Game.deserializeGameObject)).then(new_children => {
              new_children.forEach(child => obj.addChildGameObject(child));
            }),
          ]);
          return obj;
        }

        Game.deserializeComponent = function(jsonComponent) {
          return new Promise(async (resolve, reject) => {
            var TComponent = Game.ComponentTypes.get(jsonComponent.type);
            return TComponent
                ? resolve(await new TComponent().deserialize(jsonComponent))
                : reject();
          });
        }
      " />
      <br />
      <p>
        Serialization and deserialization are handled asynchronously, JavaScript Promises make it easy to schedule parallel and order dependent tasks together.
        For instance, the initial implementation bundles texture and model data into the JSON file, making it possible to deploy an entire scene in a game through a single self-contained file.
        Because of this detail, if resources aren't ready in time for serialization it fails.
        However, with Promises it was simple to add a bit of logic that waited asynchronously for the resources to be ready before continuing with a particular component while not blocking other serialization tasks.
      </p>
      <br />
      <Code lang="javascript"
            caption="Texture serialization waits seamlessly until the texture is ready."
            text="
        // Game.js
        Game.serializeTexture = async function(texture) {
          await texture.loader;
          const canvas = document.createElement('canvas');
          canvas.width = texture.image.width;
          canvas.height = texture.image.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(texture.image, 0, 0);
          return canvas.toDataURL('image/png', 1.0);
        }

        // TextureModelComponent.js
        this.serialize = async function() {
          return {
            'type': 'TextureModelComponent',
            'texture': await Game.serializeTexture(this.texture),
            'buffers': await Promise.all(this.buffers.map(element => element.serialize())),
          };
        }
      " />
    </Section>
  </Column>
</template>
