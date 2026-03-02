import { computed, inject, type InjectionKey, provide, ref, type Ref, type MaybeRefOrGetter, toValue } from 'vue'
import { createInverseRecord } from '@/util/record'

export type ThemeDepth = 0|1|2|3|4|5|6|7|8|9|10;
export type ThemeGradientSlot = '50'|'100'|'200'|'300'|'400'|'500'|'600'|'700'|'800'|'900'|'950';

export enum ThemeColor {
  Primary = 'primary',
  Secondary = 'secondary',
  Accent = 'accent',
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
  Todo = 'todo',
};

export type ThemeColorKey = keyof typeof ThemeColor;
export type CoreThemeColorKey = Extract<ThemeColorKey, 'Primary'|'Secondary'|'Accent'>;
export type NoteThemeColorKey = Extract<ThemeColorKey, 'Error'|'Info'|'Warning'|'Todo'>;
export type CoreThemeColor = typeof ThemeColor[CoreThemeColorKey];
export type NoteThemeColor = typeof ThemeColor[NoteThemeColorKey];

export enum ThemeColorGroup {
  Core = 'core',
  Note = 'note',
};

export interface IThemeColorMeta {
  readonly group: ThemeColorGroup;
  readonly name: string;
}

export interface INoteThemeColorMeta extends IThemeColorMeta {
  readonly heading: string;
  readonly icon: Array<string>;
}

const ThemeGradientSlots = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const satisfies readonly ThemeGradientSlot[];
export const ThemeDepthGradient: Record<ThemeDepth, ThemeGradientSlot> = ThemeGradientSlots.reduce(
  (result, item, index) => {
    result[index as ThemeDepth] = item;
    return result;
  },
  <Record<ThemeDepth, ThemeGradientSlot>>{}
);
export const ThemeGradientDepth: Record<ThemeGradientSlot, ThemeDepth> = createInverseRecord(ThemeDepthGradient);
export const ThemeColorKeyLookup: Record<ThemeColor, ThemeColorKey> = createInverseRecord(ThemeColor);

export const CoreThemeColorMetatable: Readonly<Record<CoreThemeColor, IThemeColorMeta>> = {
  [ThemeColor.Primary]:    { group: ThemeColorGroup.Core, name: 'Primary'   },
  [ThemeColor.Secondary]:  { group: ThemeColorGroup.Core, name: 'Secondary' },
  [ThemeColor.Accent]:     { group: ThemeColorGroup.Core, name: 'Accent'    },
};

export const NoteThemeColorMetatable: Readonly<Record<NoteThemeColor, INoteThemeColorMeta>> = {
  [ThemeColor.Error]:      { group: ThemeColorGroup.Note, name: 'Error',    heading: 'Error',              icon: ['fas', 'circle-exclamation']    },
  [ThemeColor.Info]:       { group: ThemeColorGroup.Note, name: 'Info',     heading: 'Info',               icon: ['fas', 'circle-info']           },
  [ThemeColor.Warning]:    { group: ThemeColorGroup.Note, name: 'Warning',  heading: 'Warning',            icon: ['fas', 'triangle-exclamation']  },
  [ThemeColor.Todo]:       { group: ThemeColorGroup.Note, name: 'To Do',    heading: 'Under Construction', icon: ['fas', 'road-barrier']          },
};

export const ThemeColorMetatable: Readonly<Record<ThemeColor, IThemeColorMeta | INoteThemeColorMeta>> = {
  ...CoreThemeColorMetatable,
  ...NoteThemeColorMetatable,
};

export function isCoreThemeColor(value: ThemeColor): value is CoreThemeColor {
  return ThemeColorMetatable[value].group === ThemeColorGroup.Core;
}

export function isNoteThemeColor(value: ThemeColor): value is NoteThemeColor {
  return ThemeColorMetatable[value].group === ThemeColorGroup.Note;
}

export const CoreThemeColors =
    Object.values(ThemeColor).filter(isCoreThemeColor).reduce(
      (result, item) => {
        result[ThemeColorKeyLookup[item] as CoreThemeColorKey] = item;
        return result;
      },
      <Record<CoreThemeColorKey, CoreThemeColor>>{}
    );

export const NoteThemeColors =
    Object.values(ThemeColor).filter(isNoteThemeColor).reduce(
      (result, item) => {
        result[ThemeColorKeyLookup[item] as NoteThemeColorKey] = item;
        return result;
      },
      <Record<NoteThemeColorKey, NoteThemeColor>>{}
    );

export function getThemeColorName(value: ThemeColor) {
  return ThemeColorMetatable[value].name;
}
export function getNoteHeading(value: NoteThemeColor) {
  return NoteThemeColorMetatable[value].heading;
}
export function getNoteIcon(value: NoteThemeColor) {
  return NoteThemeColorMetatable[value].icon;
}

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
  absolute?: boolean;
};

export class ThemeLayer {
  constructor(public color: ThemeColor = ThemeColor.Primary,
              public depth: ThemeDepth = 0) {}

  get classNames(): Array<string> {
    return [
      `theme-color-${this.color}`,
      `theme-depth-${this.depth.toFixed()}`,
    ];
  }
};

export type ThemeOptionsFunc = () => ThemeOptions;
const ThemeLayerParent: InjectionKey<ThemeLayer> = Symbol('theme-layer:parent');

export interface IThemeProps {
  color?: ThemeColor;
  depth?: number;
  absolute?: boolean;
  /**
   * Prevents the layer from drawing a background or adding to the layer depth.
   * This is useful for situations where you want a <Section> or <Details> without
   * adding a background or affecting descendant colors, or to temporarily disable
   * stop drawing the background of a layer.
   */
  transparent?: boolean;
};

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
export default function useTheme(initial_options?: MaybeRefOrGetter<ThemeOptions>, key: InjectionKey<ThemeLayer> = ThemeLayerParent) {
  type Context = Readonly<Ref<ThemeLayer>>;
  const parent_theme = inject<Context>(key, () => ref(new ThemeLayer(ThemeColor.Primary, 0)), true);
  let local_theme: Context = parent_theme;

  const theme = computed<ThemeLayer>(() => toValue(local_theme ?? parent_theme));

  function set(new_value: MaybeRefOrGetter<ThemeOptions>) {
    const options = toValue(new_value);
    let depth = parent_theme.value.depth;
    if (typeof options.depth === 'number') {
      depth = (options.absolute)
          ? options.depth
          : (depth + options.depth) as ThemeDepth;
    }
    local_theme = ref(new ThemeLayer(options.color ?? parent_theme.value.color, depth));
    provide<Context>(key, theme);
  }

  if (initial_options) {
    set(initial_options);
  }

  return {
    parent_theme,
    theme,
    set,
  };
};
