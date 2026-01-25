<script setup lang="ts">
import { computed, ref, toRaw, unref } from 'vue'
import Code from '@/components/code.vue'
import Column from '@/components/column.vue'
import Details from '@/components/details.vue'
import ExternalLink from '@/components/external_link.vue'
import Figure from '@/components/figure.vue'
import Formula from '@/components/formula.vue'
import Player from '@/components/player.vue'
import { PlayerState } from '@/types/player_state'
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
import useIntersectionObserver from '@/util/use_intersection_observer';
//
import UnderConstruction from '@/components/under_construction.vue'
import WebPageCitation from '@/components/citation/web_page_citation.vue'

const players = {};
const editors = {};
const player_states = ref({});
const section_states = ref({});

const { observe: mapSectionIntersectionObserver } = useIntersectionObserver((key, entry, _index, _array) => {
  section_states.value[key] = entry.isIntersecting;
});

const { observe: mapPlayerIntersectionObserver } = useIntersectionObserver((key, entry, _index, _array) => {
  player_states.value[key] = entry.isIntersecting;
});

function makeSectionRef(key) {
  return (e) => {
    mapSectionIntersectionObserver(key, e?.$el);
  };
}

function makePlayerRef(key) {
  return (e) => {
    players[key] = e;
    mapPlayerIntersectionObserver(key, e?.$el);
  };
}

function makeEditorRef(key) {
  return (e) => {
    editors[key] = e;
  };
}

function getPlayerState(section_key: string, player_key: string) {
  return (section_states.value[section_key] || player_states.value[player_key])
      ? PlayerState.Playing
      : PlayerState.Empty;
}

const UPDATE = {
  Auto: 0,
  Schedule: 1,
  Now: 2,
};

enum UniformType {
  bool = 'bool',
  float = 'float',
  int = 'int',
  uint = 'uint',
  vec2 = 'vec2',
  vec3 = 'vec3',
  vec4 = 'vec4',
  bvec2 = 'bvec2',
  bvec3 = 'bvec3',
  bvec4 = 'bvec4',
  ivec2 = 'ivec2',
  ivec3 = 'ivec3',
  ivec4 = 'ivec4',
  uvec2 = 'uvec2',
  uvec3 = 'uvec3',
  uvec4 = 'uvec4',
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
    var time_scale = unref(this.editor)?.get('game.time_scale') ?? 1.0;

    this.frame.contentWindow?.postMessage({ sources, uniforms, time_scale }, window.location.origin);
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
  return `#version 300 es
    precision mediump float;

    // Constants
    const float EPSILON = 0.001;
    const float PI = 3.1415926535897932384626433832795;
    const float TAU = 6.283185307179586476925286766559;
    const float kAxisSize = 0.001875;
    const float kReticleMinor = 0.0025;
    const float kReticleMajor = 0.025;
    const float kAnimationFrequency = 0.7;

    in vec2 UV;

    out vec4 vColor;

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
    float sdf_subtraction(float a, float b) { return max(a, -b); }

    float sdf_circle(vec2 p, float inflate) {
      return length(p) - inflate;
    }

    float sdf_circle(float len, float inflate) {
      return len - inflate;
    }

    float sdf_torus(vec2 p, float r, float inflate) {
      return abs(sdf_circle(p, r)) - inflate;
    }

    float sdf_torus(float len, float r, float inflate) {
      return abs(sdf_circle(len, r)) - inflate;
    }

    float sdf_plane(vec2 p, vec2 unit_direction) {
      return dot(p, unit_direction);
    }

    float sdf_rectangle(vec2 p, vec2 inflate) {
      // https://iquilezles.org/articles/distfunctions2d/
      vec2 d = abs(p) - inflate;
      return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
    }

    float sdf_reticle(vec2 p) {
      p = abs(p) / uScale;
      float sdf_plus = sdf_union(sdf_rectangle(p, vec2(kReticleMinor, kReticleMajor)),
                                 sdf_rectangle(p, vec2(kReticleMajor, kReticleMinor)));
      float sdf_square = max(p.x, p.y) - (0.5 * kReticleMajor);
      return sdf_subtraction(sdf_plus, sdf_square);
    }

    float sdf_axis(vec2 p, float inflate) {
      p = abs(p / uScale);
      return min(p.x, p.y) - inflate;
    }

    float sdf_line(vec2 p, vec2 unit_normal, float stroke_width) {
      return abs(sdf_plane(p, unit_normal)) - (stroke_width * 0.5);
    }

    float sdf_function(vec2 p) {
      ${sdf_function}
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

      if (uShowReticle) {
        float reticle = sdf_reticle(p);
        if (abs(reticle) <= kReticleMinor) {
          vColor = vec4(vec3((reticle <= 0.0) ? 1.0 : 0.0), 1.0);
          return;
        }
      }
      if (uShowAxis) {
        float sdf = sdf_axis(p, kAxisSize * 0.5);
        if (abs(sdf) <= kAxisSize) {
          float smooth_sdf = smoothstep((kAxisSize * 0.5)-EPSILON, (kAxisSize * 0.5), sdf);
          vColor = vec4(mix(vec3(1.0), vec3(0.0), smooth_sdf), 1.0);
          return;
        }
      }
      float sdf = sdf_function(p);
      vColor = gradient_bands(draw(sdf), sdf, 0.1);
    }
  `;
}

