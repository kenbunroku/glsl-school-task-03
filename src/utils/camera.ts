import { Vec2, Vec3, Mat4, Qtn } from "./math.js";

type Vec2 = number[];
type Vec3 = number[];

type Quaternion = Float32Array;

export type WebGLOrbitCameraState = {
  target: HTMLElement;
  distance: number;
  minDistance: number;
  maxDistance: number;
  moveScale: number;
  position: Vec3;
  center: Vec3;
  upDirection: Vec3;
  defaultPosition: Vec3;
  defaultCenter: Vec3;
  defaultUpDirection: Vec3;
  movePosition: Vec3;
  rotateX: number;
  rotateY: number;
  scale: number;
  isDown: boolean;
  prevPosition: Vec2;
  offsetPosition: Vec2;
  qt: Quaternion;
  qtx: Quaternion;
  qty: Quaternion;
};

const DEFAULT_DISTANCE = 5.0;
const DEFAULT_MIN_DISTANCE = 1.0;
const DEFAULT_MAX_DISTANCE = 10.0;
const DEFAULT_MOVE_SCALE = 2.0;

export const createWebGLOrbitCamera = (
  target: HTMLElement,
  option: Partial<WebGLOrbitCameraState> = {}
): WebGLOrbitCameraState => {
  const qtnOps = Qtn();
  const state: WebGLOrbitCameraState = {
    target: target,
    distance: option.distance || DEFAULT_DISTANCE,
    minDistance: option.minDistance || DEFAULT_MIN_DISTANCE,
    maxDistance: option.maxDistance || DEFAULT_MAX_DISTANCE,
    moveScale: option.moveScale || DEFAULT_MOVE_SCALE,
    position: Vec3(0.0, 0.0, option.distance || DEFAULT_DISTANCE).create,
    center: Vec3(0.0, 0.0, 0.0).create,
    upDirection: Vec3(0.0, 1.0, 0.0).create,
    defaultPosition: Vec3(0.0, 0.0, option.distance || DEFAULT_DISTANCE).create,
    defaultCenter: Vec3(0.0, 0.0, 0.0).create,
    defaultUpDirection: Vec3(0.0, 1.0, 0.0).create,
    movePosition: Vec3(0.0, 0.0, 0.0).create,
    rotateX: 0.0,
    rotateY: 0.0,
    scale: 0.0,
    isDown: false,
    prevPosition: Vec2(0, 0).create,
    offsetPosition: Vec2(0, 0).create,
    qt: qtnOps.create(),
    qtx: qtnOps.create(),
    qty: qtnOps.create(),
  };

  bindEventListeners(state);

  return state;
};

const bindEventListeners = (state: WebGLOrbitCameraState) => {
  const onMouseDown = (event: MouseEvent) => {
    state.isDown = true;
    const bound = state.target.getBoundingClientRect();
    state.prevPosition = Vec2(
      event.clientX - bound.left,
      event.clientY - bound.top
    ).create;
  };
  const onMouseMove = (event: MouseEvent) => {
    if (!state.isDown) return;
    const bound = state.target.getBoundingClientRect();
    const w = bound.width;
    const h = bound.height;
    const x = event.clientX - bound.left;
    const y = event.clientY - bound.top;
    const s = 1.0 / Math.min(w, h);
    state.offsetPosition = Vec2(
      x - state.prevPosition[0],
      y - state.prevPosition[1]
    ).create;
    state.prevPosition = Vec2(x, y).create;

    switch (event.buttons) {
      case 1: // Left button
        state.rotateX += state.offsetPosition[0] * s;
        state.rotateY += state.offsetPosition[1] * s;
        break;
      case 2: // Right button
        const eyeOffset = Vec3(
          state.offsetPosition[0],
          -state.offsetPosition[1],
          0.0
        ).create;
        const rotateEye = Qtn().toVecIII(state.qt, eyeOffset);
        state.movePosition[0] -= rotateEye[0] * s * state.moveScale;
        state.movePosition[1] -= rotateEye[1] * s * state.moveScale;
        state.movePosition[2] -= rotateEye[2] * s * state.moveScale;
        break;
    }
  };

  const onMouseUp = () => {
    state.isDown = false;
  };

  // Setup event listeners
  state.target.addEventListener("mousedown", onMouseDown, false);
  state.target.addEventListener("mousemove", onMouseMove, false);
  state.target.addEventListener("mouseup", onMouseUp, false);
  state.target.addEventListener(
    "contextmenu",
    (event: MouseEvent) => {
      event.preventDefault();
    },
    false
  );
};

export const updateWebGLOrbitCamera = (state: WebGLOrbitCameraState) => {
  const PI2 = Math.PI * 2.0;
  const v = Vec3(1.0, 0.0, 0.0).create;
  const u = Vec3(0.0, 1.0, 0.0).create;
  // scale
  state.scale *= 0.7;
  state.distance += state.scale;
  state.distance = Math.min(
    Math.max(state.distance, state.minDistance),
    state.maxDistance
  );
  state.defaultPosition[2] = state.distance;
  // rotate
  Qtn().identity(state.qt);
  Qtn().identity(state.qtx);
  Qtn().identity(state.qty);
  Qtn().rotate(state.rotateX * PI2, u, state.qtx);
  Qtn().toVecIII(new Float32Array(v), [...state.qt], v);
  Qtn().rotate(state.rotateY * PI2, v, state.qty);
  Qtn().multiply(state.qtx, state.qty, state.qt);
  Qtn().toVecIII(
    new Float32Array(state.defaultPosition),
    [...state.qt],
    state.position
  );
  Qtn().toVecIII(
    new Float32Array(state.defaultUpDirection),
    [...state.qt],
    state.upDirection
  );
  // translate
  state.position[0] += state.movePosition[0];
  state.position[1] += state.movePosition[1];
  state.position[2] += state.movePosition[2];
  state.center[0] = state.defaultCenter[0] + state.movePosition[0];
  state.center[1] = state.defaultCenter[1] + state.movePosition[1];
  state.center[2] = state.defaultCenter[2] + state.movePosition[2];

  return Mat4().lookAt(state.position, state.center, state.upDirection);
};
