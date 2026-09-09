import type Viewport from '@/wgpu/core/viewport'
import EventHandler from '@/wgpu/event/event-handler'

export type OnViewportRenderArgs = [
  viewport: Viewport,
  timestamp: number,
];

export default class OnViewportRenderHandler extends EventHandler<OnViewportRenderArgs> { }
