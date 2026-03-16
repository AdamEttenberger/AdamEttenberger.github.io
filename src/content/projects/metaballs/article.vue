<script setup lang="ts">
import { computed, ref, type Ref } from 'vue'
import CodeMirror from '@/components/code-mirror.vue'
import Link from '@/components/link.vue'
import Figure from '@/components/figure.vue'
import Formula from '@/components/formula.vue'
import Player from '@/components/player.vue'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import { PropertyEmits, PropertyEmitsHandler } from '@/util/property_editor/property_interfaces'
import Quote from '@/components/quote.vue'
import Section from '@/components/section.vue'
import {
  ComboBoxRow,
  NumberRangeRow,
} from '@/util/property_editor/property_types'
//
import { type IProjectInfo } from '@/types/project_types'
import { PlayerState } from '@/types/player_state'
import useIntersectionObserver from '@/composables/intersection_observer'
import usePropertyEditorModel from '@/composables/property_editor_model'
import usePostMessage from '@/composables/post_message'
import { FrameContainerSymbol, isFrameContainer, type IFrameContainer } from '@/types/frame_container'
import useFunctionRef, { toComponent, type WeakElement } from '@/composables/function_ref'

defineProps<IProjectInfo>();

type FrameRefName = 'main'|'base-texture'|'diffuse-texture'|'diffuse-outline-texture'|'outline-hue-texture';

type MetaballsPayload = {
  count?: number;
  radius?: number;
  threshold?: number;
};

type MetaballPreset = {
  label: string;
} & {
  [K in keyof MetaballsPayload]-?: MetaballsPayload[K];
};

type MetaballsPayloadKey = keyof MetaballsPayload;

const frame_ref_names = ref({}) as Ref<Record<string, FrameRefName>>;
const player_states = ref({}) as Ref<Record<FrameRefName, PlayerState>>;

const { observe: mapPlayerIntersectionObserver } = useIntersectionObserver<FrameRefName>((key, entry) => {
  player_states.value[key] = entry.isIntersecting
      ? PlayerState.Playing
      : PlayerState.Empty;
});

const player = useFunctionRef<FrameRefName>([
  {
    ref(e: undefined|WeakElement, key: FrameRefName): void {
      const comp = toComponent(e, Player);
      if (!isFrameContainer(comp)) {
        return;
      }
      frame_ref_names.value[comp[FrameContainerSymbol]] = key;
      mapPlayerIntersectionObserver(key, () => comp.$el);
    }
  }
]);

const { post } = usePostMessage<MetaballsPayload>();

enum PresetKey {
  Default = 'default',
  ExtraGloopy = 'extra-gloopy',
  ExplosiveGrowth = 'explosive-growth',
  ManyMini = 'many-mini',
};

const presets: Record<PresetKey, MetaballPreset> = {
  [PresetKey.Default]: {
    label: "Default",
    count: 40,
    radius: 0.1,
    threshold: 0.5,
  },
  [PresetKey.ExtraGloopy]: {
    label: "Extra Gloopy",
    count: 40,
    radius: 0.1,
    threshold: 0.75,
  },
  [PresetKey.ExplosiveGrowth]: {
    label: "Explosive Growth",
    count: 20,
    radius: 0.2,
    threshold: 0.9,
  },
  [PresetKey.ManyMini]: {
    label: "Many Mini",
    count: 100,
    radius: 0.05,
    threshold: 0.5,
  },
};

const PresetOptions = Object.values(PresetKey).reduce<Array<[PresetKey, string]>>(
  (result, key) => {
    result.push([key, presets[key].label]);
    return result;
  }, new Array<[PresetKey, string]>());

const selected_preset = ref<PresetKey>(PresetKey.Default);
const payload = computed<MetaballsPayload>(() => ({
  count: editor.get<number>('count'),
  radius: editor.get<number>('radius'),
  threshold: editor.get<number>('threshold'),
}));

