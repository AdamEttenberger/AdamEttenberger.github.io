import { type MaybeRefOrGetter, onBeforeUnmount, ref, type Ref, toValue, watch } from 'vue'
import usePostMessage from '@/composables/post_message'
import { FrameContainerSymbol, isFrameContainer, type IFrameContainer } from '@/types/frame_container'
import type { ExtractModelType, PropertyType } from '@/util/property_editor/property_interfaces'

export enum UniformType {
  bool = 'bool',
  float = 'float',
  int = 'int',
  uint = 'uint',
  vec2 = 'vec2',
  vec3 = 'vec3',
  vec4 = 'vec4',
  bvec2 = 'bvec2',
  bvec3 = 'bvec3',
  bvec4 = 'bvec4',
  ivec2 = 'ivec2',
  ivec3 = 'ivec3',
  ivec4 = 'ivec4',
  uvec2 = 'uvec2',
  uvec3 = 'uvec3',
  uvec4 = 'uvec4',
  mat4 = 'mat4',
};

export interface IShaderSources {
  vert: { source: string },
  frag: { source: string },
};

export interface IShaderDefinition {
  label: string;
  uniforms: Uniform[];
  sources: IShaderSources
};

export type ShaderUniformsForPayload = (string | { type: UniformType; value: ExtractModelType<PropertyType>; })[][];

export interface IShaderPayload {
  sources?: IShaderSources;
  uniforms?: ShaderUniformsForPayload;
  time_scale?: number;
}

export class Uniform {
  constructor(public type: UniformType,
              public name: string,
              public coerce?: CallableFunction) {}
}

export interface IUseShaders<
  TComponentKey extends string|symbol|number,
  TDefinitionKey extends string|symbol|number
> {
  getFrame(comp_or_key: TComponentKey|IFrameContainer): undefined|IFrameContainer;
  /**
   * Binds a component to a specific TComponentKey and TDefinitionKey.
   *
   * @param comp_key The component key to bind.
   * @param def_key The shader definition key to bind to the component.
   */
  bind(comp_or_key: TComponentKey|IFrameContainer, def_key: TDefinitionKey): void;
  /**
   * Retrieves the TDefinitionKey bound and associated with the given TComponentKey.
   *
   * @param comp_or_key The TComponentKey or IFrameContainer to query.
   */
  getAssociatedShaderKey(comp_or_key: TComponentKey|IFrameContainer): undefined|TDefinitionKey;
  /**
   * Retrieves the IShaderDefinition bound and associated with the given TComponentKey.
   * If the TDefinitionKey is already known, an alternative is to use the type mapping
   * helper. e.g., `shaders[def_key]`.
   *
   * @param comp_key The component key to query.
   */
  getAssociatedShaderDef(comp_key: TComponentKey): undefined|IShaderDefinition;
  /**
   * Update shader uniforms for a specific player component.
   *
   * @param comp_or_key The component or component key to query.
   * @param uniforms The uniforms to upload to the GPU.
   * @param time_scale Adjusts the time scale of the underlying proto-engine.
   */
  update(comp_or_key: TComponentKey|IFrameContainer, uniforms?: ShaderUniformsForPayload, time_scale?: number): void;
};

export type IUseShadersProxy<
  TComponentKey extends string|symbol|number,
  TDefinitionKey extends string|symbol|number
> = IUseShaders<TComponentKey, TDefinitionKey> & { [T in TDefinitionKey]: IShaderDefinition; };

export default function useShaders<
  TComponentKey extends string|symbol|number,
  TDefinitionKey extends string|symbol|number
