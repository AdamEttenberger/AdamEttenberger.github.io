import { type ThemeColor } from '@/composables/theme'
import { type AsyncComponentLoader, type MaybeRef, type MaybeRefOrGetter } from "vue";

export enum PropertyKind {
  Button = 'button',
  Color3 = 'color3',
  Color4 = 'color4',
  ComboBox = 'combobox',
  Divider = 'divider',
  Group = 'group',
  Label = 'label',
  NumberRange = 'range',
  Toggle = 'toggle',
};

export enum PropertyEmits {
  Changed = 'property-changed',
  Changing = 'property-changing',
  Click = 'property-click',
  Reset = 'property-reset',
}

export type PropertyFunction = (name: string, new_value?: unknown) => void;
export type PropertyFunctionWithEmits = (kind: PropertyEmits, name: string, new_value?: unknown) => void;
export type PropertyEmitFunctions = Record<PropertyEmits, PropertyFunction>;

export class PropertyEmitsHandler implements PropertyEmitFunctions {
  constructor(private handler: PropertyFunctionWithEmits) {}
  [PropertyEmits.Changed](name: string): void { this.handler(PropertyEmits.Changed, name); }
  [PropertyEmits.Changing](name: string, new_value: unknown): void { this.handler(PropertyEmits.Changing, name, new_value); }
  [PropertyEmits.Click](name: string): void { this.handler(PropertyEmits.Click, name); }
  [PropertyEmits.Reset](name: string): void { this.handler(PropertyEmits.Reset, name); }
}

export interface IPropertyConverter<T, TRow extends IPropertyDataRow<T> = IPropertyDataRow<T>> {
  toView(row: TRow, value: T): T;
  toModel(row: TRow, value: T): T;
}

export type MinMax = {
  min: number;
  max: number;
};

export interface IPropertyMeta {
  /** Which type of editor PropertyRow should generate and bind this row to. */
  readonly kind: PropertyKind;
  /** Whether the PropertyRow label text should be visible. */
  readonly with_label: boolean;
  /** Whether the PropertyRow reset button should be visible. */
  readonly with_reset: boolean;
  /** Whether the property editor should be clickable. */
  readonly with_click: boolean;
  /** Loads the <component> type for visualizing the property. */
  readonly component?: AsyncComponentLoader;
};

export interface IPropertyRow {
  readonly meta: IPropertyMeta;
  /** A unique name or identifier for the property, used for getting/setting model values and raising property notifications. */
  readonly name: string;
  /** Label for the property. This is either presented in the PropertyRow label column, or as the display text for editors that span multiple PropertyRow columns. */
  label: string;
  /** Whether the editor should be presented as 'disabled' and should not be interactable. */
  disabled: MaybeRefOrGetter<undefined|boolean>;
  /** Whether the editor should be made invisible and collapsed so it does not consume any space. */
  collapsed: MaybeRefOrGetter<undefined|boolean>;
  /** Theme color of the control An array of string HTML class names to append to the generated row item. */
  color: MaybeRefOrGetter<undefined|ThemeColor>;
};

export interface IPropertyDataRow<T> extends IPropertyRow {
  /** The default model value, used to pre-populate an undefined model, and by PropertyRow for making the reset button visible. */
  default_value: MaybeRefOrGetter<T>;
  /** The active model value which can be bound to a ref in the implementing context. Pre-populates with `default_value` when undefined or `ref(null)`. */
  modelValue?: MaybeRef<null|T>;
  /**
   * Used to create an intermediary computed property for two-way binding in place of `modelValue` which allows for converting between actual and display values.
   * e.g., To display a number range in normalized form, or to convert between units (fahrenheit, celsius, kelvin).
   */
  converter?: undefined|IPropertyConverter<T, IPropertyDataRow<T>>;
};

export interface IPropertyNumberRangeRow extends IPropertyDataRow<number> {
  // converter?: undefined|IPropertyConverter<number, IPropertyDataRow<number>>|IPropertyConverter<number, IPropertyNumberRangeRow>;

  /** The min and max amount for the number range spinner and slider controls. */
  range: MinMax;
  /** The step amount for the number range spinner and slider controls. */
  step: number;
};

export interface IPropertyComboBoxRow<TKey = string, TLabel = string> extends IPropertyDataRow<TKey> {
  converter?: IPropertyConverter<TKey, IPropertyDataRow<TKey>>|IPropertyConverter<TKey, IPropertyComboBoxRow<TKey, TLabel>>;
  /** Array of ([key, value]) entries, where key is a unique identifier and value is the display text. */
  values: Array<[TKey, TLabel]>;
};

export interface IPropertyToggleRow extends IPropertyDataRow<boolean> {
  /** Array passed to font-awesome-icon:icon used to indicate the toggle is checked. */
  icon?: Array<string>;
};

export type IPropertyButtonRow = IPropertyRow;
export type IPropertyColor3Row = IPropertyDataRow<[number, number, number, ...number[]]>;
export type IPropertyColor4Row = IPropertyDataRow<[number, number, number, number, ...number[]]>;
export type IPropertyDividerRow = IPropertyRow;
export type IPropertyGroupRow = IPropertyDataRow<boolean>;
export type IPropertyLabelRow = IPropertyDataRow<number|string>;

export interface PropertyTypeTable {
  [PropertyKind.Button]:        IPropertyButtonRow,
  [PropertyKind.Color3]:        IPropertyColor3Row,
  [PropertyKind.Color4]:        IPropertyColor4Row,
  [PropertyKind.ComboBox]:      IPropertyComboBoxRow,
  [PropertyKind.Divider]:       IPropertyDividerRow,
  [PropertyKind.Group]:         IPropertyGroupRow,
  [PropertyKind.Label]:         IPropertyLabelRow,
  [PropertyKind.NumberRange]:   IPropertyNumberRangeRow,
  [PropertyKind.Toggle]:        IPropertyToggleRow,
};

export type ExtractModelType<T> = T extends IPropertyDataRow<infer T> ? T : never;

export type PropertyTypeGeneric<TKind> = TKind extends keyof PropertyTypeTable
    ? (PropertyTypeTable[TKind] extends IPropertyRow ? PropertyTypeTable[TKind] : never)
    : never;
export type PropertyValueTypeGeneric<TKind> = TKind extends keyof PropertyTypeTable
    ? (PropertyTypeTable[TKind] extends IPropertyDataRow<ExtractModelType<PropertyTypeTable[TKind]>> ? PropertyTypeTable[TKind] : never)
    : never;

export type PropertyRowConverter<TPropertyType> = TPropertyType extends IPropertyDataRow<infer T>
    ? IPropertyConverter<T, IPropertyDataRow<T>>|IPropertyConverter<T, TPropertyType>
    : never;

export type PropertyType = PropertyTypeGeneric<keyof PropertyTypeTable>;
export function isPropertyType(item: unknown): item is PropertyType {
  return typeof item === 'object' && item !== null &&
         'meta' in item &&
         item.meta !== undefined &&
         'name' in item && typeof item.name === 'string' &&
         item.name.length > 0;
}

export type PropertyValueType = PropertyValueTypeGeneric<keyof PropertyTypeTable>;
export function isPropertyValueType(item: unknown): item is PropertyValueType {
  return isPropertyType(item) &&
         'default_value' in item &&
         item.default_value !== undefined;
}
