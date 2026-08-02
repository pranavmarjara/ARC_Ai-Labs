import * as THREE from '../vendor/three.module.js';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function makeDotTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.85)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function buildGeometry(img, opts) {
  const {
    step = 2,
    threshold = 10,
    planeWidth = 3.4,
    curvature = 0.55,
    detail = 0.32,
    jitter = 0.05,
  } = opts;

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, img.width, img.height);

  const aspect = img.height / img.width;
  const planeHeight = planeWidth * aspect;

  const positions = [];
  const colors = [];
  const sizes = [];
  const seeds = [];
  const alphas = [];

  for (let y = 0; y < img.height; y += step) {
    for (let x = 0; x < img.width; x += step) {
      const idx = (y * img.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = (r + g + b) / 3 / 255;
      const level = brightness * 255;

      if (level < threshold) continue;

      const keepChance = Math.min(1, Math.max(0.06, (level - threshold) / 50));
      if (Math.random() > keepChance) continue;

      const nx = x / img.width - 0.5;
      const ny = 0.5 - y / img.height;

      const px = nx * planeWidth;
      const py = ny * planeHeight;

      const r2 = (nx * nx + ny * ny) * 3.6;
      const dome = Math.max(0, 1 - r2) * curvature;
      const detailBump = brightness * brightness * detail;
      const noiseJitter = (hash(x, y) - 0.5) * jitter;

      const pz = dome + detailBump + noiseJitter;

      positions.push(px, py, pz);
      colors.push(brightness, brightness, brightness);
      sizes.push(0.018 + brightness * 0.05);
      seeds.push(Math.random() * Math.PI * 2);
      alphas.push(Math.min(1, brightness * 1.3 + 0.12));
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
  geometry.setAttribute('aAlpha', new THREE.Float32BufferAttribute(alphas, 1));

  return geometry;
}

const vertexShader = `
  attribute float aSize;
  attribute float aSeed;
  attribute float aAlpha;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = color;

    float flicker = 0.82 + 0.18 * sin(uTime * 1.6 + aSeed * 6.2831);
    vAlpha = aAlpha * flicker;

    vec3 pos = position;
    pos.z += sin(uTime * 0.5 + aSeed * 6.2831) * 0.012;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uPixelRatio * (340.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  precision mediump float;
  uniform sampler2D uDot;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 tex = texture2D(uDot, gl_PointCoord);
    float a = tex.a * vAlpha;
    if (a < 0.02) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

function buildGlow() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,0.16)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.05)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(6, 6, 1);
  sprite.position.set(0, 0.1, -0.6);
  return sprite;
}

export async function initHeroBust(canvasSelector, imageUrl, options = {}) {
  const canvas = document.querySelector(canvasSelector);
  if (!canvas || typeof window === 'undefined') return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) {
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 0, 4.6);
  camera.lookAt(0, 0, 0);

  scene.add(buildGlow());

  let img;
  try {
    img = await loadImage(imageUrl);
  } catch (err) {
    return null;
  }

  let geometry;
  try {
    geometry = buildGeometry(img, options);
  } catch (err) {
    console.error('[hero-bust] Could not read pixel data from image (likely a CORS/local-file restriction — serve the site over http:// instead of file://):', err);
    return null;
  }

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uDot: { value: makeDotTexture() },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  const group = new THREE.Group();
  group.add(points);
  scene.add(group);

  function resize() {
    const { clientWidth, clientHeight } = canvas;
    if (!clientWidth || !clientHeight) return;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  const pointer = { x: 0, y: 0 };
  const targetRot = { x: 0, y: 0 };
  function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  }
  if (!REDUCED_MOTION) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  let visible = true;
  const io = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? true;
  });
  io.observe(canvas);

  let raf = null;
  const clock = new THREE.Clock();

  function tick() {
    raf = requestAnimationFrame(tick);
    if (!visible || document.hidden) return;

    const t = clock.getElapsedTime();
    material.uniforms.uTime.value = t;

    if (!REDUCED_MOTION) {
      targetRot.y = pointer.x * 0.22 + Math.sin(t * 0.15) * 0.05;
      targetRot.x = pointer.y * -0.12;
      group.rotation.y += (targetRot.y - group.rotation.y) * 0.04;
      group.rotation.x += (targetRot.x - group.rotation.x) * 0.04;
    }

    renderer.render(scene, camera);
  }
  tick();

  return {
    destroy() {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