>(input_components: MaybeRefOrGetter<Record<TComponentKey, IFrameContainer>>,
  input_definitions: MaybeRefOrGetter<Record<TDefinitionKey, IShaderDefinition>>): IUseShadersProxy<TComponentKey, TDefinitionKey> {
  const components = ref({}) as Ref<Record<TComponentKey, WeakRef<IFrameContainer>>>;
  const definitions = ref({}) as Ref<Record<TDefinitionKey, IShaderDefinition>>;
  /**
   * Maps IFrameContainer[FrameContainerSymbol] to the frame's shader compile state.
   * Requires recompile when mapped to `undefined` or `false`.
   */
  const player_compile = ref({}) as Ref<Record<string, boolean>>;
  /**
   * Maps IFrameContainer[FrameContainerSymbol] to TDefinitionKey.
   */
  const frame_keys = ref({}) as Ref<Record<string, TDefinitionKey>>;

  function getFrame(comp_or_key: TComponentKey|IFrameContainer): undefined|IFrameContainer {
    return isFrameContainer(comp_or_key)
        ? comp_or_key
        : components.value[comp_or_key as TComponentKey]?.deref();
  }

  function _on_components_changed(new_value: Record<TComponentKey, IFrameContainer>) {
    components.value = (Object.keys(new_value) as TComponentKey[]).reduce(
      (result, key) => {
        result[key] = new WeakRef(new_value[key]);
        return result;
      }, <Record<TComponentKey, WeakRef<IFrameContainer>>>{}
    );
  }

  function _on_definitions_changed(new_value: Record<TDefinitionKey, IShaderDefinition>) {
    definitions.value = new_value;
  }

  function _on_post_message(_payload: IShaderPayload, frame_id: string) {
    player_compile.value[frame_id] = false;
  }

  const { post } = usePostMessage<IShaderPayload, [/*frame_id:*/string]>(_on_post_message);

  function bind(comp_or_key: TComponentKey|IFrameContainer, def_key: TDefinitionKey): void {
    const frame_id: undefined|string = getFrame(comp_or_key)?.[FrameContainerSymbol];
    if (!frame_id) {
      return;
    }
    frame_keys.value[frame_id] = def_key;
    // Always recompile shaders when calling `bind` because the frame may have
    // just been recreated through conditional rendering.
    player_compile.value[frame_id] = true;
  }

  function getAssociatedShaderKey(comp_or_key: TComponentKey|IFrameContainer): undefined|TDefinitionKey {
    const frame_id: undefined|string = getFrame(comp_or_key)?.[FrameContainerSymbol];
    if (!frame_id) {
      return;
    }
    return frame_keys.value[frame_id];
  }

  function getAssociatedShaderDef(comp_key: TComponentKey): undefined|IShaderDefinition {
    const def_key = getAssociatedShaderKey(comp_key);
    return def_key ? definitions.value[def_key] : undefined;
  }

  function update(comp_or_key: TComponentKey|IFrameContainer, uniforms?: ShaderUniformsForPayload, time_scale?: number): void {
    const frame = getFrame(comp_or_key);
    const def_key = frame ? getAssociatedShaderKey(frame) : undefined;
    if (!frame || !def_key) {
      return;
    }
    const frame_id: string = frame[FrameContainerSymbol];
    const def = definitions.value[def_key];
    const sources: undefined|IShaderSources = (player_compile.value[frame_id] !== false) ? def.sources : undefined;
    post(frame, {
      sources,
      uniforms,
      time_scale
    }, frame_id);
  }

  const watch_handles = [
    watch(() => toValue(input_components), _on_components_changed, { immediate: true }),
    watch(() => toValue(input_definitions), _on_definitions_changed, { immediate: true }),
  ];

  onBeforeUnmount(() => {
    watch_handles.forEach(item => item.stop());
  })

  return new Proxy({
    getFrame,
    bind,
    getAssociatedShaderKey,
    getAssociatedShaderDef,
    update,
  }, {
    get(target, prop, _receiver): unknown {
      if (prop in target) {
        return target[prop as keyof typeof target];
      }
      if (prop in definitions.value) {
        return definitions.value[prop as TDefinitionKey];
      }
    }
  }) as IUseShadersProxy<TComponentKey, TDefinitionKey>;
}
