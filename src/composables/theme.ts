import { computed, inject, InjectionKey, provide, readonly, ref } from 'vue'

export type ThemeDepth = null|0|1|2|3|4|5|6|7|8|9|10;
export enum ThemeColor {
  Primary = 'primary',
  Secondary = 'secondary',
  Accent = 'accent',
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
  Todo = 'todo',
};

export const ThemeGradientSlots: Array<String> = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

export const CoreThemeColors: Partial<Record<ThemeColor, String>> = {
  [ThemeColor.Primary]: ThemeColor.Primary,
  [ThemeColor.Secondary]: ThemeColor.Secondary,
  [ThemeColor.Accent]: ThemeColor.Accent,
};

export const NoteThemeColors: Partial<Record<ThemeColor, String>> = {
  [ThemeColor.Info]: ThemeColor.Info,
  [ThemeColor.Error]: ThemeColor.Error,
  [ThemeColor.Warning]: ThemeColor.Warning,
  [ThemeColor.Todo]: ThemeColor.Todo,
};

export const ThemeColorDisplayStrings: Record<ThemeColor, String> = {
  [ThemeColor.Primary]: "Primary",
  [ThemeColor.Secondary]: "Secondary",
  [ThemeColor.Accent]: "Accent",
  [ThemeColor.Error]: "Error",
  [ThemeColor.Info]: "Info",
  [ThemeColor.Warning]: "Warning",
  [ThemeColor.Todo]: "To Do",
};

export const NoteKindDisplayStrings: Record<ThemeColor, String> = {
  [ThemeColor.Primary]: "Info",
  [ThemeColor.Secondary]: "Info",
  [ThemeColor.Accent]: "Info",
  [ThemeColor.Info]: "Info",
  [ThemeColor.Error]: "Error",
  [ThemeColor.Warning]: "Warning",
  [ThemeColor.Todo]: "Under Construction",
};

export interface ThemeOptions {
  /**
   * ThemeColor to apply to participating descendants.
   */
  color?: ThemeColor;
  /**
   * Depth of the current layer
   */
  depth?: ThemeDepth;
  /**
   * Default false; whether `depth` is an absolute value, or relative to parent depth.
   */
  absolute?: Boolean;
};

export class ThemeLayer {
  constructor(public color: ThemeColor = ThemeColor.Primary,
              public depth: ThemeDepth = 0) {}

  get classNames(): Array<String> {
    return [
      `theme-color-${this.color}`,
      `theme-depth-${this.depth}`,
    ];
  }
};

export type ThemeOptionsFunc = () => ThemeOptions;
const ThemeLayerParent: InjectionKey<ThemeLayer> = Symbol('theme-layer:parent');

/**
 * Injects the enclosing <ThemeLayer> and optionally Provides a new <ThemeLayer> for a Vue component.
 *
 * Example, create a new layer stack at depth 0:
 * const { parent_theme, theme } = useTheme(() => ({
 *   color: ThemeColor.Primary,
 *   depth: 0,
 *   absolute: true,
 * }));
 *
 * Example, create a new layer without affecting color, but increase the depth by 1 relative to the parent:
 * const { parent_theme, theme } = useTheme(() => ({
 *   depth: 1,
 * }));
 *
 * Example: Overwrite the color for descendants without affecting depth.
 * const { theme } = useTheme(() => ({ color: ThemeColor.Primary }));
 *
 * Example: Retrieve the enclosing <ThemeLayer> without any adjustments, and without issuing a new Provide for the current depth.
 * const { theme } = useTheme();
 *
 *
 * @param func Function which returns a ThemeOptions for computing reactive changes.
 * @param key Allows creating an alternate hierarchy of <ThemeOptions>.
 * @returns An Object containing { parent_theme, theme }
 */
export default function useTheme(func?: ThemeOptionsFunc, key: InjectionKey<ThemeLayer> = ThemeLayerParent) {
  const parent_theme = inject<ThemeLayer>(key, () => readonly<ThemeLayer>(ref<ThemeLayer>(new ThemeLayer(ThemeColor.Primary, 0))), true);
  var theme = parent_theme;
  if (func) {
    theme = computed<ThemeLayer>(() => {
      const args: ThemeOptions = func();
      var depth = parent_theme.value.depth;
      if (typeof args?.depth === 'number') {
        depth = (args?.absolute)
            ? args.depth
            : depth + args.depth;
      }
      return new ThemeLayer(args?.color ?? parent_theme.value.color, depth);
    });
    provide<ThemeLayer>(key, readonly<ThemeLayer>(theme));
  }

  return {
    parent_theme,
    theme,
  };
};
