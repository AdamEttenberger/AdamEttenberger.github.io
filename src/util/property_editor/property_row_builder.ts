import { PropertyRowType, PropertyRowBuilder } from '@/util/property_editor/property_builder'

export default class PropertyRowBuilder<TBuilderImpl extends PropertyRowBuilder<TBuilderImpl>> {
  _result: PropertyRowData;

  constructor(type: PropertyRowType, label?: any, model?: any) {
    this._result = {
      type,
      label,
      model,
    };
  }

  setLabel(label: any): TBuilderImpl {
    this._result = {
      ...this._result,
      label,
    };
    return this;
  }

  setModel(model: any): TBuilderImpl {
    this._result = {
      ...this._result,
      model,
    };
    return this;
  }

  setDisabled(disabled: any): TBuilderImpl {
    this._result = {
      ...this._result,
      disabled,
    };
    return this;
  }

  build(): Object {
    var tmp = this._result;
    this._result = null;
    return tmp;
  }
};
