varying vec2 vTextureCoord;
varying vec2 vFilterCoord;
uniform sampler2D uSampler;
uniform sampler2D uText;
uniform sampler2D uDisp;
uniform float uTrans;
uniform float uTime;
uniform float uDir; 
// -1 or 1
void main(void) {
    vec2 uv = vFilterCoord;
    // float t = sin(uTime * 0.02) * 0.1 + 0.05;
    vec4 disp = texture2D(uDisp, uv);
    float tran0 = uTrans * (disp.r * 1.0);
    float tran1 = (1.0 - uTrans) * (disp.r * 1.0);
    vec2 distortedPosition0 = vec2(uv.x, uv.y + (tran0 * uDir));
    vec2 distortedPosition1 = vec2(uv.x, uv.y - (tran1 * uDir));
    vec4 color0 = texture2D(uText, distortedPosition0);
    vec4 color1 = texture2D(uText, distortedPosition1);
    gl_FragColor = mix(color0, color1, uTrans);
}