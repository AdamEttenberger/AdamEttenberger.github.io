<script setup lang="ts">
import { useTemplateRef, ref, computed, toRaw } from 'vue'
import Code from '@/components/code.vue'
import Column from '@/components/column.vue'
import Details from '@/components/details.vue'
import ExternalLink from '@/components/external_link.vue'
import Figure from '@/components/figure.vue'
import Player from '@/components/player.vue'
import PropertyBuilder, { PropertyNumberRangeBuilder, PropertyComboBoxBuilder } from '@/util/property_editor/property_builder'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import Section from '@/components/section.vue'
//
import UnderConstruction from '@/components/under_construction.vue'

const frames = {};

const UPDATE = {
  Auto: 0,
  Schedule: 1,
  Now: 2,
};

enum UniformType {
  float = 'float',
  vec2 = 'vec2',
  vec3 = 'vec3',
  vec4 = 'vec4',
  mat4 = 'mat4',
};

class Uniform {
  constructor(type: UniformType, name: string) {
    this.type = type;
    this.name = name;
  }
}

class FrameState {
  constructor(frame) {
    this.frame = frame;
    this.last_update = 0;
    this.debounce_ms = 33;
    this.timeout = null;
    this.shader_key = null;
    this.needs_compile = true;
  }
  static get(frame) {
    var state = frames[frame];
    if (!state) {
      state = new FrameState(frame);
      frames[frame] = state;
    }
    return state;
  }
  update(update_type = UPDATE.Auto) {
    var new_time = performance.now();
    if (update_type === UPDATE.Schedule ||
        (update_type !== UPDATE.Now && new_time - this.last_update < this.debounce_ms)) {
      if (!this.timeout) {
        this.timeout = setTimeout(() => this.update(UPDATE.Auto), this.debounce_ms);
      }
      return;
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
      delete this.timeout;
    }
    var sources = this.needs_compile ? getShaderProgram(this.shader_key) : undefined;
    var uniforms = getShaderUniformsForMessage(this.shader_key);

    this.frame.contentWindow?.postMessage({
      sources: sources,
      uniforms: uniforms,
    }, window.location.origin);
    this.last_update = new_time;
    this.needs_compile = this.needs_compile && !sources;
  }
  setKey(key, update_type = UPDATE.Auto) {
    if (this.shader_key == key) {
      return;
    }
    this.shader_key = key;
    this.needs_compile = true;
    this.update((update_type == UPDATE.Auto) ? UPDATE.Schedule : update_type);
  }
}

const main_player = useTemplateRef('main_player_ref');
function getMainPlayerFrame() {
  return main_player.value?.player_frame;
}

defineProps({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  lastmod: { type: Date },
  frame: { type: String, required: true },
})

function createSdfShader(uniforms: Array<Uniform>, sdf_function) {
  return `
    precision mediump float;

    varying vec2 UV;

    // ShaderLoaderComponent Uniforms
    uniform vec3 uResolution; // = {width, height, aspect}
    uniform float uTime;

    // Shape Uniforms
    ${uniforms.map(uniform => `uniform ${uniform.type} ${uniform.name};`).join('\n    ')}

    // Helper methods
    vec2 uv_rot90_cw(vec2 p) { return vec2(-p.y, p.x); }
    vec2 uv_rot90_ccw(vec2 p) { return vec2(p.y, -p.x); }

    float sdf_function(vec2 p) {
      ${sdf_function}
    }

    vec4 gradient_bands(float sdf, float bandsize) {
      const vec3 inside = vec3(1.0, 0.0, 0.0);
      const vec3 outside = vec3(0.0, 0.0, 1.0);
      vec3 color = (sdf > 0.0) ? outside : inside;

      float band = ceil(abs(sdf) / bandsize) * bandsize;
      color = mix(color, vec3(0.0), band);
      return vec4(color, 1.0);
    }

    void main() {
      vec2 p = UV;
      p -= vec2(0.5);       // translate to center the circle in the view.
      p.x *= uResolution.z; // scale to the aspect ratio of the container, to fit vertically.

      float sdf = sdf_function(p);
      gl_FragColor = gradient_bands(sdf, 0.1);
    }
  `;
}

