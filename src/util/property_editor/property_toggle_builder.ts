import { PropertyRowType, PropertyRowBuilder } from '@/util/property_editor/property_builder'

export type PropertyToggleOptions = {
  icon: any;
};

export default class PropertyToggleBuilder extends PropertyRowBuilder<PropertyToggleBuilder> {
  options: PropertyToggleOptions;

  constructor(label?: any, model?: any) {
    super(PropertyRowType.Toggle, label, model);
  }

  setIcon(value): PropertyToggleBuilder {
    this.options.icon = value;
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
