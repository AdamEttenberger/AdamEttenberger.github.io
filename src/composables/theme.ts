import { computed, inject, InjectionKey, provide, readonly, ref } from 'vue'

export type ThemeDepth = null|0|1|2|3|4|5|6|7|8|9;
export enum ThemeColor {
  Primary = 'primary',
  Secondary = 'secondary',
  Accent = 'accent',
  Error = 'error',
  Info = 'info',
  Question = 'question',
  Warning = 'warning',
  Todo = 'todo',
};

export const CoreThemeColors: Partial<Record<ThemeColor, String>> = {
  [ThemeColor.Primary]: ThemeColor.Primary,
  [ThemeColor.Secondary]: ThemeColor.Secondary,
  [ThemeColor.Accent]: ThemeColor.Accent,
};

export const NoteThemeColors: Partial<Record<ThemeColor, String>> = {
  [ThemeColor.Info]: ThemeColor.Info,
  [ThemeColor.Error]: ThemeColor.Error,
  [ThemeColor.Question]: ThemeColor.Question,
  [ThemeColor.Warning]: ThemeColor.Warning,
  [ThemeColor.Todo]: ThemeColor.Todo,
};

export const ThemeColorDisplayStrings: Record<ThemeColor, String> = {
  [ThemeColor.Primary]: "Primary",
  [ThemeColor.Secondary]: "Secondary",
  [ThemeColor.Accent]: "Accent",
  [ThemeColor.Error]: "Error",
  [ThemeColor.Info]: "Info",
  [ThemeColor.Question]: "Question",
  [ThemeColor.Warning]: "Warning",
  [ThemeColor.Todo]: "To Do",
};

export const NoteKindDisplayStrings: Record<ThemeColor, String> = {
  [ThemeColor.Primary]: "Info",
  [ThemeColor.Secondary]: "Info",
  [ThemeColor.Accent]: "Info",
  [ThemeColor.Info]: "Info",
  [ThemeColor.Error]: "Error",
  [ThemeColor.Question]: "Question",
  [ThemeColor.Warning]: "Warning",
  [ThemeColor.Todo]: "Under Construction",
};

interface ThemeOptions {
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
  constructor(public color: ThemeColor,
              public depth: ThemeDepth) {}
};

export type ThemeOptionsFunc = () => ThemeOptions;
const ThemeLayerParent: InjectionKey<ThemeLayer> = Symbol('theme-layer:parent');

/**
 * Injects the enclosing <ThemeLayer> and optionally Provides a new <ThemeLayer> for a Vue component.
 *
 * Example, create a new layer stack at depth 0:
 * const { parent_layer_info, current_layer_info } = useTheme(() => ({
 *   color: ThemeColor.Primary,
 *   depth: 0,
 *   absolute: true,
 * }));
 *
 * Example, create a new layer without affecting color, but increase the depth by 1 relative to the parent:
 * const { parent_layer_info, current_layer_info } = useTheme(() => ({
 *   depth: 1,
 * }));
 *
 * Example: Overwrite the color for descendants without affecting depth.
 * const { current_layer_info } = useTheme(() => ({ color: ThemeColor.Primary }));
 *
 * Example: Retrieve the enclosing <ThemeLayer> without any adjustments, and without issuing a new Provide for the current depth.
 * const { current_layer_info } = useTheme();
 *
 *
 * @param func Function which returns a ThemeOptions for computing reactive changes.
 * @param key Allows creating an alternate hierarchy of <ThemeOptions>.
 * @returns An Object containing { parent_layer_info, current_layer_info }
 */
export default function useTheme(func?: ThemeOptionsFunc, key: InjectionKey<ThemeLayer> = ThemeLayerParent) {
  const parent_layer_info = inject<ThemeLayer>(key, () => readonly<ThemeLayer>(ref<ThemeLayer>(new ThemeLayer(ThemeColor.Primary, 0))), true);
  var current_layer_info = parent_layer_info;
  if (func) {
    current_layer_info = computed<ThemeLayer>(() => {
      const args: ThemeOptions = func();
      var depth = parent_layer_info.value.depth;
      if (args?.depth) {
        if (args?.absolute) {
          depth = (args?.depth ?? 0);
        } else {
          depth += args?.depth;
        }
      }
      return new ThemeLayer(args?.color ?? parent_layer_info.value.color, depth);
    });
    provide<ThemeLayer>(key, readonly<ThemeLayer>(current_layer_info));
  }

  return {
    parent_layer_info,
    current_layer_info,
  };
};
