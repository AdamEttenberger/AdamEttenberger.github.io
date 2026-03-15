import { readonly, type AsyncComponentLoader, type MaybeRef, type MaybeRefOrGetter } from 'vue'
import {
  type MinMax,
  PropertyKind,

  // Utility Interfaces
  type ExtractModelType,
  type IPropertyConverter,

  // Base Property Interfaces
  type IPropertyMeta,
  type IPropertyRow,
  type IPropertyDataRow,

  // Editor Property Interfaces
  type IPropertyColor3Row,
  type IPropertyColor4Row,
  type IPropertyComboBoxRow,
  type IPropertyGroupRow,
  type IPropertyLabelRow,
  type IPropertyNumberRangeRow,
  type IPropertyToggleRow,
  type PropertyRowConverter,
} from '@/util/property_editor/property_interfaces'
import { type ThemeColor } from '@/composables/theme'

export {
  type MinMax,
  PropertyKind,
};

type PropertyMetaRecord = Record<PropertyKind, Readonly<IPropertyMeta>>;
function toRecords(items: Array<IPropertyMeta>): PropertyMetaRecord {
  return Object.fromEntries(items.map(item => [item.kind, readonly<IPropertyMeta>(item)])) as PropertyMetaRecord;
}

class PropertyMeta implements IPropertyMeta {
  constructor(public kind: PropertyKind,
              public with_label: boolean,
              public with_reset: boolean,
              public with_click: boolean,
              public component?: AsyncComponentLoader) {}
}

const PropertyMetatables: PropertyMetaRecord = toRecords([
  //             { kind,                      with_label, with_reset, with_click,   component? }
  new PropertyMeta(PropertyKind.Button,       false,      false,      true,         () => import('@/components/property_editor/rows/property_button.vue')),
  new PropertyMeta(PropertyKind.Color3,       true,       true,       false,        undefined),
  new PropertyMeta(PropertyKind.Color4,       true,       true,       false,        undefined),
  new PropertyMeta(PropertyKind.ComboBox,     true,       true,       false,        () => import('@/components/property_editor/rows/property_combo_box.vue')),
  new PropertyMeta(PropertyKind.Divider,      false,      false,      false,        () => import('@/components/property_editor/rows/property_divider.vue')),
  new PropertyMeta(PropertyKind.Group,        false,      false,      false,        () => import('@/components/property_editor/rows/property_group.vue')),
  new PropertyMeta(PropertyKind.Label,        true,       false,      false,        () => import('@/components/property_editor/rows/property_label.vue')),
  new PropertyMeta(PropertyKind.NumberRange,  true,       true,       false,        () => import('@/components/property_editor/rows/property_number_range.vue')),
  new PropertyMeta(PropertyKind.Toggle,       true,       true,       true,         () => import('@/components/property_editor/rows/property_toggle.vue')),
]);

class NumberReciprocalConverter implements IPropertyConverter<number> {
  #transform(value: number) { return 1.0 / value; }
  toView(row: IPropertyDataRow<number>, model_value: number): number { return this.#transform(model_value); }
  toModel(row: IPropertyDataRow<number>, view_value: number): number { return this.#transform(view_value); }
};

class NumberRangeConverter implements IPropertyConverter<number, IPropertyNumberRangeRow> {
  view_range: MinMax;
  constructor(min: number, max: number) {
    this.view_range = { min, max };
  }
  #transform(value: number, min1: number, max1: number, min2: number, max2: number) {
    return ((value - min1) / (max1 - min1) * (max2 - min2)) + min2;
  }

  toView(row: IPropertyNumberRangeRow, model_value: number): number;
  toView(row: IPropertyNumberRangeRow, model_value: number): number {
    return this.#transform(model_value, row.range.min, row.range.max,
                                        this.view_range.min, this.view_range.max);
  }
  toModel(row: IPropertyNumberRangeRow, view_value: number): number;
  toModel(row: IPropertyNumberRangeRow, view_value: number): number {
    return this.#transform(view_value, this.view_range.min, this.view_range.max,
                                       row.range.min, row.range.max);
  }
}

/**
 * Base type for all property rows.
 */
abstract class PropertyRow implements IPropertyRow {
  public abstract readonly meta: IPropertyMeta;
  public disabled: MaybeRefOrGetter<undefined|boolean>;
  public collapsed: MaybeRefOrGetter<undefined|boolean>;
  public color: MaybeRefOrGetter<undefined|ThemeColor>;

  constructor(public readonly name: string,
              public readonly label: string) {}

  setDisabled(disabled: MaybeRefOrGetter<undefined|boolean>): this {
    this.disabled = disabled;
    return this;
  }

  setCollapsed(collapsed: MaybeRefOrGetter<undefined|boolean>): this {
    this.collapsed = collapsed;
    return this;
  }

