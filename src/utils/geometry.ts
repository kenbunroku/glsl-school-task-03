export const createCube = (size: number) => {
  const halfSize = size / 2;

  const vertices = new Float32Array([
    // Front face
    -halfSize,
    -halfSize,
    halfSize,
    halfSize,
    -halfSize,
    halfSize,
    halfSize,
    halfSize,
    halfSize,
    -halfSize,
    halfSize,
    halfSize,

    // Back face
    -halfSize,
    -halfSize,
    -halfSize,
    -halfSize,
    halfSize,
    -halfSize,
    halfSize,
    halfSize,
    -halfSize,
    halfSize,
    -halfSize,
    -halfSize,

    // Top face
    -halfSize,
    halfSize,
    -halfSize,
    -halfSize,
    halfSize,
    halfSize,
    halfSize,
    halfSize,
    halfSize,
    halfSize,
    halfSize,
    -halfSize,

    // Bottom face
    -halfSize,
    -halfSize,
    -halfSize,
    halfSize,
    -halfSize,
    -halfSize,
    halfSize,
    -halfSize,
    halfSize,
    -halfSize,
    -halfSize,
    halfSize,

    // Right face
    halfSize,
    -halfSize,
    -halfSize,
    halfSize,
    halfSize,
    -halfSize,
    halfSize,
    halfSize,
    halfSize,
    halfSize,
    -halfSize,
    halfSize,

    // Left face
    -halfSize,
    -halfSize,
    -halfSize,
    -halfSize,
    -halfSize,
    halfSize,
    -halfSize,
    halfSize,
    halfSize,
    -halfSize,
    halfSize,
    -halfSize,
  ]);

  const v = 1 / Math.sqrt(3);
  const normals = new Float32Array([
    // Front
    -v,
    -v,
    v,
    v,
    -v,
    v,
    v,
    v,
    v,
    -v,
    v,
    v,

    // Back
    -v,
    -v,
    -v,
    -v,
    v,
    -v,
    v,
    v,
    -v,
    v,
    -v,
    -v,

    // Top
    -v,
    v,
    -v,
    -v,
    v,
    v,
    v,
    v,
    v,
    v,
    v,
    -v,

    // Bottom
    -v,
    -v,
    -v,
    v,
    -v,
    -v,
    v,
    -v,
    v,
    -v,
    -v,
    v,

    // Right
    v,
    -v,
    -v,
    v,
    v,
    -v,
    v,
    v,
    v,
    v,
    -v,
    v,

    // Left
    -v,
    -v,
    -v,
    -v,
    -v,
    v,
    -v,
    v,
    v,
    -v,
    v,
    -v,
  ]);

  const indices = [
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14,
    15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
  ];

  return { vertices, normals, indices };
};
