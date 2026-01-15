<script setup lang="ts">
import { useTemplateRef, ref, computed, toRaw } from 'vue'
import Code from '@/components/code.vue'
import Column from '@/components/column.vue'
import Details from '@/components/details.vue'
import ExternalLink from '@/components/external_link.vue'
import Figure from '@/components/figure.vue'
import Player from '@/components/player.vue'
import { PropertyKind } from '@/util/property_editor/property_interfaces'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import Section from '@/components/section.vue'
//
import UnderConstruction from '@/components/under_construction.vue'

const main_editor = useTemplateRef('main_editor_ref');
const main_player = useTemplateRef('main_player_ref');

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

    // Shared Uniforms
    ${shared_uniforms.map(uniform => `uniform ${uniform.type} ${uniform.name};`).join('\n    ')}

    // Shape Uniforms
    ${uniforms.map(uniform => `uniform ${uniform.type} ${uniform.name};`).join('\n    ')}

    // Helper methods
    vec2 rot90_ccw(vec2 p) { return vec2(-p.y, p.x); }
    vec2 rot90_cw(vec2 p) { return vec2(p.y, -p.x); }
    float sdf_union(float a, float b) { return min(a, b); }
    float sdf_intersection(float a, float b) { return max(a, b); }

    float sdf_function(vec2 p) {
      ${sdf_function}
    }

    vec4 gradient_bands(float sdf, float bandsize) {
      const vec3 inside = vec3(1.0, 0.0, 0.0);
      const vec3 outside = vec3(0.0, 0.0, 1.0);
      vec3 color = (sdf > 0.0) ? outside : inside;

      // Flat stepped gradient falloff brightest at the border of the shape.
      float band = floor(abs(sdf) / bandsize) * bandsize;
      color = mix(color, vec3(0.0), band);
      return vec4(color, 1.0);
    }

    void main() {
      vec2 p = UV;
      p -= vec2(0.5);       // translate to center the circle in the view.
      p.x *= uResolution.z; // scale to the aspect ratio of the container, to fit vertically.
      p *= vec2(uScale);    // apply camera zoom.

      float sdf = sdf_function(p);
      gl_FragColor = gradient_bands(sdf, 0.1);
    }
  `;
}

const shared_uniforms = [
  new Uniform(UniformType.float, 'uScale'),
];

const shader_templates = new Map([
  [
    'heart', {
      label: "Heart",
      uniforms: [
        new Uniform(UniformType.float, 'uAnimate'),
        new Uniform(UniformType.float, 'uAnimationAmplitude'),
        new Uniform(UniformType.float, 'uBlendToCircle'),
      ],
      sdf_function: `
        /*
         * Renders a heart shape that fits within 1 unit using 3 SDF functions.
         * 1. A circle around vector <C> with radius <R> in the upper-right corner which is mirrored horizontally forming the heart lobes.
         * 2. A circle around vector <D> with no radius which is collinear with the mirror axis forming the upward curve below vector <D>.
         * 3. A plane that connects vector <A> and vector <T> with the normal <N> pointing towards the 4th quadrant, mirrored horizontally.
         *
         * <A> = <vec2> @ lower point of the heart shape centered at the bottom of the image.
         * <C> = <vec2> @ center point of circle with radius <R> which is mirrored horizontally.
         * <D> = <vec2> @ top intersection point between mirrored circles around <C> with radius <R>.
         * <T> = <vec2> @ tangent between point <A> and circle <C>.
         * <N> = normalized <vec2> pointing towards the 4th quadrant which is perpendicular to the vector between <C> and tangent <T>.
         *
         * R = radius of circle <C>.
         * H = vertical distance between <C> and <D>; half the distance between the intersection points between the two mirrored circles.
         * K = horizontal offset of circle <C> from the center of the image; half distance between mirrored circles <C>.
         * S = distance between point <A> and the center of circle <C>.
         * Q = distance between point <A> and the tangent <T> of circle <C>; length of the tangent edge.
         *
         *  |=============================================|
         *  |            <D>                              |
         *  |           / | \                             |
         *  |         /   |   \                           |
         *  |       R     H     R                         |
         *  |     /       |       \                       |
         *  |    /        |        \                      |
         *  |   *----K----*----K---<C>                    |
         *  |    \        |        /| \                   |
         *  |     \       |       / |  \                  |
         *  |       R     H     R   /   R                 |
         *  |         \   |   /     |    \                |
         *  |           \ | /      /      \               |
         *  |             *       /       <T>             |
         *  |             |      S        /  \            |
         *  |             |     /       /      \          |
         *  |             |    /      /          <N>      |
         *  |             |   /     Q              \      |
         *  |             |  |    /                 _\/   |
         *  |             | /   /                         |
         *  |             | | /                           |
         *  |             |//                             |
         *  |            <A>                              |
         *  |=============================================|
         */
        const float kMinRadius = 0.28;
        const float kMaxRadius = 0.5;
        p.x = abs(p.x);

        // Switch between user control and custom animation.
        float r;
        if (uAnimate == 0.0) {
          r = mix(kMinRadius, kMaxRadius, uBlendToCircle);
        } else {
          float rate = 4.0;
          float t1 = 0.5+0.5*cos(uTime * rate);
          float t2 = 0.5+0.5*cos(uTime * rate * 2.0);
          float t = min(t1, t2);
          r = mix(kMinRadius, mix(kMinRadius, kMaxRadius, uAnimationAmplitude), t);
        }

        const vec2 a = vec2(0.0, -0.5);
        vec2 c = vec2(0.5 - r);

        // Compute the lengths between vector <A> and vectors <C> and <T>.
        vec2 c_to_a = a - c;
        float s_squared = dot(c_to_a, c_to_a);
        float s = sqrt(s_squared);
        float q = sqrt(s_squared - r*r);

        // Create normalized vector pointing from <C> to <A>.
        vec2 unit_c_to_a = c_to_a / s;
        vec2 unit_c_to_a_perpendicular = rot90_ccw(unit_c_to_a);

        // Create a unit vector pointing from <C> to <T> by rotating the unit vector
        // from <C> to <A> towards its perpendicular. In this context, theta is the
        // angle between points ACT.
        float cos_theta = r/s;
        float sin_theta = q/s;
        vec2 n = (unit_c_to_a * cos_theta) + (unit_c_to_a_perpendicular * sin_theta);

        // Compute the signed-distance, branching the render between two parts; the heart lobes and the point.
        // This is important for preventing the plane which forms the lower point from drawing over the lobes.
        float h = sqrt(r - 0.25);
        vec2 d = vec2(0.0, c.y + h);
        vec2 d_to_p = p - d;
        vec2 c_to_p = p - c;
        if (dot(d_to_p, rot90_cw(d - c)) > 0.0 &&
            dot(c_to_p, rot90_ccw(n)) > 0.0) {
          // An SDF circle which forms the right half of the mirrored heart lobes.
          return length(c_to_p) - r;
        }
        // An inverted SDF point which forms the upward curve between the lobes of the heart, only values <= 0.
        float sdf_circle_inverted = -length(d_to_p);
        // An SDF plane, collinear with points <A> and <T>, with the positive side towards the 4th quadrant away from the shape.
        float sdf_plane_outward = dot(p - a, n);
        // Combining the two shapes, taking the intersection so they blend smoothly.
        return sdf_intersection(sdf_circle_inverted, sdf_plane_outward);
      `,
    }
  ],
  [
    'eye', {
      label: "Eye",
      uniforms: [
        new Uniform(UniformType.float, 'uSize1'),
        new Uniform(UniformType.float, 'uSize2'),
      ],
      sdf_function: `
        vec2 p2 = abs(p);
        float l = length(p);
        float la = length(p2);
        vec2 s = vec2(cos(p2.x), sin(p2.y));

        float horizontal_out = -(s.y + l - 0.66);
        float horizontal_mid = -(1.0-(s.y + l + 0.4));
        float horizontal_in = (1.0-(s.y + l + 0.45));
        return max(horizontal_in, min(horizontal_out, horizontal_mid));

        // float horizontal = (length(p2) + sin(p2.y)) + 0.5;
        // float vertical = -(length(p2 * vec2(2.0, 1.0)) + sin(p2.x)/3.0);
        // float pupil = length(p - vec2(cos(uTime)*0.125, 0.0)) - 0.5;
        // return -min(pupil - vertical, 1.0 - horizontal);
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

