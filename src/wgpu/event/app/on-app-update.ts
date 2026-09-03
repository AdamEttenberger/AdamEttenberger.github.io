import type App from '@/wgpu/core/app'
import type Viewport from '@/wgpu/core/viewport'
import EventHandler from '@/wgpu/event/event-handler'

export type OnAppUpdateArgs = [
  app: App,
  viewport: Viewport,
  timestamp: number,
];

export default class OnAppUpdate extends EventHandler<OnAppUpdateArgs> { }