  setColor(color: MaybeRefOrGetter<undefined|ThemeColor>): this {
    this.color = color;
    return this;
  }
};

/**
 * Base type for all property rows with a model value.
 */
abstract class PropertyDataRow<T> extends PropertyRow implements IPropertyDataRow<T> {
  modelValue?: MaybeRef<null|T>;
  converter?: IPropertyConverter<T, IPropertyDataRow<T>>;

  constructor(name: string,
              label: string,
              public default_value: MaybeRefOrGetter<T>) {
    super(name, label);
  }

  setModel(modelValue?: MaybeRef<null|T>): this {
    this.modelValue = modelValue;
    return this;
  }

  setConverter(converter?: IPropertyConverter<T, IPropertyDataRow<T>>): this {
    this.converter = converter;
    return this;
  }
};

export class ButtonRow extends PropertyRow {
  readonly meta = PropertyMetatables[PropertyKind.Button];
};
export class DividerRow extends PropertyRow{
  readonly meta = PropertyMetatables[PropertyKind.Divider];
};

export class LabelRow extends PropertyDataRow<ExtractModelType<IPropertyLabelRow>> implements IPropertyLabelRow {
  readonly meta = PropertyMetatables[PropertyKind.Label];
};

export class Color3Row extends PropertyDataRow<ExtractModelType<IPropertyColor3Row>> implements IPropertyColor3Row {
  readonly meta = PropertyMetatables[PropertyKind.Color3];
};

export class Color4Row extends PropertyDataRow<ExtractModelType<IPropertyColor4Row>> implements IPropertyColor4Row {
  readonly meta = PropertyMetatables[PropertyKind.Color4];
};

export class ComboBoxRow<TKey = string, TValue = string> extends PropertyDataRow<ExtractModelType<IPropertyComboBoxRow<TKey, TValue>>> implements IPropertyComboBoxRow<TKey, TValue> {
  readonly meta = PropertyMetatables[PropertyKind.ComboBox];
  declare converter?: PropertyRowConverter<IPropertyComboBoxRow<TKey, TValue>>;
  setConverter(converter?: PropertyRowConverter<IPropertyComboBoxRow<TKey, TValue>>): this {
    return super.setConverter(converter);
  }

  constructor(name: string,
              label: string,
              default_value: MaybeRefOrGetter<ExtractModelType<IPropertyComboBoxRow<TKey, TValue>>>,
              public values: Array<[TKey, TValue]>) {
    super(name, label, default_value);
  }

  setValues(values: Array<[TKey, TValue]>): this {
    this.values = values;
    return this;
  }
};

export class GroupRow extends PropertyDataRow<ExtractModelType<IPropertyGroupRow>> implements IPropertyGroupRow {
  readonly meta = PropertyMetatables[PropertyKind.Group];
};

export class NumberRangeRow extends PropertyDataRow<ExtractModelType<IPropertyNumberRangeRow>> implements IPropertyNumberRangeRow {
  readonly meta = PropertyMetatables[PropertyKind.NumberRange];
  declare converter?: PropertyRowConverter<IPropertyNumberRangeRow>;
  setConverter(converter?: PropertyRowConverter<IPropertyNumberRangeRow>): this {
    return super.setConverter(converter);
  }

  range: MinMax;

  constructor(name: string,
              label: string,
              default_value: MaybeRefOrGetter<ExtractModelType<IPropertyNumberRangeRow>>,
              min: number,
              max: number,
              public step: number) {
    super(name, label, default_value);
    this.range = { min, max };
  }

  setRange(range: MinMax): this {
    this.range = range;
    return this;
  }
  setStep(step: number): this {
    this.step = step;
    return this;
  }
  /** Display the value as its reciprocal. */
  asReciprocal(): this {
    return this.setConverter(new NumberReciprocalConverter());
  }
  /** Display the value proportionally within the specified range. */
  asRange(min: number, max: number): this {
    return this.setConverter(new NumberRangeConverter(min, max));
  }
  /** Display the value normalized to the range [0.0, 1.0]. */
  asScalar(): this {
    return this.asRange(0.0, 1.0);
  }
};

export class ToggleRow extends PropertyDataRow<ExtractModelType<IPropertyToggleRow>> implements IPropertyToggleRow {
  readonly meta = PropertyMetatables[PropertyKind.Toggle];
  declare converter?: PropertyRowConverter<IPropertyToggleRow>;
  setConverter(converter?: PropertyRowConverter<IPropertyToggleRow>): this {
    return super.setConverter(converter);
  }

  /** Array passed to font-awesome-icon:icon used to indicate the toggle is checked. */
  icon?: Array<string>;

  setIcon(icon?: Array<string>): this {
    this.icon = icon;
    return this;
  }
};
