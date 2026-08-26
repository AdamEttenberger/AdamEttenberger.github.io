
enum ViewportState {
  Idle,
  Playing,
  Stopping,
};

/**
 * Helper which manages the Viewport state tied to a Canvas.
 * Automatically responds to display size and resolution changes.
 * Automatically starts/stops rendering depending on whether the Canvas is visible.
 */
export default class Viewport {
  private _device: GPUDevice;
  private _canvas: WeakRef<HTMLCanvasElement>;
  private _onResizeEvent: ((viewport: Viewport) => void)|null;
  private _onAnimationFrame: ((timestamp: number) => void)|null;

  private _intersectionObserver: IntersectionObserver|null;
  private _resizeObserver: ResizeObserver|null = null;
  private _resolutionMediaQuery: MediaQueryList|null = null;

  private _logicalWidth: number = 0;
  private _logicalHeight: number = 0;
  private _physicalWidth: number = 0;
  private _physicalHeight: number = 0;
  private _aspect: number = 0;
  private _devicePixelRatio: number = 0;
  private _state: ViewportState = ViewportState.Idle;

  private _depth_stencil_texture: GPUTexture|null = null;
  private _depth_stencil_texture_view: GPUTextureView|null = null;

  /**
   * @param canvas The canvas element used for rendering the scene.
   * @param onResizeEvent Callback executed when the viewport changes size.
   * @param onAnimationFrame Callback executed to render a new frame.
   */
  constructor(
    device: GPUDevice,
    canvas: HTMLCanvasElement,
    onResizeEvent: ((viewport: Viewport) => void)|null,
    onAnimationFrame: ((timestamp: number) => void)|null
  ) {
    this._device = device;
    this._canvas = new WeakRef(canvas);
    this._onResizeEvent = onResizeEvent;
    this._onAnimationFrame = onAnimationFrame;
    this._intersectionObserver = new IntersectionObserver(this.onIntersectionObserver);
    this._resizeObserver = new ResizeObserver(this.onDisplayChanged);
    this._resizeObserver.observe(canvas);
    this._intersectionObserver.observe(canvas);
    this.onDisplayChanged();
  }

  public get logicalWidth(): number { return this._logicalWidth; }
  public get logicalHeight(): number { return this._logicalHeight; }
  public get physicalWidth(): number { return this._physicalWidth; }
  public get physicalHeight(): number { return this._physicalHeight; }
  public get aspect(): number { return this._aspect; }
  public get devicePixelRatio(): number { return this._devicePixelRatio; }

  public get depthStencilTextureView(): GPUTextureView|null { return this._depth_stencil_texture_view; }

  public destroy() {
    if (this._resizeObserver) {
      this._resizeObserver?.disconnect();
      this._resizeObserver = null;
    }
    if (this._resolutionMediaQuery) {
      this._resolutionMediaQuery?.removeEventListener('change', this.onDisplayChanged);
      this._resolutionMediaQuery = null;
    }
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
      this._intersectionObserver = null;
    }
    if (this._depth_stencil_texture) {
      this._depth_stencil_texture.destroy();
      this._depth_stencil_texture = null;
    }
    this._onResizeEvent = null;
    this._onAnimationFrame = null;
  }

  private onDisplayChanged = () => {
    const canvas: HTMLCanvasElement|undefined = this._canvas.deref();
    if (canvas === undefined) {
      return;
    }

    const currentDevicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    if (this.devicePixelRatio != currentDevicePixelRatio) {
      this._resolutionMediaQuery?.removeEventListener('change', this.onDisplayChanged);
      this._devicePixelRatio = currentDevicePixelRatio;
      this._resolutionMediaQuery = window.matchMedia(`(resolution: ${currentDevicePixelRatio}dppx)`),
      this._resolutionMediaQuery.addEventListener('change', this.onDisplayChanged);
    }
    const box = canvas.getBoundingClientRect();
    this._logicalWidth = box?.width ?? 0;
    this._logicalHeight = box?.height ?? 0;
    this._physicalWidth = Math.max(1, Math.round(this.logicalWidth * this.devicePixelRatio));
    this._physicalHeight = Math.max(1, Math.round(this.logicalHeight * this.devicePixelRatio));
    this._aspect = this.physicalWidth / this.physicalHeight;

    // Assumes canvas is dynamically sized with CSS, skip setting canvas.style.{width|height}.
    canvas.width = Math.floor(this.physicalWidth);
    canvas.height = Math.floor(this.physicalHeight);

    this._depth_stencil_texture?.destroy();
    this._depth_stencil_texture = this._device.createTexture({
      size: [this.physicalWidth, this.physicalHeight],
      format: 'depth24plus-stencil8',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this._depth_stencil_texture_view = this._depth_stencil_texture.createView();

    this._onResizeEvent?.(this);
  }

  private onIntersectionObserver = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    const isVisible: boolean = entries[0]?.isIntersecting ?? false;
    if (this._state === ViewportState.Idle && isVisible) {
      this._state = ViewportState.Playing;
      requestAnimationFrame(this.onRequestAnimationFrame);
    } else if (this._state === ViewportState.Playing && !isVisible) {
      this._state = ViewportState.Stopping;
    }
  }

  private onRequestAnimationFrame = (timestamp: number) => {
    if (this._state !== ViewportState.Playing) {
      this._state = ViewportState.Idle;
      return;
    }
    this._onAnimationFrame?.(timestamp);
    if (this._state === ViewportState.Playing) {
      requestAnimationFrame(this.onRequestAnimationFrame);
    }
  }
}
