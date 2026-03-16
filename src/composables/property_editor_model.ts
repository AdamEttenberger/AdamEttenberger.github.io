import {
  computed,
  isRef,
  reactive,
  toValue,
  type Reactive,
} from 'vue'
import {
  type PropertyEmitFunctions,
  PropertyEmits,
  PropertyEmitsHandler,
  type PropertyType,
  isPropertyValueType,
} from '@/util/property_editor/property_interfaces'

export type PropertyOptionRecords = Record<string, PropertyType>;
export type PropertyModelRecords = Record<string, unknown>;

export interface IUsePropertyEditorModel {
  rows: PropertyOptionRecords;
  models: Reactive<PropertyModelRecords>;
  onPropertyEmit: PropertyEmitFunctions;

  get<T>(name: string): undefined|T;
  set<T>(name: string, new_value: T): void;
};

export default function usePropertyEditorModel<TPropList extends PropertyType[]>(
  properties: TPropList,
  custom_callbacks?: PropertyEmitFunctions
): IUsePropertyEditorModel {
  const rows = properties.reduce((result, item) => {
    result[item.name] = item;
    return result;
  }, <PropertyOptionRecords>{});

  const pending_changes = reactive<PropertyModelRecords>({});

  const models = reactive(properties.reduce((result, item) => {
    if (isPropertyValueType(item)) {
      result[item.name] = computed({
        get() {
          let current_value = pending_changes[item.name] ?? toValue(item.modelValue);
          // Lazy-initialize modelValue when `null`.
          if (current_value == null && isRef(item.modelValue) && item.modelValue.value === null) {
            item.modelValue.value = toValue(item.default_value);
            current_value = item.modelValue.value;
          }
          return current_value ?? toValue(item.default_value)
        },
        set(new_value) {
          pending_changes[item.name] = new_value;
        },
      });
    }
    return result;
  }, <PropertyModelRecords>{}));

  function _handleEmits(kind: PropertyEmits, name: string, new_value?: any): void {
    switch (kind) {
      case PropertyEmits.Click: {
        custom_callbacks?.[kind]?.(name);
        break;
      }
      case PropertyEmits.Changed: {
        console.assert(name in pending_changes);
        // PropertyEmits.Changed does not provide `new_value`.
        new_value = pending_changes[name];
        if (new_value === undefined) {
          return;
        }
        const row = rows[name];
        if (isPropertyValueType(row)) {
          if (isRef(row.modelValue)) {
            row.modelValue.value = new_value;
          } else {
            row.modelValue = new_value;
          }
          delete pending_changes[name];
        }
        custom_callbacks?.[kind]?.(name);
        break;
      }
      case PropertyEmits.Changing: {
        custom_callbacks?.[kind]?.(name, new_value);
        if (isPropertyValueType(rows[name])) {
          pending_changes[name] = new_value;
        }
        break;
      }
      case PropertyEmits.Reset: {
        const row = rows[name];
        if (!isPropertyValueType(row)) {
          break;
        }
        _handleEmits(PropertyEmits.Changing, name, toValue(row.default_value));
        custom_callbacks?.[kind]?.(name);
        _handleEmits(PropertyEmits.Changed, name);
        break;
      }
    }
  }

  const handler = new PropertyEmitsHandler(_handleEmits);
  const onPropertyEmit = (Object.values(PropertyEmits) as PropertyEmits[]).reduce<PropertyEmitFunctions>((result, key) => {
    result[key] = handler[key].bind(handler);
    return result;
  }, <PropertyEmitFunctions>{});

  function get<T>(name: string): undefined|T {
    return models[name] as T;
  }

  function set<T>(name: string, new_value: T): void {
    if (models[name] === new_value) {
      return;
    }
    _handleEmits(PropertyEmits.Changing, name, new_value);
    _handleEmits(PropertyEmits.Changed, name);
  }

  return {
    rows,
    models,
    onPropertyEmit,

    get,
    set,
  };
};
