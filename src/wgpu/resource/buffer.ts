// WebGPUStruct.ts
//
// Zero-copy AoS views over an ArrayBuffer.
//
// Public API:
//
//   vertices.value[0].position
//   vertices.value[0].uv
//   vertices.value[0].color
//
// Every field is a Float32Array or Uint32Array view directly into the
// backing ArrayBuffer. No field data is copied.
//
// Instances are laid out as:
//
//   instance 0: [field0][field1][field2]...
//   instance 1: [field0][field1][field2]...
//   ...
//
// The instance stride is the size of one complete struct, rounded up to
// the required struct alignment.
//
// This is intended to work naturally with gl-matrix:
//
//   vec3.set(vertices.value[0].position, 1, 2, 3);
//   vec2.set(vertices.value[0].uv, 0, 0);
//   vec4.set(vertices.value[0].color, 1, 1, 1, 1);
//

import { alignUp } from '@/wgpu/util/memory'

export function isGPUBuffer(obj: any): obj is GPUBuffer               { return obj.constructor.name === GPUBuffer.name;         }
export function isF64Array(obj: any): obj is Float64Array             { return obj.constructor.name === Float64Array.name;      }
export function isF32Array(obj: any): obj is Float32Array             { return obj.constructor.name === Float32Array.name;      }
export function isF16Array(obj: any): obj is Float16Array             { return obj.constructor.name === Float16Array.name;      }
export function isI64Array(obj: any): obj is BigInt64Array            { return obj.constructor.name === BigInt64Array.name;     }
export function isI32Array(obj: any): obj is Int32Array               { return obj.constructor.name === Int32Array.name;        }
export function isI16Array(obj: any): obj is Int16Array               { return obj.constructor.name === Int16Array.name;        }
export function isI8Array(obj: any): obj is Int8Array                 { return obj.constructor.name === Int8Array.name;         }
export function isU64Array(obj: any): obj is BigUint64Array           { return obj.constructor.name === BigUint64Array.name;    }
export function isU32Array(obj: any): obj is Uint32Array              { return obj.constructor.name === Uint32Array.name;       }
export function isU16Array(obj: any): obj is Uint16Array              { return obj.constructor.name === Uint16Array.name;       }
export function isU8Array(obj: any): obj is Uint8Array                { return obj.constructor.name === Uint8Array.name;        }
export function isU8ClampedArray(obj: any): obj is Uint8ClampedArray  { return obj.constructor.name === Uint8ClampedArray.name; }

export function isArrayBuffer(obj: any, strict: boolean = true): obj is ArrayBuffer {
  return (obj.constructor.name === ArrayBuffer.name) || (!strict && (
    isF32Array(obj) || isU32Array(obj) || isI32Array(obj)       ||
    isF16Array(obj) || isU16Array(obj) || isI16Array(obj)       ||
    isU8Array(obj)  || isI8Array(obj)  || isU8ClampedArray(obj) ||
    isF64Array(obj) || isU64Array(obj) || isI64Array(obj)
  ));
}

type F32Array = Float32Array<ArrayBuffer>;
type U32Array = Uint32Array<ArrayBuffer>;

type StructArray = F32Array | U32Array;

type TypedArrayCtor =
  | Float32ArrayConstructor
  | Uint32ArrayConstructor;

export type WebGPUUniformType =
  | "f32"
  | "i32"
  | "u32"
  | "vec2f"
  | "vec2i"
  | "vec2u"
  | "vec3f"
  | "vec3i"
  | "vec3u"
  | "vec4f"
  | "vec4i"
  | "vec4u"
  | "mat2x2f"
  | "mat3x3f"
  | "mat4x4f";

interface WebGPUUniformTypeSpec {
  /**
   * Number of bytes occupied by the field in the WGSL structure.
   *
   * For example, vec3f has a logical size of 12 bytes even though its
   * alignment is 16 bytes.
   */
  size: number;

  /**
   * WGSL alignment requirement.
   */
  align: number;

  /**
   * Number of 32-bit elements exposed by the typed-array view.
   *
   * mat3x3f deliberately exposes 12 floats because its WGSL storage
   * representation contains one padding float per column.
   */
  elements: number;

  TypedArrayCtor: TypedArrayCtor;
}

export const TYPE_SPECS: Record<
  WebGPUUniformType,
  WebGPUUniformTypeSpec
