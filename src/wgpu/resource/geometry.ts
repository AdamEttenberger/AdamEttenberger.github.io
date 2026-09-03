import { isF32Array, isGPUBuffer, isU16Array, isU32Array } from '@/wgpu/resource/buffer'
import Hash from '@/wgpu/util/hash'
import { alignUp } from '@/wgpu/util/memory'
import { vec2, Vec3, vec3, type Vec2Like, type Vec3Like } from 'ts-gl-matrix'

export enum AxisDirection {
  X, Y, Z,
  PositiveX = X,  Right = X,
  PositiveY = Y,  Up = Y,
  PositiveZ = Z,  Backward = Z,
  NegativeX = 3, Left = NegativeX,
  NegativeY = 4, Down = NegativeY,
  NegativeZ = 5, Forward = NegativeZ,
}
type AxisDirectionArray = {
  [K in AxisDirection]: Readonly<Vec3Like>;
};

export enum QuadCorner {
  TL, BL, BR, TR,
  TopLeft = TL,
  BottomLeft = BL,
  BottomRight = BR,
  TopRight = TR,
}
type QuadCornerArray = {
  [K in QuadCorner]: Readonly<Vec2Like>;
}

export const UNIT_AXIS: AxisDirectionArray = Object.freeze([
  vec3.fromValues( 1,  0,  0), // T:-Z, B:-Y, N:+X
  vec3.fromValues( 0,  1,  0), // T:+X, B:+Z, N:+Y
  vec3.fromValues( 0,  0,  1), // T:+X, B:-Y, N:+Z
  vec3.fromValues(-1,  0,  0), // T:+Z, B:-Y, N:-X
  vec3.fromValues( 0, -1,  0), // T:+X, B:-Z, N:-Y
  vec3.fromValues( 0,  0, -1), // T:-X, B:-Y, N:-Z
]);

export const AXIS_TANGENT: AxisDirectionArray = Object.freeze([
  UNIT_AXIS[AxisDirection.NegativeZ],
  UNIT_AXIS[AxisDirection.PositiveX],
  UNIT_AXIS[AxisDirection.PositiveX],
  UNIT_AXIS[AxisDirection.PositiveZ],
  UNIT_AXIS[AxisDirection.PositiveX],
  UNIT_AXIS[AxisDirection.NegativeX],
]);

export const AXIS_BITANGENT: AxisDirectionArray = Object.freeze([
  UNIT_AXIS[AxisDirection.NegativeY],
  UNIT_AXIS[AxisDirection.PositiveZ],
  UNIT_AXIS[AxisDirection.NegativeY],
  UNIT_AXIS[AxisDirection.NegativeY],
  UNIT_AXIS[AxisDirection.NegativeZ],
  UNIT_AXIS[AxisDirection.NegativeY],
]);

export const UV_CORNERS: QuadCornerArray = Object.freeze([
  vec2.fromValues(0, 0),
  vec2.fromValues(0, 1),
  vec2.fromValues(1, 1),
  vec2.fromValues(1, 0),
]);

const VERTEX_ATTRIBUTE_ALIGNMENT: number = 4;

const VERTEX_FORMAT_SIZE: Record<GPUVertexFormat, number> = {
  "float16": 2,
  "float16x2": 4,
  "float16x4": 8,
  "float32": 4,
  "float32x2": 8,
  "float32x3": 12,
  "float32x4": 16,
  "unorm10-10-10-2": 4,
  "unorm8x4-bgra": 4,
  "sint16": 2,
  "sint16x2": 4,
  "sint16x4": 8,
  "sint32": 4,
  "sint32x2": 8,
  "sint32x3": 12,
  "sint32x4": 16,
  "sint8": 1,
  "sint8x2": 2,
  "sint8x4": 4,
  "snorm16": 2,
  "snorm16x2": 4,
  "snorm16x4": 8,
  "snorm8": 1,
  "snorm8x2": 2,
  "snorm8x4": 4,
  "uint16": 2,
  "uint16x2": 4,
  "uint16x4": 8,
  "uint32": 4,
  "uint32x2": 8,
  "uint32x3": 12,
  "uint32x4": 16,
  "uint8": 1,
  "uint8x2": 2,
  "uint8x4": 4,
  "unorm16": 2,
  "unorm16x2": 4,
  "unorm16x4": 8,
  "unorm8": 1,
  "unorm8x2": 2,
  "unorm8x4": 4,
};

/**
 * glTF 2.0 Mesh Vertex Attributes
 */
export enum VertexAttribute {
  Position,
  UV,
  Normal,
  Tangent,
  RGB,
  RGBA,
  Joints,
  Weights,
};

