struct InstanceData {
  mMatrix: mat4x4f,
  normalMatrix: mat4x4f,
  material_id: u32,
};

@group(2) @binding(0) var<storage, read> instances: array<InstanceData>;