const shader_definitions = Object.fromEntries(shader_templates.entries().map(([shader_key, value]) =>
  [
    shader_key,
    {
      label: value.label,
      uniforms: value.uniforms,
      sources: {
        vert: {file: "/library/projects/shader_loader/shaders/default.vert"},
        frag: {source: createSdfShader(value.uniforms, value.sdf_function)},
      }
    }
  ]
));

const selected_shader = ref('heart');
const play_animation = ref(true);
const shader_properties = [
  {
    kind: PropertyKind.ComboBox,
    name: 'program',
    label: 'Shader',
    values: Object.entries(shader_definitions).map(([key, value]) => [key, value.label]),
    default_value: 'heart',
    model: selected_shader,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'uScale',
    label: 'Scale',
    min_value: 1.0,
    max_value: 10.0,
    step_value: 0.25,
    as_scalar: true,
    default_value: 1.0,
  },
  {
    kind: PropertyKind.Toggle,
    name: 'heart.uAnimate',
    label: 'Animate',
    collapsed: computed(() => selected_shader.value !== 'heart'),
    default_value: true,
    model: play_animation,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'heart.uAnimationAmplitude',
    label: 'Animation Amplitude',
    disabled: computed(() => !play_animation.value),
    collapsed: computed(() => selected_shader.value !== 'heart'),
    min_value: 0.0,
    max_value: 1.0,
    step_value: 0.01,
    as_scalar: true,
    default_value: 1.0,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'heart.uBlendToCircle',
    label: 'Blend To Circle',
    disabled: computed(() => play_animation.value),
    collapsed: computed(() => selected_shader.value !== 'heart'),
    min_value: 0.0,
    max_value: 1.0,
    step_value: 0.01,
    as_scalar: true,
    default_value: 0.0,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'circle.uRadius',
    label: 'Radius',
    collapsed: computed(() => selected_shader.value !== 'circle'),
    min_value: 0.0,
    max_value: 1.0,
    step_value: 0.01,
    default_value: 0.5,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'plane.uNormal',
    label: 'Normal Degrees',
    collapsed: computed(() => selected_shader.value !== 'plane'),
    min_value: 0.0,
    max_value: 360.0,
    step_value: 1.0,
    default_value: 0.0,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'plane.uDistanceFromOrigin',
    label: 'Distance From Origin',
    collapsed: computed(() => selected_shader.value !== 'plane'),
    min_value: -0.5,
    max_value: 0.5,
    step_value: 0.01,
    default_value: 0.0,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'square.uSize',
    label: 'Size',
    collapsed: computed(() => selected_shader.value !== 'square'),
    min_value: 0.0,
    max_value: 1.0,
    step_value: 0.01,
    default_value: 0.5,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'eye.uSize1',
    label: 'Size1',
    collapsed: computed(() => selected_shader.value !== 'eye'),
    min_value: 0.0,
    max_value: 0.5,
    step_value: 0.01,
    default_value: 0.25,
  },
  {
    kind: PropertyKind.NumberRange,
    name: 'eye.uSize2',
    label: 'Size2',
    collapsed: computed(() => selected_shader.value !== 'eye'),
    min_value: 0.0,
    max_value: 0.5,
    step_value: 0.01,
    default_value: 0.5,
  },
];