// Intentionally setup so each editor is synchronized.
const editor = usePropertyEditorModel(
  [
    new NumberRangeRow('count', 'Count', (() => presets[selected_preset.value].count), 0, 100, 1),
    new NumberRangeRow('radius', 'Radius', (() => presets[selected_preset.value].radius), 0.01, 0.2, 0.01),
    new NumberRangeRow('threshold', 'Min-Mass', (() => presets[selected_preset.value].threshold), 0.01, 0.99, 0.01),
    new ComboBoxRow<PresetKey>('preset', 'Preset', selected_preset.value, PresetOptions).setModel(selected_preset),
  ],
  new PropertyEmitsHandler((kind: PropertyEmits, name: string): void => {
    switch (kind) {
      case PropertyEmits.Changed: {
        if (name === 'preset') {
          onPresetChanged();
        }
        update_frames();
        break;
      }
      case PropertyEmits.Changing:
      case PropertyEmits.Click:
      case PropertyEmits.Reset: {
        break;
      }
    }
  })
);

function update_frames() {
  const snapshot = payload.value;
  player.forEachComponent(Player, (frame) => {
    post(frame as unknown as  IFrameContainer, snapshot);
  });
}

function onPlayerLoaded(_source: HTMLIFrameElement, frame_key: string) {
  const ref_name = frame_ref_names.value[frame_key];
  if (!ref_name) {
    return;
  }
  const comp = player.asComponent(ref_name, Player);
  if (!isFrameContainer(comp)) {
    return;
  }
  post(comp, payload.value);
}

function onPresetChanged() {
  const new_presets = presets[selected_preset.value];
  for (const key of (Object.keys(payload.value) as MetaballsPayloadKey[])) {
    editor.set(key, new_presets[key]);
  }
}
</script>

