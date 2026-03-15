export const FrameContainerSymbol: unique symbol = Symbol();

export interface IFrameContainer {
  readonly [FrameContainerSymbol]: string;
  inner_frame?: HTMLIFrameElement;
};

export function isFrameContainer(value: unknown): value is IFrameContainer {
  return typeof value === 'object' && value !== null &&
         FrameContainerSymbol in value && typeof value[FrameContainerSymbol] === 'string';
}
