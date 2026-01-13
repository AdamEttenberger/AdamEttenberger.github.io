export enum PropertyKind {
  Button = 'button',
  ComboBox = 'combobox',
  NumberRange = 'range',
  Toggle = 'toggle',
};

/**
 * Base type for all properties.
 */
export type PropertyOptions = {
  kind: PropertyKind;
  classes?: any; /* Array of string HTML class names to append to the row item */
  name: any;
  label: any;
  disabled?: any;
  collapsed?: any;
};

/**
 * Base type for all editable properties.
 */
export type PropertyValueOptions = {
  default_value: any;
  model?: any;
} & PropertyOptions;

//
// Editor Options Implementations
//

export type ButtonOptions = {
  kind: PropertyKind.Button;
  text: any;
} & PropertyOptions;

export type ComboBoxOptions = {
  kind: PropertyKind.ComboBox;
  values: any;
} & PropertyValueOptions;

export type NumberRangeOptions = {
  kind: PropertyKind.NumberRange;
  min_value: any;
  max_value: any;
  step_value: any;
  as_scalar?: any;
} & PropertyValueOptions;

export type ToggleOptions = {
  kind: PropertyKind.Toggle;
  icon?: any;
} & PropertyValueOptions;


//
// Union Types
//

export type AnyPropertyOptions = ButtonOptions | ComboBoxOptions | NumberRangeOptions | ToggleOptions;
