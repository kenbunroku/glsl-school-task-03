attribute vec3 cubePosition;
attribute vec3 cubeNormal;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vNormal = cubeNormal;

    gl_Position = vec4(cubePosition, 1.0);
}
