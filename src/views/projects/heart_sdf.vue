<script setup lang="ts">
import { computed, ref, toRaw, unref } from 'vue'
import Code from '@/components/code.vue'
import Column from '@/components/column.vue'
import Details from '@/components/details.vue'
import ExternalLink from '@/components/external_link.vue'
import Figure from '@/components/figure.vue'
import Formula from '@/components/formula.vue'
import Player from '@/components/player.vue'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import Section from '@/components/section.vue'
import {
  Color4Options,
  ComboBoxOptions,
  DividerOptions,
  GroupOptions,
  NumberRangeOptions,
  ToggleOptions,
} from '@/util/property_editor/property_types'
//
import UnderConstruction from '@/components/under_construction.vue'

const players = {};
const editors = {};

function playerRef(key) { return (e) => players[key] = e; }
function editorRef(key) { return (e) => editors[key] = e; }

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
  constructor(type: UniformType, name: string, coerce?: CallableFunction) {
    this.type = type;
    this.name = name;
    this.coerce = coerce;
  }
}

class FrameState {
  static #frame_cache = new Map();

  constructor(frame: HTMLIFrameElement, editor) {
    this.frame = frame;
    this.editor = editor;
    this.last_update = 0;
    this.debounce_ms = 33;
    this.timeout = null;
    this.shader_key = null;
    this.needs_compile = true;
  }
  static register(frame: HTMLIFrameElement, editor: Proxy) {
    var state = FrameState.#frame_cache.get(frame);
    if (!state) {
      state = new FrameState(frame, editor);
      FrameState.#frame_cache.set(frame, state);
    }
    return state;
  }
  static get(frame: HTMLIFrameElement): FrameState {
    return FrameState.#frame_cache.get(frame);
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
    var sources = this.needs_compile ? shader_definitions[this.shader_key].sources : undefined;
    var uniforms = getShaderUniformsForMessage(this.shader_key, this.editor);

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

    // Constants
    const float kReticleMinor = 0.0025;
    const float kReticleMajor = 0.025;

    varying vec2 UV;

    // ShaderLoaderComponent Uniforms
    uniform vec3 uResolution; // = {width, height, aspect}
    uniform float uTime;

    // Shared Uniforms
    ${shared_uniforms.map(uniform => `uniform ${uniform.type} ${uniform.name};`).join('\n    ')}

    // Shape Uniforms
    ${uniforms.map(uniform => `uniform ${uniform.type} ${uniform.name};`).join('\n    ')}

    // Helper methods
    mat2 rotate2d(float angle) {
      return mat2(cos(angle), -sin(angle),
                  sin(angle), cos(angle));
    }
    vec2 rot90_ccw(vec2 p) { return vec2(-p.y, p.x); }
    vec2 rot90_cw(vec2 p) { return vec2(p.y, -p.x); }
    float sdf_union(float a, float b) { return min(a, b); }
    float sdf_intersection(float a, float b) { return max(a, b); }
    float sdf_subtraction(float a, float b) { return max(-a, b); }

    float sdf_function(vec2 p) {
      ${sdf_function}
    }

    float sdf_rectangle(vec2 p, vec2 half_extent) {
      // https://iquilezles.org/articles/distfunctions2d/
      vec2 d = abs(p) - half_extent;
      return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
    }

    float sdf_reticle(vec2 p) {
      p = abs(p) / uScale;
      float sdf_plus = sdf_union(sdf_rectangle(p, vec2(kReticleMinor, kReticleMajor)),
                                 sdf_rectangle(p, vec2(kReticleMajor, kReticleMinor)));
      float sdf_square = max(p.x, p.y) - (0.5 * kReticleMajor);
      return sdf_subtraction(sdf_square, sdf_plus);
    }

    vec4 gradient_bands(vec4 color, float sdf, float bandsize) {
      // Flat stepped gradient falloff brightest at the border of the shape.
      float band = floor(abs(sdf) / bandsize) * bandsize;
      return vec4(mix(color.rgb, vec3(0.0), band), color.a);
    }

    vec4 draw(float sdf) {
      if (sdf + uInsetWidth <= 0.0) {
        return uInsideColor;
      } else if (sdf - uOutsetWidth > 0.0) {
        return uOutsideColor;
      } else {
        return (sdf > 0.0) ? uOutsetColor : uInsetColor;
      }
    }

    void main() {
      vec2 p = UV;
      p -= vec2(0.5);       // translate to center the circle in the view.
      p.x *= uResolution.z; // scale to the aspect ratio of the container, to fit vertically.
      p *= vec2(uScale);                  // camera zoom
      p -= vec2(uPositionX, uPositionY);  // camera translation
      p = rotate2d(uRotation) * p;        // camera rotation

      if (uShowReticle != 0.0) {
        float reticle = sdf_reticle(p);
        if (abs(reticle) <= kReticleMinor) {
          gl_FragColor = vec4(vec3((reticle <= 0.0) ? 1.0 : 0.0), 1.0);
          return;
        }
      }
      float sdf = sdf_function(p);
      gl_FragColor = gradient_bands(draw(sdf), sdf, 0.1);
    }
  `;
}

const shared_uniforms = [
  new Uniform(UniformType.float, 'uShowReticle'),
  new Uniform(UniformType.float, 'uPositionX'),
  new Uniform(UniformType.float, 'uPositionY'),
  new Uniform(UniformType.float, 'uRotation', degToRad), // TBD angle editor
  new Uniform(UniformType.float, 'uScale'),
  new Uniform(UniformType.vec4, 'uInsideColor'),
  new Uniform(UniformType.vec4, 'uOutsideColor'),
  new Uniform(UniformType.vec4, 'uOutsetColor'),
  new Uniform(UniformType.vec4, 'uInsetColor'),
  new Uniform(UniformType.float, 'uOutsetWidth'),
  new Uniform(UniformType.float, 'uInsetWidth'),
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
         * 1. A circle around vector <C> with radius <R> in the upper-right corner, mirrored horizontally to form the heart lobes.
         * 2. A circle around vector <D> with no radius, collinear with the mirror axis to form the upward curve below vector <D>.
         * 3. A plane that connects vector <A> and vector <T> with the normal <N> pointing towards the 4th quadrant, mirrored horizontally.
         *
         * <A> = <vec2> @ lower point of the heart shape centered at the bottom of the image.
         * <C> = <vec2> @ center point of circle with radius <R>, mirrored horizontally.
         * <D> = <vec2> @ top intersection point between mirrored circles around <C> with radius <R>.
         * <T> = <vec2> @ tangent between point <A> and circle <C>.
         * <N> = normalized <vec2> pointing towards the 4th quadrant, perpendicular to the vector between <C> and tangent <T>.
         *
         * R = radius of circle <C>.
         * H = vertical distance between <C> and <D>; half the distance between the intersection points between the two mirrored circles.
         * K = horizontal offset of circle <C> from the center of the image; half distance between mirrored circles <C>.
         * S = distance between point <A> and the center of circle <C>.
         * Q = distance between point <A> and the tangent <T> of circle <C>; length of the tangent edge.
         *
         * All lines on the diagram below should be interpreted as straight lines despite being jagged.
         *
         *  |=============================================|
         *  |            <D>                              |
         *  |           / | \\                             |
         *  |         /   |   \\                           |
         *  |       R     H     R                         |
         *  |     /       |       \\                       |
         *  |    /        |        \\                      |
         *  |   *----K----*----K---<C>                    |
         *  |    \\        |        /| \\                   |
         *  |     \\       |       / |  \\                  |
         *  |       R     H     R   |   R                 |
         *  |         \\   |   /     |    \\                |
         *  |           \\ | /      /      \\               |
         *  |             *       /       <T>             |
         *  |             |      S        /  \\            |
         *  |             |     /       /      \\          |
         *  |             |    /      /         <N>       |
         *  |             |   /     Q              \\      |
         *  |             |  /    /                 _\\/   |
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
        new Uniform(UniformType.vec2, 'uNormal', degToVec2), // TBD vector editor
        new Uniform(UniformType.float, 'uDistanceFromOrigin'),
      ],
      sdf_function: 'return dot(p, uNormal) - uDistanceFromOrigin;',
    }
  ],
  [
    'mirror', {
      label: "Mirrors",
      uniforms: [
        new Uniform(UniformType.float, 'uShape',),
        new Uniform(UniformType.float, 'uHorizontalMirror'),
        new Uniform(UniformType.float, 'uVerticalMirror'),
      ],
      sdf_function: `
        if (uHorizontalMirror != 0.0) {
          p.x = abs(p.x);
        }
        if (uVerticalMirror != 0.0) {
          p.y = abs(p.y);
        }
        if (uShape == 0.0) {
          const float cos_theta = 0.70710678118654752440084436210485;
          return dot(p, vec2(cos_theta, -cos_theta));
        }
        if (uShape == 1.0) {
          return length(p - vec2(0.3, 0.3)) - 0.3;
        }
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

/**
 * Generates unique bindings for PropertyEditor.properties.
 *
 * e.g., ('my-shader', { 'uInsideColor': { default_value: [1.0, 0.0, 0.0] } })
 *
 * @param shader_key The key/name of the shader program to load.
 * @param property_overlay Object containing key-value pairs ([uniform_key, IPropertyOptions_instance_overrides]). The key names the uniform which will be overridden, and the value is an object which partially implements the derived IPropertyOptions type containing which key/value pairs to override.
 */
function getShaderProperties(shader_key, property_overlay) {
  const group_camera_open = ref(null);
  const group_colors_open = ref(null);
  const group_border_open = ref(null);
  const camera_scale = ref(null);
  var local_properties = [
    new DividerOptions('divider-common', 'Common'),
    new ToggleOptions('uShowReticle', 'Show Origin Reticle', true),
    new GroupOptions('group-camera', 'Camera', false).setModel(group_camera_open),
    new NumberRangeOptions('uPositionX', 'Position X', 0.0, -1.0, 1.0, 0.01).setCollapsed(computed(() => !group_camera_open.value)),
    new NumberRangeOptions('uPositionY', 'Position Y', 0.0, -1.0, 1.0, 0.01).setCollapsed(computed(() => !group_camera_open.value)),
    new NumberRangeOptions('uRotation', 'Rotation', 0.0, 0, 360, 1).setCollapsed(computed(() => !group_camera_open.value)),
    new NumberRangeOptions('uScale', 'Scale', 1.0, 1, 5, 0.25).setModel(camera_scale).setCollapsed(computed(() => !group_camera_open.value)).asReciprocal(),
    new GroupOptions('group-colors', 'Colors', false).setCollapsed(true).setModel(group_colors_open), // TODO(Color4Options): Remove setCollapsed after implementing a color picker
    new Color4Options('uInsideColor', 'Inside Color', [0.0, 0.0, 1.0, 1.0]).setCollapsed(computed(() => !group_colors_open.value)),
    new Color4Options('uOutsideColor', 'Outside Color', [1.0, 0.0, 0.0, 1.0]).setCollapsed(computed(() => !group_colors_open.value)),
    new Color4Options('uInsetColor', 'Inset Color', [1.0, 1.0, 1.0, 1.0]).setCollapsed(computed(() => !group_colors_open.value)),
    new Color4Options('uOutsetColor', 'Outset Color', [0.0, 0.0, 0.0, 1.0]).setCollapsed(computed(() => !group_colors_open.value)),
    new GroupOptions('group-border', 'Border', false).setModel(group_border_open),
    new NumberRangeOptions('uInsetWidth', 'Inset Width', 0.0, 0, 0.1, 0.001).setCollapsed(computed(() => !group_border_open.value)),
    new NumberRangeOptions('uOutsetWidth', 'Outset Width', 0.0, 0, 0.1, 0.001).setCollapsed(computed(() => !group_border_open.value)),
  ];

  switch (shader_key) {
    case 'heart':
      const play_animation = ref(null);
      local_properties = [
        ...local_properties,
        new DividerOptions('divider-heart', 'SDF Heart'),
        new ToggleOptions('heart.uAnimate', 'Animate', false).setModel(play_animation),
        new NumberRangeOptions('heart.uAnimationAmplitude', 'Animation Amplitude', 1.0, 0, 1, 0.01).setDisabled(computed(() => !play_animation.value)),
        new NumberRangeOptions('heart.uBlendToCircle', 'Blend To Circle', 0.0, 0, 1, 0.01).setDisabled(computed(() => play_animation.value)),
      ];
      break;
    case 'circle':
      local_properties = [
        ...local_properties,
        new DividerOptions('divider-circle', 'SDF Circle'),
        new NumberRangeOptions('circle.uRadius', 'Radius', 0.5, 0, 1, 0.01),
      ];
      break;
    case 'plane':
      local_properties = [
        ...local_properties,
        new DividerOptions('divider-plane', 'SDF Plane'),
        new NumberRangeOptions('plane.uNormal', 'Normal Angle', 0.0, 0, 360, 1),
        new NumberRangeOptions('plane.uDistanceFromOrigin', 'Distance From Origin', 0.0, -0.5, 0.5, 0.01),
      ];
      break;
    case 'mirror':
      local_properties = [
        ...local_properties,
        new DividerOptions('divider-mirror', 'Mirrored Plane'),
        new ComboBoxOptions('mirror.uShape', 'Shape', 0, [
          [0, 'Plane'],
          [1, 'Circle'],
        ]),
        new ToggleOptions('mirror.uHorizontalMirror', 'Mirror Horizontally', true),
        new ToggleOptions('mirror.uVerticalMirror', 'Mirror Vertically', true),
      ];
      break;
    default:
      console.log(`unknown shader_key: ${shader_key}`);
      break;
  }
  if (property_overlay && Object.keys(property_overlay).length) {
    for (var props of local_properties) {
      var overlay = property_overlay[props.name];
      if (!overlay) {
        continue;
      }
      Object.entries(property_overlay[props.name])?.forEach(([key, value]) => props[key] = value);
    }
  }
  return local_properties;
}

function degToRad(deg) {
  return deg * (Math.PI / 180.0);
}

function degToVec2(deg) {
  var rad = degToRad(deg);
  return [Math.cos(rad), Math.sin(rad)];
}

function getShaderUniformsForMessage(shader_key, editor) {
  const shader_uniforms = [
    ...shared_uniforms,
    ...shader_definitions[shader_key].uniforms,
  ];
  return [
    ...shader_uniforms.map(uniform => {
      var value = unref(editor)?.get(uniform.name);
      if (value === undefined) {
        value = unref(editor)?.get(`${shader_key}.${uniform.name}`);
      }
      value = toRaw(value);
      if (uniform.coerce) {
        value = uniform.coerce(value);
      }
      return [uniform.name, {type: uniform.type, value: value}];
    }),
  ];
}

function onPlayerLoaded(frame: HTMLIFrameElement, editor, shader_key: string) {
  FrameState.register(frame, editor).setKey(shader_key, UPDATE.Now);
}

function onPlayerPropertyChanged(frame: HTMLIFrameElement, name: string) {
  FrameState.get(frame).update(UPDATE.Schedule);
}
</script>

<template>
  <Player :ref="playerRef('main')"
          :title="title"
          :date="date"
          :lastmod="lastmod"
          :frame="frame"
          :paused="false"
          @load="(frame) => onPlayerLoaded(frame, editors.main, 'heart')" />
  <Column>
    <Section heading="Controls">
      <PropertyEditor :ref="editorRef('main')"
                      :properties="getShaderProperties('heart', {
                        'uShowReticle': { default_value: false },
                        'uInsideColor': { default_value: [1.0, 0.0, 0.0] },
                        'uOutsideColor': { default_value: [0.0, 0.0, 1.0] },
                        'heart.uAnimate': { default_value: true },
                      })"
                      @property-changed="(name) => onPlayerPropertyChanged(players.main.player_frame, name)" />
    </Section>

    <Section heading="What is a signed-distance function (SDF)?">
      <p>
        A <ExternalLink to="https://en.wikipedia.org/wiki/Signed_distance_function">signed-distance function</ExternalLink> (SDF) or signed-distance field, is a function which computes the signed-distance between any point and the nearest surface or boundary.
        The sign of the result indicates whether a point is inside (negative), outside (positive), or on the surface (0) of a shape boundary, similar to how the dot product of two vectors indicates whether they point in similar (positive), opposing (negative), or perpendicular (0) directions.
      </p>
    </Section>

    <Section heading="Colors Used">
      <p>
        The example shaders and diagrams below will represent <b>positive</b> values with <b>red</b> and <b>negative</b> values with <b>blue</b>.
        This will cause the heart example below to appear inverted.
        These colors were selected arbitrarily to mirror common colors for north and south magnetic poles.
      </p>
    </Section>

    <Section heading="Foundation">
      <p>
        To help illustrate the concept of a signed-distance function, consider the following examples of a point and a line segment on a <b>1-D</b> number line.
        For any point <b>P</b>, values other than <b>P</b> will yield a positive signed-distance, the absolute difference from <b>P</b>.
      </p>
      <br />
      <Figure src_light="/images/projects/sdf/foundation_sdf_point_light.png"
              src_dark="/images/projects/sdf/foundation_sdf_point_dark.png"
              alt="An abstract number line with an illustrated distance field above, with point 'P' at the center where the value is lowest (zero), extending outward towards positive infinity both to the left and right where the value will be the highest." />
      <br />
      <p>
        To create a line segment centered around <b>P</b>, the point can be inflated by subtracting a <b>radius</b> or <b>half-length</b>.
        Afterwards, any point within the edge will have a negative signed-distance, and any point outside the edge will be positive.
      </p>
      <br />
      <Figure src_light="/images/projects/sdf/foundation_sdf_segment_light.png"
              src_dark="/images/projects/sdf/foundation_sdf_segment_dark.png"
              alt="An abstract number line with an illustrated distance field above, with point 'P' at the center and radius 'R' which extends from 'P' a fixed amount in both directions.
                  The value is lowest (negative) at 'P', zero at the boundary 'R', and extending outward towards positive infinity from the boundary where the value will be the highest." />
    </Section>

    <Section heading="Points and Circles">
      <p>
        The easiest shape to implement is likely a point, or its inflated 2D/3D forms (circle, sphere) which are offsets of the point function.
        Intuitively the signed-distance from a point is either <b>0</b> at the exact center or <b>>0</b>.
        Subtracting a radius from this value inflates the shape, with negative values falling inside the boundary formed at the radius.
      </p>
      <br />
      <Code lang="cpp"
            caption="Circle signed-distance function."
            :text="shader_templates.get('circle').sdf_function" />
      <br />
      <Player :ref="playerRef('circle')"
              title="Circle"
              :date="date"
              :lastmod="lastmod"
              :frame="frame"
              :paused="false"
              @load="(frame) => onPlayerLoaded(frame, editors.circle, 'circle')" />
      <br />
      <PropertyEditor :ref="editorRef('circle')"
                      :properties="getShaderProperties('circle')"
                      @property-changed="(name) => onPlayerPropertyChanged(players.circle.player_frame, name)" />
      </Section>

      <Section heading="Planes">
      <p>
        Next is a plane, which could be defined with a unit vector, and an optional offset from the origin along the normal.
        The offset is optional because applying transformations to the UV coordinate could also orient and pivot the plane around any target point, demonstrated by adjusting the shader's <b>Camera</b> settings.
      </p>
      <br />
      <Code lang="cpp"
            caption="Plane signed-distance function."
            :text="shader_templates.get('plane').sdf_function" />
      <br />
      <Player :ref="playerRef('plane')"
              title="Plane"
              :date="date"
              :lastmod="lastmod"
              :frame="frame"
              :paused="false"
              @load="(frame) => onPlayerLoaded(frame, editors.plane, 'plane')" />
      <br />
      <PropertyEditor :ref="editorRef('plane')"
                      :properties="getShaderProperties('plane')"
                      @property-changed="(name) => onPlayerPropertyChanged(players.plane.player_frame, name)" />
    </Section>

    <Section heading="Symmetry">
      <p>
        When a shape can be mirrored, centering the shape along the origin may simplify the math involved.
        For example, mirroring across the horizontal or vertical axis can be achieved by taking the absolute value of their respective UV component when the shape is centered at the origin.
      </p>
      <br />
      <Code lang="cpp"
            caption="Mirrored shapes signed-distance function."
            :text="shader_templates.get('mirror').sdf_function" />
      <br />
      <Player :ref="playerRef('mirror')"
              title="Mirrored Shapes"
              :date="date"
              :lastmod="lastmod"
              :frame="frame"
              :paused="false"
              @load="(frame) => onPlayerLoaded(frame, editors['mirror'], 'mirror')" />
      <br />
      <PropertyEditor :ref="editorRef('mirror')"
                      :properties="getShaderProperties('mirror')"
                      @property-changed="(name) => onPlayerPropertyChanged(players['mirror'].player_frame, name)" />
    </Section>

    <Section heading="Insets and Outsets">
      <p>
        Outlines can easily be rendered by creating a value band near zero, the boundary of the shape.
        This can be further discriminated by treating negative values as insets and positive values as outsets.
        Rendering both insets and outsets as separate high contrast colors can help make shapes more readable over noisy backgrounds.
      </p>
      <br />
      <Code lang="cpp"
            caption="Simple SDF draw call with 4 layers: [outside, outset, inset, inside]."
            text="
        vec4 draw(float sdf) {
          if (sdf + uInsetWidth <= 0.0) {
            return uInsideColor;
          } else if (sdf - uOutsetWidth > 0.0) {
            return uOutsideColor;
          } else {
            return (sdf > 0.0) ? uOutsetColor : uInsetColor;
          }
        }
      " />
    </Section>

    <Section heading="Combining Shapes">
      <UnderConstruction />
    </Section>

    <Section heading="Compositing a Heart">
      <UnderConstruction />
      <br />
      <Details summary="Heart Signed-distance Function">
      <Code lang="cpp"
            caption="Heart signed-distance function."
            :text="shader_templates.get('heart').sdf_function" />
      </Details>
      <br />
      <Player :ref="playerRef('heart')"
          title="Heart"
          :date="date"
          :lastmod="lastmod"
          :frame="frame"
          :paused="false"
          @load="(frame) => onPlayerLoaded(frame, editors.heart, 'heart')" />
      <br />
      <PropertyEditor :ref="editorRef('heart')"
                      :properties="getShaderProperties('heart')"
                      @property-changed="(name) => onPlayerPropertyChanged(players.heart.player_frame, name)" />
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