function getShaderProgram(shader_key) {
  return shader_definitions[shader_key].sources;
}

function degToVec2(deg) {
  var rad = deg * (Math.PI / 180.0);
  return [Math.cos(rad), Math.sin(rad)];
}

function getShaderUniformsForMessage(shader_key) {
  const shader_uniforms = [
    ...shared_uniforms,
    ...shader_definitions[shader_key].uniforms,
  ];
  return shader_uniforms.map(uniform => {
    var value = main_editor.value.get(uniform.name);
    if (value === undefined) {
      value = main_editor.value.get(`${shader_key}.${uniform.name}`);
    }
    value = toRaw(value);
    // Until vector editors are implemented, display vec2 values as angles.
    if (uniform.type === UniformType.vec2) {
      value = degToVec2(value);
    }
    return [uniform.name, {type: uniform.type, value: value}];
  });
}

function onPlayerLoaded(frame) {
  FrameState.get(frame).setKey(selected_shader.value, UPDATE.Now);
}

function onMainFramePropertyChanged(name) {
  if (name === 'program') {
    FrameState.get(main_player.value?.player_frame).setKey(selected_shader.value);
  } else {
    FrameState.get(main_player.value?.player_frame).update(UPDATE.Schedule);
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
      <PropertyEditor ref="main_editor_ref"
                      :properties="shader_properties"
                      @property-changed="onMainFramePropertyChanged" />
    </Section>

    <Section heading="What is a signed-distance function (SDF)?">
    </Section>

    <Section heading="Example Shapes">
      <UnderConstruction />
    </Section>

    <Section heading="Insets and Outsets">
      <UnderConstruction />
    </Section>

    <Section heading="Combining Shapes">
      <UnderConstruction />
    </Section>

    <Section heading="Compositing a Heart">
      <UnderConstruction />
    </Section>

    <Section heading="Adding Effects">
      <UnderConstruction />
    </Section>

    <Section heading="Adding Animations">
      <UnderConstruction />
    </Section>

    <Section heading="References">
      <UnderConstruction />
    </Section>
  </Column>
</template>
