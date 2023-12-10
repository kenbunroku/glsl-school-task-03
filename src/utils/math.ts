// create vec2 from x and y
export const Vec2 = (x: number, y: number) => {
  const vec: number[] = [x, y];

  const add = function (v: number[]) {
    return Vec2(vec[0] + v[0], vec[1] + v[1]);
  };

  const sub = function (v: number[]) {
    return Vec2(vec[0] - v[0], vec[1] - v[1]);
  };

  const mul = function (v: number[]) {
    return Vec2(vec[0] * v[0], vec[1] * v[1]);
  };

  const div = function (v: number[]) {
    return Vec2(vec[0] / v[0], vec[1] / v[1]);
  };

  const dot = function (v: number[]) {
    return vec[0] * v[0] + vec[1] * v[1];
  };

  const length = function () {
    return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
  };

  const normalize = function () {
    const len = length();
    return Vec2(vec[0] / len, vec[1] / len);
  };

  return {
    create: vec,
    add: add,
    sub: sub,
    mul: mul,
    div: div,
    dot: dot,
    length: length,
    normalize: normalize,
  };
};

// create vec3 from x, y and z
export const Vec3 = (x: number, y: number, z: number) => {
  const vec: number[] = [x, y, z];

  const add = function (v: number[]) {
    return Vec3(vec[0] + v[0], vec[1] + v[1], vec[2] + v[2]);
  };
  const sub = function (v: number[]) {
    return Vec3(vec[0] - v[0], vec[1] - v[1], vec[2] - v[2]);
  };
  const mul = function (v: number[]) {
    return Vec3(vec[0] * v[0], vec[1] * v[1], vec[2] * v[2]);
  };
  const div = function (v: number[]) {
    return Vec3(vec[0] / v[0], vec[1] / v[1], vec[2] / v[2]);
  };
  const dot = function (v: number[]) {
    return vec[0] * v[0] + vec[1] * v[1] + vec[2] * v[2];
  };
  const cross = function (v: number[]) {
    return Vec3(
      vec[1] * v[2] - vec[2] * v[1],
      vec[2] * v[0] - vec[0] * v[2],
      vec[0] * v[1] - vec[1] * v[0]
    );
  };
  const length = function () {
    return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
  };
  const normalize = function () {
    const len = length();
    return Vec3(vec[0] / len, vec[1] / len, vec[2] / len);
  };

  return {
    create: vec,
    add: add,
    sub: sub,
    mul: mul,
    div: div,
    dot: dot,
    cross: cross,
    length: length,
    normalize: normalize,
  };
};

