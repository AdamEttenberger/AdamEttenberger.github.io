import { Ref } from "vue";

export enum PropertyKind {
  Button = 'button',
  Color3 = 'color3',
  Color4 = 'color4',
  ComboBox = 'combobox',
  Divider = 'divider',
  Group = 'group',
  NumberRange = 'range',
  Toggle = 'toggle',
};

export type PropertyConverterFunc = (options: IPropertyValueOptions, value: any) => any;
export interface IPropertyConverter {
  toView: PropertyConverterFunc,
  toModel: PropertyConverterFunc,
};

export type MinMax = {
  min: any;
  max: any;
};

/**
 * Base type for all properties.
 */
export interface IPropertyOptions {
  //
  // Editor Constants
  //
  /** Which type of editor PropertyRow should generate and bind these options to. */
  kind: PropertyKind;
  /** Whether the PropertyRow label text should be visible. */
  show_label: boolean;
  /** Whether the PropertyRow undo button should be visible. */
  show_undo: boolean;

  //
  // Editor Options
  //
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
};

/**
 * Base type for all editable properties.
 */
export interface IPropertyValueOptions extends IPropertyOptions {
  /** The default model value, used to pre-populate an undefined model, and by PropertyRow for making the undo button visible. */
  default_value: any;
  /** The value used by property editors when creating two-way bindings. */
  modelValue?: Ref<any>;
  /**
   * Used to create an intermediary computed property for two-way binding in place of `modelValue` which allows for converting between actual and display values.
   * e.g., To display a number range in normalized form, or to convert between units (fahrenheit, celsius, kelvin).
   */
  converter?: IPropertyConverter;
};

//
// [[ PropertyOptions ]] Editor Options Implementations
//

export interface IPropertyButtonOptions extends IPropertyOptions {};

export interface IPropertyDividerOptions extends IPropertyOptions {};

//
// [[ PropertyValueOptions ]] Editor Options Implementations
//

export interface IPropertyColor3Options extends IPropertyValueOptions {};
export interface IPropertyColor4Options extends IPropertyValueOptions {};

export interface IPropertyComboBoxOptions extends IPropertyValueOptions {
  /** Array of ([key, value]) entries, where key is a unique identifier and value is the display text. */
  values: any;
};

export interface IPropertyGroupOptions extends IPropertyValueOptions {};

export interface IPropertyNumberRangeOptions extends IPropertyValueOptions {
  /** The min and max amount for the number range spinner and slider controls. */
  range: MinMax;
  /** The step amount for the number range spinner and slider controls. */
  step: any;
};

export interface IPropertyToggleOptions extends IPropertyValueOptions {
  /** Array passed to font-awesome-icon:icon used to indicate the toggle is checked. */
  icon?: any;
};

//
// Union Types
//

export type AnyPropertyOptions =
    IPropertyButtonOptions |
    IPropertyColor3Options |
    IPropertyComboBoxOptions |
    IPropertyDividerOptions |
    IPropertyGroupOptions |
    IPropertyNumberRangeOptions |
    IPropertyToggleOptions;
