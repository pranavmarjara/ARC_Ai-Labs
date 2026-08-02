import { Renderer, Program, Triangle, Mesh } from '../vendor/ogl.mjs';

const hexToRgb = hex => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
};

const originToFlip = origin => {
  switch (origin) {
    case 'top-left': return [1, 0];
    case 'bottom-right': return [0, 1];
    case 'bottom-left': return [1, 1];
    default: return [0, 0];
  }
};

const vert = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const frag = `precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform float iSpeed;
uniform vec3 iRayColor1;
uniform vec3 iRayColor2;
uniform float iIntensity;
uniform float iSpread;
uniform float iFlipX;
uniform float iFlipY;
uniform float iTilt;
uniform float iSaturation;
uniform float iBlend;
uniform float iFalloff;
uniform float iOpacity;

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
  return clamp(
    (0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-cosAngle * seedB + iTime * speed)),
    0.0, 1.0) *
    clamp((iResolution.x - length(sourceToCoord)) / iResolution.x, 0.5, 1.0);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  if (iFlipX > 0.5) fragCoord.x = iResolution.x - fragCoord.x;
  if (iFlipY > 0.5) fragCoord.y = iResolution.y - fragCoord.y;

  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  vec2 rayPos = vec2(iResolution.x * 1.1, -0.5 * iResolution.y);

  float tiltRad = iTilt * 3.14159265 / 180.0;
  float cs = cos(tiltRad);
  float sn = sin(tiltRad);
  vec2 rel = coord - rayPos;
  vec2 tiltedCoord = vec2(rel.x * cs - rel.y * sn, rel.x * sn + rel.y * cs) + rayPos;

  float halfSpread = iSpread * 0.275;
  vec2 rayRefDir1 = normalize(vec2(cos(0.785398 + halfSpread), sin(0.785398 + halfSpread)));
  vec2 rayRefDir2 = normalize(vec2(cos(0.785398 - halfSpread), sin(0.785398 - halfSpread)));

  vec4 rays1 = vec4(iRayColor1, 1.0) * rayStrength(rayPos, rayRefDir1, tiltedCoord, 36.2214, 21.11349, iSpeed);
  vec4 rays2 = vec4(iRayColor2, 1.0) * rayStrength(rayPos, rayRefDir2, tiltedCoord, 22.3991, 18.0234, iSpeed * 0.2);

  vec4 color = rays1 * (1.0 - iBlend) * 0.9 + rays2 * iBlend * 0.9;

  float distanceToLight = length(fragCoord.xy - vec2(rayPos.x, iResolution.y - rayPos.y)) / iResolution.y;
  float brightness = iIntensity * 0.4 / pow(max(distanceToLight, 0.001), iFalloff);
  color.rgb *= brightness;

  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  color.rgb = mix(vec3(gray), color.rgb, iSaturation);

  color.a = max(color.r, max(color.g, color.b)) * iOpacity;
  gl_FragColor = color;
}`;

export function initSideRays(container, options = {}) {
  if (!container) return null;

  const {
    speed = 2.5,
    rayColor1 = '#EAB308',
    rayColor2 = '#96c8ff',
    intensity = 2,
    spread = 2,
    origin = 'top-right',
    tilt = 0,
    saturation = 1.5,
    blend = 0.75,
    falloff = 1.6,
    opacity = 1.0,
  } = options;

  let renderer;
  try {
    renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      alpha: true,
    });
  } catch {
    return null;
  }

  const gl = renderer.gl;
  if (!gl) return null;

  const canvas = gl.canvas;
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const geometry = new Triangle(gl);

  const [flipX, flipY] = originToFlip(origin);
  const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: [1, 1] },
    iSpeed: { value: speed },
    iRayColor1: { value: hexToRgb(rayColor1) },
    iRayColor2: { value: hexToRgb(rayColor2) },
    iIntensity: { value: intensity },
    iSpread: { value: spread },
    iFlipX: { value: flipX },
    iFlipY: { value: flipY },
    iTilt: { value: tilt },
    iSaturation: { value: saturation },
    iBlend: { value: blend },
    iFalloff: { value: falloff },
    iOpacity: { value: opacity },
  };

  const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
  const mesh = new Mesh(gl, { geometry, program });

  function setSize() {
    renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h);
    uniforms.iResolution.value = [w * renderer.dpr, h * renderer.dpr];
  }

  const resizeObserver = new ResizeObserver(setSize);
  resizeObserver.observe(container);
  setSize();

  let raf = 0;
  let contextLost = false;
  let visible = true;
  const t0 = performance.now();

  function loop(t) {
    if (contextLost || !visible) return;
    uniforms.iTime.value = (t - t0) * 0.001;
    try {
      renderer.render({ scene: mesh });
    } catch {
      return;
    }
    raf = requestAnimationFrame(loop);
  }

  function onContextLost(e) {
    e.preventDefault();
    contextLost = true;
    cancelAnimationFrame(raf);
  }
  function onContextRestored() {
    contextLost = false;
    if (visible) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    }
  }
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);

  const io = new IntersectionObserver(([entry]) => {
    const wasVisible = visible;
    visible = entry.isIntersecting;
    if (visible && !wasVisible && !contextLost) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    }
  }, { threshold: 0.1 });
  io.observe(container);

  raf = requestAnimationFrame(loop);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      io.disconnect();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      try {
        const loseCtx = gl.getExtension('WEBGL_lose_context');
        if (loseCtx) loseCtx.loseContext();
      } catch {}
      try {
        container.removeChild(canvas);
      } catch {}
    },
  };
}
