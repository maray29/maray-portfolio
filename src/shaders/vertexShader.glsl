#define M_PI 3.1415926535897932384626433832795

uniform vec2 uOffset;
varying vec2 vUv;

uniform float progress;
uniform float scale;
uniform float aspectRatio;

vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
    position.x = position.x + (sin(uv.y * M_PI) * offset.x);
    position.y = position.y + (sin(uv.x * M_PI) * offset.y);
    return position;
}

// Function to warp the rectangular mesh into a spherical shape
vec3 warpToSphere(vec3 position, float progress) {
    float radius = 0.5;

    float theta = (position.x + 0.5) * 2.0 * 3.14159265;
    float phi = (position.y + 0.5) * 3.14159265;

    vec3 spherePos = vec3(radius * sin(phi) * cos(theta), radius * cos(phi), radius * sin(phi) * sin(theta));

    return mix(position, spherePos, progress);
}

vec2 applyDistortion(vec2 uv) {
    vec2 center = vec2(0.5, 0.5);
    float k1 = 0.5 * progress;
    float k2 = 0.25 * progress;

    // vec2 distUv = uv - center;
    vec2 distUv = (uv - center) * vec2(aspectRatio, 1.0);
    float r2 = dot(distUv, distUv);
    float distortionFactor = 1.0 - k1 * r2 - k2 * r2 * r2;

    // Modify distortion factor based on progress
    distortionFactor = mix(distortionFactor, 1.0, clamp((progress - 0.5) * 2.0, 0.0, 1.0));

    vec2 barrelDistortion = distUv * distortionFactor;
    vec2 barrelUv = barrelDistortion + center;

    return barrelUv;
}

void main() {
    vUv = uv;

    vec2 distortedUv = applyDistortion(uv);

    // vUv = distortedUv;

    // Scale the mesh based on progress value
    vec3 scaledPosition = position * ((scale + progress) * 0.4);

    scaledPosition = deformationCurve(scaledPosition, uv, uOffset);
    vec4 mvPosition = modelViewMatrix * vec4(scaledPosition, 1.0);
    gl_Position = projectionMatrix * vec4(mvPosition.xyz + vec3(distortedUv * 2.0 - 1.0, 0.0), 1.0);
}

// #define M_PI 3.1415926535897932384626433832795

// uniform vec2 uOffset;
// varying vec2 vUv;

// uniform float progress;

// vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
//     position.x = position.x + (sin(uv.y * M_PI) * offset.x);
//     position.y = position.y + (sin(uv.x * M_PI) * offset.y);
//     return position;
// }

// vec3 deformationCurveOnProgress(vec3 position, vec2 uv, float progress) {
//     vec2 center = vec2(0.5, 0.5);
//     vec2 direction = normalize(uv - center);
//     float distanceFromCenter = length(uv - center);

//     float progressWave = sin(progress * M_PI);
//     float deformation = sin(distanceFromCenter * M_PI) * progressWave * 0.75;
//     position.x = position.x + deformation * direction.x;
//     position.y = position.y + deformation * direction.y;

//     return position;
// }

// void main() {

//     vUv = uv;
//     vec3 newPosition = position;
//     newPosition = deformationCurve(position, uv, uOffset);
//     newPosition = deformationCurveOnProgress(newPosition, uv, progress);

//     gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
// }
