// brain hologram, from website drafts/brain-hologram-shell (script.js), drawn inside the hero card
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";

// white on purpose: the glow brightens the background, so the canvas is multiplied onto the page instead (style.css)
const BG_COLOR = 0xffffff;

const canvas = document.getElementById("brain-canvas");
const loader = document.getElementById("loader");

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(BG_COLOR, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Scene & camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 1000);
// Rest view: the original straight-on view from the brain-hologram-shell draft.
// The camera starts here, and drifts back here after a spell with no dragging.
const REST_DIR = new THREE.Vector3(0, 0, 1);
const IDLE_MS = 5000;        // how long the brain is left alone before it goes home
const RETURN_EASE = 0.035;   // how fast it goes home -- lower is slower
// Extra tilt at rest (0 = the draft's own pose; negative turns it clockwise on screen)
const REST_ROLL = 0;
// Default turn: the brain spun 75 degrees anticlockwise (as seen from above) from the draft's view.
// The model is straightened by MODEL_YAW below, so that is added back here to keep the same resting view.
const REST_YAW = THREE.MathUtils.degToRad(75 + 24);
camera.position.copy(REST_DIR).multiplyScalar(5);

scene.add(new THREE.AmbientLight(0xffffff, 1));

// Glow: bloom post-processing makes the dots shine
const GLOW_STRENGTH = 0.10; // how bright the glow is
const GLOW_RADIUS = 0.15;   // how far the glow spreads

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), GLOW_STRENGTH, GLOW_RADIUS, 0);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// Controls: drag to rotate, no zoom/pan so page layout stays stable
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;

// Remember when the visitor last let go of the brain
let dragging = false;
let lastTouch = -Infinity;
controls.addEventListener("start", () => { dragging = true; });
controls.addEventListener("end", () => { dragging = false; lastTouch = performance.now(); });
const restSph = new THREE.Spherical().setFromVector3(REST_DIR);
const camSph = new THREE.Spherical();
function driftHome() {
  if (dragging || performance.now() - lastTouch < IDLE_MS) return;
  camSph.setFromVector3(camera.position);
  // shortest way round
  let dTheta = restSph.theta - camSph.theta;
  dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta));
  const dPhi = restSph.phi - camSph.phi;
  if (Math.abs(dTheta) < 1e-4 && Math.abs(dPhi) < 1e-4) return;
  camSph.theta += dTheta * RETURN_EASE;
  camSph.phi += dPhi * RETURN_EASE;
  camera.position.setFromSpherical(camSph);
}
// OrbitControls claims every touch; give vertical swipes back to the page
canvas.style.touchAction = "pan-y";

// Which brain is drawn. "surface" is a real brain mesh: the dots go straight onto
// its own triangles, so its folds are kept exactly as modelled. null draws the
// old particle brain (brain.glb) with the photo colors below.
// Model: "Brain Areas" by Versal, https://sketchfab.com/3d-models/brain-areas-d64608a3978b47d8a39c5a15795ca8c4
// licensed CC-BY-4.0 -- needs a visible credit on the site.
const SURFACE = {
  src: "hologram/brain_areas.glb",
  // Drawn in the particle brain's own style: its dot density (DOTS_PER_AREA),
  // dot size (POINT_SIZE) and backing shade (BACKING_SHADE), so only the shape
  // underneath differs
  dotsPerArea: 90000,
  backingInset: 0.006,      // backing mesh pushed in along its normals, just under the dots
  pointSize: 0.0065,
  backingShade: 0.7,        // slightly darker than the dots, so gaps read as depth
  restYaw: THREE.MathUtils.degToRad(-90), // this model faces +z; turn it side-on, face to the left

  // Coloring: the particle brain's palette (sampled from its photos in
  // hologram/views, with its saturation boost), placed the way the fluorescent
  // scans place it. Each spot is measured against a smoothed copy of the mesh --
  // sticking out = gyrus, sunk in = sulcus -- giving 0 (deepest crease) .. 1
  // (top of a gyrus). The ramp climbs out of the crease through blue and green
  // to a thin yellow line where the gyrus turns over, then back to cyan on top,
  // so every gyrus comes out outlined in yellow.
  ridgeSmooth: 30,          // smoothing passes for that copy -- higher = judges wider folds
  ramp: [
    [0.00, "#002760"],      // navy, deep in the sulci
    [0.30, "#0064c4"],      // blue up the walls
    [0.47, "#008644"],      // dark green
    [0.56, "#58bf48"],      // green
    [0.62, "#f6df00"],      // yellow: the gyrus border
    [0.68, "#58bf48"],      // green
    [0.80, "#0096c6"],      // cyan across the top of the gyrus
    [1.00, "#0096c6"],
  ],
  // Lower brain (temporal lobes, cerebellum): the particle brain's pink/blue
  // there, same layout -- the border line is pink over blue
  lowRamp: [
    [0.00, "#002760"],
    [0.30, "#1f6bff"],
    [0.52, "#1f6bff"],
    [0.62, "#ff3fa4"],      // pink: the gyrus border
    [0.74, "#1f6bff"],
    [1.00, "#0064c4"],
  ],
  lowStart: 0.4,            // lower-brain colors fade in below this fraction of the height...
  lowFull: 0.18,            // ...fully by here
  marble: 0.05,             // slow wobble along the ramp, so the border lines waver like the scans'
  rimTint: "#e542a2",       // the silhouette picks up the palette's pink, like the scans' outlines
  rimTintMix: 0,            // off: the particle brain's rim only brightens, it is not tinted
};

// Pivot holds the model so we can spin/tilt it independently of the camera
const pivot = new THREE.Group();
scene.add(pivot);
pivot.rotation.y = SURFACE ? SURFACE.restYaw : REST_YAW;

// Dots: scattered evenly over the brain's surface (the density-field surface
// below, at level DOT_ISO), so they cover every fold with no bare patches.
const DOTS_PER_AREA = 90000; // dots per square unit of surface -- more = finer, slower load
const DOT_ISO = 0.5;         // which density level the dots sit on (lower = further out)
const DOT_JITTER = 0.004;    // slight in/out jitter so the skin is not paper-flat
const POINT_SIZE = 0.0065;   // dot size

