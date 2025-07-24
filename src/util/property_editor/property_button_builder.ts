import { PropertyRowType, PropertyRowBuilder } from '@/util/property_editor/property_builder'

export type PropertyButtonOptions = {
  text?: any;
};

export default class PropertyButtonBuilder extends PropertyRowBuilder<PropertyButtonBuilder> {
  options?: PropertyButtonOptions;

  constructor(label?: any, model?: any) {
    super(PropertyRowType.Button, label, model);
  }

  setText(text): PropertyButtonBuilder {
    this.options = {
      ...this.options,
      text,
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
