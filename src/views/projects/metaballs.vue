<script setup lang="ts">
import { ref } from 'vue'
import Code from '@/components/code.vue'
import Column from '@/components/column.vue'
import ExternalLink from '@/components/external_link.vue'
import Figure from '@/components/figure.vue'
import Math from '@/components/math.vue'
import Player from '@/components/player.vue'
import PropertyBuilder, { PropertyNumberRangeBuilder, PropertyComboBoxBuilder } from '@/util/property_editor/property_builder'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import Quote from '@/components/quote.vue'
import Section from '@/components/section.vue'


defineProps({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  lastmod: { type: Date },
  frame: { type: String, required: true },
})

const editorProperties = ref(new PropertyBuilder()
    .addProperty('count', new PropertyNumberRangeBuilder().setLabel('Count').setModel(40).setMin(1).setMax(100).setStep(1))
    .addProperty('radius', new PropertyNumberRangeBuilder().setLabel('Radius').setModel(0.1).setMin(0.01).setMax(0.2).setStep(0.01))
    .addProperty('threshold', new PropertyNumberRangeBuilder().setLabel('Min-Mass').setModel(0.5).setMin(0.01).setMax(0.99).setStep(0.01))
    .addProperty('preset', new PropertyComboBoxBuilder().setLabel('Preset').setModel('default').setValues({
      "default": {
        label: "Default",
        count: 40,
        radius: 0.1,
        threshold: 0.5,
      },
      "extra-gloopy": {
        label: "Extra Gloopy",
        count: 40,
        radius: 0.1,
        threshold: 0.75,
      },
      "explosive-growth": {
        label: "Explosive Growth",
        count: 20,
        radius: 0.2,
        threshold: 0.9,
      },
      "many-mini": {
        label: "Many Mini",
        count: 100,
        radius: 0.05,
        threshold: 0.5,
      },
    }))
    .build());

function onPlayerLoaded(target_frame) {
  postMessageToFrame(target_frame);
}

function postMessageToFrame(target_frame) {
  target_frame.contentWindow.postMessage({
    count: editorProperties.value.count.model,
    radius: editorProperties.value.radius.model,
    threshold: editorProperties.value.threshold.model,
  }, window.location.origin);
}

var pending_update = null;
function scheduleUpdate() {
  if (pending_update) {
    return;
  }
  clearTimeout(pending_update);
  pending_update = setTimeout(() => {
    document.querySelectorAll('iframe').forEach(postMessageToFrame);
    pending_update = null;
  }, 300);
}

function onPresetSelected(new_value) {
  var new_options = editorProperties.value.preset.options.values[new_value];
  if (!new_options) {
    return;
  }
  for (var key of ['count', 'radius', 'threshold']) {
    if (!new_options[key] || !editorProperties.value[key]) {
      continue;
    }
    editorProperties.value[key].model = new_options[key];
    editorProperties.value[key].options.initial_value = new_options[key];
  }
}

function onPropertyChanged(name, new_value) {
  if (name === 'preset') {
    onPresetSelected(new_value);
  }
  scheduleUpdate();
}
</script>

