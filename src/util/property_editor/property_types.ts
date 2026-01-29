import { computed, Ref, unref } from 'vue'
import {
  type AnyPropertyOptions,
  type MinMax,
  PropertyKind,

  // Utility Interfaces
  IPropertyConverter,
  IRangePropertyConverter,

  // Base Property Interfaces
  IPropertyValueOptions,
  IPropertyOptions,

  // Editor Property Interfaces
  IPropertyButtonOptions,
  IPropertyColor3Options,
  IPropertyColor4Options,
  IPropertyComboBoxOptions,
  IPropertyDividerOptions,
  IPropertyGroupOptions,
  IPropertyNumberRangeOptions,
  IPropertyToggleOptions,
} from '@/util/property_editor/property_interfaces'

export {
  type AnyPropertyOptions,
  type MinMax,
  PropertyKind,
};

class NumberReciprocalConverter implements IPropertyConverter {
  #transform(value) { return 1.0 / value; }
  toView(options: IPropertyValueOptions, model_value) { return this.#transform(model_value); }
  toModel(options: IPropertyValueOptions, view_value) { return this.#transform(view_value); }
};

class NumberRangeConverter implements IPropertyConverter {
  view_range: any;
  constructor(min, max) {
    this.view_range = { min, max };
  }
  #transform(value, min1, max1, min2, max2) {
    return ((value - min1) / (max1 - min1) * (max2 - min2)) + min2;
  }

  toView(options: IPropertyValueOptions, model_value);
  toView(options: IPropertyNumberRangeOptions, model_value) {
    if (!options.range) return model_value;
    return this.#transform(model_value, options.range.min, options.range.max, this.view_range.min, this.view_range.max);
  }
  toModel(options: IPropertyValueOptions, view_value);
  toModel(options: IPropertyNumberRangeOptions, view_value) {
    if (!options.range) return view_value;
    return this.#transform(view_value, this.view_range.min, this.view_range.max, options.range.min, options.range.max);
  }
}

/**
 * Base type for all property options.
 */
class PropertyOptions implements IPropertyOptions {
  // Editor Constants
  /** Which type of editor PropertyRow should generate and bind these options to. */
  kind: PropertyKind;
  /** Whether the PropertyRow label text should be visible. */
  show_label: boolean;
  /** Whether the PropertyRow undo button should be visible. */
  show_undo: boolean;

  // Editor Options
  /** A unique name or identifier for the property, used for getting/setting model values and raising property notifications. */
  name: any;
  /** Label for the property. This is either presented in the PropertyRow label column, or as the display text for editors that span multiple PropertyRow columns. */
  label: any;
  /** Whether the editor should be presented as 'disabled' and should not be interactable. */
  disabled?: any;
  /** Whether the editor should be made invisible and collapsed so it does not consume any space. */
  collapsed?: any;
  /** An array of string HTML class names to append to the generated row item. */
  classes?: any;

  constructor(name, label) {
    this.name = name;
    this.label = label;
  }

  setName(name): this {
    this.name = name;
    return this;
  }

  setLabel(label): this {
    this.label = label;
    return this;
  }

  setDisabled(disabled?: any): this {
    this.disabled = disabled;
    return this;
  }

  setCollapsed(collapsed?: any): this {
    this.collapsed = collapsed;
    return this;
  }

  setClasses(classes?: any): this {
    this.classes = classes;
    return this;
  }
}

/**
 * Base type for all property options that have a model value.
 */
class PropertyValueOptions extends PropertyOptions implements IPropertyValueOptions {
  /** The default model value, used to pre-populate an undefined model, and by PropertyRow for making the undo button visible. */
  default_value: any;
  /** The value used by property editors when creating two-way bindings. */
  modelValue?: Ref<any>;
  /**
   * Used to create an intermediary computed property for two-way binding in place of `modelValue` which allows for converting between actual and display values.
   * e.g., To display a number range in normalized form, or to convert between units (fahrenheit, celsius, kelvin).
   */
  converter?: IPropertyConverter;

  constructor(name, label, default_value) {
    super(name, label);
    this.default_value = default_value;
  }

  setDefault(default_value): this {
    this.default_value = default_value;
    return this;
  }

  setModel(model?: Ref<any>): this {
    this.modelValue = model;
    return this;
  }

  setConverter(converter?: IPropertyConverter): this {
    this.converter = converter;
    return this;
  }
};

export class ButtonOptions extends PropertyOptions implements IPropertyButtonOptions {
  kind = PropertyKind.Button;
  show_label = false;
  show_undo = false;

  constructor(name, label) {
    super(name, label);
  }
};
export class DividerOptions extends PropertyOptions implements IPropertyDividerOptions {
  kind = PropertyKind.Divider;
  show_label = false;
  show_undo = false;

  constructor(name, label) {
    super(name, label);
  }
};

export class Color3Options extends PropertyValueOptions implements IPropertyColor3Options {
  kind = PropertyKind.Color3;
  show_label = true;
  show_undo = true;

  constructor(name, label, default_value) {
    super(name, label, default_value);
  }
};

export class Color4Options extends PropertyValueOptions implements IPropertyColor4Options {
  kind = PropertyKind.Color4;
  show_label = true;
  show_undo = true;

  constructor(name, label, default_value) {
    super(name, label, default_value);
  }
};

export class ComboBoxOptions extends PropertyValueOptions implements IPropertyComboBoxOptions {
  kind = PropertyKind.ComboBox;
  show_label = true;
  show_undo = true;
  /** Array of ([key, value]) entries, where key is a unique identifier and value is the display text. */
  values: any;

  constructor(name, label, default_value, values) {
    super(name, label, default_value);
    this.values = values;
  }
  setValues(values): this {
    this.values = values;
    return this;
  }
};

export class GroupOptions extends PropertyValueOptions implements IPropertyGroupOptions {
  kind = PropertyKind.Group;
  show_label = false;
  show_undo = false;

  constructor(name, label, default_value) {
    super(name, label, default_value);
  }
};

export class NumberRangeOptions extends PropertyValueOptions implements IPropertyNumberRangeOptions {
  kind = PropertyKind.NumberRange;
  show_label = true;
  show_undo = true;

  /** The min and max amount for the number range spinner and slider controls. */
  range: MinMax;
  /** The step amount for the number range spinner and slider controls. */
  step: any;

  constructor(name, label, default_value, min, max, step) {
    super(name, label, default_value);
    this.range = { min, max };
    this.step = step;
  }

  setRange(range: MinMax): this {
    this.range = range;
    return this;
  }
  setStep(step): this {
    this.step = step;
    return this;
  }
  /** Display the value as its reciprocal. */
  asReciprocal(): this {
    return this.setConverter(new NumberReciprocalConverter());
  }
  /** Display the value proportionally within the specified range. */
  asRange(min, max): this {
    return this.setConverter(new NumberRangeConverter(min, max));
  }
  /** Display the value normalized to the range [0.0, 1.0]. */
  asScalar(): this {
    return this.asRange(0.0, 1.0);
  }
};

export class ToggleOptions extends PropertyValueOptions implements IPropertyToggleOptions {
  kind = PropertyKind.Toggle;
  show_label = true;
  show_undo = true;
  /** Array passed to font-awesome-icon:icon used to indicate the toggle is checked. */
  icon?: any;

  constructor(name, label, default_value) {
    super(name, label, default_value);
  }

  setIcon(icon?: any): this {
    this.icon = icon;
    return this;
  }
};
