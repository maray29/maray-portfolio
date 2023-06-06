uniform vec3 color;
uniform float time;
uniform float speed;
varying vec2 vUv;
varying vec3 vPosition;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 10.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  // Permutations
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);    // mod(j,N)

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  //Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Function to create a circle with blurred edges
float circle(vec2 uv, float radius, float blur) {
  float dist = length(uv - vec2(0.5));
  float circle = smoothstep(radius, radius + blur, dist);
  return 1.0 - circle;
}

float light1(float intensity, float attenuation, float dist) {
  return intensity / (1.0 + dist * attenuation);
}
float light2(float intensity, float attenuation, float dist) {
  return intensity / (1.0 + dist * dist * attenuation);
}

vec4 extractAlpha(vec3 colorIn) {
  vec4 colorOut;
  float maxValue = min(max(max(colorIn.r, colorIn.g), colorIn.b), 1.0);
  if (maxValue > 1e-5) {
    colorOut.rgb = colorIn.rgb * (1.0 / maxValue);
    colorOut.a = maxValue;
  } else {
    colorOut = vec4(0.0);
  }
  return colorOut;
}

void main() {
  float delta = 0.1;
  float alpha = 1. - smoothstep(0.45 - delta, 0.45, length(gl_PointCoord - vec2(0.5)));
    // float circle = 1. - step(0.5, length(gl_PointCoord - vec2(0.5)));

    // float gradient = smoothstep(0.4, 0.5, vUv.y);
  float gradient = circle(vUv, 0.05, 0.3);

    // ring
  vec3 color1 = vec3(0.611765, 0.262745, 0.996078);
  vec3 color2 = vec3(0.298039, 0.760784, 0.913725);
  vec3 color3 = vec3(0.062745, 0.078431, 0.600000);
  float noiseScale = 0.65;
  float innerRadius = 0.6;
  float adjustedTime = time * speed;
  float len = length(vUv);
  float ang = atan(vUv.y, vUv.x);
  float v0, v1, v2, v3, cl;
  float r0, d0, n0;
  float r, d;
  vec3 p = vPosition;
    // n0 = snoise(vec3(vUv * noiseScale, time * 0.5)) * 0.5 + 0.5;
  n0 = snoise(vec3(p.x * 0.6 + adjustedTime * 0.2, p.y * 0.4 + adjustedTime * 0.3, p.z * 0.2 + adjustedTime * 0.2));
  r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
  d0 = distance(vUv, r0 / len * vUv);
  v0 = light1(1.0, 10.0, d0);
  v0 *= smoothstep(r0 * 1.05, r0, len);
  cl = cos(ang + time * 2.0) * 0.5 + 0.5;

    // high light
  float a = time * -1.0;
  vec2 pos = vec2(cos(a), sin(a)) * r0;
  d = distance(vUv, pos);
  v1 = light2(1.5, 5.0, d);
  v1 *= light1(1.0, 50.0, d0);

    // back decay
  v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);

    // hole
  v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);

    // color
  vec3 col = mix(color1, color2, cl);
  col = mix(color3, col, v0);
  col = (col + v1) * v2 * v3;
  col.rgb = clamp(col.rgb, 0.0, 0.9);

  vec4 finalColor = extractAlpha(col);
  finalColor.a = alpha;

    // gl_FragColor = vec4(color, alpha * v1 * v2 * v3);
  gl_FragColor = vec4(color, alpha * v1);
    // gl_FragColor = vec4(col, alpha);
    // gl_FragColor = finalColor;
}