> = {
  f32:      { size: 4,  align: 4,   elements: 1,  TypedArrayCtor: Float32Array  },
  i32:      { size: 4,  align: 4,   elements: 1,  TypedArrayCtor: Uint32Array   },
  u32:      { size: 4,  align: 4,   elements: 1,  TypedArrayCtor: Uint32Array   },
  vec2f:    { size: 8,  align: 8,   elements: 2,  TypedArrayCtor: Float32Array  },
  vec2i:    { size: 8,  align: 8,   elements: 2,  TypedArrayCtor: Uint32Array   },
  vec2u:    { size: 8,  align: 8,   elements: 2,  TypedArrayCtor: Uint32Array   },
  vec3f:    { size: 12, align: 16,  elements: 3,  TypedArrayCtor: Float32Array  },
  vec3i:    { size: 12, align: 16,  elements: 3,  TypedArrayCtor: Uint32Array   },
  vec3u:    { size: 12, align: 16,  elements: 3,  TypedArrayCtor: Uint32Array   },
  vec4f:    { size: 16, align: 16,  elements: 4,  TypedArrayCtor: Float32Array  },
  vec4i:    { size: 16, align: 16,  elements: 4,  TypedArrayCtor: Uint32Array   },
  vec4u:    { size: 16, align: 16,  elements: 4,  TypedArrayCtor: Uint32Array   },
  mat2x2f:  { size: 16, align: 8,   elements: 4,  TypedArrayCtor: Float32Array  },
  mat3x3f:  { size: 48, align: 16,  elements: 12, TypedArrayCtor: Float32Array  },
  mat4x4f:  { size: 64, align: 16,  elements: 16, TypedArrayCtor: Float32Array  },
};

export type WebGPUFieldDefinition = {
  type: WebGPUUniformType;
};

interface FieldLayout {
  readonly name: string;
  readonly offset: number;
  readonly size: number;
  readonly elements: number;
  readonly TypedArrayCtor: TypedArrayCtor;
}

type StructFields = object;

type ValidateStructFields<T extends StructFields> = {
  [K in keyof T]: T[K] extends StructArray ? T[K] : never;
};

/**
 * The schema must contain exactly one definition for every member of T.
 *
 * Using a mapped type here means that omitting a member from the schema is
 * a compile-time error, as is adding an unknown member.
 */
type WebGPUSchema<T extends StructFields> = {
  [K in keyof T]-?: WebGPUFieldDefinition;
};
export type StructView<T extends StructFields> = T;

export interface WebGPUStructValue<T extends StructFields> {
  readonly value: {
    readonly [index: number]: StructView<T>;
  };
}

/**
 * Converts a JavaScript Proxy property to an array index.
 *
 * Only non-negative integer property names are treated as indices.
 */
function propToIndex(
  prop: string | symbol,
): number | undefined {
  if (typeof prop !== "string" || prop === "") {
    return undefined;
  }

  const index = Number(prop);

  if (!Number.isInteger(index) || index < 0 || String(index) !== prop) {
    return undefined;
  }

  return index;
}

/**
 * Object.entries() loses the relationship between the keys and values
 * of a generic mapped type. This helper preserves that relationship for
 * the schema.
 */
function typedEntries<T extends object>(
  value: T,
): Array<[keyof T, T[keyof T]]> {
  return Object.entries(value) as Array<
    [keyof T, T[keyof T]]
  >;
}

/**
 * Creates the view for one complete AoS instance.
 *
 * Each returned property is a typed-array view directly into `buffer`.
 */
function createStructView<T extends StructFields>(
  buffer: ArrayBuffer,
  layouts: readonly FieldLayout[],
  instanceIndex: number,
  stride: number,
): StructView<T> {
  const baseOffset = instanceIndex * stride;
  const result: Record<string, StructArray> = {};

  for (const layout of layouts) {
    result[layout.name] = new layout.TypedArrayCtor(
      buffer,
      baseOffset + layout.offset,
      layout.elements,
    );
  }

  return result as StructView<T>;
}

/**
 * Creates the `.value` collection.
 *
 * Instances are created lazily and cached. Consequently:
 *
 *   value[3]
 *
 * always returns the same object, and:
 *
 *   value[3].position
 *
 * always returns the same TypedArray view.
 *
 * This avoids allocating objects/views repeatedly during rendering.
 */
function createValueProxy<T extends StructFields>(
  buffer: ArrayBuffer,
  layouts: readonly FieldLayout[],
  stride: number,
  count: number,
): WebGPUStructValue<T>["value"] {
  const instances: Array<
    StructView<T> | undefined
  > = new Array(count);

  return new Proxy(
    {},
    {
      get(_target, prop) {
        const index = propToIndex(prop);

        if (index === undefined || index >= count) {
          return undefined;
        }

        let instance = instances[index];

        if (instance === undefined) {
          instance = createStructView<T>(
            buffer,
            layouts,
            index,
            stride,
          );

          instances[index] = instance;
        }

        return instance;
      },

      has(_target, prop) {
        const index = propToIndex(prop);
        return (index !== undefined && index < count);
      },

      ownKeys() {
        const keys = new Array<string>(count);

        for (let i = 0; i < count; ++i) {
          keys[i] = String(i);
        }

        return keys;
      },

      getOwnPropertyDescriptor(
        _target,
        prop,
      ) {
        const index = propToIndex(prop);

        if (index === undefined || index >= count) {
          return undefined;
        }

        return {
          configurable: true,
          enumerable: true,
          writable: false,
          value: instances[index],
        };
      },
    },
  ) as WebGPUStructValue<T>["value"];
}

