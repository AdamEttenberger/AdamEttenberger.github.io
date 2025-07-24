import { PropertyRowType, PropertyRowBuilder } from '@/util/property_editor/property_builder'

export type PropertyNumberRangeOptions = {
  min_value: any;
  max_value: any;
  step_value: any;
};

export default class PropertyNumberRangeBuilder extends PropertyRowBuilder<PropertyNumberRangeBuilder> {
  options: PropertyNumberRangeOptions;

  constructor(label?: any, model?: any) {
    super(PropertyRowType.NumberRange, label, model);
  }

  setOptions(min_value: any, max_value: any, step_value: any): PropertyNumberRangeBuilder {
    this.options = {
      ...this.options,
      min_value,
      max_value,
      step_value,
    };
    return this;
  }
  setMin(min_value): PropertyNumberRangeBuilder {
    this.options = {
      ...this.options,
      min_value,
    };
    return this;
  }
  setMax(max_value): PropertyNumberRangeBuilder {
    this.options = {
      ...this.options,
      max_value,
    };
    return this;
  }
  setStep(step_value): PropertyNumberRangeBuilder {
    this.options = {
      ...this.options,
      step_value,
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
