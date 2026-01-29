<script setup lang="ts">
import { computed, ref, toRaw, unref } from 'vue'
import Code from '@/components/code.vue'
import Column from '@/components/column.vue'
import Term from '@/components/term.vue'
import TermList from '@/components/term_list.vue'
import Details from '@/components/details.vue'
import ExternalLink from '@/components/external_link.vue'
import Figure from '@/components/figure.vue'
import Formula from '@/components/formula.vue'
import Note from '@/components/note.vue'
import Player from '@/components/player.vue'
import { PlayerState } from '@/types/player_state'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import Section from '@/components/section.vue'
import WebPageCitation from '@/components/citation/web_page_citation.vue'
import {
  Color4Options,
  ComboBoxOptions,
  DividerOptions,
  GroupOptions,
  NumberRangeOptions,
  ToggleOptions,
} from '@/util/property_editor/property_types'
//
import useIntersectionObserver from '@/util/use_intersection_observer';
import default_vertex_shader from '@/assets/shaders/default.vert?raw'

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
    const float PI = 3.1415926535897932384626433832795;
    const float TAU = 6.283185307179586476925286766559;
    const float kAxisSize = 0.005;
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

    float sdf_smooth_union(float a, float b, float k) {
        // https://iquilezles.org/articles/smin/
        float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
        return mix( b, a, h ) - k*h*(1.0-h);
    }

    float sdf_reticle(vec2 p) {
      p = abs(p) / uScale;
      float sdf_plus = sdf_union(sdf_rectangle(p, vec2(kReticleMinor, kReticleMajor)),
                                 sdf_rectangle(p, vec2(kReticleMajor, kReticleMinor)));
      float sdf_square = max(p.x, p.y) - (0.5 * kReticleMajor);
      return sdf_subtraction(sdf_plus, sdf_square);
    }

    float sdf_axis(vec2 p, uint component_index, float inflate) {
      float axis_sdf_unscaled = p[component_index ^ 1u] / uScale;
      return abs(axis_sdf_unscaled) - inflate;
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
      p -= vec2(0.5);       // move the origin to the center of the view.
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

      if (uShowAxisX || uShowAxisY) {
        float axis_extent = kAxisSize * 0.5;
        vec2 axis_sdf = vec2(
          uShowAxisX ? sdf_axis(p, 0u, axis_extent) : 0.0,
          uShowAxisY ? sdf_axis(p, 1u, axis_extent) : 0.0
        );
        float sdf = (uShowAxisX && uShowAxisY)
            ? sdf_union(axis_sdf.x, axis_sdf.y)
            : axis_sdf.x + axis_sdf.y;
        if (sdf <= 0.0) {
          float smooth_sdf = smoothstep(-axis_extent, 0.0, sdf);
          vColor = vec4(vec3(mix(1.0, 0.0, smooth_sdf)), 1.0);
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
  new Uniform(UniformType.bool, 'uShowAxisX'),
  new Uniform(UniformType.bool, 'uShowAxisY'),
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
        new Uniform(UniformType.bool, 'uHiddenCompositionAnimation'),
        new Uniform(UniformType.int, 'uCompositionStep'),
      ],
      sdf_function: `
        /*
         * Renders a heart shape that fits within 1 unit using 3 SDF functions.
         * 1. A circle around vector <C> with radius <R> in the upper-right corner,
         *    mirrored horizontally to form the heart lobes.
         * 2. A circle around vector <B> with no radius, collinear with the mirror
         *    axis to form the upward curve below vector <B>.
         * 3. A plane that connects vector <A> and vector <T> with the normal <N>
         *    pointing towards the 4th quadrant, mirrored horizontally.
         *
         * <A> = <vec2> @ point at the bottom of the shape, the image center-bottom.
         * <C> = <vec2> @ center of circle with radius <R>, mirrored horizontally.
         * <B> = <vec2> @ highest point where the mirrored heart lobes meet.
         * <T> = <vec2> @ tangent between point <A> and circle <C>.
         * <N> = unit <vec2> perpendicular to the edge connecting <A> and <T>.
         *
         * R = radius of circle <C>.
         * H = vertical distance between <C> and <B>; half the distance between
         *     the intersection points between the two mirrored circles.
         * K = horizontal offset of circle <C> from the center of the image;
         *     half distance between mirrored circles <C>.
         * S = distance between point <A> and the center of circle <C>.
         * Q = distance between point <A> and the tangent <T> of circle <C>;
         *     length of the tangent edge.
         *
         * All lines on the diagram below should be interpreted as straight
         * lines despite being jagged.
         *
         *  |===========================================|
         *  |            <B>                            |
         *  |           / | \\                           |
         *  |         /   |   \\                         |
         *  |       R     H     R                       |
         *  |     /       |       \\                     |
         *  |    /        |        \\                    |
         *  |   *----K----*----K---<C>                  |
         *  |    \\        |        /| \\                 |
         *  |     \\       |       / |  \\                |
         *  |       R     H     R   |   R               |
         *  |         \\   |   /     |    \\              |
         *  |           \\ | /      /      \\             |
         *  |             *       /       <T>           |
         *  |             |      S        /  \\          |
         *  |             |     /       /     \\         |
         *  |             |    /      /        <N>      |
         *  |             |   /     Q            \\      |
         *  |             |  /    /              _\\/    |
         *  |             | /   /                       |
         *  |             | | /                         |
         *  |             |//                           |
         *  |            <A>                            |
         *  |===========================================|
         */
        const float kMinRadius = 0.25;
        const float kMaxRadius = 0.5;
        p.x = abs(p.x);

        // Switch between user control and custom animation.
        float r;
        switch (uMode) {
          case 0: // Heartbeat Animation
            const float kMinAnimationRadius = 0.28;
            float animation_time = (uTime * TAU) * kAnimationFrequency;
            float wave1 = 0.5 + 0.5 * cos(animation_time);
            float wave2 = 0.5 + 0.5 * cos(animation_time * 2.0);
            float t = min(wave1, wave2);
            float amp = mix(kMinAnimationRadius, kMaxRadius, uAnimationAmplitude);
            r = mix(kMinAnimationRadius, amp, t);
            break;
          case 1: // Step By Step Composition
            if (uHiddenCompositionAnimation) {
              const float kFrequency = 0.1;
              float animation_time = (uTime * TAU) * kFrequency;
              float t = 0.5 + 0.5 * cos(animation_time);
              float amp = mix(kMinRadius, kMaxRadius, uAnimationAmplitude);
              r = mix(kMinRadius, amp, t);
            } else {
              r = mix(kMinRadius, kMaxRadius, uBlendToCircle);
            }
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

        // Compute the unit vector <N> by rotating a unit vector pointing
        // from <C> towards <A> counter-clockwise by theta, to avoid
        // calling trig functions. In this context, theta is the angle
        // between points <ACT>. The angle between <CTA> is a right-angle.
        float cos_theta = r/s;
        float sin_theta = q/s;
        vec2 unit_c_to_a = c_to_a / s;

        // // 2-D Rotation Matrix
        // mat2 rotation_theta = mat2(
        //   cos_theta, sin_theta, // column #1
        //   -sin_theta, cos_theta // column #2
        // );
        // vec2 n = rotation_theta * unit_c_to_a;
        // // Another form of the 2-D Rotation Matrix multiplication above.
        // vec2 n = (cos_theta * unit_c_to_a) +
        //          (sin_theta * rot90_ccw(unit_c_to_a));
        // Inline form of the 2-D Rotation Matrix multiplication above.
        vec2 n = vec2(cos_theta*unit_c_to_a.x - sin_theta*unit_c_to_a.y,
                      sin_theta*unit_c_to_a.x + cos_theta*unit_c_to_a.y);

        float h = sqrt(r - 0.25);
        vec2 b = vec2(0.0, c.y + h);
        vec2 a_to_p = p - a;
        vec2 c_to_p = p - c;
        vec2 d_to_p = p - b;

        // Typically these SDF calculations would be computed
        // only within the branch needed. Placing here for demo
        // purposes, to simplify uCompositionStep.

        // An SDF circle which forms the right half of the mirrored heart lobes.
        float mirrored_lobes_sdf = sdf_circle(c_to_p, r);
        // An SDF circle which forms the right half of the mirrored heart lobes.
        float lower_point_sdf = sdf_circle(a_to_p, 0.0);
        // An inverted SDF point which forms the upward curve between the lobes
        // of the heart, only values <= 0.
        float upper_point_inverted_sdf = -sdf_circle(d_to_p, 0.0);
        // An SDF plane, collinear with points <A> and <T>, with the positive side
        // towards the 4th quadrant away from the shape.
        float mirrored_plane_sdf = sdf_plane(a_to_p, n);


        // Compute masks to split the render into different drawing regions.
        // This is important to prevent shapes from overlapping each other.
        // 1. The 3 outer circle shapes: left and right heart lobes, and
        //    the lowest point where the mirrored planes meet.
        // 2. The plane and inner circle shapes.

        // Removes the regions to the left of or below the heart lobe edge, <B-C>.
        bool outer_mask_cd = (p.y > c.y) && dot(c_to_p, rot90_cw(b - c)) > 0.0;
        // Removes the regions to the left of or below the heart lobe edge, <T-C>.
        bool outer_mask_ct = (p.y <= c.y) && dot(c_to_p, rot90_ccw(n)) > 0.0;
        // Removes regions in the direction of the vector <A-T> and below <A>,
        // i.e., to the left of or below the perpendicular of the normal.
        bool outer_mask_an = (p.y <= a.y) && dot(a_to_p, rot90_cw(n)) > 0.0;
        bool outer_circles_mask = outer_mask_cd || outer_mask_ct || outer_mask_an;

        if (uMode == 1) {
          switch (uCompositionStep) {
            case 0: // Mirrored heart lobes and lower point
              return sdf_union(mirrored_lobes_sdf, lower_point_sdf);
            case 1: // Mirrored Plane
              return mirrored_plane_sdf;
            case 2: // Outer circle draw region
              if (!outer_circles_mask) {
                discard;
              }
              break;
            case 3: // Opposite draw region, incomplete (without inverted point)
              if (outer_circles_mask) {
                discard;
              }
              return mirrored_plane_sdf;
            case 4: // Incomplete Composition (Without inverted point)
              return outer_circles_mask
                  ? sdf_union(mirrored_lobes_sdf, lower_point_sdf)
                  : mirrored_plane_sdf;
            case 5: // Heart lobes with inverted point
              return outer_circles_mask
                  ? sdf_union(mirrored_lobes_sdf, lower_point_sdf)
                  : upper_point_inverted_sdf;
            case 6: // Plane with inverted point
              if (outer_circles_mask) {
                discard;
              }
              return sdf_intersection(upper_point_inverted_sdf, mirrored_plane_sdf);
            default: // Complete Composition
              break;
          }
        }

        return outer_circles_mask
            ? sdf_union(mirrored_lobes_sdf, lower_point_sdf)
            : sdf_intersection(upper_point_inverted_sdf, mirrored_plane_sdf);
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
        new Uniform(UniformType.bool, 'uSmoothMinimum'),
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

            float ring = sdf_torus(p, ring_core, ring_inflate);
            float circle = sdf_circle(p - path, dot_size);
            float orbitals = sdf_union(
                sdf_circle(p - vec2(cos45) * ring_core, dot_size),
                sdf_rectangle(p - rot90_cw(path), vec2(dot_size)));

            float outer_shapes = sdf_union(circle, orbitals);

            if (uSmoothMinimum) {
              float smooth_factor = mix(0.025, 0.1, (1.0-cos(t*0.5)));
              return sdf_smooth_union(ring, outer_shapes, smooth_factor);
            } else {
              return sdf_union(ring, outer_shapes);
            }
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
        vert: {source: default_vertex_shader},
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
    new ToggleOptions('uShowAxisX', 'Show X-Axis', false).setCollapsed(computed(() => !group_overlays_open.value)),
    new ToggleOptions('uShowAxisY', 'Show Y-Axis', false).setCollapsed(computed(() => !group_overlays_open.value)),
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
        new NumberRangeOptions('game.time_scale', 'Time Scale', 1.0, 0.0, 2.0, 0.25).setCollapsed(computed(() => mode.value !== 0)),
        new NumberRangeOptions('heart.uAnimationAmplitude', 'Animation Amplitude', 1.0, 0, 1, 0.01).setCollapsed(computed(() => mode.value !== 0)),
        new NumberRangeOptions('heart.uBlendToCircle', 'Blend To Circle', 0.0, 0, 1, 0.01).setCollapsed(computed(() => mode.value === 0)),
        new ToggleOptions('heart.uHiddenCompositionAnimation', '(Hidden) Composition Animation', false).setCollapsed(true),
        new NumberRangeOptions('heart.uCompositionStep', 'Composition Step', 7, 0, 7, 1).setCollapsed(computed(() => mode.value !== 1)),
      ];
      break;
    case 'circle':
      const circle_mode = ref(null);
      local_properties = [
        ...local_properties,
        new DividerOptions('divider-circle', 'SDF Circle'),
        new ComboBoxOptions('circle.uMode', 'Mode', 0, [
          [0, 'Circle'],
          [1, 'Ring (Within Radius)'],
          [2, 'Ring (Centered on Radius)'],
        ]).setModel(circle_mode),
        new NumberRangeOptions('circle.uRadius', 'Core Radius', 0.5, 0, 1, 0.01),
        new NumberRangeOptions('circle.uRingStrokeWidth', 'Annulus Radius', 0.1, 0, 1, 0.01).setCollapsed(computed(() => circle_mode.value == 0)),
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
        new ToggleOptions('mirror.uSmoothMinimum', 'Smooth Minimum', true).setCollapsed(computed(() => mirror_shape.value !== 0)),
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
      ['uShowAxisX',     {type: UniformType.bool, value: false}],
      ['uShowAxisY',     {type: UniformType.bool, value: true}],
      ['uPositionX', {type: UniformType.float, value: 0}],
      ['uPositionY', {type: UniformType.float, value: 0}],
      ['uRotation', {type: UniformType.float, value: 0}],
      ['uScale', {type: UniformType.float, value: 1.5}],
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
      ['uHiddenCompositionAnimation', {type: UniformType.bool, value: true}],
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
        A <ExternalLink to="https://en.wikipedia.org/wiki/Signed_distance_function">signed-distance function</ExternalLink> (<abbr>SDF</abbr>) or signed-distance field, is a function which computes the signed-distance between any point and the nearest surface or boundary.
        The sign of the result indicates whether a point is inside (negative), outside (positive), or on the surface (0) of a shape boundary, like how the dot product of two vectors indicates whether they point in similar (positive), opposing (negative), or perpendicular (0) directions.
      </p>
    </Section>

    <Section heading="Scope and Inspiration">
      <p>
        This page is a somewhat structured accumulation of notes and demos related to signed-distance fields and their properties.
        While the goal for this page isn't a comprehensive guide, readers familiar with <ExternalLink to="https://en.wikipedia.org/wiki/Shading_language">shading languages</ExternalLink> and the graphics pipeline should be able to recreate the demos and create simple scenes after reading.
        I'll briefly discuss how to derive the distance field of a few shape primitives, and how to compose simple complex shapes including an <b>aligned capsule</b> and <b>heart</b> shape.
      </p>
      <br />
      <p>
        For this exercise I wanted to experiment with signed-distance fields (<abbr>SDF</abbr>) for rendering game user interface elements and shader effects.
        This also gave me an excuse to begin implementing a shader viewport for more interesting demos going forward.
        The new viewport behaves like the viewport in <ExternalLink to="https://www.shadertoy.com/">ShaderToy</ExternalLink>, providing a few predefined uniforms like elapsed time and viewport size automatically, built with my simple <RouterLink to="/projects/proto_engine">WebGL Proto-Engine</RouterLink>.
      </p>
      <br />
      <p>
        This was heavily inspired by the work of Inigo Quilez on <ExternalLink to='https://iquilezles.org/articles/distfunctions2d/'>2D distance functions</ExternalLink>.
        I recreated the heart shape and designed it to fill a 1x1 UV unit, with adjustable heart lobes which are used to animate and morph the shape.
      </p>
      <br />
      <p>
        I strongly encourage readers to also review the <b>References</b> section at the end for more information on signed-distance functions.
      </p>
    </Section>

    <Section heading="Technical Notes">
      <p>
        Before diving in, it's worth covering a few important details about the technical demos on this page.
      </p>
      <br />
      <p>
        All shaders are targeting <ExternalLink to="https://en.wikipedia.org/wiki/OpenGL_Shading_Language">GLSL ES Version 3</ExternalLink>. As of writing, that's the latest version supported by the <ExternalLink to="https://registry.khronos.org/webgl/specs/latest/2.0/">WebGL 2.0 Specification</ExternalLink>.
        Using the default UV coordinate system; origin in the lower-left corner, <b>U</b> extends to the right, <b>V</b> extends upwards, positive rotations are counter-clockwise, and UV component ranges are <b class="no-wrap">[0.0, 1.0]</b>.
      </p>
      <br />
      <p>
        The WebGL context is configured with an orthographic projection, drawing a single quad to fill the render target with the results of an attached shader.
        Before calling the signed-distance function, UV coordinates are translated so the resulting image is centered and scaled based on frame resolution to fit the frame vertically and avoid stretching or <ExternalLink to="https://en.wikipedia.org/wiki/Letterboxing_(filming)">letterboxing</ExternalLink> the final image.
      </p>
    </Section>

    <Section heading="Colors Used">
      <p>
        The example shaders and diagrams below represent <b>positive</b> values with <b>red</b> and <b>negative</b> values with <b>blue</b>.
        The animated frame at the top of the page has its colors reversed for aesthetics.
        These colors were selected arbitrarily to mirror common colors for north and south magnetic poles.
      </p>
    </Section>

    <Section heading="Foundation">
      <p>
        To help illustrate the concept of a signed-distance function, consider the following examples on a <b>1-D</b> number line.
      </p>
      <br />
      <ol class="foundation-steps">
        <li>
          <p>
            The difference between points <b>P</b> and <b>Q</b>, in the form <b>Q-P</b>.
            This creates the signed distance function of a <b>1-D</b> edge.
            With <b>negative</b> values extend infinitely to the left of <b>P</b> where <b>Q&lt;P</b> and <b>positive</b> values extend infinitely to the right of <b>P</b> where <b>Q&gt;P</b>.
          </p>
          <br/>
          <Figure src_light="/images/projects/sdf/foundation_sdf_edge_light.png"
                  src_dark="/images/projects/sdf/foundation_sdf_edge_dark.png"
                  alt="Abstract (1-D) number line illustrating the signed-distance function 'Q-P'." />
        </li>
        <li>
          <p>
            Taking the absolute value raises the floor of the function to zero while maintaining relative distances to the boundary.
            This creates the signed distance function of a <b>1-D</b> point.
          </p>
          <br/>
          <Figure src_light="/images/projects/sdf/foundation_sdf_point_light.png"
                  src_dark="/images/projects/sdf/foundation_sdf_point_dark.png"
                  alt="Abstract (1-D) number line illustrating the signed-distance function 'abs(Q-P)'." />
        </li>
        <li>
          <p>
            Subtracting a <b>radius</b>, <b>extents</b>, or <b>half-width</b> from the distance function inflates the boundary uniformly in all directions.
            This creates the signed distance function of a <b>1-D</b> line segment; a region centered around <b>P</b> extended by <b>R</b> in each direction.
            The distance is zero at both endpoints of the line segment, falling negative inside the region, and growing positive outside the region.
          </p>
          <br/>
          <Figure src_light="/images/projects/sdf/foundation_sdf_segment_light.png"
                  src_dark="/images/projects/sdf/foundation_sdf_segment_dark.png"
                  alt="Abstract (1-D) number line illustrating the signed-distance function 'abs(Q-P) - R'." />
        </li>
        <li>
          <p>
            Steps (2) and (3) can be repeated to inflate from the new boundary of the shape.
            Taking the absolute value of the distance field then subtracting another <b>radius</b> amount <b>L</b> inflates both endpoints of the line segment into new line segments that are each <b>2L</b> wide.
          </p>
          <br/>
          <Figure src_light="/images/projects/sdf/foundation_sdf_segment_abs_light.png"
                  src_dark="/images/projects/sdf/foundation_sdf_segment_abs_dark.png"
                  alt="Abstract (1-D) number line illustrating the signed-distance function 'abs(abs(Q-P) - R)'." />
          <Figure src_light="/images/projects/sdf/foundation_sdf_segment_abs_inflated_light.png"
                  src_dark="/images/projects/sdf/foundation_sdf_segment_abs_inflated_dark.png"
                  alt="Abstract (1-D) number line illustrating the signed-distance function 'abs(abs(Q-P) - R) - L'." />
        </li>
      </ol>
    </Section>

    <Section :ref="makeSectionRef('points-circles-rings')" heading="Points, Circles, and Rings">
      <p>
        The easiest shape to implement is likely a point, or its inflated 2D/3D forms (circle, sphere) which are offsets of the point function.
        Intuitively the signed-distance from a point is either <b>0</b> at the exact center or <b>&gt;0</b>.
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
        This process is like how the signed-distance of a point can be <b>inflated</b> into a circle or sphere, or how the <i>absolute</i> distance field of a circle inflates into a torus.
        Taking the absolute value makes the lowest value <i>possible</i> in the distance field <b>zero</b> while maintaining distance to the boundary of the shape.
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
                        'uShowAxisX': { default_value: true },
                        'uShowAxisY': { default_value: true },
                      })"
                      @property-changed="(name) => onPlayerPropertyChanged(players['plane'].inner_frame, name)" />
    </Section>

    <Section :ref="makeSectionRef('symmetry')" heading="Symmetry">
      <p>
        When a shape can be mirrored, centering the shape along the origin may simplify the math involved.
        For example, mirroring across the horizontal or vertical axis can be achieved by using the absolute value of their respective UV component when the shape is centered at the origin, causing anything drawn on the <b>positive</b> side of the axis to be mirrored, or the first quadrant when both axes are mirrored.
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
                        'uShowAxisX': { default_value: true },
                        'uShowAxisY': { default_value: true },
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

    <Section :ref="makeSectionRef('draw-regions')" heading="Drawing Regions">
      <p>
        Another approach to compositing a shape is to slice the render into different drawing regions.
        Consider a capsule shape which is effectively an inflated line segment.
      </p>
      <br />
      <p>
        Fortunately, capsules have symmetry across two perpendicular axes, so an aligned capsule can be mirrored from the first quadrant.
        One method of drawing a line segment is to draw a mirrored plane for the line body and a point at each endpoint.
        However, a plane extends infinitely and is always "closest" when compared with a collinear point, so the two shapes can't join with boolean operations.
      </p>
      <br />
      <p>
        To fix this, one approach is to split the render into two drawing regions:
      </p>
      <ul>
        <li>A plane drawn for any points between the origin and the end of the line segment.</li>
        <li>A point/circle drawn for any points further than the end of the line segment.</li>
      </ul>
      <br />
      <p>
        The default settings for the demo below inverts the <abbr>SDF</abbr> of the plane connecting the two points to highlight the drawing regions.
      </p>
      <br />
      <Details summary="Aligned Capsule: Drawing Regions">
        <Code lang="cpp"
              caption="Aligned capsule signed-distance function. Draws a circle and plane, mirrored across both axes, with two drawing regions."
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
                        'uShowAxisX': { default_value: true },
                        'uShowAxisY': { default_value: true },
                      })"
                      @property-changed="(name) => onPlayerPropertyChanged(players['capsule'].inner_frame, name)" />
    </Section>

    <Section heading="Boundaries, Insets, and Outsets">
      <p>
        Outlines can easily be rendered by creating a value band near zero, the boundary of the shape.
        Taking this a step further, negative and positive values could have different colors, creating separate inset and outset color bands.
        Rendering both insets and outsets as separate high contrast colors can help make shapes more readable over noisy backgrounds.
      </p>
      <br />
      <p>
        This is one example for how to draw separate layers, but how to approach this really depends on your design requirements.
        If the final texture was going to be a compositing mask, then maybe only values <b class="no-wrap"><= 0.0</b> need to be filled and everything else could be <b>discard</b>-ed.
        To the opposite extreme, arrays could be used to specify many colors and distance-threshold values, through shader uniforms, constants, or encoded in texture data if you have a suitable use case.
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
        To begin lets first analyze the shape to decide how to approach drawing it.
        There are many subtle variations and methods of drawing the <ExternalLink to="https://en.wikipedia.org/wiki/Heart_symbol">heart symbol</ExternalLink>.
        To keep things simple and keep the complexity of the shape low, this demo draws overlapping circles for the heart lobes and a mirrored plane for tangent lines that meet at the bottom forming a point.
      </p>
      <br />
      <p>
        The shape can be broken down as illustrated by the following diagram and key components:
      </p>
      <br />
      <Figure src_light="/images/projects/sdf/heart_geometry_light.png"
              src_dark="/images/projects/sdf/heart_geometry_dark.png"
              alt="Illustration of the geometry composing the heart shape used for this demo." />
      <br />
      <h2 class="heart-terms-heading"></h2>
      <TermList class="heart-terms" heading="Components">
        <Term term="A: Vertex">Where the tangent lines meet forming a triangular point, lowest point in the shape.</Term>
        <Term term="B: Vertex">Highest point where the mirrored heart lobes meet.</Term>
        <Term term="C: Vertex">Center point of the mirrored heart lobe.</Term>
        <Term term="T: Vertex">Point that forms a tangent between vertex <b>A</b> and circle <b>C</b>.</Term>
        <Term term="N: Unit Vector">A <b><u>unit</u></b> vector pointing from vertex <b>C</b> towards vertex <b>T</b>.</Term>
        <Term term="R: Length">The radius of the heart lobes.</Term>
        <Term term="H: Length">The <b>vertical distance</b> between vertex <b>C</b> and vertex <b>B</b>.</Term>
        <Term term="S: Length">The distance between vertex <b>A</b> and vertex <b>C</b>.</Term>
        <Term term="Q: Length">The distance between vertex <b>A</b> and vertex <b>T</b>.</Term>
        <Term term="θ: Angle">The angle required to turn a vector pointing from vertex <b>C</b> to vertex <b>A</b>, to then point towards the tangent vertex <b>T</b>.</Term>
      </TermList>
      <br />
      <p>
        For clarity, here are definitions for some of the vector math symbols used in the formula frames below.
      </p>
      <br />
      <Formula caption="2-D vector V, and its 2x1 matrix.">
        \begin{aligned}
          \text{vector} \\
          \left(\vec{V}\right) = \begin{bmatrix}
            \vec{V}_{x} \\
            \vec{V}_{y}
          \end{bmatrix}
        \end{aligned}
      </Formula>

      <Formula caption="Perpendicular of vector V, rotated 90-degrees counter-clockwise from vector V, and its 2x1 matrix.">
        \begin{aligned}
          \text{perpendicular of vector V, rotated 90-deg CCW} \\
          \left(\vec{V}_{\perp}\right) = \begin{bmatrix}
            -\vec{V}_{y} \\
            \vec{V}_{x}
          \end{bmatrix}
        \end{aligned}
      </Formula>

      <Formula caption="Unit vector V, with an identity.">
        \begin{aligned}
          \text{unit vector} \\
          \left(\hat{V}\right) = \left(\tfrac{\vec{V}}{||\vec{V}||}\right)
        \end{aligned}
      </Formula>

      <Formula caption="Vector difference between A and B, in the direction A towards B, with an identity.">
        \begin{aligned}
          \text{vector difference, A towards B} \\
          \left(\vec{AB}\right) = \left(\vec{B}-\vec{A}\right)
        \end{aligned}
      </Formula>

      <Formula caption="Unit vector in the direction A towards B, with an identity.">
        \begin{aligned}
          \text{unit vector, A towards B} \\
          \left(\hat{\vec{AB}}\right) = \left(\tfrac{\vec{AB}}{||\vec{AB}||}\right)
        \end{aligned}
      </Formula>
      <br />
      <p>
        It's best to start with known variables and constraints.
      </p>
      <br />
      <ul>
        <li>This shape needs to fill as much of a 1x1 UV unit as possible.</li>
        <li>The radius of the heart lobes will be used as an animation property, for morphing between a heart and a circle.</li>
        <li>The heart lobes must be <i>at least</i> tangent to each other to maintain the illusion of a heart shape.</li>
      </ul>
      <br />
      <p>
        For inputs, we know that <b>R</b> must be constrained to a minimum of half quadrant 1, and a maximum of half the UV space.
        This is the maximum range allowed for the heart and circle transformation to maintain the illusion and stay within bounds of the 1x1 UV unit space.
      </p>
      <br />
      <Formula caption="R is within range [0.25, 0.5]">
        R \in \left[\tfrac{1}{4},\tfrac{1}{2}\right]
      </Formula>
      <br />
      <p>
        So far both vertex <b>A</b> and <b>C</b> are known values.
        Vertex <b>A</b> must be the lower-midpoint of the UV space.
      </p>
      <br />
      <Formula caption="A is the point [0, -0.5]">
        \vec{A} = \begin{bmatrix}
          0 \\
          -\tfrac{1}{2}
        \end{bmatrix}
      </Formula>
      <br />
      <p>
        Vertex <b>C</b> is offset from both the top and right edges of the UV space by the radius <b>R</b>.
      </p>
      <br />
      <Formula caption="C is the point [0.5-R, 0.5-R]">
        \vec{C} = \begin{bmatrix}
          \tfrac{1}{2}-R \\
          \tfrac{1}{2}-R \\
        \end{bmatrix}
      </Formula>
      <br />
      <p>
        This is enough information to start drawing with.
        So, looking at what's been solved for:
      </p>
      <br />
      <Player :ref="makePlayerRef(`heart-composition-step-0`)"
              :title="`(Fig. 0) Mirrored Heart Lobe + Lower Point`"
              :date="date"
              :lastmod="lastmod"
              :frame="frame"
              :state="getPlayerState('compositing-a-heart', `heart-composition-step-0`)"
              @load="(frame) => onStepByStepPlayerLoaded(frame, 0)" />
      <br />
      <p>
        To draw the slope connecting vertex <b>A</b> and vertex <b>T</b>, we'll need to find the <b><i>direction</i></b> from vertex <b>C</b> to tangent vertex <b>T</b>, the location of the tangent isn't needed.
        There are a few ways to derive this value, and it's worth reviewing a few of them.
      </p>
      <br />
      <p>
        To find the tangent direction, we'll need the length <b>S</b>, the distance between vertices <b>A</b> and <b>C</b>.
      </p>
      <br />
      <Formula caption="S is the length between vertex A and C.">
        \begin{aligned}
        S &=& ||\vec{CA}|| = \sqrt{\left(\vec{CA} \cdot \vec{CA}\right)} \\
          &=& \sqrt{(\vec{A}_{x}-\vec{C}_{x})^2 + (\vec{A}_{y}-\vec{C}_{y})^2} \\
          &=& \sqrt{\left(R-\tfrac{1}{2}\right)^2 + (R-1)^2} \\
          &=& \sqrt{2R^2 - 3R + \left(\tfrac{5}{4}\right)} \\
        \end{aligned}
      </Formula>
      <br />
      <p>
        For the first approach, the tangent direction can be computed with a few trig functions.
        The angle of a vector pointing from vertex <b>C</b> to vertex <b>A</b> can be computed as the arctangent of the difference between their components.
        The angle needed to rotate a vector pointing from <b>C</b> to <b>A</b> counter-clockwise, to point towards vertex <b>T</b> can be computed as the arccosine of radius <b>R</b> and length <b>S</b>.
        Finally, the sum of the angles can be used to compute <b>N</b> using cosine and sine for the x and y components respectively.
      </p>
      <br />
      <p>
        This solution requires 4 trig functions which are relatively expensive operations.
      </p>
      <br />
      <Formula caption="unit vector N, computed through trig functions.">
        \begin{aligned}
          \alpha =& \arctan(\tfrac{\vec{CA}_{y}}{\vec{CA}_{x}}) \\
          \theta =& \arccos(\tfrac{R}{S}) \\
          \hat{N} =& \begin{bmatrix}
            \cos(\alpha+\theta) \\
            \sin(\alpha+\theta)
          \end{bmatrix}
        \end{aligned}
      </Formula>
      <br />
      <p>
        For the second approach, the tangent direction can be computed without trig functions by using a <ExternalLink to="https://en.wikipedia.org/wiki/Rotation_matrix">rotation matrix</ExternalLink> based on <b class="no-wrap">cos(θ)</b> and <b class="no-wrap">sin(θ)</b>, rather than computing the angle <b>θ</b>.
        This can be done by using perpendicular unit vectors, or with a rotation matrix.
      </p>
      <br />
      <p>
        With the length <b>Q</b> we can solve for <b class="no-wrap">cos(θ)</b> and <b class="no-wrap">sin(θ)</b>, rather than <b>θ</b> itself.
      </p>
      <br />
      <Formula caption="Q is the length between vertex A and T.">
        Q = \sqrt{S^2 - R^2}
      </Formula>

      <Formula caption="θ is the angle formed by the triangle vertices A, C, and T.">
        \begin{aligned}
          \cos(\theta)  &=& \left(\tfrac{R}{S}\right) \\
          \sin(\theta)  &=& \left(\tfrac{Q}{S}\right) \\
        \end{aligned}
      </Formula>
      <br />
      <p>
        Next create a unit vector pointing from vertex <b>C</b> to vertex <b>A</b>, scaling the difference between them by the inverse length <b>S</b> to normalize.
      </p>
      <br />
      <Formula caption="unit vector pointing from vertex C to vertex A.">
        \hat{\vec{CA}} = \tfrac{\vec{CA}}{S}
      </Formula>
      <br />
      <p>
        Then there are a few more options to choose from to compute unit vector <b>N</b>:
      </p>
      <br />
      <ul>
        <li>
          <p>
            Create a 2-D rotation matrix directly with the precomputed values <b class="no-wrap">cos(θ)</b> and <b class="no-wrap">sin(θ)</b>.
          </p>
          <Formula caption="unit vector N, computed directly with a rotation matrix using matrix multiplication.">
            \begin{aligned}
              \hat{N} &=& \begin{bmatrix}
                \cos(\theta) & \quad -\sin(\theta) \\
                \sin(\theta) & \quad \cos(\theta)
              \end{bmatrix} \cdot \hat{\vec{CA}} \\

              &=& \begin{bmatrix}
                \cos(\theta) \cdot \hat{\vec{CA}}_{x} - \sin(\theta) \cdot \hat{\vec{CA}}_{y} \\
                \sin(\theta) \cdot \hat{\vec{CA}}_{x} + \cos(\theta) \cdot \hat{\vec{CA}}_{y}
              \end{bmatrix}
            \end{aligned}
          </Formula>
        </li>
        <li>
          <p>
            Swizzle and flip a component to create a counter-clockwise perpendicular vector.
            Then multiply each vector by <b class="no-wrap">cos(θ)</b> and <b class="no-wrap">sin(θ)</b> respectively.
          </p>
          <br />
          <Note>
            This is an identity of the matrix above.
            Game engines often have a <b>local transform</b> API that exposes <b><u>unit</u></b> vectors like <b>forward</b>, <b>right</b>, <b>up</b>, and other <i>local</i> cardinal directions which can be helpful for rotating a vector without constructing a matrix.
            For game logic, an engine likely exposes at least one math API to logically simplify this type of calculation.
          </Note>
          <br />
          <Formula caption="unit vector N, computed with vector multiplication and addition, another form of the 2-D rotation matrix.">
            \begin{aligned}
              \hat{N} &=& \left(\cos(\theta) \cdot \hat{\vec{CA}} + \sin(\theta) \cdot \hat{\vec{CA}}_{\perp}\right) \\
                      &=& \begin{bmatrix}
                            \cos(\theta) \cdot \hat{\vec{CA}}_{x} \\
                            \cos(\theta) \cdot \hat{\vec{CA}}_{y} \\
                          \end{bmatrix} + \begin{bmatrix}
                            \sin(\theta) \cdot -\hat{\vec{CA}}_{y} \\
                            \sin(\theta) \cdot \hat{\vec{CA}}_{x} \\
                          \end{bmatrix} \\
                      &=& \left(\left(\tfrac{R}{S}\right) \cdot \hat{\vec{CA}} + \left(\tfrac{Q}{S}\right) \cdot \hat{\vec{CA}}_{\perp}\right) \\
            \end{aligned}
          </Formula>
        </li>
      </ul>
      <br />
      <p>
        Now that the unit normal <b>N</b> has been solved a plane can be drawn relative to vertex <b>A</b> which is tangent to the heart lobe through vertex <b>T</b>.
      </p>
      <br />
      <Player :ref="makePlayerRef(`heart-composition-step-1`)"
              :title="`(Fig. 1) Mirrored Plane`"
              :date="date"
              :lastmod="lastmod"
              :frame="frame"
              :state="getPlayerState('compositing-a-heart', `heart-composition-step-1`)"
              @load="(frame) => onStepByStepPlayerLoaded(frame, 1)" />
      <br />
      <p>
        Unfortunately, the shape can't easily be composed using boolean operations, so the image needs to be sliced into separate drawing regions.
        To create a seamless appearance when joining the plane and circle, the circles need to be cut from their center point to a tangent.
        At least two regions are needed, but 3 cutting planes are needed to define the boundary between them.
      </p>
      <br />
      <p>
        When using planes to slice an image into different regions, be sure their intersection points behave well when animating the shape.
        Two of the planes used for this image are parallel, the region between <b>A</b> and <b>T</b> that extends along the normal <b>N</b>.
        However, the third cutting plane is based on the edge between vertex <b>C</b> towards <b>B</b>, and <b>B</b> can lie on either side of the other plane.
        For the heart shape this issue can be avoided by using the vertical axis to define which plane should be used to cut with.
      </p>
      <br />
      <p>
        The drawing regions and the cutting planes can roughly be described as follows:
      </p>
      <br />
      <Figure src_light="/images/projects/sdf/heart_draw_regions_light.png"
              src_dark="/images/projects/sdf/heart_draw_regions_dark.png"
              alt="Illustration of the 3 draw region mask slices are made." />
      <br />
      <Figure src_light="/images/projects/sdf/heart_cut_planes_light.png"
              src_dark="/images/projects/sdf/heart_cut_planes_dark.png"
              alt="Illustration of cut edges CB and CT, showing how the angle can be acute or obtuse." />
      <br />
      <TermList heading="Drawing Regions">
        <Term term="Planes">Mostly the slope connecting vertex <b>A</b> and vertex <b>T</b>, and a triangle region cut out of circle <b>C</b> with vertex <b>B</b>.</Term>
        <Term term="Circles">Mostly outward curves like the heart lobes and a section below the point drawn at vertex <b>A</b>.</Term>
      </TermList>
      <br />
      <TermList heading="Region Edges">
        <Term term="Circle Edge CB"><Formula caption="">\vec{C} \quad \text{towards} \quad \hat{\vec{CB}}_{\perp}</Formula></Term>
        <Term term="Circle Edge CT"><Formula caption="">\vec{C} \quad \text{towards} \quad -\hat{N}_{\perp}</Formula></Term>
        <Term term="Point Edge A"><Formula caption="">\vec{A} \quad \text{towards} \quad \hat{N}_{\perp}</Formula></Term>
      </TermList>
      <br />
      <p>
        Since vertex <b>B</b> lies on the vertical axis only the <b>Y</b> component is missing, which can be defined as relative to the <b>Y</b> component of vertex <b>C</b>.
        So, the vertical component of <b>B</b> is only missing the value <b>H</b> which can be solved for as follows.
      </p>
      <br />
      <Formula caption="H is the vertical difference between vertex B and C.">
        \begin{aligned}
          H &=& \sqrt{R^2 - \left(\vec{C}_{x}\right)^2} \\
            &=& \sqrt{R^2 - \left(\tfrac{1}{2}-R\right)^2} \\
            &=& \sqrt{R-\tfrac{1}{4}} \\
        \end{aligned}
      </Formula>
      <Formula caption="B is the highest point where heart lobes meet.">
        \begin{aligned}
          \vec{B} &=& \begin{bmatrix}
                        0 \\
                        \vec{C}_{y} + H \\
                      \end{bmatrix}
                  &=& \begin{bmatrix}
                        0 \\
                        \left(\tfrac{1}{2}-R\right) + \sqrt{R-\tfrac{1}{4}} \\
                      \end{bmatrix}
        \end{aligned}
      </Formula>
      <br />
      <p>
        With drawing regions defined the image can be stitched together.
      </p>
      <br />
      <Player :ref="makePlayerRef(`heart-composition-step-2`)"
              :title="`(Fig. 2) Draw Region #1, Outer Circles`"
              :date="date"
              :lastmod="lastmod"
              :frame="frame"
              :state="getPlayerState('compositing-a-heart', `heart-composition-step-2`)"
              @load="(frame) => onStepByStepPlayerLoaded(frame, 2)" />
      <Player :ref="makePlayerRef(`heart-composition-step-3`)"
              :title="`(Fig. 3) Draw Region #2, Plane (Incomplete)`"
              :date="date"
              :lastmod="lastmod"
              :frame="frame"
              :state="getPlayerState('compositing-a-heart', `heart-composition-step-3`)"
              @load="(frame) => onStepByStepPlayerLoaded(frame, 3)" />
      <Player :ref="makePlayerRef(`heart-composition-step-4`)"
              :title="`(Fig. 4) Heart Shape (Incomplete)`"
              :date="date"
              :lastmod="lastmod"
              :frame="frame"
              :state="getPlayerState('compositing-a-heart', `heart-composition-step-4`)"
              @load="(frame) => onStepByStepPlayerLoaded(frame, 4)" />
      <br />
      <p>
        That's close, the silhouette is correct but the area below vertex <b>B</b> doesn't look right.
        To fix this, an <i>inverted</i> point can be drawn at vertex <b>B</b> within the planes draw region, creating the illusion that the heart lobes have one continuous inner curve.
      </p>
      <br />
      <Player :ref="makePlayerRef(`heart-composition-step-5`)"
              :title="`(Fig. 5) Outer Circles + Inverted Point in Draw Region #2`"
              :date="date"
              :lastmod="lastmod"
              :frame="frame"
              :state="getPlayerState('compositing-a-heart', `heart-composition-step-5`)"
              @load="(frame) => onStepByStepPlayerLoaded(frame, 5)" />
      <Player :ref="makePlayerRef(`heart-composition-step-6`)"
              :title="`(Fig. 6) Draw Region #2, Plane + Inverted Point`"
              :date="date"
              :lastmod="lastmod"
              :frame="frame"
              :state="getPlayerState('compositing-a-heart', `heart-composition-step-6`)"
              @load="(frame) => onStepByStepPlayerLoaded(frame, 6)" />
      <br />
      <p>
        With 2 drawing regions composed of 3 points, 1 plane, and 3 cutting edges; the heart is complete and is ready for animation.
      </p>
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
                        'uScale': { default_value: 1.5 },
                        'uShowAxisY': { default_value: true },
                        'heart.uMode': { default_value: 1 },
                        'heart.uBlendToCircle': { default_value: 0.25 },
                      })"
                      @property-changed="(name) => onPlayerPropertyChanged(players['heart'].inner_frame, name)" />
    </Section>

    <Section heading="Adding Animations">
      <p>
        Simple animations can be added by looping over one or more wave functions, providing <b>frame time</b> or a similar value to interpolate properties of the scene such as object transformations, colors, or texture coordinates for example.
        This type of animation can easily be adjusted to warp time or play in reverse by scaling the real <b>delta time</b>, unless some property of the animation isn't deterministic or breaks time symmetry.
      </p>
      <br />
      <Code lang="cpp"
            caption="Time based heartbeat animation cycle composed of two wave functions."
            text="
        float animation_time = (uTime * TAU) * kAnimationFrequency;
        float wave1 = 0.5 + 0.5 * cos(animation_time);
        float wave2 = 0.5 + 0.5 * cos(animation_time * 2.0);
        float t = min(wave1, wave2);
        float amp = mix(kMinAnimationRadius, kMaxRadius, uAnimationAmplitude);
        r = mix(kMinAnimationRadius, amp, t);
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
      <WebPageCitation firstname='Inigo' lastname='Quilez'
                       website_title='Inigo Quilez' webpage_title='smooth minimum - 2013'
                       url='https://iquilezles.org/articles/smin/' />
    </Section>
  </Column>
</template>

<style scoped>
ol.foundation-steps li {
  margin: var(--size-padding-round) 0;
}
</style>