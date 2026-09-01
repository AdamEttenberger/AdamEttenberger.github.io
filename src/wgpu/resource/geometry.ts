import Hash from '@/wgpu/util/hash'
import { alignUp } from '@/wgpu/util/memory'

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
  constructor(
    public readonly vertexLayout: VertexLayout,
    public readonly indexFormat: GPUIndexFormat,
    public readonly vertexBuffer: GPUBuffer,
    public readonly indexBuffer: GPUBuffer,
  ) { }

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

    const vertexBuffer = device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    const indexBuffer = device.createBuffer({
      size: indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(vertexBuffer, 0, vertices);
    device.queue.writeBuffer(indexBuffer, 0, indices);

    super(
      vertexLayout,
      indexFormat,
      vertexBuffer,
      indexBuffer
    );
  }
}
