import { PropertyRowType, PropertyRowBuilder } from '@/util/property_editor/property_builder'

export type PropertyComboBoxOptions = {
  values: any;
};

export default class PropertyComboBoxBuilder extends PropertyRowBuilder<PropertyComboBoxBuilder> {
  options: PropertyComboBoxOptions;

  constructor(label?: any, model?: any) {
    super(PropertyRowType.ComboBox, label, model);
  }

  setValues(values: any): PropertyComboBoxBuilder {
    this.options = {
      ...this.options,
      values,
    };
    return this;
  }

  build(): Object {
    var options = this.options;
    this.options = null;
    return {
      ...super.build(),
      options,
    };
  }
};
