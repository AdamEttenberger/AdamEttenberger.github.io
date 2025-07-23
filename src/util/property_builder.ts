export default class PropertyBuilder {
  _result = {};

  addButton(name: string, label: string, text: string): PropertyBuilder {
    this._result[name] = {
      type: 'button',
      label,
      options: {
        text
      }
    }
    return this;
  }

  addToggle(name: string, label: string, model: boolean): PropertyBuilder {
    this._result[name] = {
      type: 'toggle',
      label,
      model,
    }
    return this;
  }

  addRange(name: string, label: string, model: number, min_value: number, max_value: number, step_value: number): PropertyBuilder {
    this._result[name] = {
      type: 'range',
      label,
      model,
      options: {
        min_value,
        max_value,
        step_value,
      },
    };
    return this;
  }

  addComboBox(name: string, label: string, model: string, values: Object): PropertyBuilder {
    this._result[name] = {
      type: 'combobox',
      label,
      model,
      options: {
        values,
      },
    };
    return this;
  }

  build(): Object {
    var result = this._result;
    this._result = {};
    return result;
  }
};
