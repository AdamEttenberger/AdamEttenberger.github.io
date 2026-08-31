import type Viewport from '@/wgpu/core/viewport';
import { mat4, vec3, type Mat4Like, type QuatLike, type Vec3Like, type Vec4Like } from 'ts-gl-matrix';

export type PerspectiveProjectionOptions = {
  type: 'perspective',
  fovy: number;
  near: number;
  far: number;
};

export type OrthogonalProjectionOptions = {
  type: 'orthogonal',
  left: number;
  right: number;
  bottom: number;
  top: number;
  near: number,
  far: number,
};

export type CameraProjectionOptions = PerspectiveProjectionOptions | OrthogonalProjectionOptions;


export interface ICameraOptions {
  position: Vec3Like;
  rotation: QuatLike;
  projection: CameraProjectionOptions;
}

export interface ICamera extends ICameraOptions {
  apply(viewport: Viewport, view: Mat4Like, projection: Mat4Like): void;
}

export default class Camera implements ICamera {
  public position: Vec3Like;
  public rotation: Vec4Like;
  public projection: CameraProjectionOptions;

  constructor(
    options: ICameraOptions,
  ) {
    this.position = options.position;
    this.rotation = options.rotation;
    this.projection = options.projection;
  }

  public static makePerspectiveCamera(position: Vec3Like, rotation: QuatLike, fovy_rads: number): Camera {
    return new Camera({
      position,
      rotation,
      projection: {
        type: "perspective",
        fovy: fovy_rads,
        near: 0.1,
        far: 1000.0,
      }
    });
  }

  public static makeOrthogonalCamera(position: Vec3Like, rotation: QuatLike, left: number, top: number, right: number, bottom: number): Camera {
    return new Camera({
      position,
      rotation,
      projection: {
        type: 'orthogonal',
        left,
        top,
        right,
        bottom,
        near: 0.1,
        far: 1000.0,
      }
    });
  }

  public apply(viewport: Viewport, viewMatrix: Mat4Like, projectionMatrix: Mat4Like): void {
    const cameraWorldMatrix = mat4.fromRotationTranslationScale(mat4.create(), this.rotation, this.position, vec3.fromValues(1, 1, 1));
    mat4.invert(viewMatrix, cameraWorldMatrix);

    switch (this.projection.type) {
      case 'perspective':
        mat4.perspectiveZO(projectionMatrix, this.projection.fovy, viewport.aspect, this.projection.near, this.projection.far);
        break;
      case 'orthogonal':
        mat4.orthoZO(projectionMatrix, this.projection.left, this.projection.right, this.projection.bottom, this.projection.top, this.projection.near, this.projection.far);
        break;
    }
  }
}