const shader_definitions = new Map([
  [
    'heart', {
      label: "Heart",
      uniforms: [
        new Uniform(UniformType.float, 'uRadius'),
      ],
      sdf_function: `
        p.x = abs(p.x);
        const vec2 a = vec2(0.0, -0.5);
        vec2 c = vec2(0.5 - uRadius);
        float k = sqrt(uRadius - 0.25);
        vec2 d = vec2(0.0, c.y + k);
        float s = length(c - a);
        float normal_angle = atan(a.y - c.y, a.x - c.x) + acos(uRadius / s); // = angle_from_c_to_a - angle_to_tangent
        vec2 n = vec2(cos(normal_angle), sin(normal_angle));
        if (dot(p - d, uv_rot90_ccw(d - c)) > 0.0 &&
            dot(p - c, uv_rot90_cw(n)) > 0.0) {
          return length(p - c) - uRadius;
        }
        float sdf_a = length(p - d);
        float sdf_b = dot(p - a, -n);
        return -min(sdf_a, sdf_b);
      `,
    }
  ],
  [
    'circle', {
      label: "Circle",
      uniforms: [
        new Uniform(UniformType.float, 'uRadius'),
      ],
      sdf_function: 'return length(p) - uRadius;',
    }
  ],
  [
    'plane', {
      label: "Plane",
      uniforms: [
        new Uniform(UniformType.vec2, 'uNormal'),
        new Uniform(UniformType.float, 'uDistanceFromOrigin'),
      ],
      sdf_function: 'return dot(p, uNormal) - uDistanceFromOrigin;',
    }
  ],
  [
    'square', {
      label: "Square",
      uniforms: [
        new Uniform(UniformType.float, 'uSize'),
      ],
      sdf_function: `
        p = abs(p);
        return max(p.x, p.y) - uSize;
      `,
    }
  ],
]);

const shader_selection = ref(new PropertyBuilder()
    .addProperty('program', new PropertyComboBoxBuilder().setLabel('Shader').setModel('heart').setValues(
      Object.fromEntries(shader_definitions.entries().map(([key, value]) => [
          key,
          {
            label: value.label,
            uniforms: value.uniforms,
            sources: {
              vert: {file: "/library/projects/shader_loader/shaders/default.vert"},
              frag: {source: createSdfShader(value.uniforms, value.sdf_function)},
            }
          }
      ])
    )))
    .addProperty('circle.uRadius', new PropertyNumberRangeBuilder().setLabel("Radius").setModel(0.5).setOptions(0.0, 1.0, 0.01).setCollapsed(computed(() => shader_selection.value.program.model !== 'circle')))
    .addProperty('heart.uRadius', new PropertyNumberRangeBuilder().setLabel("Blend To Circle").setModel(0.28).setOptions(0.28, 0.5, 0.0022).setScalar(true).setCollapsed(computed(() => shader_selection.value.program.model !== 'heart')))
    .addProperty('plane.uNormal', new PropertyNumberRangeBuilder().setLabel("Normal Degrees").setModel(0.0).setOptions(0.0, 360.0, 1.0).setCollapsed(computed(() => shader_selection.value.program.model !== 'plane')))
    .addProperty('plane.uDistanceFromOrigin', new PropertyNumberRangeBuilder().setLabel("Distance From Origin").setModel(0.0).setOptions(-0.5, 0.5, 0.01).setCollapsed(computed(() => shader_selection.value.program.model !== 'plane')))
    .addProperty('square.uSize', new PropertyNumberRangeBuilder().setLabel("Size").setModel(0.5).setOptions(0.0, 1.0, 0.01).setCollapsed(computed(() => shader_selection.value.program.model !== 'square')))
    .build());

function getShaderProgram(key) {
  var sources = shader_selection.value.program.options.values[key]?.sources;
  if (!sources) {
    return {};
  }
  return toRaw(sources);
}

function degToVec2(deg) {
  var rad = deg * (Math.PI / 180.0);
  return [Math.cos(rad), Math.sin(rad)];
}

function getShaderUniformTypes(key) {
  return shader_selection.value.program.options.values[key].uniforms;
}

function getShaderUniformsForMessage(key) {
  return getShaderUniformTypes(key).map(uniform => {
    var value = toRaw(shader_selection.value[`${key}.${uniform.name}`].model);
    // Until vector editors are implemented, display vec2 values as angles.
    if (uniform.type === UniformType.vec2) {
      value = degToVec2(value);
    }
    return [uniform.name, {type: uniform.type, value: value}];
  });
}

function onPlayerLoaded(frame) {
  FrameState.get(frame).setKey(shader_selection.value.program.model, UPDATE.Now);
}

function onPropertyChanged(name, new_value) {
  if (name === 'program') {
    FrameState.get(getMainPlayerFrame()).setKey(new_value);
  } else {
    FrameState.get(getMainPlayerFrame()).update(UPDATE.Schedule);
  }
}
</script>

<template>
  <Player ref="main_player_ref"
          :title="title"
          :date="date"
          :lastmod="lastmod"
          :frame="frame"
          :paused="false"
          @load="(e) => onPlayerLoaded(e)" />
  <Column>
    <Section heading="Controls">
      <PropertyEditor :properties="shader_selection"
                      @property-changed="onPropertyChanged" />
    </Section>
  </Column>
  <Column>
    <UnderConstruction />
  </Column>
</template>
