import PropertyRowBuilder from '@/util/property_editor/property_row_builder'
import PropertyButtonBuilder, { type PropertyButtonOptions } from '@/util/property_editor/property_button_builder'
import PropertyComboBoxBuilder, { type PropertyComboBoxOptions } from '@/util/property_editor/property_combo_box_builder'
import PropertyNumberRangeBuilder, { type PropertyNumberRangeOptions } from '@/util/property_editor/property_number_range_builder'
import PropertyToggleBuilder, { type PropertyToggleOptions }  from '@/util/property_editor/property_toggle_builder'

export {
  PropertyRowBuilder,
  PropertyButtonBuilder,
  PropertyButtonOptions,
  PropertyComboBoxBuilder,
  PropertyComboBoxOptions,
  PropertyNumberRangeBuilder,
  PropertyNumberRangeOptions,
  PropertyToggleBuilder,
  PropertyToggleOptions,
};

export type PropertyRowBuilderTypes =
  PropertyButtonBuilder |
  PropertyComboBoxBuilder |
  PropertyNumberRangeBuilder |
  PropertyToggleBuilder;

export enum PropertyRowType {
  Button = 'button',
  ComboBox = 'combobox',
  NumberRange = 'range',
  Toggle = 'toggle',
};

export type PropertyRowData = {
  type: PropertyRowType;
  label?: any;
  model?: any;
  disabled?: any;
};

export default class PropertyBuilder {
  _result: Map<string, PropertyRowBuilderTypes> = new Map<string, PropertyRowBuilderTypes>();

  addProperty(name: string, builder: PropertyRowBuilderTypes): PropertyBuilder {
    this._result.set(name, builder);
    return this;
  }

  build(): Object {
    var result = this._result;
    this._result = null;
    return Object.fromEntries(result.entries().map(([name, builder]) => [name, builder.build()]));;
  }
};