// Coloring: each dot takes its color from reference photos of the brain, one
// per side. A dot is projected into every photo facing it and the samples are
// blended by how squarely that photo faces the dot.
// Axes are anatomical: F = toward the face, U = up, R = the brain's own right.
// "right"/"up" say which anatomical direction points right/up in each photo.
// "weight" scales how much a photo counts.
// The sides are painted from one hemisphere of the top photo ("half": "top"),
// not from views/left.webp / right.webp: those are slices through the middle
// of the brain, and painted the inside anatomy (ventricles, corpus callosum)
// onto the outer surface. The top photo's folds -- blue/green with yellow
// borders -- carry the same look down the sides.
const VIEWS = [
  { src: "hologram/views/superior.webp",  look: "U",  right: "F",  up: "R",  weight: 1 },
  { src: "hologram/views/inferior.webp",  look: "-U", right: "F",  up: "-R", weight: 1 },
  { src: "hologram/views/anterior.webp",  look: "F",  right: "-R", up: "U",  weight: 1 },
  { src: "hologram/views/posterior.webp", look: "-F", right: "R",  up: "U",  weight: 1 },
  { src: "hologram/views/superior.webp",  look: "R",  right: "F",  up: "U",  weight: 1, half: "top" },
  { src: "hologram/views/superior.webp",  look: "-R", right: "-F", up: "U",  weight: 1, half: "top", flipX: true },
];
// Which way the model's face points along z (+1 or -1). U is +y, and R follows.
const FRONT_SIGN = -1;
// The brain sits turned 24 degrees about the vertical inside brain.glb, so its
// midline is not the x = 0 plane the photos are mapped onto -- the superior
// photo's fissure landed diagonally across the hemispheres. Turning it back by
// this much (found by mirror-symmetry fit) lines the midline up with x = 0.
const MODEL_YAW = THREE.MathUtils.degToRad(-24);
const MIDLINE_X = -0.01; // where the midline sits across x once turned (model units)
const VIEW_SHARPNESS = 12;  // higher = each photo covers only the side it faces (low values blend photos and blur the folds)
const SIDE_KEEP = 0.6;      // how much of the hemisphere's length the sides use -- lower = bigger, less stretched folds
const VIEW_LABEL_CUTOFF = 0.82; // photos carry a caption below this fraction of height
const COLOR_GAIN = 0.9;
const COLOR_SATURATION = 1.25; // >1 makes the photo colours more vivid

// Dots are drawn solid and hide what sits behind them, so the brain reads as
// a surface instead of a glass cloud.
const DOT_OPACITY = 1.0;

// Backing: the particles are also melted into one closed surface (a density
// field, then marching cubes), painted the same colors and tucked just inside
// the dots. It is unlit, so it reads as plain color filling the gaps between
// dots -- the far side of the brain never shows through.
const SHOW_BACKING = true;
const BACKING_INSET = 0.97;  // shrink so the backing sits behind the dot layer
const BACKING_SHADE = 0.7;   // slightly darker than the dots, so gaps read as depth
const SOLID_RES = 144;       // grid cells per side -- higher = finer folds, slower load
const SOLID_RADIUS = 0.07;   // how far each particle's "mass" reaches
const SOLID_SMOOTH = 3;      // blur passes -- higher = smoother, softer folds
const SOLID_ISO = 0.6;       // surface level -- higher = thinner, sits deeper inside the dots
const SOLID_FIT = 1.1;       // grid spans +-this, so the brain never touches its edge

// Detail from the model's own folds (worked out from the same density field):
const CAVITY_BLUR = 10;      // how wide an area counts as "a crease" -- higher = broader
const CREASE_SHADE = 1.0;    // color multiplier deep in a crease (1 = off: the model's creases do not match the painted folds)
const CROWN_LIFT = 1.0;      // color multiplier on top of a ridge (1 = off)
const LIGHT_AMBIENT = 0.85;  // dot lighting: base level...
const LIGHT_DIFFUSE = 0.2;   // ...plus this much where a fold faces the light

// Lower brain: recolored pink/blue, keeping the photos' light/dark pattern --
// bright ridges turn pink, the rest blue. Heights are fractions of the brain's
// height from the bottom; the tint fades in between START and FULL.
const BOTTOM_START = 0.55;
const BOTTOM_FULL = 0.3;
const BOTTOM_BLUE = "#1f6bff";
const BOTTOM_PINK = "#ff3fa4";

// Edge highlight: dots on the silhouette brighten so the outline stays readable
// against the background. It lifts the dot's own color, not a fixed one.
const RIM_INTENSITY = 0.5;  // how much brighter the edge burns
const RIM_POWER = 2.4;      // higher = tighter, thinner edge band
const RIM_SHELL = 0.55;     // only dots past this fraction of the radius glow

// Load each photo into readable pixels and find the brain's bounding box in it
// (everything clearly brighter than the black background, above the caption).
function loadView(view) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, c.width, c.height);
      const maxY = Math.floor(c.height * VIEW_LABEL_CUTOFF);
      let x0 = c.width, y0 = maxY, x1 = 0, y1 = 0;
      for (let y = 0; y < maxY; y++) {
        for (let x = 0; x < c.width; x++) {
          const i = (y * c.width + x) * 4;
          if (data[i] + data[i + 1] + data[i + 2] > 120) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      }
      if (view.half === "top") {
        // One hemisphere of the top photo, turned so its outer edge runs along
        // the bottom of the side and its midline edge along the top. Only the
        // middle SIDE_KEEP of its length is used, so the folds are not
        // stretched tall when spread over the side.
        const mid = Math.round((y0 + y1) / 2) - Math.round((y1 - y0) * 0.03);
        const cx = (x0 + x1) / 2, hw = ((x1 - x0) * SIDE_KEEP) / 2;
        resolve({ ...view, data, w: c.width, h: c.height, x0: Math.round(cx - hw), y0: mid, x1: Math.round(cx + hw), y1: y0 });
        return;
      }
      resolve({ ...view, data, w: c.width, h: c.height, x0, y0, x1, y1 });
    };
    img.onerror = reject;
    img.src = view.src;
  });
}
// the photos only color the particle brain
const viewsReady = SURFACE ? null : Promise.all(VIEWS.map(loadView));

// Photo pixels are sRGB bytes; the renderer works in linear color. A lookup
// table saves three pow() calls per photo per dot -- over a million dots.
const SRGB_TO_LINEAR = new Float32Array(256).map((_, i) => {
  const c = i / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
});

// Anatomical axis name -> model-space unit vector
function axis(name) {
  const s = name.startsWith("-") ? -1 : 1;
  const a = name.replace("-", "");
  if (a === "U") return new THREE.Vector3(0, s, 0);
  if (a === "F") return new THREE.Vector3(0, 0, s * FRONT_SIGN);
  return new THREE.Vector3(s * FRONT_SIGN, 0, 0); // R = U x F
}

// Round, soft-edged dot texture for the points
function makeDotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.5, "rgba(255,255,255,0.9)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const dotTexture = makeDotTexture();

// Point material with an edge (fresnel) highlight.
// "nrm" is each dot's outward direction from the brain's center, so dots whose
// direction is perpendicular to the camera sit on the silhouette and light up.
const materials = [];

// three's own point-size attenuation scale: half the drawing buffer height
function pointScale() {
  return renderer.getContext().drawingBufferHeight * 0.5;
}

function makeRimMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: dotTexture },
      uGain: { value: COLOR_GAIN },
      uRim: { value: RIM_INTENSITY },
      uSize: { value: SURFACE ? SURFACE.pointSize : POINT_SIZE },
      uScale: { value: pointScale() },
      uRimTint: { value: new THREE.Color(SURFACE ? SURFACE.rimTint : 0xffffff) },
      uRimTintMix: { value: SURFACE ? SURFACE.rimTintMix : 0 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 nrm;
      attribute vec3 fnrm;
      attribute float rad;
      attribute vec3 col;
      uniform float uSize;
      uniform float uScale;
      varying float vRim;
      varying float vLight;
      varying vec3 vCol;
      void main() {
        vCol = col;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * nrm);
        vec3 viewDir = normalize(-mv.xyz);
        // Soft light from the upper left, fixed to the viewer, so the folds
        // keep their relief whichever way the brain is turned
        vec3 fn = normalize(normalMatrix * fnrm);
        vec3 L = normalize(vec3(-0.45, 0.6, 0.65));
        vLight = ${LIGHT_AMBIENT.toFixed(2)} + ${LIGHT_DIFFUSE.toFixed(2)} * max(dot(fn, L), 0.0);
        float edge = 1.0 - abs(dot(n, viewDir));
        float shell = smoothstep(${RIM_SHELL.toFixed(2)}, 1.0, rad);
        vRim = pow(clamp(edge, 0.0, 1.0), ${RIM_POWER.toFixed(2)}) * shell;
        gl_PointSize = uSize * (uScale / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uGain;
      uniform float uRim;
      uniform vec3 uRimTint;
      uniform float uRimTintMix;
      varying float vRim;
      varying float vLight;
      varying vec3 vCol;

      void main() {
        vec4 tex = texture2D(uMap, gl_PointCoord);
        if (tex.a < 0.01) discard;
        // dot color, lit by its fold, brightened (and tinted) along the silhouette
        vec3 color = vCol * uGain * vLight * (1.0 + uRim * vRim);
        color = mix(color, uRimTint, clamp(vRim * uRimTintMix, 0.0, 1.0));
        gl_FragColor = vec4(color, ${DOT_OPACITY.toFixed(2)});
      }
    `,
    transparent: true,
    depthWrite: true,
    blending: THREE.NormalBlending,
  });
}

// The model is made of thousands of tiny spheres merged into one mesh.
// Find each sphere (connected group of vertices) and return its center.
function particleCenters(mesh) {
  const geo = mesh.geometry;
  const pos = geo.attributes.position;
  const count = pos.count;
  const parent = new Int32Array(count).map((_, i) => i);
  const find = (i) => {
    while (parent[i] !== i) i = parent[i] = parent[parent[i]];
    return i;
  };
  const idx = geo.index;
  if (idx) {
    for (let i = 0; i < idx.count; i += 3) {
      const a = find(idx.getX(i)), b = find(idx.getX(i + 1)), c = find(idx.getX(i + 2));
      parent[b] = a;
      parent[find(c)] = a;
    }
  }
  const sums = new Map();
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    const r = find(i);
    const s = sums.get(r) || sums.set(r, [0, 0, 0, 0]).get(r);
    s[0] += v.x; s[1] += v.y; s[2] += v.z; s[3]++;
  }
  return [...sums.values()].map((s) => new THREE.Vector3(s[0] / s[3], s[1] / s[3], s[2] / s[3]));
}

// Separable box blur (radius 1), repeated -- approximates a gaussian
function blurGrid(field, n, passes) {
  const tmp = new Float32Array(field.length);
  const strides = [1, n, n * n];
  for (let pass = 0; pass < passes; pass++) {
    for (const s of strides) {
      tmp.set(field);
      for (let i = s; i < field.length - s; i++) {
        field[i] = (tmp[i - s] + tmp[i] + tmp[i + s]) / 3;
      }
    }
  }
}

// Density field of the whole brain. Each particle adds a smooth bump of mass
// to a grid spanning +-SOLID_FIT. Two copies are kept:
//   fine  -- lightly blurred; its surface and slope follow the individual folds
//   broad -- heavily blurred; it only knows the brain's overall shape, and its
//            value says how buried a spot is (high in creases, low on ridges)
function buildDensity(particles) {
  const n = SOLID_RES;
  const half = n / 2;
  const fine = new Float32Array(n * n * n);
  const toGrid = (v) => (v / SOLID_FIT) * half + half;
  const r = (SOLID_RADIUS / SOLID_FIT) * half; // reach, in grid cells
  const r2 = r * r;
  for (const q of particles) {
    const gx = toGrid(q.x), gy = toGrid(q.y), gz = toGrid(q.z);
    const z0 = Math.max(1, Math.ceil(gz - r)), z1 = Math.min(n - 2, Math.floor(gz + r));
    const y0 = Math.max(1, Math.ceil(gy - r)), y1 = Math.min(n - 2, Math.floor(gy + r));
    const x0 = Math.max(1, Math.ceil(gx - r)), x1 = Math.min(n - 2, Math.floor(gx + r));
    for (let z = z0; z <= z1; z++) {
      const dz = z - gz;
      for (let y = y0; y <= y1; y++) {
        const dy = y - gy;
        const row = z * n * n + y * n;
        for (let x = x0; x <= x1; x++) {
          const dx = x - gx;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 >= r2) continue;
          const t = 1 - d2 / r2;
          fine[row + x] += t * t;
        }
      }
    }
  }

  // Melt the particles into smooth folds instead of a pile of bubbles
  blurGrid(fine, n, SOLID_SMOOTH);
  const broad = fine.slice();
  blurGrid(broad, n, CAVITY_BLUR);

  // Trilinear lookup at a model-space point
  const sample = (f, x, y, z) => {
    const gx = Math.min(n - 1.001, Math.max(0, toGrid(x)));
    const gy = Math.min(n - 1.001, Math.max(0, toGrid(y)));
    const gz = Math.min(n - 1.001, Math.max(0, toGrid(z)));
    const x0 = gx | 0, y0 = gy | 0, z0 = gz | 0;
    const tx = gx - x0, ty = gy - y0, tz = gz - z0;
    const i = z0 * n * n + y0 * n + x0;
    const nn = n * n;
    const c00 = f[i] + (f[i + 1] - f[i]) * tx;
    const c10 = f[i + n] + (f[i + n + 1] - f[i + n]) * tx;
    const c01 = f[i + nn] + (f[i + nn + 1] - f[i + nn]) * tx;
    const c11 = f[i + nn + n] + (f[i + nn + n + 1] - f[i + nn + n]) * tx;
    const c0 = c00 + (c10 - c00) * ty;
    const c1 = c01 + (c11 - c01) * ty;
    return c0 + (c1 - c0) * tz;
  };

  // Outward surface direction: density falls off toward the outside, so the
  // normal is the negative slope. Falls back to straight out from the center.
  const h = SOLID_FIT / half; // one grid cell
  const normal = (f, x, y, z, out) => {
    let nx = sample(f, x - h, y, z) - sample(f, x + h, y, z);
    let ny = sample(f, x, y - h, z) - sample(f, x, y + h, z);
    let nz = sample(f, x, y, z - h) - sample(f, x, y, z + h);
    let l = Math.hypot(nx, ny, nz);
    if (l < 1e-6) { nx = x; ny = y; nz = z; l = Math.hypot(x, y, z) || 1; }
    out[0] = nx / l;
    out[1] = ny / l;
    out[2] = nz / l;
    return out;
  };

  return { n, fine, broad, sample, normal };
}

// Outer shell only. Three steps, all on the density grid:
//   capGaps    -- the surface has narrow pits diving into the brain; each gets
//                 a lid across its mouth (gaps up to about 2 x SHELL_CLOSE cells)
//   fillSealed -- hollows sealed inside the brain are filled, so their walls
//                 are never drawn
//   isInside   -- anything left more than SHELL_DEPTH cells from the outside
//                 air is dropped, dots and backing alike
const SHELL_CLOSE = 6;   // pit lids, in grid cells -- higher closes wider gaps
const SHELL_DEPTH = 4;   // how far from the outside air still counts as shell, in grid cells

// Grow (or shrink) a 0/1 grid by r cells along each axis
function morph(mask, n, r, grow) {
  const out = mask.slice();
  const full = 2 * r + 1;
  for (const s of [1, n, n * n]) {
    const a = out.slice();
    for (let o = 0; o < a.length; o++) {
      if (((o / s) | 0) % n !== 0) continue; // start of a line along this axis
      let cnt = 0;
      for (let c = 0; c <= r && c < n; c++) cnt += a[o + c * s];
      for (let c = 0; c < n; c++) {
        out[o + c * s] = grow ? (cnt > 0 ? 1 : 0) : (cnt === full ? 1 : 0);
        if (c + r + 1 < n) cnt += a[o + (c + r + 1) * s];
        if (c - r >= 0) cnt -= a[o + (c - r) * s];
      }
    }
  }
  return out;
}

// Pits: the surface has narrow holes that dive into the brain, and their walls
// show from outside. This copy of the field is raised above iso only in the
// empty cells the envelope seals over, so each pit gets a lid across its
// mouth; everywhere else the field, and so the shell, is left as it was.
function capGaps(density, iso) {
  const { n, fine } = density;
  const solid = new Uint8Array(fine.length);
  for (let i = 0; i < fine.length; i++) solid[i] = fine[i] >= iso ? 1 : 0;
  const envelope = morph(morph(solid, n, SHELL_CLOSE, true), n, SHELL_CLOSE, false);
  // soften the envelope's blocky edge so the lids are smooth
  const soft = new Float32Array(fine.length);
  for (let i = 0; i < soft.length; i++) soft[i] = envelope[i];
  blurGrid(soft, n, 2);
  const out = fine.slice();
  for (let i = 0; i < out.length; i++) {
    if (envelope[i] && !solid[i]) out[i] = Math.max(out[i], soft[i] * 2 * iso);
  }
  return out;
}

// Hollows sealed inside the brain (including the ones closed off by the pit
// lids) still have walls, hidden but there. Fill every empty cell that the
// outside air cannot reach, so the only surface left is the outer skin.
function fillSealed(field, n, iso) {
  const out = field.slice();
  const nn = n * n;
  const outside = new Uint8Array(field.length);
  const stack = [];
  const visit = (i) => {
    if (!outside[i] && field[i] < iso) { outside[i] = 1; stack.push(i); }
  };
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      visit(a * nn + b * n);           // x = 0 face
      visit(a * nn + b * n + n - 1);   // x = n-1
      visit(a * nn + b);               // y = 0
      visit(a * nn + (n - 1) * n + b); // y = n-1
      visit(a * n + b);                // z = 0
      visit((n - 1) * nn + a * n + b); // z = n-1
    }
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % n, y = ((i / n) | 0) % n, z = (i / nn) | 0;
    if (x > 0) visit(i - 1);
    if (x < n - 1) visit(i + 1);
    if (y > 0) visit(i - n);
    if (y < n - 1) visit(i + n);
    if (z > 0) visit(i - nn);
    if (z < n - 1) visit(i + nn);
  }
  for (let i = 0; i < out.length; i++) {
    if (!outside[i] && out[i] < iso) out[i] = iso * 2;
  }
  return { field: out, outside };
}

// True where a model-space point is more than SHELL_DEPTH cells from the air
// outside the brain
function insideTest(outside, n) {
  const nearAir = morph(outside, n, SHELL_DEPTH, true);
  const half = n / 2;
  return (x, y, z) => {
    const gx = Math.round((x / SOLID_FIT) * half + half);
    const gy = Math.round((y / SOLID_FIT) * half + half);
    const gz = Math.round((z / SOLID_FIT) * half + half);
    if (gx < 0 || gy < 0 || gz < 0 || gx >= n || gy >= n || gz >= n) return false;
    return nearAir[gz * n * n + gy * n + gx] === 0;
  };
}

// Triangles of the density surface at a given level, in model space: corner
// positions and outward corner normals, 9 floats per triangle each. Used to
// scatter the dots evenly over the folds.
function surfaceTriangles(density, iso, field) {
  const mc = new MarchingCubes(density.n, new THREE.MeshBasicMaterial(), false, false, 600000);
  mc.isolation = iso;
  mc.field.set(field);
  mc.update();
  const pos = mc.positionArray.slice(0, mc.count * 3);
  for (let i = 0; i < pos.length; i++) pos[i] *= SOLID_FIT;
  const nrm = mc.normalArray.slice(0, mc.count * 3);
  mc.geometry.dispose();
  return { pos, nrm };
}

// Melt the particles into one closed surface, painted by colorAt.
// Marching cubes draws the surface where the fine density crosses SOLID_ISO.
function buildSolid(density, colorAt, isInside, field) {
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
  const mc = new MarchingCubes(density.n, mat, false, true, 600000);
  mc.isolation = SOLID_ISO;
  mc.scale.setScalar(SOLID_FIT * BACKING_INSET);
  mc.field.set(field);
  mc.update();

  // Drop the triangles that sit inside the brain (see insideTest)
  const pos = mc.positionArray;
  const nrm = mc.normalArray;
  let kept = 0;
  for (let t = 0; t < mc.count; t += 3) {
    const k = t * 3;
    const cx = (pos[k] + pos[k + 3] + pos[k + 6]) / 3 * SOLID_FIT;
    const cy = (pos[k + 1] + pos[k + 4] + pos[k + 7]) / 3 * SOLID_FIT;
    const cz = (pos[k + 2] + pos[k + 5] + pos[k + 8]) / 3 * SOLID_FIT;
    if (isInside(cx, cy, cz)) continue;
    if (kept !== t) {
      pos.copyWithin(kept * 3, k, k + 9);
      nrm.copyWithin(kept * 3, k, k + 9);
    }
    kept += 3;
  }
  mc.count = kept;
  mc.geometry.setDrawRange(0, kept);

  // Paint each vertex from the photos exactly as the dots are painted --
  // facing along the brain's broad shape, not the lumpy surface normal, so
  // the backing carries no shading of its own and its shape never reads.
  const col = mc.colorArray;
  const c = [];
  const bn = [0, 0, 0];
  const gain = COLOR_GAIN * BACKING_SHADE;
  for (let i = 0; i < mc.count; i++) {
    const k = i * 3;
    const px = pos[k] * SOLID_FIT, py = pos[k + 1] * SOLID_FIT, pz = pos[k + 2] * SOLID_FIT;
    density.normal(density.broad, px, py, pz, bn);
    c.length = 0;
    colorAt(px, py, pz, bn[0], bn[1], bn[2], c);
    col[k] = c[0] * gain;
    col[k + 1] = c[1] * gain;
    col[k + 2] = c[2] * gain;
  }
  return mc;
}

// Load model
const gltfLoader = new GLTFLoader();
gltfLoader.setMeshoptDecoder(MeshoptDecoder);

// How far each vertex sticks out of its folds: the mesh is smoothed (repeated
// neighbor averaging) until the folds melt away, and each vertex's height
// above that smoothed copy, along its normal, is the answer -- positive on
// gyrus crowns, negative down in the sulci. The mesh itself is not changed.
function ridgeField(geo, passes) {
  const P = geo.attributes.position.array, N = geo.attributes.normal.array;
  const n = P.length / 3;
  // vertices split along texture seams are welded back together, so the
  // smoothing runs across the seams
  const ids = new Map();
  const id = new Int32Array(n);
  let u = 0;
  for (let i = 0; i < n; i++) {
    const key = `${P[i * 3].toFixed(5)},${P[i * 3 + 1].toFixed(5)},${P[i * 3 + 2].toFixed(5)}`;
    let v = ids.get(key);
    if (v === undefined) ids.set(key, (v = u++));
    id[i] = v;
  }
  const pos = new Float64Array(u * 3), nrm = new Float64Array(u * 3);
  for (let i = 0; i < n; i++) {
    const a = id[i] * 3;
    pos[a] = P[i * 3]; pos[a + 1] = P[i * 3 + 1]; pos[a + 2] = P[i * 3 + 2];
    nrm[a] += N[i * 3]; nrm[a + 1] += N[i * 3 + 1]; nrm[a + 2] += N[i * 3 + 2];
  }
  // neighbors, from the triangles' edges (compressed lists)
  const idx = geo.index ? geo.index.array : null;
  const triCount = (idx ? idx.length : n) / 3;
  const corner = (k) => id[idx ? idx[k] : k];
  const deg = new Int32Array(u + 1);
  for (let t = 0; t < triCount; t++) {
    for (let e = 0; e < 3; e++) deg[corner(t * 3 + e)] += 2;
  }
  const start = new Int32Array(u + 1);
  for (let i = 0; i < u; i++) start[i + 1] = start[i] + deg[i];
  const fill = start.slice(0, u);
  const nb = new Int32Array(start[u]);
  for (let t = 0; t < triCount; t++) {
    const a = corner(t * 3), b = corner(t * 3 + 1), c = corner(t * 3 + 2);
    nb[fill[a]++] = b; nb[fill[a]++] = c;
    nb[fill[b]++] = a; nb[fill[b]++] = c;
    nb[fill[c]++] = a; nb[fill[c]++] = b;
  }
  let cur = pos.slice(), next = new Float64Array(u * 3);
  for (let p = 0; p < passes; p++) {
    for (let i = 0; i < u; i++) {
      let sx = 0, sy = 0, sz = 0;
      const s = start[i], e = start[i + 1];
      for (let k = s; k < e; k++) {
        const j = nb[k] * 3;
        sx += cur[j]; sy += cur[j + 1]; sz += cur[j + 2];
      }
      const m = e - s || 1, a = i * 3;
      next[a] = (cur[a] + sx / m) / 2;
      next[a + 1] = (cur[a + 1] + sy / m) / 2;
      next[a + 2] = (cur[a + 2] + sz / m) / 2;
    }
    [cur, next] = [next, cur];
  }
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = id[i] * 3;
    const l = Math.hypot(nrm[a], nrm[a + 1], nrm[a + 2]) || 1;
    out[i] = ((pos[a] - cur[a]) * nrm[a] + (pos[a + 1] - cur[a + 1]) * nrm[a + 1] + (pos[a + 2] - cur[a + 2]) * nrm[a + 2]) / l;
  }
  return out;
}

// Real brain mesh -> dots. Nothing about the shape is rebuilt or smoothed: every
// dot sits on one of the mesh's own triangles. The mesh itself, pushed in a hair
// and painted flat, backs the dots so the far side never shows between them.
function buildFromSurface(gltf) {
  const model = gltf.scene;
  model.updateMatrixWorld(true);

  // Center it and fit it into the same 2-unit box as the particle brain
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const s = 2 / Math.max(size.x, size.y, size.z);
  const fit = new THREE.Matrix4().makeScale(s, s, s)
    .multiply(new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z));

  const backingMat = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      attribute vec3 col;
      varying vec3 vCol;
      void main() {
        // unlit, like the particle brain's backing
        vCol = col * ${(COLOR_GAIN * SURFACE.backingShade).toFixed(3)};
        vec3 p = position - normalize(normal) * ${SURFACE.backingInset.toFixed(4)};
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vCol;
      void main() { gl_FragColor = vec4(vCol, 1.0); }
    `,
    side: THREE.DoubleSide,
  });

  // Every part, in fitted space, with how far each vertex sticks out of its folds
  const meshes = [];
  model.traverse((obj) => {
    if (!obj.isMesh) return;
    const geo = obj.geometry.clone();
    if (!geo.attributes.normal) geo.computeVertexNormals();
    geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(fit, obj.matrixWorld));
    geo.setAttribute("ridge", new THREE.BufferAttribute(ridgeField(geo, SURFACE.ridgeSmooth), 1));
    meshes.push(geo);
  });

  // Ridge values rescaled so the surface's own range maps to 0 (deepest
  // crease) .. 1 (highest crown); percentiles, so a few odd spots do not
  // flatten the rest
  const allRidge = [];
  meshes.forEach((g) => allRidge.push(...g.attributes.ridge.array));
  allRidge.sort((a, b) => a - b);
  const rLo = allRidge[Math.floor(allRidge.length * 0.04)];
  const rHi = allRidge[Math.floor(allRidge.length * 0.96)];
  const box2 = new THREE.Box3();
  meshes.forEach((g) => { g.computeBoundingBox(); box2.union(g.boundingBox); });

  const yLo = box2.min.y, yHi = box2.max.y;

  const toRamp = (r) => r.map(([at, hex]) => [at, new THREE.Color(hex)]);
  const ramp = toRamp(SURFACE.ramp), lowRamp = toRamp(SURFACE.lowRamp);
  const lookup = (rp, t, out) => {
    let i = 1;
    while (i < rp.length - 1 && rp[i][0] < t) i++;
    const [a0, c0] = rp[i - 1], [a1, c1] = rp[i];
    return out.copy(c0).lerp(c1, THREE.MathUtils.clamp((t - a0) / (a1 - a0), 0, 1));
  };
  const tmpC = new THREE.Color(), lowC = new THREE.Color();
  // color for a spot on the surface, written into out[o..o+2]
  const colorAt = (ridge, x, y, z, out, o) => {
    // slow wobble so the bands marble instead of following the folds exactly
    const wob = Math.sin(x * 7.1 + Math.sin(z * 5.3)) * Math.sin(y * 6.7 + Math.sin(x * 4.9)) +
      0.5 * Math.sin(z * 13.0 + y * 11.0);
    const t = THREE.MathUtils.clamp((ridge - rLo) / (rHi - rLo) + wob * SURFACE.marble, 0, 1);
    lookup(ramp, t, tmpC);
    const low = 1 - THREE.MathUtils.smoothstep((y - yLo) / (yHi - yLo), SURFACE.lowFull, SURFACE.lowStart);
    if (low > 0) tmpC.lerp(lookup(lowRamp, t, lowC), low);
    out[o] = tmpC.r; out[o + 1] = tmpC.g; out[o + 2] = tmpC.b;
  };

  const parts = [];
  for (let geo of meshes) {
    if (SHOW_BACKING) {
      const p = geo.attributes.position, rg = geo.attributes.ridge;
      const bc = new Float32Array(p.count * 3);
      for (let i = 0; i < p.count; i++) colorAt(rg.getX(i), p.getX(i), p.getY(i), p.getZ(i), bc, i * 3);
      geo.setAttribute("col", new THREE.BufferAttribute(bc, 3));
      pivot.add(new THREE.Mesh(geo, backingMat));
    }
    if (geo.index) geo = geo.toNonIndexed();
    parts.push(geo);
  }
  let triCount = 0;
  parts.forEach((g) => (triCount += g.attributes.position.count / 3));
  const tri = new Float32Array(triCount * 9);
  const triN = new Float32Array(triCount * 9);
  const triR = new Float32Array(triCount * 3);
  let o = 0;
  for (const g of parts) {
    tri.set(g.attributes.position.array, o);
    triN.set(g.attributes.normal.array, o);
    triR.set(g.attributes.ridge.array, o / 3);
    o += g.attributes.position.array.length;
  }

  // Area-weighted triangle pick, so the dots cover the surface evenly
  const cum = new Float64Array(triCount);
  let area = 0, maxR = 0;
  for (let t = 0; t < triCount; t++) {
    const k = t * 9;
    const ax = tri[k + 3] - tri[k], ay = tri[k + 4] - tri[k + 1], az = tri[k + 5] - tri[k + 2];
    const bx = tri[k + 6] - tri[k], by = tri[k + 7] - tri[k + 1], bz = tri[k + 8] - tri[k + 2];
    area += 0.5 * Math.hypot(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx);
    cum[t] = area;
    maxR = Math.max(maxR, Math.hypot(tri[k], tri[k + 1], tri[k + 2]));
  }
  const pickTriangle = (r) => {
    let a = 0, b = triCount - 1;
    while (a < b) {
      const m = (a + b) >> 1;
      if (cum[m] < r) a = m + 1;
      else b = m;
    }
    return a;
  };

  const count = Math.round(area * SURFACE.dotsPerArea);
  const pos = new Float32Array(count * 3);
  const nrms = new Float32Array(count * 3);
  const fnrms = new Float32Array(count * 3);
  const rads = new Float32Array(count);
  const cols = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = pickTriangle(Math.random() * area);
    const k = t * 9;
    let u = Math.random();
    let v = Math.random();
    if (u + v > 1) { u = 1 - u; v = 1 - v; }
    const w = 1 - u - v;
    let fx = triN[k] * w + triN[k + 3] * u + triN[k + 6] * v;
    let fy = triN[k + 1] * w + triN[k + 4] * u + triN[k + 7] * v;
    let fz = triN[k + 2] * w + triN[k + 5] * u + triN[k + 8] * v;
    const fl = Math.hypot(fx, fy, fz) || 1;
    fx /= fl; fy /= fl; fz /= fl;
    // slight in/out jitter so the skin is not paper-flat
    const off = (Math.random() - 0.5) * 2 * DOT_JITTER;
    const px = tri[k] * w + tri[k + 3] * u + tri[k + 6] * v + fx * off;
    const py = tri[k + 1] * w + tri[k + 4] * u + tri[k + 7] * v + fy * off;
    const pz = tri[k + 2] * w + tri[k + 5] * u + tri[k + 8] * v + fz * off;
    const j = i * 3;
    const r = Math.hypot(px, py, pz) || 1;
    pos[j] = px; pos[j + 1] = py; pos[j + 2] = pz;
    // rim uses the broad outward direction: straight out from the center
    nrms[j] = px / r; nrms[j + 1] = py / r; nrms[j + 2] = pz / r;
    fnrms[j] = fx; fnrms[j + 1] = fy; fnrms[j + 2] = fz;
    rads[i] = r / maxR;
    const q = t * 3;
    colorAt(triR[q] * w + triR[q + 1] * u + triR[q + 2] * v, px, py, pz, cols, j);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("nrm", new THREE.BufferAttribute(nrms, 3));
  geo.setAttribute("fnrm", new THREE.BufferAttribute(fnrms, 3));
  geo.setAttribute("rad", new THREE.BufferAttribute(rads, 1));
  geo.setAttribute("col", new THREE.BufferAttribute(cols, 3));
  const mat = makeRimMaterial();
  materials.push(mat);
  pivot.add(new THREE.Points(geo, mat));
  brainReady = true;

  loader.classList.add("hidden");
  window.dispatchEvent(new CustomEvent("arc:ready"));
}