type VertexAttributeEntry =
  | { attribute: VertexAttribute.Position,  format: 'float32x3'}
  | { attribute: VertexAttribute.UV,        format: 'float32x2'|'unorm8x2'|'unorm16x2'}
  | { attribute: VertexAttribute.Normal,    format: 'float32x3'}
  | { attribute: VertexAttribute.Tangent,   format: 'float32x4'}
  | { attribute: VertexAttribute.RGB,       format: 'float32x3'|'unorm8x4'|'unorm16x4'}
  | { attribute: VertexAttribute.RGBA,      format: 'float32x4'|'unorm8x4'|'unorm16x4'}
  | { attribute: VertexAttribute.Joints,    format: 'uint8x4'|'uint16x4'}
  | { attribute: VertexAttribute.Weights,   format: 'float32x4'|'unorm8x4'|'unorm16x4'};

export class VertexLayout {
  public readonly hash: number;
  public readonly formatString: string;
  public readonly gpuLayout: GPUVertexBufferLayout;

  constructor(
    ...attribute_formats: VertexAttributeEntry[]
  ) {
    this.formatString = VertexLayout.toAttributeFormatString(attribute_formats);
    this.hash = Hash.cyrb53(this.formatString);
    this.gpuLayout = VertexLayout.toGPULayout(attribute_formats);
  }

  private static toAttributeFormatString(attribute_formats: VertexAttributeEntry[]): string {
    return attribute_formats.reduce(
      (result, entry, shaderLocation) => {
        if (shaderLocation > 0) {
          result += ',';
        }
        return result + `${entry.attribute}:${entry.format}`;
      },
      ''
    );
  }

  private static toGPULayout(attribute_formats: VertexAttributeEntry[]): GPUVertexBufferLayout {
    let arrayStride: number = 0;
    let attributes: GPUVertexAttribute[] = attribute_formats.reduce(
      (result, entry, shaderLocation) => {
        result.push({
          format: entry.format,
          offset: arrayStride,
          shaderLocation,
        });
        arrayStride += alignUp(VERTEX_FORMAT_SIZE[entry.format], VERTEX_ATTRIBUTE_ALIGNMENT);
        return result;
      },
      new Array<GPUVertexAttribute>()
    );
    return {
      arrayStride,
      attributes,
      stepMode: 'vertex',
    };
  }
}

export interface IGeometry {
  readonly vertexLayout: VertexLayout;
  readonly indexFormat: GPUIndexFormat;
  readonly vertexBuffer: GPUBuffer;
  readonly indexBuffer: GPUBuffer;

  destroy(): void;
}

class GeometryBase implements IGeometry {
  public readonly vertexLayout: VertexLayout;
  public readonly indexFormat: GPUIndexFormat;
  public readonly vertexBuffer: GPUBuffer;
  public readonly indexBuffer: GPUBuffer;

