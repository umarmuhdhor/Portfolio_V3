/**
 * GLSL for the image layer.
 *
 * Written from the behaviours identified in the reference's compiled output,
 * not transcribed from it: cover-fit in UV space, a soft alpha falloff at the
 * plane edges, an SDF rounded-corner border antialiased with fwidth, a
 * scroll-driven clip, and opacity gating that discards entirely rather than
 * blending a fully transparent fragment.
 *
 * The value-noise field is used for the dissolve on reveal — a plain opacity
 * fade reads as a video crossfade, where a noise-thresholded one reads as the
 * image resolving into place, which is what the reference does.
 */

export const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uTexture;
  uniform vec2  uResolution;   // plane size in pixels
  uniform vec2  uImageSize;    // intrinsic texture size in pixels
  uniform vec2  uOffset;       // cover-fit focal offset, 0.5 = centred
  uniform float uOpacity;
  uniform float uBgOpacity;
  uniform float uRadius;       // corner radius in pixels
  uniform float uClip;         // discard below this uv.y — scroll reveal
  uniform float uFeather;      // edge falloff width, in uv units
  uniform float uNoise;        // 0 = resolved, 1 = fully dissolved
  uniform float uTime;
  uniform vec3  uBgColor;

  // -- value noise ---------------------------------------------------------
  // Cheap hash; quality matters less than being stable across frames, since a
  // flickering dissolve is far more noticeable than a slightly regular one.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    // smoothstep the interpolant so cell boundaries do not show as creases
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      sum += amp * valueNoise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return sum;
  }

  // -- object-fit: cover, in UV space --------------------------------------
  // Compare the two aspect ratios and scale the axis that would otherwise
  // letterbox, then re-centre on the focal offset.
  vec2 coverUv(vec2 uv, vec2 planeSize, vec2 imageSize, vec2 offset) {
    vec2 ratio = vec2(
      min((planeSize.x / planeSize.y) / (imageSize.x / imageSize.y), 1.0),
      min((planeSize.y / planeSize.x) / (imageSize.y / imageSize.x), 1.0)
    );
    return uv * ratio + (1.0 - ratio) * offset;
  }

  // -- signed distance to a rounded box ------------------------------------
  // p is relative to the box centre; b is the half-extent inset by the radius.
  float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  // -- soft alpha falloff at the plane edges -------------------------------
  float edgeFeather(vec2 uv, float width) {
    vec2 f = smoothstep(vec2(0.0), vec2(width), uv)
           * smoothstep(vec2(0.0), vec2(width), 1.0 - uv);
    return f.x * f.y;
  }

  void main() {
    // Nothing to composite — leave the fragment entirely rather than paying
    // for a blend that contributes no colour.
    if (uOpacity <= 0.001 && uBgOpacity <= 0.001) discard;

    // Scroll-driven clip. The plane is revealed from the bottom up as it
    // enters, so everything below the threshold is simply not drawn.
    if (vUv.y < uClip) discard;

    vec2 uv = coverUv(vUv, uResolution, uImageSize, uOffset);
    vec4 tex = texture2D(uTexture, uv);

    // Rounded corner mask, antialiased over one pixel of screen-space
    // derivative so the radius holds at any plane size.
    vec2 halfSize = uResolution * 0.5;
    vec2 p = (vUv - 0.5) * uResolution;
    float dist = sdRoundedBox(p, halfSize, uRadius);
    float aa = fwidth(dist);
    float corner = 1.0 - smoothstep(-aa, aa, dist);

    // Dissolve: threshold an fBm field rather than fading uniformly.
    float n = fbm(vUv * 6.0 + uTime * 0.02);
    float dissolve = smoothstep(uNoise - 0.25, uNoise + 0.25, n);

    float feather = edgeFeather(vUv, uFeather);
    float alpha = corner * feather * dissolve;

    vec3 color = mix(uBgColor, tex.rgb, uOpacity);
    float outAlpha = alpha * max(uOpacity, uBgOpacity);

    if (outAlpha <= 0.001) discard;

    gl_FragColor = vec4(color, outAlpha);
  }
`;
