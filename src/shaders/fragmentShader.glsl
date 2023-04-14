uniform sampler2D uTexture;
uniform float uAlpha;
uniform vec2 uOffset;
varying vec2 vUv;

vec3 rgbShift(sampler2D texture1, vec2 uv, vec2 offset) {
    float r = texture2D(uTexture, vUv + uOffset).r;
    vec2 gb = texture2D(uTexture, vUv).gb;
    return vec3(r, gb);
}
void main() {
    vec3 color = rgbShift(uTexture, vUv, uOffset);
    gl_FragColor = vec4(color, uAlpha);
}

// uniform sampler2D uTexture;
// uniform float uAlpha;
// uniform vec2 uOffset;
// varying vec2 vUv;
// uniform float progress;

// vec3 rgbShift(sampler2D texture1, vec2 uv, vec2 offset) {
//     float r = texture2D(uTexture, vUv + uOffset).r;
//     vec2 gb = texture2D(uTexture, vUv).gb;
//     return vec3(r, gb);
// }

// vec2 applyDistortion(vec2 uv) {
//     // Apply barrel distortion
//     vec2 center = vec2(0.5, 0.5);
//     float k1 = 0.75 * progress;
//     float k2 = 0.25 * progress;

//     vec2 distUv = uv - center;
//     float r2 = dot(distUv, distUv);
//     float distortionFactor = 1.0 - k1 * r2 - k2 * r2 * r2;

//     // Modify distortion factor based on progress
//     distortionFactor = mix(distortionFactor, 1.0, clamp((progress - 0.5) * 2.0, 0.0, 1.0));

//     vec2 barrelDistortion = distUv * distortionFactor;
//     vec2 barrelUv = barrelDistortion + center;

//     return barrelUv;
// }
// void main() {
//     // vec3 color = rgbShift(uTexture, vUv, uOffset);
//     // gl_FragColor = vec4(color, uAlpha);

//     vec2 distortedUv = applyDistortion(vUv);
//     gl_FragColor = texture2D(uTexture, distortedUv);
// }