<template>
  <Player :title="title"
          :date="date"
          :lastmod="lastmod"
          :frame="frame + '?mode=Version2025'"
          :paused="false"
          @load="onPlayerLoaded" />
  <Column>
    <Section heading="Controls">
      <PropertyEditor :properties="editorProperties"
                      @property-changed="onPropertyChanged" />
    </Section>

    <Section>
      <template v-slot:heading>
        <Quote name="you, probably">What am I looking at?</Quote>
      </template>
      <p>
        This demonstrates something like <ExternalLink to="https://en.wikipedia.org/wiki/Deferred_shading">deferred shading</ExternalLink> to render 2D <ExternalLink to="https://en.wikipedia.org/wiki/Metaballs">metaballs</ExternalLink>.
        The viewport is split into 4 quadrants showing different effects applied to the same scene.
      </p>
      <br />
      <p>
        The upper-left quadrant is the "base texture" which is a composite of an array of VertexPositionColor points being rendered with a pixel shader which paints a radial gradient (color and alpha) around each point.
        Each vertex is "brightest" at its center and is more transparent towards the edge as the alpha drops off.
        Afterwards the base texture is used as input for the remaining 3 quadrants, each applying a slightly different pixel shader.
      </p>
      <br />

      <Figure src_light="/images/projects/metaballs/viewport_explanation_light.png"
              src_dark="/images/projects/metaballs/viewport_explanation_dark.png"
              alt="Image describing the quadrants in the live demo at the top of the page.
                  (1) upper-left: base texture,
                  (2) upper-right: diffuse metaball,
                  (3) lower-left: diffuse metaball + outline,
                  (4) lower-right: hue + outline." />

      <Figure src_light="/images/projects/metaballs/hierarchy_light.png"
              src_dark="/images/projects/metaballs/hierarchy_dark.png"
              alt="Image describing the the scene hierarchy.
                  (1) VertexPositionColor[] data,
                  (2) Base Texture,
                  (3) Each; Diffuse Metaball, Diffuse + Outline, Hue + Outline." />
    </Section>

    <Section>
      <template v-slot:heading>
        <font-awesome-icon :icon="['fas', 'dragon']" /> Here be Dragons <font-awesome-icon class="fa-flip-horizontal" :icon="['fas', 'dragon']" />
      </template>
      <p>
        Be warned, this project was one of my first shader experiments.
        I really wouldn't recommend this approach, there's certainly better ways to achieve this effect with the latest OpenGL / WebGL APIs or more robust maths.
        My goal was to approximate metaballs though alpha blending, which worked pretty well for this narrow use case. In any case, I hope you find this interesting.
      </p>
    </Section>

    <Section heading="Base Texture: Draw Points">
      <p>
        First the renderer needs to be configured for blending.
        It's important that the background is transparent black, the later shaders will use the alpha channel as a "mass" or "influence" value, deciding whether to discard or paint a pixel.
      </p>
      <br />
      <Code lang="javascript"
            caption="Configure WebGL for alpha blending."
            text="
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFuncSeparate(/*srcRGB=*/ gl.SRC_ALPHA,
                            /*dstRGB=*/ gl.ONE_MINUS_SRC_ALPHA,
                            /*srcAlpha=*/ gl.ONE,
                            /*dstAlpha=*/ gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
      "></Code>

      <Math>
        \begin{aligned}
        R_{rgb} &=& \Big[(S_{rgb} \cdot S_a) &+& (D_{rgb} \cdot (1 - S_a))\Big] \\
        R_a     &=& \Big[(S_a \cdot 1) &+& (D_a \cdot (1 - S_a))\Big] \\
        \end{aligned}
      </Math>
      <br />
      <p>
        Each particle is shaded into the base texture after updating its per-particle uniform values.
        The final base texture contains all points on a transparent black background, radial gradients (color and alpha) around each point.
        Each point has a color gradient where the center is the assigned color and perimeter is transparent black.
      </p>
      <br />
      <Code file="/library/projects/metaballs/shaders/metaball-points-fs-v2012.c"></Code>
      <br />
      <p>
        The approach above works, however a more robust solution might be to use signed-distance fields.
        <br />
        <ExternalLink to="https://iquilezles.org/">Inigo Quilez</ExternalLink> has some great articles and resources on this subject:
      </p>
      <ul>
        <li><ExternalLink to="https://iquilezles.org/articles/distfunctions2d/">2D distance functions</ExternalLink></li>
        <li><ExternalLink to="https://iquilezles.org/articles/distgradfunctions2d/">2D distance and gradient functions</ExternalLink></li>
      </ul>
      <br />
      <Code file="/library/projects/metaballs/shaders/metaball-points-fs-v2025.c"></Code>
      <br />
      <p>
        Finally blending modes are reset before passing the composited texture to one of the following shaders.
      </p>
      <br />
      <Code lang="javascript"
            caption="Disable WebGL blend and re-enables depth test."
            text="
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
      "></Code>
      <Player title="Base Texture"
              :date="date"
              :lastmod="lastmod"
              :frame="frame + '?mode=WebFigureBaseTexture'"
              @load="onPlayerLoaded" />
      <PropertyEditor :properties="editorProperties" @property-changed="onPropertyChanged" />
    </Section>

    <Section heading="Apply: Diffuse Metaball">
      <p>
        This shader is simply a mask that discards any alpha values below the minimum-influence, uThreshold.
        The "diffuse" shading comes "free" since the color shading has already been baked into the texture, so kind of cheating.
      </p>
      <br />
      <Code file="/library/projects/metaballs/shaders/metaball-fs.c"></Code>
      <br />
      <Player title="Diffuse Metaball"
              :date="date"
              :lastmod="lastmod"
              :frame="frame + '?mode=WebFigureDiffuse'"
              @load="onPlayerLoaded" />
      <PropertyEditor :properties="editorProperties" @property-changed="onPropertyChanged" />
    </Section>

    <Section heading="Apply: Diffuse Metaball + Outline">
      <p>
        This shader builds upon the previous, adding a black and white outline around masses.
      </p>
      <br />
      <Code file="/library/projects/metaballs/shaders/outline-metaball-fs.c"></Code>
      <br />
      <Player title="Diffuse Metaball + Outline"
              :date="date"
              :lastmod="lastmod"
              :frame="frame + '?mode=WebFigureDiffuseOutline'"
              @load="onPlayerLoaded" />
      <PropertyEditor :properties="editorProperties" @property-changed="onPropertyChanged" />
    </Section>

    <Section heading="Apply: Outline + Hue">
      <p>
        This shader builds upon the previous two, replacing the innermost fill color with a rotating hue.
      </p>
      <br />
      <Code file="/library/projects/metaballs/shaders/hue-metaball-fs.c"></Code>
      <br />
      <Player title="Outline + Hue"
              :date="date"
              :lastmod="lastmod"
              :frame="frame + '?mode=WebFigureHueOutline'"
              @load="onPlayerLoaded" />
      <PropertyEditor :properties="editorProperties" @property-changed="onPropertyChanged" />
    </Section>

    <Section heading="Limitations">
      <ul>
        <li>Doesn't handle <i>many</i> overlapping points very well, critical masses sometimes have an unexpected halo-like outline within the mass.</li>
        <li>Doesn't handle <i>large</i> points well, point merges become more sharp and less blobby as their size increases.</li>
        <li>
          Before drawing points, the render target must be cleared to transparent black for blending to work correctly.
          <ul>
            <li>Cannot draw points over a rendered scene without affecting the resulting image dramatically.</li>
            <li>After drawing points with one of the additional metaball/effect shader, the resulting texture may be included in the scene though a UV mapped model (e.g., 3D billboard or complex model, 2D UI component).</li>
          </ul>
        </li>
        <li>
          Points are drawn orthographically in UV coordinate space without depth information:
          <ul>
            <li>3D information is lost as points are drawn to a flat texture.</li>
          </ul>
        </li>
        <li>
          Could be more performant:
          <ul>
            <li>Points are drawn individually with shader <ExternalLink to="https://www.khronos.org/opengl/wiki/Uniform_(GLSL)">uniform</ExternalLink> values (assigned for each drawn point).</li>
            <li>Instancing with <ExternalLink to="https://www.khronos.org/opengl/wiki/Shader_Storage_Buffer_Object">shader storage buffer object</ExternalLink> (SSBO) arrays for per-particle parameters should reduce both the number of draw calls and times data is copied to the GPU.</li>
          </ul>
        </li>
      </ul>
    </Section>

  </Column>
</template>
