import { reduceEnum } from '@/util/enum'

export enum TextureGroup {
  _32,
  _64,
  _128,
  _256,
  _512,
  _1k,
  _2k,
  _4k,
  _8k,
};

const TextureGroupSize = new Map<TextureGroup, number>([
  [TextureGroup._32,  (1 << 5)],
  [TextureGroup._64,  (1 << 6)],
  [TextureGroup._128, (1 << 7)],
  [TextureGroup._256, (1 << 8)],
  [TextureGroup._512, (1 << 9)],
  [TextureGroup._1k,  (1 << 10)],
  [TextureGroup._2k,  (1 << 11)],
  [TextureGroup._4k,  (1 << 12)],
  [TextureGroup._8k,  (1 << 13)],
]);

const SizeToTextureGroup = new Map<number, TextureGroup>(Array.from(TextureGroupSize, ([group, size]) => [size, group]));

export function getTextureGroupSize(group: TextureGroup): number {
  return TextureGroupSize.get(group)!;
}

export interface ITextureLocation {
  readonly group: number;
  readonly layer: number;
}

class TextureLocation implements ITextureLocation {
  constructor(
    public readonly group: number,
    public readonly layer: number,
  ) { }
}

class PendingTexture {
  private _controller: AbortController;
  constructor(
    public readonly promise: Promise<ITextureLocation|undefined>,
    controller: AbortController,
  ) {
    this._controller = controller;
  }

  public abort() {
    this._controller.abort();
  }

  public get aborted(): boolean {
    return this._controller.signal.aborted;
  }
}

class TexturePool {
  private _device: GPUDevice;
  public readonly group: TextureGroup;
  public readonly layers: number;
  private readonly _texture: GPUTexture;
  // TextureRegistry guarantees no duplicate entries, so Array<> should
  // be significantly faster than Set<> for a free-list container.
  private _free: Array<number> = new Array<number>();
  private _next: number = 0;

  constructor(
    device: GPUDevice,
    group: TextureGroup,
    layers: number,
  ) {
    this._device = device;
    this.group = group;
    this.layers = layers;
    this._texture = this.makeTextureGroup();
  }

  public add(image: ImageBitmap): ITextureLocation|undefined {
    if (image.width != this._texture.width || image.height != this._texture.height) {
      throw new Error(`Texture size mismatch, expected [${this._texture.width}, ${this._texture.height}], actual [${image.width}, ${image.height}]`);
    }
    let layer: number|undefined = this._free.pop();
    if (layer === undefined) {
      if (this._next === this.layers) {
        console.error(`Out of texture layers, group(${this.group})`);
        return;
      }
      layer = this._next++;
    }
    this._device.queue.copyExternalImageToTexture(
      { source: image },
      {
        texture: this._texture,
        origin: { x: 0, y: 0, z: layer },
        premultipliedAlpha: false,
        colorSpace: 'srgb'
      },
      { width: this._texture.width, height: this._texture.height }
    );

    return new TextureLocation(
      this.group,
      layer,
    );
  }

  public release(layer: number) {
    this._free.push(layer);
  }

  public createView(): GPUTextureView {
    return this._texture.createView({
      dimension: '2d-array',
      baseArrayLayer: 0,
      arrayLayerCount: this.layers
    });
  }

  private makeTextureGroup(): GPUTexture {
    let size: number = getTextureGroupSize(this.group);
    return this._device.createTexture({
      size: { width: size, height: size, depthOrArrayLayers: this.layers },
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }
}

export default class TextureRegistry {
  private _pools: Map<TextureGroup, TexturePool>;
  private _pending: Map<string, PendingTexture> = new Map<string, PendingTexture>();
  private _locations: Map<string, ITextureLocation> = new Map<string, ITextureLocation>();

  constructor(device: GPUDevice, max_layers: Map<TextureGroup, number>) {
    this._pools = reduceEnum(
      TextureGroup,
      (result, group) => {
        let layers: number|undefined = max_layers.get(group);
        if (layers !== undefined) {
          result.set(group, new TexturePool(device, group, layers));
        }
        return result;
      },
      new Map<TextureGroup, TexturePool>()
    );
  }

  public get_group(group: TextureGroup): GPUTextureView|undefined {
    let pool: TexturePool|undefined = this._pools.get(group);
    if (pool === undefined) {
      return;
    }
    return pool.createView();
  }

  public async get(path: string): Promise<ITextureLocation|undefined> {
    let location: ITextureLocation|undefined = this._locations.get(path);
    if (location !== undefined) {
      return location;
    }
    let pending: PendingTexture|undefined = this._pending.get(path);
    if (pending === undefined) {
      const controller = new AbortController();
      pending = new PendingTexture(this.loadImageAsync(path, controller.signal).then<ITextureLocation|undefined>((image) => {
        this._pending.delete(path);
        if (controller.signal.aborted) {
          return;
        }
        if (image === undefined || image.width !== image.height) {
          return;
        }
        let group: TextureGroup|undefined = SizeToTextureGroup.get(image.width);
        if (group === undefined) {
          return;
        }
        let location: ITextureLocation|undefined = this._pools.get(group)!.add(image);
        if (location !== undefined) {
          this._locations.set(path, location);
        }
        return location;
      }), controller);
      this._pending.set(path, pending);
    }
    return pending.promise;
  }

  public delete(path: string): boolean {
    let location: ITextureLocation|undefined = this._locations.get(path);
    if (location !== undefined) {
      this._pools.get(location.group)!.release(location.layer);
      return this._locations.delete(path);
    }
    let pending: PendingTexture|undefined = this._pending.get(path);
    if (pending !== undefined) {
      pending.abort();
      return this._pending.delete(path);
    }
    return false;
  }

  private async loadImageAsync(path: string, signal: AbortSignal): Promise<ImageBitmap|undefined> {
    try {
      const response = await fetch(path, { signal });
      if (!response.ok) {
        return;
      }
      const blob = await response.blob();
      return createImageBitmap(blob);
    } catch { }
  }
}