/**
 * Base class for zero-copy WebGPU AoS structures.
 *
 * The generic type defines the public shape of one instance, while the
 * constructor schema must provide a WebGPU type for every member.
 *
 * Example:
 *
 *   interface Vertex {
 *     position: Float32Array<ArrayBuffer>;
 *     uv: Float32Array<ArrayBuffer>;
 *     color: Float32Array<ArrayBuffer>;
 *   }
 *
 *   class VertexPosition_UV_Color
 *     extends WebGPUStruct<Vertex>
 *   {
 *     constructor(
 *       device: GPUDevice,
 *       count: number,
 *     ) {
 *       super(device, {
 *         position: { type: "vec3f" },
 *         uv:       { type: "vec2f" },
 *         color:    { type: "vec4f" },
 *       }, count);
 *     }
 *   }
 *
 * Usage:
 *
 *   const vertices = new VertexPosition_UV_Color(device, 2);
 *
 *   vec3.set(
 *     vertices.value[0].position,
 *     0, 0, 0,
 *   );
 *
 *   vec2.set(
 *     vertices.value[0].uv,
 *     0, 0,
 *   );
 *
 *   vec4.set(
 *     vertices.value[0].color,
 *     0, 0, 0, 0,
 *   );
 *
 *   vec3.set(
 *     vertices.value[1].position,
 *     1, 0, 0,
 *   );
 */
export abstract class WebGPUStruct<
  T extends ValidateStructFields<T>,
> implements WebGPUStructValue<T> {
  public readonly count: number;

  public readonly gpuBuffer: GPUBuffer;

  public readonly arrayBuffer: ArrayBuffer;

  /**
   * Complete byte size of one AoS instance.
   */
  public readonly stride: number;

  /**
   * `.value[index]` provides a zero-copy view of one
   * complete instance.
   */
  public readonly value: WebGPUStructValue<T>["value"];

  protected readonly fieldLayouts: readonly FieldLayout[];

  private readonly device: GPUDevice;

  protected constructor(
    device: GPUDevice,
    schema: WebGPUSchema<T>,
    count: number = 1,
    usage: GPUBufferUsageFlags =
      GPUBufferUsage.UNIFORM,
  ) {
    if (!Number.isInteger(count) || count < 1) {
      throw new RangeError(`count must be a positive integer; received ${count}`);
    }

    this.device = device;
    this.count = count;

    const layouts: FieldLayout[] = [];

    let currentOffset = 0;

    for (const [name, field] of typedEntries(schema)) {
      const spec = TYPE_SPECS[field.type];

      if (spec === undefined) {
        throw new Error(`Unknown WebGPU uniform type: "${field.type}"`);
      }

      currentOffset = alignUp(currentOffset, spec.align);

      layouts.push({
        name: String(name),
        offset: currentOffset,
        size: spec.size,
        elements: spec.elements,
        TypedArrayCtor: spec.TypedArrayCtor,
      });

      currentOffset += spec.size;
    }

    // WebGPU structures are aligned to at least 16 bytes.
    this.stride = alignUp(currentOffset, 16);

    this.fieldLayouts = layouts;

    this.arrayBuffer = new ArrayBuffer(this.count * this.stride);

    this.gpuBuffer = device.createBuffer({
      size: this.byteLength,
      usage:
        usage |
        GPUBufferUsage.COPY_DST,
    });

    this.value = createValueProxy<T>(
      this.arrayBuffer,
      this.fieldLayouts,
      this.stride,
      this.count,
    );
  }

  /**
   * Total size of the backing ArrayBuffer /  GPUBuffer.
   */
  public get byteLength(): number {
    return this.arrayBuffer.byteLength;
  }

  /**
   * Writes the complete CPU-side AoS buffer to the GPU.
   */
  public submit(): void {
    this.device.queue.writeBuffer(
      this.gpuBuffer,
      0,
      this.arrayBuffer,
    );
  }

  public destroy() {
    this.gpuBuffer.destroy();
  }

  /**
   * Returns the byte offset of a field within one instance.
   */
  protected getFieldOffset(
    name: string,
  ): number {
    const layout = this.fieldLayouts.find(
      field => field.name === name,
    );

    if (layout === undefined) {
      throw new Error(`Unknown field: "${name}"`);
    }

    return layout.offset;
  }

  /**
   * Returns the layout of a field.
   */
  protected getFieldLayout(
    name: string,
  ): FieldLayout {
    const layout = this.fieldLayouts.find(
      field => field.name === name,
    );

    if (layout === undefined) {
      throw new Error(`Unknown field: "${name}"`);
    }

    return layout;
  }
}