<template>
  <article>
    <Player :ref="player.ref('main')" :state="player_states['main']"
            :title="title"
            :date="date"
            :lastmod="lastmod"
            frame="/library/projects/metaballs/main.html?mode=Version2025"
            @load="onPlayerLoaded" />

    <Section heading="Controls">
      <PropertyEditor v-bind:rows="editor.rows" v-model="editor.models" v-on="editor.onPropertyEmit" />
    </Section>

    <Section>
      <template v-slot:heading>
        <Quote name="you, probably">What am I looking at?</Quote>
      </template>
      <p>
        This demonstrates something like <Link to="https://en.wikipedia.org/wiki/Deferred_shading">deferred shading</Link> to render 2D <Link to="https://en.wikipedia.org/wiki/Metaballs">metaballs</Link>.
        The viewport is split into 4 quadrants showing different effects applied to the same scene.
      </p>
      <p>
        The upper-left quadrant is the "base texture" which is a composite of an array of VertexPositionColor points being rendered with a pixel shader which paints a radial gradient (color and alpha) around each point.
        Each vertex is "brightest" at its center and is more transparent towards the edge as the alpha drops off.
        Afterwards the base texture is used as input for the remaining 3 quadrants, each applying a slightly different pixel shader.
      </p>

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
      <CodeMirror lang="javascript"
                  caption="Configure WebGL for alpha blending."
                  content="
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFuncSeparate(/*srcRGB=*/ gl.SRC_ALPHA,
                            /*dstRGB=*/ gl.ONE_MINUS_SRC_ALPHA,
                            /*srcAlpha=*/ gl.ONE,
                            /*dstAlpha=*/ gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
      " />

      <Formula caption="Equation for the blendFuncSeparate above, computing the color `R` given colors source `S` and destination `D`."
               content="
                  \begin{aligned}
                  R_{rgb} &=& &(S_{rgb} \cdot S_a) &+& (D_{rgb} \cdot (1 - S_a))& \\
                  R_a     &=& &(S_a \cdot 1) &+& (D_a \cdot (1 - S_a))& \\
                  \end{aligned}
               " />
      <p>
        Each particle is shaded into the base texture after updating its per-particle uniform values.
        The final base texture contains all points on a transparent black background, radial gradients (color and alpha) around each point.
        Each point has a color gradient where the center is the assigned color and perimeter is transparent black.
      </p>
      <CodeMirror file="/library/projects/metaballs/shaders/metaball-points-fs-v2012.c" />
      <p>
        The approach above works, however a more robust solution might be to use signed-distance fields.
        <Link to="https://iquilezles.org/">Inigo Quilez</Link> has some great articles and resources on this subject:
      </p>
      <ul>
        <li><Link to="https://iquilezles.org/articles/distfunctions2d/">2D distance functions</Link></li>
        <li><Link to="https://iquilezles.org/articles/distgradfunctions2d/">2D distance and gradient functions</Link></li>
      </ul>
      <CodeMirror file="/library/projects/metaballs/shaders/metaball-points-fs-v2025.c" />
      <p>
        Finally blending modes are reset before passing the composited texture to one of the following shaders.
      </p>
      <CodeMirror lang="javascript"
                  caption="Disable WebGL blend and re-enables depth test."
                  content="
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
      " />
      <Player :ref="player.ref('base-texture')" :state="player_states['base-texture']"
              title="Base Texture"
              :date="date"
              :lastmod="lastmod"
              frame="/library/projects/metaballs/main.html?mode=WebFigureBaseTexture"
              @load="onPlayerLoaded" />
      <PropertyEditor v-bind:rows="editor.rows" v-model="editor.models" v-on="editor.onPropertyEmit" />
    </Section>

    <Section heading="Apply: Diffuse Metaball">
      <p>
        This shader is simply a mask that discards any alpha values below the minimum-influence, uThreshold.
        The "diffuse" shading comes "free" since the color shading has already been baked into the texture, so kind of cheating.
      </p>
      <CodeMirror file="/library/projects/metaballs/shaders/metaball-fs.c" />
      <Player :ref="player.ref('diffuse-texture')" :state="player_states['diffuse-texture']"
              title="Diffuse Metaball"
              :date="date"
              :lastmod="lastmod"
              frame="/library/projects/metaballs/main.html?mode=WebFigureDiffuse"
              @load="onPlayerLoaded" />
      <PropertyEditor v-bind:rows="editor.rows" v-model="editor.models" v-on="editor.onPropertyEmit" />
    </Section>

    <Section heading="Apply: Diffuse Metaball + Outline">
      <p>
        This shader builds upon the previous, adding a black and white outline around masses.
      </p>
      <CodeMirror file="/library/projects/metaballs/shaders/outline-metaball-fs.c" />
      <Player :ref="player.ref('diffuse-outline-texture')" :state="player_states['diffuse-outline-texture']"
              title="Diffuse Metaball + Outline"
              :date="date"
              :lastmod="lastmod"
              frame="/library/projects/metaballs/main.html?mode=WebFigureDiffuseOutline"
              @load="onPlayerLoaded" />
      <PropertyEditor v-bind:rows="editor.rows" v-model="editor.models" v-on="editor.onPropertyEmit" />
    </Section>

    <Section heading="Apply: Outline + Hue">
      <p>
        This shader builds upon the previous two, replacing the innermost fill color with a rotating hue.
      </p>
      <CodeMirror file="/library/projects/metaballs/shaders/hue-metaball-fs.c" />
      <Player :ref="player.ref('outline-hue-texture')" :state="player_states['outline-hue-texture']"
              title="Outline + Hue"
              :date="date"
              :lastmod="lastmod"
              frame="/library/projects/metaballs/main.html?mode=WebFigureHueOutline"
              @load="onPlayerLoaded" />
      <PropertyEditor v-bind:rows="editor.rows" v-model="editor.models" v-on="editor.onPropertyEmit" />
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
            <li>Points are drawn individually with shader <Link to="https://www.khronos.org/opengl/wiki/Uniform_(GLSL)">uniform</Link> values (assigned for each drawn point).</li>
            <li>Instancing with <Link to="https://www.khronos.org/opengl/wiki/Shader_Storage_Buffer_Object">shader storage buffer object</Link> (SSBO) arrays for per-particle parameters should reduce both the number of draw calls and times data is copied to the GPU.</li>
          </ul>
        </li>
      </ul>
    </Section>
  </article>
</template>
