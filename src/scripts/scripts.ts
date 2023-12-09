import {
  loadFile,
  createProgram,
  createCubeTextureFromFile,
} from "../utils/webglUtils";
import { createCube } from "../utils/geometry";
import { initMouseEvents, mouseState } from "../utils/mouse";
import { Pane } from "tweakpane";

interface CustomWebGLProgram extends WebGLProgram {
  position: number;
  cubePosition: number;
  cubeNormal: number;
}

interface Options {
  iterations_poisson: number;
  iterations_viscous: number;
  mouse_force: number;
  resolution: number;
  cursor_size: number;
  viscous: number;
  isBounce: boolean;
  dt: number;
  isViscous: boolean;
  BFECC: boolean;
}

let canvas: HTMLCanvasElement | null = null;
let width: number = 0;
let height: number = 0;
let gl: WebGLRenderingContext | null = null;

let program: CustomWebGLProgram | null = null;
let cubeGeometry: any = null;
let vbos: WebGLBuffer[] = [];
let ibo: WebGLBuffer | null = null;
let attributeLocations: number[] = [];
let texture: WebGLTexture | null = null;
let previousTime: number = 0;

const options: Options = {
  iterations_poisson: 32,
  iterations_viscous: 32,
  mouse_force: 20,
  resolution: 0.5,
  cursor_size: 100,
  viscous: 30,
  isBounce: false,
  dt: 0.014,
  isViscous: false,
  BFECC: true,
};

const init = () => {
  // Find the canvas element
  canvas = document.querySelector("#canvas");

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("No html canvas element.");
  }

  width = window.innerWidth;
  height = window.innerHeight;

  // WebGL rendering context
  const param = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
  };
  gl = canvas.getContext("webgl");
  canvas.width = width;
  canvas.height = height;

  if (!gl) {
    throw new Error("No WebGL context.");
  }

  // Set up tweakpane
  const pane = new Pane();
};

const setupGeometry = (gl: WebGLRenderingContext) => {
  // create a cube that contains vertices and normals
  cubeGeometry = createCube(2.0);
  const cubeData = {
    cubePosition: cubeGeometry.vertices,
    cubeNormal: cubeGeometry.normals,
  };

  // create vbos
  Object.values(cubeData).forEach((val) => {
    const vbo = gl.createBuffer();
    if (!vbo) {
      throw new Error("Unable to create a buffer.");
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, val, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    vbos.push(vbo);
  });

  // create ibo
  ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Int16Array(cubeGeometry.indices),
    gl.STATIC_DRAW
  );
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

const resize = () => {
  if (!canvas) {
    throw new Error("No canvas element.");
  }

  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  if (gl && program) {
    const resolution = gl.getUniformLocation(program, "iResolution");
    gl.uniform2f(resolution, width, height);
  }
};

const load = async () => {
  if (!gl) {
    throw new Error("No WebGL context.");
  }

  // Load shaders
  const vs = await loadFile("/glsl-school-task-03/shaders/main.vert");
  const fs = await loadFile("/glsl-school-task-03/shaders/main.frag");

  program = (await createProgram(gl, vs, fs)) as CustomWebGLProgram;

  const sources = [
    "/glsl-school-task-03/assets/img/nx.png",
    "/glsl-school-task-03/assets/img/py.png",
    "/glsl-school-task-03/assets/img/pz.png",
    "/glsl-school-task-03/assets/img/nx.png",
    "/glsl-school-task-03/assets/img/ny.png",
    "/glsl-school-task-03/assets/img/nz.png",
  ];
  const targetArray = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
  ];
  texture = await createCubeTextureFromFile(gl, sources, targetArray);
};

const initProgram = (gl: WebGLRenderingContext) => {
  if (!program) {
    throw new Error("No WebGL program.");
  }
  gl.useProgram(program);

  // set attributes
  attributeLocations = [
    gl.getAttribLocation(program, "cubePosition"),
    gl.getAttribLocation(program, "cubeNormal"),
  ];

  // set uniforms
  const resolution = gl.getUniformLocation(program, "iResolution");
  gl.uniform2f(resolution, width, height);
  const textureUnit = gl.getUniformLocation(program, "textureUnit");
  gl.uniform1i(textureUnit, 0);
};

const setup = (gl: WebGLRenderingContext) => {
  initProgram(gl);
  setupGeometry(gl);
  previousTime = Date.now();

  // set texture
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
};

const render = (gl: WebGLRenderingContext, program: CustomWebGLProgram) => {
  // Clear the scene
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.cullFace(gl.FRONT);
  gl.depthMask(false);

  const now = Date.now();
  const dt = (now - previousTime) / 1000;
  previousTime = now;
  const time = gl.getUniformLocation(program, "iTime");
  gl.uniform1f(time, dt);
  const mouse = gl.getUniformLocation(program, "iMouse");
  gl.uniform2f(mouse, mouseState.center.x, mouseState.center.y);

  vbos.forEach((vbo, index) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(attributeLocations[index]);
    gl.vertexAttribPointer(attributeLocations[index], 3, gl.FLOAT, false, 0, 0);
  });
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.drawElements(
    gl.TRIANGLES,
    cubeGeometry.indices.length,
    gl.UNSIGNED_SHORT,
    0
  );

  // Cleanup
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

const run = async () => {
  init();
  await load();

  if (!gl) {
    throw new Error("No WebGL context.");
  }
  if (!program) {
    throw new Error("No WebGL program.");
  }
  setup(gl);
  initMouseEvents(canvas);
  render(gl, program);
};

window.onload = run;
window.onresize = resize;