gltfLoader.load(
  SURFACE ? SURFACE.src : "hologram/brain.glb",
  async (gltf) => {
    window.dispatchEvent(new CustomEvent("arc:progress", { detail: 1 }));
    if (SURFACE) return buildFromSurface(gltf);
    const views = await viewsReady;
    const model = gltf.scene;
    model.updateMatrixWorld(true);

    // Collect particle centers, grouped by color
    const groups = [];
    model.traverse((obj) => {
      if (!obj.isMesh) return;
      const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
      const centers = particleCenters(obj);
      centers.forEach((p) => p.applyAxisAngle(THREE.Object3D.DEFAULT_UP, MODEL_YAW));
      groups.push({ color: mat.emissive.clone(), centers });
    });

    // Normalize: center the brain (across x, on its midline) and fit it into a 2-unit box
    const box = new THREE.Box3();
    groups.forEach((g) => g.centers.forEach((p) => box.expandByPoint(p)));
    const center = box.getCenter(new THREE.Vector3());
    center.x = MIDLINE_X;
    const size = box.getSize(new THREE.Vector3());
    const scale = 2 / Math.max(size.x, size.y, size.z);

    // Radius of the outermost dot, so "rad" can be expressed as 0..1
    let maxR = 0;
    for (const g of groups) {
      for (const p of g.centers) {
        maxR = Math.max(maxR, Math.hypot(
          (p.x - center.x) * scale,
          (p.y - center.y) * scale,
          (p.z - center.z) * scale
        ));
      }
    }

    // Flatten every particle into one list so the surface estimate covers the
    // whole brain rather than one group at a time.
    const all = [];
    groups.forEach((g, gi) => {
      for (const q of g.centers) {
        const x = (q.x - center.x) * scale;
        const y = (q.y - center.y) * scale;
        const z = (q.z - center.z) * scale;
        all.push({ gi, x, y, z, len: Math.hypot(x, y, z) || 1e-6 });
      }
    });

    // Model extents, so each photo's brain box can be stretched over the model
    const lo = new THREE.Vector3(Infinity, Infinity, Infinity);
    const hi = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    for (const q of all) {
      lo.min(q);
      hi.max(q);
    }
    // even out left/right, so each photo's midline lands on the model's (x = 0)
    hi.x = Math.max(hi.x, -lo.x);
    lo.x = -hi.x;
    for (const v of views) {
      v.dir = axis(v.look);
      v.r = axis(v.right);
      v.u = axis(v.up);
      // extent of the model along the photo's right / up axes (axis-aligned)
      const span = (a) => {
        const p = lo.dot(a), q = hi.dot(a);
        return [Math.min(p, q), Math.max(p, q)];
      };
      [v.rMin, v.rMax] = span(v.r);
      [v.uMin, v.uMax] = span(v.u);
    }

    // Color of a point: projected into every photo that faces it, blended by
    // how squarely each one faces the point's outward direction.
    const tmp = new THREE.Color();
    const blue = new THREE.Color(BOTTOM_BLUE);
    const pink = new THREE.Color(BOTTOM_PINK);
    const colorAt = (px, py, pz, nx, ny, nz, out) => {
      let r = 0, g = 0, b = 0, wSum = 0;
      for (const v of views) {
        const facing = nx * v.dir.x + ny * v.dir.y + nz * v.dir.z;
        if (facing <= 0) continue;
        const s = ((px * v.r.x + py * v.r.y + pz * v.r.z) - v.rMin) / (v.rMax - v.rMin);
        const t = ((px * v.u.x + py * v.u.y + pz * v.u.z) - v.uMin) / (v.uMax - v.uMin);
        const ix = Math.round(v.x0 + (v.flipX ? 1 - s : s) * (v.x1 - v.x0));
        const iy = Math.round(v.y1 - t * (v.y1 - v.y0));
        let i = (Math.max(0, Math.min(v.h - 1, iy)) * v.w + Math.max(0, Math.min(v.w - 1, ix))) * 4;
        if (v.half) {
          // the hemisphere is an oval: from its corners, step inward to the
          // nearest brain pixel
          const cx = (v.x0 + v.x1) / 2, cy = (v.y0 + v.y1) / 2;
          for (let st = 1; st <= 30 && v.data[i] + v.data[i + 1] + v.data[i + 2] <= 60; st++) {
            const k = st / 30;
            const qx = Math.round(ix + (cx - ix) * k), qy = Math.round(iy + (cy - iy) * k);
            i = (Math.max(0, Math.min(v.h - 1, qy)) * v.w + Math.max(0, Math.min(v.w - 1, qx))) * 4;
          }
        }
        const sr = v.data[i], sg = v.data[i + 1], sb = v.data[i + 2];
        // Where the photo's outline and the model's differ a sample can land on
        // the black background -- let the other photos cover that spot instead.
        const lit = Math.min(1, (sr + sg + sb) / 150) + 0.02;
        const w = Math.pow(facing, VIEW_SHARPNESS) * lit * v.weight;
        r += SRGB_TO_LINEAR[sr] * w;
        g += SRGB_TO_LINEAR[sg] * w;
        b += SRGB_TO_LINEAR[sb] * w;
        wSum += w;
      }
      wSum = wSum || 1;
      r /= wSum;
      g /= wSum;
      b /= wSum;

      // Pink/blue lower brain
      const h = (py - lo.y) / (hi.y - lo.y);
      const k = 1 - THREE.MathUtils.smoothstep(h, BOTTOM_FULL, BOTTOM_START);
      if (k > 0) {
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const p = THREE.MathUtils.smoothstep(lum, 0.25, 0.6);
        tmp.copy(blue).lerp(pink, p).multiplyScalar(Math.max(r, g, b));
        r += (tmp.r - r) * k;
        g += (tmp.g - g) * k;
        b += (tmp.b - b) * k;
      }
      // More vivid, like the reference photos
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = Math.max(0, lum + (r - lum) * COLOR_SATURATION);
      g = Math.max(0, lum + (g - lum) * COLOR_SATURATION);
      b = Math.max(0, lum + (b - lum) * COLOR_SATURATION);
      out.push(r, g, b);
    };

    const density = buildDensity(all);
    // Outer shell only (see capGaps / fillSealed / insideTest)
    const capped = capGaps(density, DOT_ISO);
    const shell = fillSealed(capped, density.n, DOT_ISO);
    const shellField = shell.field;
    const isInside = insideTest(shell.outside, density.n);
    if (SHOW_BACKING) pivot.add(buildSolid(density, colorAt, isInside, fillSealed(capped, density.n, SOLID_ISO).field));

    // Scatter the dots over the brain's surface, evenly by area, so every fold
    // is covered and none of the far side can show between them.
    const { pos: tri, nrm: triN } = surfaceTriangles(density, DOT_ISO, shellField);
    const triCount = tri.length / 9;

    // Per triangle, once: its share of the area, the brain's broad outward
    // direction there (which photo covers it, and the silhouette rim), and how
    // buried it sits (high in creases, low on ridges). These change slowly
    // across the surface, so every dot on a triangle can share them.
    const cum = new Float64Array(triCount);
    const triBroad = new Float32Array(triCount * 3);
    const triBuried = new Float32Array(triCount);
    const bn = [0, 0, 0];
    let area = 0;
    for (let t = 0; t < triCount; t++) {
      const k = t * 9;
      const ax = tri[k + 3] - tri[k], ay = tri[k + 4] - tri[k + 1], az = tri[k + 5] - tri[k + 2];
      const bx = tri[k + 6] - tri[k], by = tri[k + 7] - tri[k + 1], bz = tri[k + 8] - tri[k + 2];
      area += 0.5 * Math.hypot(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx);
      cum[t] = area;
      const cx = (tri[k] + tri[k + 3] + tri[k + 6]) / 3;
      const cy = (tri[k + 1] + tri[k + 4] + tri[k + 7]) / 3;
      const cz = (tri[k + 2] + tri[k + 5] + tri[k + 8]) / 3;
      density.normal(density.broad, cx, cy, cz, bn);
      triBroad[t * 3] = bn[0];
      triBroad[t * 3 + 1] = bn[1];
      triBroad[t * 3 + 2] = bn[2];
      triBuried[t] = density.sample(density.broad, cx, cy, cz);
    }
    const pickTriangle = (r) => {
      let a = 0, b = triCount - 1;
      while (a < b) {
        const m = (a + b) >> 1;
        if (cum[m] < r) a = m + 1;
        else b = m;
      }
      return a;
    };

    // Darken the photo color down in the creases and lift it on the ridges --
    // the photos' own light/dark pattern belongs to another brain's folds,
    // this one lines up with the model's. "Buried" is rescaled so the
    // surface's own range maps to 0 (exposed ridge) .. 1 (deepest crease);
    // percentiles, not min/max, so a few odd spots do not flatten the rest.
    const sorted = triBuried.slice().sort();
    const bLo = sorted[Math.floor(triCount * 0.05)];
    const bHi = sorted[Math.floor(triCount * 0.95)];
    const triShade = triBuried.map((b) =>
      CROWN_LIFT + (CREASE_SHADE - CROWN_LIFT) * THREE.MathUtils.smoothstep(b, bLo, bHi)
    );

    const count = Math.round(area * DOTS_PER_AREA);
    const pos = new Float32Array(count * 3);
    const nrms = new Float32Array(count * 3);
    const fnrms = new Float32Array(count * 3);
    const rads = new Float32Array(count);
    const cols = new Float32Array(count * 3);
    const c = [];

    let m = 0; // dots kept
    for (let i = 0; i < count; i++) {
      // random point on a random triangle (area-weighted)
      const t = pickTriangle(Math.random() * area);
      const k = t * 9;
      let u = Math.random();
      let v = Math.random();
      if (u + v > 1) { u = 1 - u; v = 1 - v; }
      const w = 1 - u - v;
      let px = tri[k] * w + tri[k + 3] * u + tri[k + 6] * v;
      let py = tri[k + 1] * w + tri[k + 4] * u + tri[k + 7] * v;
      let pz = tri[k + 2] * w + tri[k + 5] * u + tri[k + 8] * v;

      // fine normal: the fold this dot sits on (smoothly blended corner
      // normals), for lighting
      let fx = triN[k] * w + triN[k + 3] * u + triN[k + 6] * v;
      let fy = triN[k + 1] * w + triN[k + 4] * u + triN[k + 7] * v;
      let fz = triN[k + 2] * w + triN[k + 5] * u + triN[k + 8] * v;
      const fl = Math.hypot(fx, fy, fz) || 1;
      fx /= fl; fy /= fl; fz /= fl;

      // slight in/out jitter so the skin is not paper-flat
      const off = (Math.random() - 0.5) * 2 * DOT_JITTER;
      px += fx * off;
      py += fy * off;
      pz += fz * off;

      // inside the brain, not on its shell: leave it out
      if (isInside(px, py, pz)) continue;

      const j = m * 3;
      const bx = triBroad[t * 3], by = triBroad[t * 3 + 1], bz = triBroad[t * 3 + 2];
      pos[j] = px; pos[j + 1] = py; pos[j + 2] = pz;
      nrms[j] = bx; nrms[j + 1] = by; nrms[j + 2] = bz;
      fnrms[j] = fx; fnrms[j + 1] = fy; fnrms[j + 2] = fz;
      rads[m] = Math.hypot(px, py, pz) / maxR;
      c.length = 0;
      colorAt(px, py, pz, bx, by, bz, c);
      const shade = triShade[t];
      cols[j] = c[0] * shade; cols[j + 1] = c[1] * shade; cols[j + 2] = c[2] * shade;
      m++;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos.slice(0, m * 3), 3));
    geo.setAttribute("nrm", new THREE.BufferAttribute(nrms.slice(0, m * 3), 3));
    geo.setAttribute("fnrm", new THREE.BufferAttribute(fnrms.slice(0, m * 3), 3));
    geo.setAttribute("rad", new THREE.BufferAttribute(rads.slice(0, m), 1));
    geo.setAttribute("col", new THREE.BufferAttribute(cols.slice(0, m * 3), 3));
    const mat = makeRimMaterial();
    materials.push(mat);
    pivot.add(new THREE.Points(geo, mat));
    brainReady = true;

    loader.classList.add("hidden");
    window.dispatchEvent(new CustomEvent("arc:ready"));
  },
  (e) => {
    // download progress, for the loading screen
    if (e.total) window.dispatchEvent(new CustomEvent("arc:progress", { detail: e.loaded / e.total }));
  },
  (err) => {
    console.error(err);
    loader.textContent = "Could not load model";
    window.dispatchEvent(new CustomEvent("arc:ready"));
  }
);