// create mat4 from 16 elements
export const Mat4 = () => {
  const create = () => new Float32Array(16);

  const identity = (dest: Float32Array | null): Float32Array => {
    const out = dest == null ? create() : dest;
    out.fill(0);
    out[0] = out[5] = out[10] = out[15] = 1;
    return out;
  };

  const multiply = (
    mat0: Float32Array,
    mat1: Float32Array,
    dest: Float32Array | null
  ): Float32Array => {
    const out = dest == null ? create() : dest;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        out[i * 4 + j] =
          mat0[i * 4] * mat1[j] +
          mat0[i * 4 + 1] * mat1[j + 4] +
          mat0[i * 4 + 2] * mat1[j + 8] +
          mat0[i * 4 + 3] * mat1[j + 12];
      }
    }
    return out;
  };

  const scale = (
    mat: Float32Array,
    vec: number[],
    dest: Float32Array | null
  ): Float32Array => {
    const out = dest == null ? create() : dest;
    out.set(mat);
    out[0] *= vec[0];
    out[5] *= vec[1];
    out[10] *= vec[2];
    return out;
  };

  const translate = (
    mat: Float32Array,
    vec: number[],
    dest: Float32Array | null
  ): Float32Array => {
    const out = dest == null ? create() : dest;
    out.set(mat);
    out[12] = mat[0] * vec[0] + mat[4] * vec[1] + mat[8] * vec[2] + mat[12];
    out[13] = mat[1] * vec[0] + mat[5] * vec[1] + mat[9] * vec[2] + mat[13];
    out[14] = mat[2] * vec[0] + mat[6] * vec[1] + mat[10] * vec[2] + mat[14];
    out[15] = mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15];
    return out;
  };

  const rotate = (
    mat: Float32Array,
    angle: number,
    axis: [number, number, number],
    dest: Float32Array | null = null
  ) => {
    const out = dest == null ? create() : dest;
    let [x, y, z] = axis;
    let len = Math.sqrt(x * x + y * y + z * z);
    if (!len) return null;
    if (len !== 1) {
      len = 1 / len;
      x *= len;
      y *= len;
      z *= len;
    }

    const s = Math.sin(angle);
    const c = Math.cos(angle);
    const t = 1 - c;

    const a00 = mat[0],
      a01 = mat[1],
      a02 = mat[2],
      a03 = mat[3];
    const a10 = mat[4],
      a11 = mat[5],
      a12 = mat[6],
      a13 = mat[7];
    const a20 = mat[8],
      a21 = mat[9],
      a22 = mat[10],
      a23 = mat[11];

    // Construct the elements of the rotation matrix
    const b00 = x * x * t + c,
      b01 = y * x * t + z * s,
      b02 = z * x * t - y * s;
    const b10 = x * y * t - z * s,
      b11 = y * y * t + c,
      b12 = z * y * t + x * s;
    const b20 = x * z * t + y * s,
      b21 = y * z * t - x * s,
      b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    // If the source and destination differ, copy the unchanged last row
    if (mat !== out) {
      out[12] = mat[12];
      out[13] = mat[13];
      out[14] = mat[14];
      out[15] = mat[15];
    }

    return out;
  };

  const lookAt = (
    eye: number[],
    center: number[],
    up: number[],
    dest: Float32Array | null = null
  ) => {
    const out = dest == null ? create() : dest;

    const [eyeX, eyeY, eyeZ] = eye;
    const [centerX, centerY, centerZ] = center;
    const [upX, upY, upZ] = up;

    if (
      Math.abs(eyeX - centerX) < Number.EPSILON &&
      Math.abs(eyeY - centerY) < Number.EPSILON &&
      Math.abs(eyeZ - centerZ) < Number.EPSILON
    ) {
      return identity(out);
    }

    let z0 = eyeX - centerX,
      z1 = eyeY - centerY,
      z2 = eyeZ - centerZ;
    let len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    let x0 = upY * z2 - upZ * z1,
      x1 = upZ * z0 - upX * z2,
      x2 = upX * z1 - upY * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
      x0 = x1 = x2 = 0;
    } else {
      len = 1 / len;
      x0 *= len;
      x1 *= len;
      x2 *= len;
    }

    let y0 = z1 * x2 - z2 * x1,
      y1 = z2 * x0 - z0 * x2,
      y2 = z0 * x1 - z1 * x0;
    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
      y0 = y1 = y2 = 0;
    } else {
      len = 1 / len;
      y0 *= len;
      y1 *= len;
      y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyeX + x1 * eyeY + x2 * eyeZ);
    out[13] = -(y0 * eyeX + y1 * eyeY + y2 * eyeZ);
    out[14] = -(z0 * eyeX + z1 * eyeY + z2 * eyeZ);
    out[15] = 1;

    return out;
  };

  const perspective = (
    fovy: number,
    aspect: number,
    near: number,
    far: number,
    dest: Float32Array | null = null
  ) => {
    const out = dest == null ? create() : dest;
    const f = 1.0 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);

    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = 2 * far * near * nf;
    out[15] = 0;

    return out;
  };

  const ortho = (
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number,
    dest: Float32Array | null = null
  ): Float32Array => {
    const out = dest == null ? create() : dest;
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
  };

  const transpose = (
    mat: Float32Array,
    dest: Float32Array | null = null
  ): Float32Array => {
    const out = dest == null ? create() : dest;
    out[0] = mat[0];
    out[1] = mat[4];
    out[2] = mat[8];
    out[3] = mat[12];
    out[4] = mat[1];
    out[5] = mat[5];
    out[6] = mat[9];
    out[7] = mat[13];
    out[8] = mat[2];
    out[9] = mat[6];
    out[10] = mat[10];
    out[11] = mat[14];
    out[12] = mat[3];
    out[13] = mat[7];
    out[14] = mat[11];
    out[15] = mat[15];
    return out;
  };

  const inverse = (
    mat: Float32Array,
    dest: Float32Array | null = null
  ): Float32Array => {
    const out = dest == null ? new Float32Array(16) : dest;
    const a = mat[0],
      b = mat[1],
      c = mat[2],
      d = mat[3],
      e = mat[4],
      f = mat[5],
      g = mat[6],
      h = mat[7],
      i = mat[8],
      j = mat[9],
      k = mat[10],
      l = mat[11],
      m = mat[12],
      n = mat[13],
      o = mat[14],
      p = mat[15];

    const q = a * f - b * e,
      r = a * g - c * e,
      s = a * h - d * e,
      t = b * g - c * f,
      u = b * h - d * f,
      v = c * h - d * g,
      w = i * n - j * m,
      x = i * o - k * m,
      y = i * p - l * m,
      z = j * o - k * n,
      A = j * p - l * n,
      B = k * p - l * o,
      ivd = 1 / (q * B - r * A + s * z + t * y - u * x + v * w);

    if (!isFinite(ivd)) {
      throw new Error("Matrix cannot be inverted");
    }

    out[0] = (f * B - g * A + h * z) * ivd;
    out[1] = (-b * B + c * A - d * z) * ivd;
    out[2] = (n * v - o * u + p * t) * ivd;
    out[3] = (-j * v + k * u - l * t) * ivd;
    out[4] = (-e * B + g * y - h * x) * ivd;
    out[5] = (a * B - c * y + d * x) * ivd;
    out[6] = (-m * v + o * s - p * r) * ivd;
    out[7] = (i * v - k * s + l * r) * ivd;
    out[8] = (e * A - f * y + h * w) * ivd;
    out[9] = (-a * A + b * y - d * w) * ivd;
    out[10] = (m * u - n * s + p * q) * ivd;
    out[11] = (-i * u + j * s - l * q) * ivd;
    out[12] = (-e * z + f * x - g * w) * ivd;
    out[13] = (a * z - b * x + c * w) * ivd;
    out[14] = (-m * t + n * r - o * q) * ivd;
    out[15] = (i * t - j * r + k * q) * ivd;

    return out;
  };

  const toVecIV = (
    mat: Float32Array,
    vec: [number, number, number, number]
  ): [number, number, number, number] => {
    const [x, y, z, w] = vec;
    return [
      x * mat[0] + y * mat[4] + z * mat[8] + w * mat[12],
      x * mat[1] + y * mat[5] + z * mat[9] + w * mat[13],
      x * mat[2] + y * mat[6] + z * mat[10] + w * mat[14],
      x * mat[3] + y * mat[7] + z * mat[11] + w * mat[15],
    ];
  };

  const screenPositionFromMvp = (
    mat: Float32Array,
    vec: [number, number, number],
    width: number,
    height: number
  ): [number, number] => {
    const halfWidth = width * 0.5;
    const halfHeight = height * 0.5;
    const v = toVecIV(mat, [vec[0], vec[1], vec[2], 1.0]);

    if (v[3] <= 0.0) {
      return [NaN, NaN];
    }

    const screenX = v[0] / v[3];
    const screenY = v[1] / v[3];
    return [halfWidth + screenX * halfWidth, halfHeight - screenY * halfHeight];
  };

  return {
    create,
    identity,
    multiply,
    scale,
    translate,
    rotate,
    lookAt,
    perspective,
    ortho,
    transpose,
    inverse,
    screenPositionFromMvp,
  };
};

