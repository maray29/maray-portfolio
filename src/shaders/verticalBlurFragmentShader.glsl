uniform sampler2D sampler;
uniform float blurSize;

varying vec2 vUv;

void main() {

    vec4 sum = vec4(0.0);

    sum += texture2D(sampler, vec2(vUv.x, vUv.y - 4.0 * blurSize)) * 0.051;
    sum += texture2D(sampler, vec2(vUv.x, vUv.y - 3.0 * blurSize)) * 0.0918;
    sum += texture2D(sampler, vec2(vUv.x, vUv.y - 2.0 * blurSize)) * 0.12245;
    sum += texture2D(sampler, vec2(vUv.x, vUv.y - 1.0 * blurSize)) * 0.1531;
    sum += texture2D(sampler, vec2(vUv.x, vUv.y)) * 0.1633;
    sum += texture2D(sampler, vec2(vUv.x, vUv.y + 1.0 * blurSize)) * 0.1531;
    sum += texture2D(sampler, vec2(vUv.x, vUv.y + 2.0 * blurSize)) * 0.12245;
    sum += texture2D(sampler, vec2(vUv.x, vUv.y + 3.0 * blurSize)) * 0.0918;
    sum += texture2D(sampler, vec2(vUv.x, vUv.y + 4.0 * blurSize)) * 0.051;
    gl_FragColor = sum;
}