// Resize
function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  materials.forEach((m) => (m.uniforms.uScale.value = pointScale()));
  camera.aspect = w / h;
  // Pull the camera back a little on narrow screens so the brain fits
  camera.position.setLength(w < h ? 5.4 : 3.9);
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
new ResizeObserver(resize).observe(canvas);
resize();

// Mouse parallax: the brain leans slightly toward the cursor, but only while the
// cursor is on the brain itself. After each frame is drawn, the pixel under the
// cursor is read back: the background is pure white, so anything else is brain.
let brainReady = false;
const pointer = { x: 0, y: 0 };
const settle = () => { pointer.x = 0; pointer.y = 0; };
const cursor = { x: 0, y: 0, inCanvas: false };
const pixel = new Uint8Array(4);
window.addEventListener("pointermove", (e) => {
  const r = canvas.getBoundingClientRect();
  cursor.inCanvas = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  cursor.x = e.clientX - r.left;
  cursor.y = e.clientY - r.top;
  cursor.w = r.width;
  cursor.h = r.height;
  if (!cursor.inCanvas) settle();
});
document.addEventListener("pointerleave", () => { cursor.inCanvas = false; settle(); });

// called right after the frame is drawn, while its pixels are still readable
function checkHover() {
  if (!brainReady || !cursor.inCanvas) return;
  const gl = renderer.getContext();
  const px = Math.floor(cursor.x / cursor.w * gl.drawingBufferWidth);
  const py = Math.floor((1 - cursor.y / cursor.h) * gl.drawingBufferHeight);
  gl.readPixels(px, py, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  const onBrain = pixel[0] < 238 || pixel[1] < 238 || pixel[2] < 238;
  if (!onBrain) return settle();
  // lean toward the cursor, measured from the middle of the card
  pointer.x = (cursor.x / cursor.w) * 2 - 1;
  pointer.y = (cursor.y / cursor.h) * 2 - 1;
}

// Animation loop -- paused while the hero is scrolled out of view
const clock = new THREE.Clock();
let onScreen = true;
new IntersectionObserver((entries) => {
  const was = onScreen;
  onScreen = entries[0].isIntersecting;
  if (onScreen && !was) requestAnimationFrame(animate);
}).observe(canvas);
function animate() {
  if (!onScreen) return;
  clock.getDelta();
  const t = clock.elapsedTime;

  // Gentle float + parallax tilt
  pivot.position.y = Math.sin(t * 0.8) * 0.05;
  pivot.rotation.x += (REST_ROLL + pointer.y * 0.25 - pivot.rotation.x) * 0.05;
  pivot.rotation.z += (-pointer.x * 0.1 - pivot.rotation.z) * 0.05;

  driftHome();
  controls.update();
  composer.render();
  checkHover();
  requestAnimationFrame(animate);
}
animate();