const shared_uniforms = [
  new Uniform(UniformType.bool, 'uShowReticle'),
  new Uniform(UniformType.bool, 'uShowAxis'),
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
        new Uniform(UniformType.int, 'uMode'),
        new Uniform(UniformType.float, 'uAnimationAmplitude'),
        new Uniform(UniformType.float, 'uBlendToCircle'),
        new Uniform(UniformType.int, 'uCompositionStep'),
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
        vec2 mirrored_p = vec2(abs(p.x), p.y);

        // Switch between user control and custom animation.
        float r;
        switch (uMode) {
          case 0: // Heartbeat Animation
            float animation_time = (uTime * TAU) * kAnimationFrequency;
            float wave1 = 0.5 + 0.5 * cos(animation_time);
            float wave2 = 0.5 + 0.5 * cos(animation_time * 2.0);
            float t = min(wave1, wave2);
            r = mix(kMinRadius, mix(kMinRadius, kMaxRadius, uAnimationAmplitude), t);
            break;
          case 1: // Step By Step Composition
            r = mix(kMinRadius, kMaxRadius, uBlendToCircle);
            break;
          case 2:
          default: // Blend To Circle
            r = mix(kMinRadius, kMaxRadius, uBlendToCircle);
            break;
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
        vec2 d_to_p = mirrored_p - d;
        vec2 c_to_p = mirrored_p - c;

        // Ordinarily, these SDF calculations would be computed
        // only within the branch needed. Placing here for demo
        // purposes, since it makes uCompositionStep easier to
        // implement.

        // An SDF circle which forms the right half of the mirrored heart lobes.
        float mirrored_lobes_sdf = sdf_circle(c_to_p, r);
        // An inverted SDF point which forms the upward curve between the lobes of the heart, only values <= 0.
        float inverted_point_sdf = -sdf_circle(d_to_p, 0.0);
        // An SDF plane, collinear with points <A> and <T>, with the positive side towards the 4th quadrant away from the shape.
        float mirrored_plane_sdf = sdf_plane(mirrored_p - a, n);

        bool heart_lobe_mask = dot(d_to_p, rot90_cw(d - c)) > 0.0 &&
                               dot(c_to_p, rot90_ccw(n)) > 0.0;

        if (uMode == 1) {
          switch (uCompositionStep) {
            case 0: // Mirrored circle heart lobes.
              return mirrored_lobes_sdf;

            case 1: // Mirrored Plane
              return mirrored_plane_sdf;
            case 2: // Circle with (inverted) Plane (for visibility)
              return sdf_subtraction(mirrored_plane_sdf, mirrored_lobes_sdf);
            case 3: // Heart Lobe Draw Region
              if (!heart_lobe_mask) {
                discard;
              }
              return mirrored_lobes_sdf;
            case 4: // Plane Draw Region
              if (heart_lobe_mask) {
                discard;
              }
              return mirrored_plane_sdf;
            case 5: // Incomplete Composition (Without inverted point)
              return heart_lobe_mask ? mirrored_lobes_sdf : mirrored_plane_sdf;
            case 6: // Circle and (positive) Point
              return heart_lobe_mask ? mirrored_lobes_sdf : -inverted_point_sdf;
            case 7: // Circle and (negative) Point
              return heart_lobe_mask ? mirrored_lobes_sdf : inverted_point_sdf;
            case 8: // Plane and (positive) Point
              return sdf_intersection(inverted_point_sdf, mirrored_plane_sdf);
            case 9: // Final Shape (without mirroring)
              bool unmirrored_heart_lobe_mask = dot(p - d, rot90_cw(d - c)) > 0.0 &&
                                                dot(p - c, rot90_ccw(n)) > 0.0;
              return unmirrored_heart_lobe_mask
                  ? sdf_circle(p - c, r)
                  : sdf_intersection(-sdf_circle(p - d, 0.0), sdf_plane(p - a, n));
            case 10: // Final Render
              return heart_lobe_mask
                  ? mirrored_lobes_sdf
                  : sdf_intersection(inverted_point_sdf, mirrored_plane_sdf);
            default:
              break;
          }
        }

        return heart_lobe_mask
            ? mirrored_lobes_sdf
            : sdf_intersection(inverted_point_sdf, mirrored_plane_sdf);
      `,
    }
  ],
  [
    'circle', {
      label: "Circle",
      uniforms: [
        new Uniform(UniformType.float, 'uRadius'),
        new Uniform(UniformType.int, 'uMode'),
        new Uniform(UniformType.float, 'uRingStrokeWidth'),
      ],
      sdf_function: `
        float sdf = length(p) - uRadius;
        switch (uMode) {
          case 0:
          default: // Circle
            break;
          case 1: // Ring (Within Radius)
            float half_extent = uRingStrokeWidth * 0.5;
            sdf = abs(sdf + half_extent) - half_extent;
            break;
          case 2: // Ring (Centered on Radius)
            sdf = abs(sdf) - (uRingStrokeWidth * 0.5);
            break;
        }
        return sdf;
      `,
    }
  ],
  [
    'plane', {
      label: "Plane",
      uniforms: [
        new Uniform(UniformType.bool, 'uMirror'),
        new Uniform(UniformType.vec2, 'uNormal', degToVec2), // TBD vector editor
        new Uniform(UniformType.float, 'uDistanceFromOrigin'),
      ],
      sdf_function: `
        float sdf = dot(p, uNormal);
        if (uMirror) {
          sdf = abs(sdf);
        }
        return sdf - uDistanceFromOrigin;
      `,
    }
  ],
  [
    'capsule', {
      label: "Capsule",
      uniforms: [
        new Uniform(UniformType.bool, 'uInvertPlane'),
        new Uniform(UniformType.int, 'uAxis'),
        new Uniform(UniformType.float, 'uRadius'),
        new Uniform(UniformType.float, 'uLength'),
      ],
      sdf_function: `
        p = abs(p);
        float extent = uLength * 0.5;
        if (p[uAxis] <= extent) {
          float invert = (uInvertPlane ? -1.0 : 1.0);
          vec2 perpendicular = vec2(1.0);
          perpendicular[uAxis] = 0.0;
          return (sdf_plane(p, perpendicular) - uRadius) * invert;
        } else {
          vec2 offset = vec2(0.0);
          offset[uAxis] = extent;
          return sdf_circle(p - offset, uRadius);
        }
      `,
    }
  ],
  [
    'venn-diagram', {
      label: "Venn Diagram",
      uniforms: [
        new Uniform(UniformType.int, 'uOp'),
      ],
      sdf_function: `
        float left = sdf_circle(p + vec2(0.25, 0.0), 0.4);
        float right = sdf_circle(p - vec2(0.25, 0.0), 0.4);

        switch (uOp) {
          case 0: return min(left, right);                          // union
          case 1: return max(left, right);                          // intersection
          case 2: return max(left, -right);                         // subtraction
          case 3: return max(min(left, right), -max(left, right));  // Xor
        }
      `,
    }
  ],
  [
    'mirror', {
      label: "Mirrors",
      uniforms: [
        new Uniform(UniformType.int, 'uShape',),
        new Uniform(UniformType.bool, 'uHorizontalMirror'),
        new Uniform(UniformType.bool, 'uVerticalMirror'),
      ],
      sdf_function: `
        if (uHorizontalMirror) {
          p.x = abs(p.x);
        }
        if (uVerticalMirror) {
          p.y = abs(p.y);
        }
        const float cos45 = 0.70710678118654752440084436210485;
        switch (uShape) {
          case 0: // Ring and Circles
            const float ring_core = 0.4;
            const float ring_inflate = 0.025;
            const float dot_size = 0.075;

            float t = uTime * TAU * 0.25;
            vec2 path = vec2(cos(t), sin(t)) * ring_core;

            float sdf = sdf_torus(p, ring_core, ring_inflate);
            sdf = sdf_union(sdf, sdf_circle(p - path, dot_size));
            sdf = sdf_union(sdf, sdf_rectangle(p - rot90_cw(path), vec2(dot_size)));
            sdf = sdf_union(sdf, sdf_circle(p - vec2(cos45) * ring_core, dot_size));
            return sdf;
          case 1: // Plane
            return sdf_plane(p, vec2(cos45, -cos45));
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
 * e.g., ('my-shader', { 'uInsideColor': { default_value: [1.0, 0.0, 0.0, 1.0] } })
 *
 * @param shader_key The key/name of the shader program to load.
 * @param property_overlay Object containing key-value pairs ([uniform_key, IPropertyOptions_instance_overrides]). The key names the uniform which will be overridden, and the value is an object which partially implements the derived IPropertyOptions type containing which key/value pairs to override.
 */
function getShaderProperties(shader_key, property_overlay) {
  const group_overlays_open = ref(null);
  const group_camera_open = ref(null);
  const group_colors_open = ref(null);
  const group_border_open = ref(null);
  const camera_scale = ref(null);
  var local_properties = [
    new DividerOptions('divider-common', 'Common'),
    new GroupOptions('group-overlays', 'Overlays', false).setModel(group_overlays_open),
    new ToggleOptions('uShowReticle', 'Show Origin Reticle', false).setCollapsed(computed(() => !group_overlays_open.value)),
    new ToggleOptions('uShowAxis', 'Show Cardinal Axis', false).setCollapsed(computed(() => !group_overlays_open.value)),
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
    new NumberRangeOptions('uInsetWidth', 'Inset Width', 0.01, 0, 0.1, 0.001).setCollapsed(computed(() => !group_border_open.value)),
    new NumberRangeOptions('uOutsetWidth', 'Outset Width', 0.01, 0, 0.1, 0.001).setCollapsed(computed(() => !group_border_open.value)),
  ];

  switch (shader_key) {
    case 'heart':
      const mode = ref(null);
      local_properties = [
        ...local_properties,
        new DividerOptions('divider-heart', 'SDF Heart'),
        new ComboBoxOptions('heart.uMode', 'Mode', 0, [
          [0, 'Heartbeat Animation'],
          [1, 'Step By Step Composition'],
          [2, 'Blend To Circle'],
        ]).setModel(mode),
        new NumberRangeOptions('game.time_scale', 'Time Scale', 1.0, -2.0, 2.0, 0.25).setCollapsed(computed(() => mode.value !== 0)),
        new NumberRangeOptions('heart.uAnimationAmplitude', 'Animation Amplitude', 1.0, 0, 1, 0.01).setCollapsed(computed(() => mode.value !== 0)),
        new NumberRangeOptions('heart.uBlendToCircle', 'Blend To Circle', 0.0, 0, 1, 0.01).setCollapsed(computed(() => mode.value === 0)),
        new NumberRangeOptions('heart.uCompositionStep', 'Composition Step', 10, 0, 10, 1).setCollapsed(computed(() => mode.value !== 1)),
      ];
      break;
    case 'circle':
      const circle_mode = ref(null);
      local_properties = [
        ...local_properties,
        new DividerOptions('divider-circle', 'SDF Circle'),
        new NumberRangeOptions('circle.uRadius', 'Radius', 0.5, 0, 1, 0.01),
        new ComboBoxOptions('circle.uMode', 'Mode', 0, [
          [0, 'Circle'],
          [1, 'Ring (Within Radius)'],
          [2, 'Ring (Centered on Radius)'],
        ]).setModel(circle_mode),
        new NumberRangeOptions('circle.uRingStrokeWidth', 'Ring Radius', 0.1, 0, 1, 0.01).setCollapsed(computed(() => circle_mode.value == 0)),
      ];
      break;
    case 'plane':
      local_properties = [
        ...local_properties,
        new DividerOptions('divider-plane', 'SDF Plane'),
        new ToggleOptions('plane.uMirror', 'Mirror Plane', false),
        new NumberRangeOptions('plane.uNormal', 'Normal Angle', 0.0, 0, 360, 1),
        new NumberRangeOptions('plane.uDistanceFromOrigin', 'Distance From Origin', 0.0, -0.5, 0.5, 0.01),
      ];
      break;
    case 'capsule':
      local_properties = [
        ...local_properties,
        new DividerOptions('divider-capsule', 'SDF Capsule'),
        new ToggleOptions('capsule.uInvertPlane', 'Invert Plane SDF', true),
        new ComboBoxOptions('capsule.uAxis', 'Axis', 0, [
          [0, 'Horizontal'],
          [1, 'Vertical'],
        ]),
        new NumberRangeOptions('capsule.uRadius', 'Radius', 0.2, 0.0, 1.0, 0.01),
        new NumberRangeOptions('capsule.uLength', 'Length', 0.55, 0.0, 1.0, 0.01),
      ];
      break;
    case 'venn-diagram':
      local_properties = [
        ...local_properties,
        new DividerOptions('divider-venn-diagram', 'SDF Capsule'),
        new ComboBoxOptions('venn-diagram.uOp', 'Function', 0, [
          [0, 'Union'],
          [1, 'Intersection'],
          [2, 'Subtraction'],
          [3, 'Xor'],
        ]),
      ];
      break;
    case 'mirror':
      const mirror_shape = ref(null);
      local_properties = [
        ...local_properties,
        new DividerOptions('divider-mirror', 'Mirrored Plane'),
        new ComboBoxOptions('mirror.uShape', 'Shape', 0, [
          [0, 'Ring and Circles'],
          [1, 'Plane'],
        ]).setModel(mirror_shape),
        new ToggleOptions('mirror.uHorizontalMirror', 'Mirror Horizontally', false),
        new ToggleOptions('mirror.uVerticalMirror', 'Mirror Vertically', false),
        new NumberRangeOptions('game.time_scale', 'Time Scale', 1.0, -2.0, 2.0, 0.25).setCollapsed(computed(() => mirror_shape.value !== 0)),
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
      Object.entries(overlay).forEach(([key, value]) => props[key] = value);
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
  FrameState.get(frame)?.update(UPDATE.Schedule);
}

function onStepByStepPlayerLoaded(frame: HTMLIFrameElement, composition_step: int) {
  frame.contentWindow?.postMessage({
    sources: shader_definitions['heart'].sources,
    uniforms: [
      // Common
      ['uShowReticle',  {type: UniformType.bool, value: false}],
      ['uShowAxis',     {type: UniformType.bool, value: true}],
      ['uPositionX', {type: UniformType.float, value: 0}],
      ['uPositionY', {type: UniformType.float, value: 0}],
      ['uRotation', {type: UniformType.float, value: 0}],
      ['uScale', {type: UniformType.float, value: 1}],
      ['uInsideColor', {type: UniformType.vec4, value: [0.0, 0.0, 1.0, 1.0]}],
      ['uOutsideColor', {type: UniformType.vec4, value: [1.0, 0.0, 0.0, 1.0]}],
      ['uInsetColor', {type: UniformType.vec4, value: [1.0, 1.0, 1.0, 1.0]}],
      ['uOutsetColor', {type: UniformType.vec4, value: [0.0, 0.0, 0.0, 1.0]}],
      ['uInsetWidth', {type: UniformType.float, value: 0.01}],
      ['uOutsetWidth', {type: UniformType.float, value: 0.01}],
      // Heart Shape
      ['uMode', {type: UniformType.int, value: 1}],
      ['uAnimationAmplitude', {type: UniformType.float, value: 1}],
      ['uBlendToCircle', {type: UniformType.float, value: 0.2}],
      ['uCompositionStep', {type: UniformType.int, value: composition_step}],
    ],
  }, window.location.origin);
}
</script>

<template>
  <Player :ref="makePlayerRef('main')"
          :title="title"
          :date="date"
          :lastmod="lastmod"
          :frame="frame"
          :state="PlayerState.Playing"
          @load="(frame) => onPlayerLoaded(frame, editors['main'], 'heart')" />
  <Column>
    <Section heading="Controls">
      <PropertyEditor :ref="makeEditorRef('main')"
                      :properties="getShaderProperties('heart', {
                        'uInsideColor': { default_value: [1.0, 0.0, 0.0, 1.0] },
                        'uOutsideColor': { default_value: [0.0, 0.0, 1.0, 1.0] },
                        'uInsetWidth': { default_value: 0.0 },
                        'uOutsetWidth': { default_value: 0.0 },
                      })"
                      @property-changed="(name) => onPlayerPropertyChanged(players['main'].inner_frame, name)" />
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
        The animated frame at the top of the page has its colors reversed for aesthetics.
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

    <Section :ref="makeSectionRef('points-circles-rings')" heading="Points, Circles, and Rings">
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
      <Player :ref="makePlayerRef('circle')"
              title="Circle"
              :date="date"
              :lastmod="lastmod"
              :frame="frame"
              :state="getPlayerState('points-circles-rings', 'circle')"
              @load="(frame) => onPlayerLoaded(frame, editors['circle'], 'circle')" />
      <br />
      <PropertyEditor :ref="makeEditorRef('circle')"
                      :properties="getShaderProperties('circle')"
                      @property-changed="(name) => onPlayerPropertyChanged(players['circle'].inner_frame, name)" />
    </Section>

    <Section :ref="makeSectionRef('planes-lines')" heading="Planes and Lines">
      <p>
        Next is a plane, defined with a <b>unit vector normal</b> and an amount to offset the plane from the origin along the normal.
        The signed-distance between a point and a plane is the projected length onto the <b><u>unit</u> vector</b> using the <ExternalLink to="https://en.wikipedia.org/wiki/Dot_product">vector dot product</ExternalLink>.
        Creating a region of positive values on the side the <b>normal</b> vector is pointing, and negative values in the opposite direction.
      </p>
      <br />
      <p>
        A plane can be transformed into a line by taking the absolute value of the signed-distance, then subtract half the line width to <b>inflate</b> the shape boundary.
        This process is similar to how the signed-distance of a point can be <b>inflated</b> into a circle or sphere, or how the absolute distance field of a circle inflates into a torus.
        Taking the absolute value makes the lowest value in the distance field <b>zero</b> while maintaining distance to the boundary of the shape.
        Subtracting from the distance field <b>inflates</b> the boundary of the shape by shifting the field uniformly <b>away from the boundary</b>.
      </p>
      <br />
      <Code lang="cpp"
            caption="Plane signed-distance function."
            :text="shader_templates.get('plane').sdf_function" />
      <br />
      <Player :ref="makePlayerRef('plane')"
              title="Plane"
              :date="date"
              :lastmod="lastmod"
              :frame="frame"
              :state="getPlayerState('planes-lines', 'plane')"
              @load="(frame) => onPlayerLoaded(frame, editors['plane'], 'plane')" />
      <br />
      <PropertyEditor :ref="makeEditorRef('plane')"
                      :properties="getShaderProperties('plane', {
                        'uShowReticle': { default_value: true },
                        'uShowAxis': { default_value: true },
                      })"
                      @property-changed="(name) => onPlayerPropertyChanged(players['plane'].inner_frame, name)" />
    </Section>

    <Section :ref="makeSectionRef('symmetry')" heading="Symmetry">
      <p>
        When a shape can be mirrored, centering the shape along the origin may simplify the math involved.
        For example, mirroring across the horizontal or vertical axis can be achieved by taking the absolute value of their respective UV component when the shape is centered at the origin and drawn on the <b>positive</b> side of each mirrored axis.
      </p>
      <br />
      <Details summary="Mirrored Shapes Signed-distance Function">
        <Code lang="cpp"
              caption="Mirrored shapes signed-distance function."
              :text="shader_templates.get('mirror').sdf_function" />
      </Details>
      <br />
      <Player :ref="makePlayerRef('mirror')"
              title="Mirrored Shapes"
              :date="date"
              :lastmod="lastmod"
              :frame="frame"
              :state="getPlayerState('symmetry', 'mirror')"
              @load="(frame) => onPlayerLoaded(frame, editors['mirror'], 'mirror')" />
      <br />
      <PropertyEditor :ref="makeEditorRef('mirror')"
                      :properties="getShaderProperties('mirror', {
                        'uShowAxis': { default_value: true },
                      })"
                      @property-changed="(name) => onPlayerPropertyChanged(players['mirror'].inner_frame, name)" />
    </Section>

    <Section :ref="makeSectionRef('boolean-operations')" heading="Boolean Operations">
      <p>
        Shapes can be combined with an equivalent to boolean operators.
        These make it easier to create complex shapes, but don't guarantee the signed-distance field is accurate.
        Accurate signed-distance fields are generally preferred since they're more flexible, but boolean operations can quickly compose a shape when only the shape boundary or mask is needed.
      </p>
      <br />
      <Details summary="Venn Diagram: Boolean Operators">
        <Code lang="cpp"
              caption="SDF Venn Diagram boolean operators."
              :text="shader_templates.get('venn-diagram').sdf_function" />
      </Details>
      <br />
      <Player :ref="makePlayerRef('venn-diagram')"
              title="Venn Diagram"
              :date="date"
              :lastmod="lastmod"
              :frame="frame"
              :state="getPlayerState('boolean-operations', 'venn-diagram')"
              @load="(frame) => onPlayerLoaded(frame, editors['venn-diagram'], 'venn-diagram')" />
      <br />
      <PropertyEditor :ref="makeEditorRef('venn-diagram')"
                      :properties="getShaderProperties('venn-diagram')"
                      @property-changed="(name) => onPlayerPropertyChanged(players['venn-diagram'].inner_frame, name)" />
    </Section>

    <Section :ref="makeSectionRef('draw-regions')" heading="Draw Regions">
      <p>
        Another approach to compositing a shape is to slice the render into different draw regions.
        For example, consider the 2D capsule shape which is effectively an inflated line segment.
        There's a point at each cap, and a mirrored plane connecting them.
        Once inflated, the caps naturally form semi-circles that the edges of the two shapes align as they're expanded uniformly.
      </p>
      <br />
      <p>
        Fortunately this shape is symmetrical, so the function can be reduced to a single point and plane equation drawn in the first quadrant, then mirrored across both axis.
        However, the plane extends infinitely and will always be "closest" so the two shapes can't be joined with boolean operations.
        To fix this, the render can be split into two draw regions.
        The first is a plane drawn for any points between the origin and the end of the line segment.
        The second is a circle drawn for any points further than the end of the line segment.
      </p>
      <br />
      <Details summary="Aligned Capsule: Draw Regions">
        <Code lang="cpp"
              caption="Aligned capsule signed-distance function. Draws a circle and plane, mirrored across both axis, with two draw regions."
              :text="shader_templates.get('capsule').sdf_function" />
      </Details>
      <br />
      <Player :ref="makePlayerRef('capsule')"
              title="Aligned Capsule"
              :date="date"
              :lastmod="lastmod"
              :frame="frame"
              :state="getPlayerState('draw-regions', 'capsule')"
              @load="(frame) => onPlayerLoaded(frame, editors['capsule'], 'capsule')" />
      <br />
      <PropertyEditor :ref="makeEditorRef('capsule')"
                      :properties="getShaderProperties('capsule', {
                        'uShowAxis': { default_value: true },
                      })"
                      @property-changed="(name) => onPlayerPropertyChanged(players['capsule'].inner_frame, name)" />
    </Section>

    <Section heading="Boundaries, Insets, and Outsets">
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

    <Section :ref="makeSectionRef('compositing-a-heart')" heading="Compositing a Heart">
      <p>
        <UnderConstruction />
      </p>
      <br />
      <Player v-for="index in [...Array(10).keys()]"
              :ref="makePlayerRef(`heart-composition-step-${index}`)"
              :title="`Heart Composition Frame ${index}`"
              :date="date"
              :lastmod="lastmod"
              :frame="frame"
              :state="getPlayerState('compositing-a-heart', `heart-composition-step-${index}`)"
              @load="(frame) => onStepByStepPlayerLoaded(frame, index)" />
      <br />
      <Details summary="Heart Signed-distance Function">
        <Code lang="cpp"
              caption="Heart signed-distance function."
              :text="shader_templates.get('heart').sdf_function" />
      </Details>
      <br />
      <Player :ref="makePlayerRef('heart')"
          title="Heart"
          :date="date"
          :lastmod="lastmod"
          :frame="frame"
          :state="getPlayerState('compositing-a-heart', `heart`)"
          @load="(frame) => onPlayerLoaded(frame, editors['heart'], 'heart')" />
      <br />
      <PropertyEditor :ref="makeEditorRef('heart')"
                      :properties="getShaderProperties('heart', {
                        'uShowAxis': { default_value: true },
                        'heart.uMode': { default_value: 1 },
                        'heart.uBlendToCircle': { default_value: 0.2 },
                      })"
                      @property-changed="(name) => onPlayerPropertyChanged(players['heart'].inner_frame, name)" />
    </Section>

    <Section heading="Adding Animations">
      <p>
        <UnderConstruction />
      </p>
      <br />
      <Code lang="cpp"
            caption="Time based heartbeat animation cycle."
            text="
        float animation_time = (uTime * TAU) * kAnimationFrequency;
        float wave1 = 0.5 + 0.5 * cos(animation_time);
        float wave2 = 0.5 + 0.5 * cos(animation_time * 2.0);
        float t = min(wave1, wave2);
        r = mix(kMinRadius, mix(kMinRadius, kMaxRadius, uAnimationAmplitude), t);
      " />
    </Section>

    <Section heading="References">
      <WebPageCitation firstname='Inigo' lastname='Quilez'
                       website_title='Inigo Quilez' webpage_title='Inigo Quilez'
                       url='https://iquilezles.org/' />
      <WebPageCitation firstname='Inigo' lastname='Quilez'
                       website_title='Inigo Quilez' webpage_title='2D Distance Functions'
                       url='https://iquilezles.org/articles/distfunctions2d/' />
      <WebPageCitation firstname='Inigo' lastname='Quilez'
                       website_title='Inigo Quilez' webpage_title='2D Distance and Gradient Functions'
                       url='https://iquilezles.org/articles/distgradfunctions2d/' />
      <WebPageCitation firstname='Inigo' lastname='Quilez'
                       website_title='Inigo Quilez' webpage_title='3D Distance Functions'
                       url='https://iquilezles.org/articles/distfunctions/' />
    </Section>
  </Column>
</template>