// create a function of quaternion
export const Qtn = () => {
  const create = (): Float32Array => new Float32Array(4);

  const identity = (dest: Float32Array | null): Float32Array => {
    const out = dest == null ? create() : dest;
    out.fill(0);
    out[0] = out[1] = out[2] = 0;
    out[3] = 1;
    return out;
  };

  const inverse = (
    qtn: Float32Array,
    dest: Float32Array | null = null
  ): Float32Array => {
    const out = dest == null ? create() : dest;
    out[0] = -qtn[0];
    out[1] = -qtn[1];
    out[2] = -qtn[2];
    out[3] = qtn[3];
    return out;
  };

  const normalize = (
    qtn: Float32Array,
    dest: Float32Array | null = null
  ): Float32Array => {
    const out = dest == null ? create() : dest;
    let x = qtn[0],
      y = qtn[1],
      z = qtn[2],
      w = qtn[3];
    let l = x * x + y * y + z * z + w * w;
    if (l === 0) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
    } else {
      l = 1 / Math.sqrt(l);
      out[0] = x * l;
      out[1] = y * l;
      out[2] = z * l;
      out[3] = w * l;
    }
    return out;
  };

  const multiply = (
    qtn0: Float32Array,
    qtn1: Float32Array,
    dest: Float32Array | null = null
  ): Float32Array => {
    const out = dest == null ? create() : dest;
    const ax = qtn0[0],
      ay = qtn0[1],
      az = qtn0[2],
      aw = qtn0[3];
    const bx = qtn1[0],
      by = qtn1[1],
      bz = qtn1[2],
      bw = qtn1[3];
    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
  };

  const rotate = (
    angle: number,
    axis: number[],
    dest: Float32Array | null = null
  ): Float32Array => {
    const out = dest == null ? create() : dest;
    let [x, y, z] = axis;
    let len = Math.sqrt(x * x + y * y + z * z);
    if (len !== 1) {
      len = 1 / len;
      x *= len;
      y *= len;
      z *= len;
    }

    let s = Math.sin(angle * 0.5);
    out[0] = x * s;
    out[1] = y * s;
    out[2] = z * s;
    out[3] = Math.cos(angle * 0.5);
    return out;
  };

  const toVecIII = (
    qtn: Float32Array,
    vec: number[],
    dest: number[] | null = null
  ): number[] => {
    const out = dest == null ? [0, 0, 0] : dest;
    const [qx, qy, qz, qw] = qtn;
    const [vx, vy, vz] = vec;
    const x = qw * vx + qy * vz - qz * vy;
    const y = qw * vy + qz * vx - qx * vz;
    const z = qw * vz + qx * vy - qy * vx;
    const w = -qx * vx - qy * vy - qz * vz;
    out[0] = vx * qw + w * -qx + y * -qz - z * -qy;
    out[1] = vy * qw + w * -qy + z * -qx - x * -qz;
    out[2] = vz * qw + w * -qz + x * -qy - y * -qx;
    return out;
  };

  const toMatIV = (
    qtn: Float32Array,
    dest: Float32Array | null = null
  ): Float32Array => {
    const out = dest == null ? Mat4().create() : dest;
    const [x, y, z, w] = qtn;
    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2;
    const yx = y * x2;
    const yy = y * y2;
    const zx = z * x2;
    const zy = z * y2;
    const zz = z * z2;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;
    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;
    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;
    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  };

  const slerp = (
    qtn0: Float32Array,
    qtn1: Float32Array,
    time: number,
    dest: Float32Array | null = null
  ): Float32Array => {
    const out = dest == null ? create() : dest;
    let [ax, ay, az, aw] = qtn0;
    let [bx, by, bz, bw] = qtn1;
    let cosHalfTheta = ax * bx + ay * by + az * bz + aw * bw;
    if (cosHalfTheta < 0.0) {
      out[0] = -bx;
      out[1] = -by;
      out[2] = -bz;
      out[3] = -bw;
      cosHalfTheta = -cosHalfTheta;
    } else {
      out[0] = bx;
      out[1] = by;
      out[2] = bz;
      out[3] = bw;
    }
    if (cosHalfTheta >= 1.0) {
      out[0] = ax;
      out[1] = ay;
      out[2] = az;
      out[3] = aw;
      return out;
    }
    const halfTheta = Math.acos(cosHalfTheta);
    const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
    if (Math.abs(sinHalfTheta) < 0.001) {
      out[0] = ax * 0.5 + bx * 0.5;
      out[1] = ay * 0.5 + by * 0.5;
      out[2] = az * 0.5 + bz * 0.5;
      out[3] = aw * 0.5 + bw * 0.5;
      return out;
    }
    const ratioA = Math.sin((1 - time) * halfTheta) / sinHalfTheta;
    const ratioB = Math.sin(time * halfTheta) / sinHalfTheta;
    out[0] = ax * ratioA + bx * ratioB;
    out[1] = ay * ratioA + by * ratioB;
    out[2] = az * ratioA + bz * ratioB;
    out[3] = aw * ratioA + bw * ratioB;
    return out;
  };

  return {
    create,
    identity,
    inverse,
    normalize,
    multiply,
    rotate,
    toVecIII,
    toMatIV,
    slerp,
  };
};
