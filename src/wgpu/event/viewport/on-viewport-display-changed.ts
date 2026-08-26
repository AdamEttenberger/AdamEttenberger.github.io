import type Viewport from '@/wgpu/core/viewport'
import EventHandler from '@/wgpu/event/event-handler'

export type OnViewportDisplayChangedArgs = [
  viewport: Viewport,
];

export default class OnViewportDisplayChanged extends EventHandler<OnViewportDisplayChangedArgs> { }
