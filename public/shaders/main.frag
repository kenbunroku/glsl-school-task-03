#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float iTime;
uniform vec2 iMouse;
uniform vec2 iResolution;
uniform samplerCube textureUnit;

#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.001
#define PI 3.141592
#define TAU 6.283185
#define S smoothstep

mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

vec2 pmod(vec2 p, float r) {
    float a = atan(p.y, p.x) + PI / r;
    float n = (PI * 2.0) / r;
    a = floor(a / n) * n;

    return p * rot(-a);
}

float sdBox(vec3 p, vec3 s) {
    p = abs(p) - s;
    return length(max(p, 0.0)) + min(max(p.x, max(p.y, p.z)), 0.0);
}

float getDist(vec3 p) {
    p.xy *= rot(iTime * 0.2);

    p.yx = pmod(p.yx, 18.0);
    p.y -= sin(iTime) * 2.;

    for(int i = 0; i < 2; i++) {
        p = abs(p) - 2.;
        p.xz *= rot(iTime * 0.2);
        p.xy *= rot(iTime * 0.4);
        // p.yz *= rot(iTime * 0.6);
    }
    float d = sdBox(p, vec3(1.0));

    float c = cos(PI / 5.0), s = sqrt(0.75 - c * c);
    vec3 n = vec3(-0.5, -c, s);

    p = abs(p);
    p -= 2. * min(0., dot(p, n)) * n;

    p.xy = abs(p.xy);
    p -= 2. * min(0., dot(p, n)) * n;

    p.xy = abs(p.xy);
    p -= 2. * min(0., dot(p, n)) * n;

    d = p.z - 1.0;
    return d;
}

float rayMarch(vec3 ro, vec3 rd, float side) {
    float d = 0.0;
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * d;
        float dS = getDist(p) * side;
        d += dS;
        if(dS < SURF_DIST || d > MAX_DIST)
            break;
    }
    return d;
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.01, 0.0);
    return normalize(vec3(getDist(p + e.xyy) - getDist(p - e.xyy), getDist(p + e.yxy) - getDist(p - e.yxy), getDist(p + e.yyx) - getDist(p - e.yyx)));
}

vec3 getRayDir(vec2 uv, vec3 p, vec3 l, float z) {
    vec3 f = normalize(l - p);
    vec3 r = normalize(cross(vec3(0.0, 1.0, 0.0), f));
    vec3 u = cross(f, r);
    vec3 c = f * z;
    vec3 i = c + uv.x * r + uv.y * u;
    return normalize(i);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - iResolution.xy * 0.5) / iResolution.y;
    vec2 m = iMouse.xy / iResolution.xy;

    vec3 ro = vec3(.0, .0, -10.0);

    vec3 rd = getRayDir(uv, ro, vec3(0.0, 0.0, 0.0), 1.);
    vec3 col = textureCube(textureUnit, rd).rgb;

    float d = rayMarch(ro, rd, 1.0);

    float IOR = 1.45;
    if(d < MAX_DIST) {
        vec3 p = ro + rd * d;
        vec3 n = getNormal(p);
        vec3 r = reflect(rd, n);
        vec3 refOutside = textureCube(textureUnit, r).rgb;

        vec3 rdIn = refract(rd, n, 1.0 / IOR);

        vec3 pEnter = p - n * SURF_DIST * 3.0;
        float dIn = rayMarch(pEnter, rdIn, -1.0); // inside

        vec3 pExit = pEnter + rdIn * dIn;
        vec3 nExit = -getNormal(pExit);

        vec3 reflTex = vec3(0.0);
        vec3 rdOut = vec3(0.0);

        float abb = 0.1;

        // Red
        rdOut = refract(rdIn, nExit, IOR - abb);
        if(dot(rdOut, rdOut) == 0.0)
            rdOut = reflect(rdIn, nExit);
        reflTex.r = textureCube(textureUnit, rdOut).r;

        // Green
        rdOut = refract(rdIn, nExit, IOR);
        if(dot(rdOut, rdOut) == 0.0)
            rdOut = reflect(rdIn, nExit);
        reflTex.g = textureCube(textureUnit, rdOut).g;

        // Blue
        rdOut = refract(rdIn, nExit, IOR + abb);
        if(dot(rdOut, rdOut) == 0.0)
            rdOut = reflect(rdIn, nExit);
        reflTex.b = textureCube(textureUnit, rdOut).b;

        float dens = 0.2;
        float optDist = exp(-dIn * dens);

        reflTex = reflTex * optDist;

        float fresnel = pow(1.0 + dot(rd, n), 5.0);
        col = mix(reflTex, refOutside, fresnel);
    }

    col = pow(col, vec3(0.4545));

    gl_FragColor = vec4(col, 1.0);
}