  /**
   * Creates or takes ownership of GPUBuffer vertex and index buffers.
   * @param device
   * @param vertexLayout Vertex layout and format information
   * @param indexFormat Index format information
   * @param vertices Vertex buffer to take ownership of
   * @param indices Vertex buffer to take ownership of
   */
  constructor(
    device: GPUDevice,
    vertexLayout: VertexLayout,
    indexFormat: GPUIndexFormat,
    vertices: GPUBuffer|Float32Array,
    indices: GPUBuffer|Uint32Array|Uint16Array,
  ) {
    this.vertexLayout = vertexLayout;
    this.indexFormat = indexFormat;

    if (isGPUBuffer(vertices)) {
      this.vertexBuffer = vertices;
    } else if (isF32Array(vertices)) {
      this.vertexBuffer = device.createBuffer({
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(this.vertexBuffer, 0, vertices);
    } else {
      throw new TypeError(`Unhandled vertex buffer type: ${(vertices as any).constructor?.name ?? "unknown"}`);
    }

    if (isGPUBuffer(indices)) {
      this.indexBuffer = indices;
    } else if (isU32Array(indices) || isU16Array(indices)) {
      this.indexBuffer = device.createBuffer({
        size: indices.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(this.indexBuffer, 0, indices);
    } else {
      throw new TypeError(`Unhandled index buffer type: ${(indices as any).constructor?.name ?? "unknown"}`);
    }
  }

  public destroy(): void {
    this.vertexBuffer.destroy();
    this.indexBuffer.destroy();
  }
}

export class Plane extends GeometryBase {
  constructor(
    device: GPUDevice,
    gridsize: number = 1
  ) {
    const vertexLayout = new VertexLayout(
      { attribute: VertexAttribute.Position,  format: 'float32x3' },
      { attribute: VertexAttribute.Normal,    format: 'float32x3' },
      { attribute: VertexAttribute.Tangent,   format: 'float32x4' },
      { attribute: VertexAttribute.UV,        format: 'float32x2' },
    );

    const vert_width = gridsize + 1;
    const vert_stride = vertexLayout.gpuLayout.arrayStride / Float32Array.BYTES_PER_ELEMENT;
    const vert_count = vert_width * vert_width;
    const index_count = gridsize * gridsize * 6;
    const vert_distance = 1 / gridsize;

    const indexFormat = vert_count < 65535 ? 'uint16' : 'uint32';
    const IndexArrayCtor = vert_count < 65535 ? Uint16Array : Uint32Array;
    const vertices = new Float32Array(vert_count * vert_stride);
    const indices = new IndexArrayCtor(index_count);

    // Begin in the "top-left" corner, right-handed coordinate space,
    // (-Z) into screen, UV [0, 0]
    let vert_offset = 0;
    for (let row = 0; row <= gridsize; ++row) {
      let dy = row * vert_distance;
      for (let col = 0; col <= gridsize; ++col) {
        let dx = col * vert_distance;
        /*x=*/  vertices[vert_offset]      = dx - 0.5;
        /*y=*/  vertices[vert_offset + 1]  = 0;
        /*z=*/  vertices[vert_offset + 2]  = dy - 0.5;
        /*Nx=*/ vertices[vert_offset + 3]  = 0;
        /*Ny=*/ vertices[vert_offset + 4]  = 1;
        /*Nz=*/ vertices[vert_offset + 5]  = 0;
        /*Tx=*/ vertices[vert_offset + 6]  = 1;
        /*Ty=*/ vertices[vert_offset + 7]  = 0;
        /*Tz=*/ vertices[vert_offset + 8]  = 0;
        /*Tw=*/ vertices[vert_offset + 9]  = 1;
        /*u=*/  vertices[vert_offset + 10] = dx;
        /*v=*/  vertices[vert_offset + 11] = dy;
        vert_offset += vert_stride;
      }
    }

    let idx_offset = 0;
    for (let row = 0; row < gridsize; ++row) {
      let quad_tl = row * vert_width;
      for (let col = 0; col < gridsize; ++col) {
        let quad_br = quad_tl + vert_width + 1;
        /*tl=*/ indices[idx_offset]     = quad_tl;
        /*bl=*/ indices[idx_offset + 1] = quad_br - 1;
        /*br=*/ indices[idx_offset + 2] = quad_br;
        /*tl=*/ indices[idx_offset + 3] = quad_tl;
        /*br=*/ indices[idx_offset + 4] = quad_br;
        /*tr=*/ indices[idx_offset + 5] = quad_tl + 1;
        idx_offset += 6;
        ++quad_tl;
      }
    }

    super(
      device,
      vertexLayout,
      indexFormat,
      vertices,
      indices,
    );
  }
}

export class Cube extends GeometryBase {
  constructor(
    device: GPUDevice,
    size: number = 1.0,
  ) {
    const vertexLayout = new VertexLayout(
      { attribute: VertexAttribute.Position,  format: 'float32x3' },
      { attribute: VertexAttribute.Normal,    format: 'float32x3' },
      { attribute: VertexAttribute.Tangent,   format: 'float32x4' },
      { attribute: VertexAttribute.UV,        format: 'float32x2' },
    );

    const vert_stride = vertexLayout.gpuLayout.arrayStride / Float32Array.BYTES_PER_ELEMENT;
    const vert_count = 24;
    const index_count = 36;
    const indexFormat = 'uint16';

    const vertices = new Float32Array(vert_count * vert_stride);
    const indices = new Uint16Array(index_count);

    const extent = size * 0.5;

    const tb_signs: QuadCornerArray = [[-1, -1], [-1, 1], [1, 1], [1, -1]]; // [TL, BL, BR, TR]

    for (let face_index: AxisDirection = 0; face_index < 6; ++face_index) {
      const T: Readonly<Vec3Like> = AXIS_TANGENT[face_index];    // [X]: (+U) world direction
      const B: Readonly<Vec3Like> = AXIS_BITANGENT[face_index];  // [Y]: (+V) world direction
      const N: Readonly<Vec3Like> = UNIT_AXIS[face_index];       // [Z]: object/world normal

      const first_vert_index: number = face_index * 4;
      let vert_offset: number = first_vert_index * vert_stride;
      for (let quad_vert_index: QuadCorner = 0; quad_vert_index < 4; ++quad_vert_index) {
        const P: Vec3Like = vertices.subarray(vert_offset, vert_offset + 3);
        vec3.copy(P, N);
        vec3.scaleAndAdd(P, P, T, tb_signs[quad_vert_index][0]);
        vec3.scaleAndAdd(P, P, B, tb_signs[quad_vert_index][1]);
        vec3.scale(P, P, extent);

        vertices.set(N, vert_offset + 3);
        vertices.set(T, vert_offset + 6);
        /*Tw=*/ vertices[vert_offset + 9] = 1;
        vertices.set(UV_CORNERS[quad_vert_index], vert_offset + 10);
        vert_offset += vert_stride;
      }

      const idx_offset = face_index * 6;
      /*tl=*/ indices[idx_offset]     = first_vert_index;
      /*bl=*/ indices[idx_offset + 1] = first_vert_index + 1;
      /*br=*/ indices[idx_offset + 2] = first_vert_index + 2;
      /*tl=*/ indices[idx_offset + 3] = first_vert_index;
      /*br=*/ indices[idx_offset + 4] = first_vert_index + 2;
      /*tr=*/ indices[idx_offset + 5] = first_vert_index + 3;
    }

    super(
      device,
      vertexLayout,
      indexFormat,
      vertices,
      indices,
    );
  }
}
