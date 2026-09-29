/* Roadmap section, imported from website drafts/Extra/projects topo.
   A contour-line terrain pinned in #roadmap; scrolling flies the camera summit to summit
   while the card on the right steps through the milestones. Lenis is set up in script.js. */
import * as THREE from "three";

/* ---------------- content ----------------
   One entry per mountain. x/z place the summit on the terrain,
   height/spread shape it, view sets where the camera stands (azimuth in degrees). */
const STOPS = [
    { phase: "Milestone 01", when: "Sep 2025", name: "The Idea", img: "images/roadmap/01-idea.jpg", alt: "Base camp",
      copy: "Where it starts: a question about what the voice can reveal, and the first sketch of an instrument that could answer it.",
      x: 0,    z: 0,    height: 30, spread: 9,  view: -25 },
    { phase: "Milestone 02", when: "Feb 2026", name: "Incubated", img: "images/roadmap/02-incubated.jpg", pos: "50% 22%", alt: "Incubated at IIT",
      copy: "The company is formally set up and joins incubation at IIT, giving the work a home, mentors and room to build.",
      x: -58,  z: -55,  height: 26, spread: 12, view: 10 },
    { phase: "Milestone 03", when: "Mar 2026", name: "Software Prototype", img: "images/roadmap/03-software.jpg", alt: "The first build",
      copy: "The first working software prototype: an end-to-end pipeline that takes a recording in and puts an analysis out.",
      x: 20,   z: -112, height: 34, spread: 11, view: -40 },
    { phase: "Milestone 04", when: "Apr 2026", name: "Idea Validation", img: "images/roadmap/04-validation.jpg", alt: "In the clinic",
      copy: "Conversations with surgeons and physicians, testing the problem and the approach against how clinical care actually works.",
      x: -42,  z: -170, height: 28, spread: 14, view: 20 },
    { phase: "Milestone 05", when: "May 2026", name: "Hardware Prototype", img: "images/roadmap/05-hardware.jpg", alt: "Built to listen",
      copy: "The instrument gets a body: a hardware prototype built to capture the voice cleanly enough for acoustic analysis.",
      x: -50,  z: -286, height: 32, spread: 13, view: 15 },
    { phase: "Milestone 06", when: "Jun 2026", name: "MVP", img: "images/roadmap/06-mvp.jpg", pos: "50% 62%", alt: "(Minimum viable product)",
      copy: "Software and hardware come together into a minimum viable product, complete enough to put in front of real users.",
      x: 12,   z: -344, height: 40, spread: 12, view: -30 },
    { phase: "Milestone 07", when: "Jul 2026", name: "Testing", img: "images/roadmap/07-testing.jpg", alt: "Put to the test",
      copy: "The MVP goes into testing, measuring how it performs, where it falls short and what has to change before it goes further.",
      x: -38,  z: -402, height: 34, spread: 14, view: 20 },
    { phase: "Milestone 08", when: "Aug 2026", name: "SISFS", img: "images/roadmap/08-sisf.jpg", alt: "Startup India Seed Fund",
      copy: "Backed by the Startup India Seed Fund Scheme, funding the next stretch of the climb.",
      x: 26,   z: -462, height: 46, spread: 13, view: -15 },
];

/* ---------------- helpers ---------------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const range = (v, a, b) => clamp((v - a) / (b - a));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // easeInOutCubic
const easeOut = t => 1 - Math.pow(1 - t, 3);

// deterministic value noise + fbm, shared by the mesh and the marker so both agree on height
function hash(x, z) {
    const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
    return s - Math.floor(s);
}
function vnoise(x, z) {
    const xi = Math.floor(x), zi = Math.floor(z);
    const xf = x - xi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
    const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
function fbm(x, z) {
    let f = 0, amp = .5, freq = 1;
    for (let i = 0; i < 5; i++) { f += amp * vnoise(x * freq, z * freq); freq *= 2.03; amp *= .5; }
    return f;
}

// secondary hills scattered around, so the summits sit in a living landscape
const HILLS = [];
for (let i = 0; i < 46; i++) {
    HILLS.push({
        x: (hash(i, 1) - .5) * 260,
        z: 40 - hash(i, 2) * 560,
        h: 5 + hash(i, 3) * 13,
        s: 7 + hash(i, 4) * 14,
    });
}

function heightAt(x, z) {
    // domain warp so summits and hills come out organic rather than perfectly round
    const wx = x + (fbm(x * .035 + 11, z * .035) - .5) * 18;
    const wz = z + (fbm(x * .035, z * .035 + 23) - .5) * 18;
    x = wx; z = wz;
    let h = (fbm(x * .018, z * .018) - .45) * 16;          // rolling base
    h += (fbm(x * .07 + 40, z * .07) - .5) * 3;             // fine wrinkles
    for (const p of HILLS) {
        const d2 = (x - p.x) ** 2 + (z - p.z) ** 2;
        h += p.h * Math.exp(-d2 / (2 * p.s * p.s));
    }
    for (const p of STOPS) {
        const d2 = (x - p.x) ** 2 + (z - p.z) ** 2;
        // sharpened gaussian: steeper flanks, rounded crown
        const g = Math.exp(-d2 / (2 * p.spread * p.spread));
        h += p.height * Math.pow(g, .8);
    }
    return h;
}

/* ---------------- three ---------------- */
const canvas = document.getElementById("rm-terrain");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x071724, 1);   // roadmap --paper

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, .5, 900);

// terrain mesh — the contour lines are drawn in the fragment shader from height
const SIZE_X = 360, SIZE_Z = 680, SEG_X = 360, SEG_Z = 680, CENTER_Z = -230;
const geo = new THREE.PlaneGeometry(SIZE_X, SIZE_Z, SEG_X, SEG_Z);
geo.rotateX(-Math.PI / 2);
geo.translate(0, 0, CENTER_Z);
const pos = geo.attributes.position;
for (let i = 0; i < pos.count; i++) {
    pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
}
geo.computeVertexNormals();

const uniforms = {
    uTime: { value: 0 },
    uReveal: { value: 0 },
    uFogNear: { value: 70 },
    uFogFar: { value: 300 },
};

const terrainMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
        varying float vH;
        varying float vDist;
        varying vec3 vNormal;
        void main(){
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vH = position.y;
            vNormal = normal;
            vDist = distance(cameraPosition, wp.xyz);
            gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
    fragmentShader: /* glsl */`
        uniform float uTime, uReveal, uFogNear, uFogFar;
        varying float vH;
        varying float vDist;
        varying vec3 vNormal;

        // anti-aliased iso line: 1 on the line, 0 elsewhere
        float iso(float v, float width){
            float fw = fwidth(v);
            float d = abs(fract(v - .5) - .5) / max(fw, 1e-4);
            return (1.0 - smoothstep(0.0, width, d)) * (1.0 - smoothstep(.22, .5, fw));
        }

        void main(){
            float h = vH * .8 - uTime * .08;        // a line every 1.25 units, slowly drifting uphill
            float minor = iso(h, .9);
            float major = iso(h / 5.0, 1.5);

            float a = max(minor * .55, major * .95);

            // steeper faces glow slightly brighter, like the reference
            float steep = 1.0 - clamp(vNormal.y, 0.0, 1.0);
            a *= .75 + steep * .6;

            float fog = 1.0 - smoothstep(uFogNear, uFogFar, vDist);
            // roadmap colors: grey (#C9C9C9) lines on the navy (#071724) ground
            vec3 paper = vec3(0.027, 0.090, 0.141);
            vec3 ink = vec3(0.788);
            vec3 col = mix(paper, ink, clamp(a * fog, 0.0, 1.0));
            gl_FragColor = vec4(col, 1.0);
        }`,
});
scene.add(new THREE.Mesh(geo, terrainMat));

// scattered dust points sitting on the surface
const DOTS = 4000;
const dotPos = new Float32Array(DOTS * 3);
const dotSeed = new Float32Array(DOTS);
for (let i = 0; i < DOTS; i++) {
    const x = (Math.random() - .5) * SIZE_X * .95;
    const z = CENTER_Z + (Math.random() - .5) * SIZE_Z * .95;
    dotPos[i * 3] = x;
    dotPos[i * 3 + 1] = heightAt(x, z) + .35;
    dotPos[i * 3 + 2] = z;
    dotSeed[i] = Math.random();
}
const dotGeo = new THREE.BufferGeometry();
dotGeo.setAttribute("position", new THREE.BufferAttribute(dotPos, 3));
dotGeo.setAttribute("seed", new THREE.BufferAttribute(dotSeed, 1));
const dotMat = new THREE.ShaderMaterial({
    uniforms: { ...uniforms, uPR: { value: renderer.getPixelRatio() } },
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */`
        attribute float seed;
        uniform float uTime, uPR, uFogNear, uFogFar;
        varying float vA;
        void main(){
            vec4 wp = modelMatrix * vec4(position, 1.0);
            float d = distance(cameraPosition, wp.xyz);
            float tw = .45 + .55 * sin(uTime * (0.6 + seed * 1.6) + seed * 40.0);
            vA = tw * (1.0 - smoothstep(uFogNear, uFogFar, d));
            gl_Position = projectionMatrix * viewMatrix * wp;
            gl_PointSize = (1.2 + seed * 1.6) * uPR;
        }`,
    fragmentShader: /* glsl */`
        varying float vA;
        void main(){
            float r = length(gl_PointCoord - .5);
            if (r > .5) discard;
            gl_FragColor = vec4(vec3(0.788), vA * (1.0 - smoothstep(.2, .5, r)));
        }`,
});
scene.add(new THREE.Points(dotGeo, dotMat));

/* ---------------- camera keyframes ---------------- */
// the warp shifts each peak a little, so find the true highest point near each stop
const summits = STOPS.map(s => {
    let best = new THREE.Vector3(s.x, -Infinity, s.z);
    for (let dx = -24; dx <= 24; dx += 1) for (let dz = -24; dz <= 24; dz += 1) {
        const y = heightAt(s.x + dx, s.z + dz);
        if (y > best.y) best.set(s.x + dx, y, s.z + dz);
    }
    return best;
});

function viewFor(i) {
    const s = STOPS[i], top = summits[i];
    const az = THREE.MathUtils.degToRad(s.view);
    // taller summits get a wider, higher stance so they always fit the frame
    const dist = 46 + top.y * 1.15, lift = top.y * .85 + 20;
    return {
        pos: new THREE.Vector3(top.x + Math.sin(az) * dist, lift, top.z + Math.cos(az) * dist),
        target: new THREE.Vector3(top.x, top.y * .55, top.z),
    };
}
const VIEWS = STOPS.map((_, i) => viewFor(i));
// high, distant establishing shot behind the title
const VIEW_START = {
    pos: new THREE.Vector3(10, 150, 150),
    target: new THREE.Vector3(-10, 0, -70),
};

function mixView(a, b, t) {
    return { pos: a.pos.clone().lerp(b.pos, t), target: a.target.clone().lerp(b.target, t) };
}

/* ---------------- dom ---------------- */
const section = document.getElementById("roadmap");
const titleEl = document.getElementById("rm-title");
const dimEl = document.getElementById("rm-dim");
const cardEl = document.getElementById("rm-card");
const markerEl = document.getElementById("rm-marker");
const slidesEl = document.getElementById("rm-slides");
const barsEl = document.getElementById("rm-bars");

STOPS.forEach(s => {
    const a = document.createElement("article");
    a.className = "rm-slide";
    a.innerHTML = `
        <div class="rm-eyebrow"><span>Milestone</span><span>${s.phase.replace(/\D/g, "")}</span></div>
        <div class="rm-brand">
            <div class="rm-num rm-date">${s.when}</div>
            <div class="rm-name">${s.name}</div>
            <div class="rm-alt">${s.alt}</div>
        </div>
        <p class="rm-copy">${s.copy}</p>`;
    if (s.img) {
        const fig = document.createElement("figure");
        fig.className = "rm-photo";
        fig.innerHTML = `<img src="${s.img}" alt="" loading="lazy" decoding="async"${s.pos ? ` style="object-position:${s.pos}"` : ""}>`;
        a.querySelector(".rm-eyebrow").after(fig);
    }
    slidesEl.appendChild(a);
    barsEl.insertAdjacentHTML("beforeend", "<i><b></b></i>");
});
const slides = [...slidesEl.children];
const barFills = [...barsEl.querySelectorAll("b")];

// labels: each summit gets its name, pinned at the top beside the marker ring
const LABELS = [];
STOPS.forEach((s, i) => LABELS.push({
    t: s.name, p: summits[i].clone().add(new THREE.Vector3(0, 2, 0)), cls: "peak"
}));
const labelLayer = document.getElementById("rm-labels");
const labelEls = LABELS.map(l => {
    const el = document.createElement("div");
    el.className = "rm-lbl " + l.cls;
    el.innerHTML = `<span class="d"></span><span class="t">${l.t}</span>`;
    labelLayer.appendChild(el);
    return el;
});

/* ---------------- sizing ---------------- */
let W = 1, H = 1;
// the same query style.css uses to move the card from the right side to the bottom
const cardBelow = matchMedia("(max-width: 720px) and (min-height: 521px), (max-width: 1100px) and (max-aspect-ratio: 4/5)");
function resize() {
    W = canvas.clientWidth; H = canvas.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    // push the scene's centre away from the card so the summit isn't hidden behind it
    if (!cardBelow.matches) {
        camera.fov = 38;
        camera.setViewOffset(W, H, W * .12, 0, W, H);
    } else {
        // with the card over the bottom half, only the top ~45% is open: a wider lens shrinks the
        // mountain so the summit (about 12° above the look-at point) lands near 18% down, clear of
        // the top edge and the Menu pill, while the look-at point stays just above the card
        camera.fov = 55;
        camera.setViewOffset(W, H, 0, H * .12, W, H);
    }
    camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize);
cardBelow.addEventListener("change", resize);

const tmp = new THREE.Vector3();
function toScreen(v) {
    tmp.copy(v).project(camera);
    return { x: (tmp.x * .5 + .5) * W, y: (-tmp.y * .5 + .5) * H, visible: tmp.z < 1 };
}

/* ---------------- timeline ----------------
   p = progress through the pinned section (0 → 1)
   0.00–0.12  title fades, terrain brightens, camera descends to the first summit
   0.09–0.14  labels fade in
   0.10–0.17  card rises
   0.16–0.98  one segment per mountain                                 */
const N = STOPS.length;
const P_START = .16, P_END = .98, SEG = (P_END - P_START) / N;
const MOVE = .32;   // half-width (in segments) of the camera flight around each boundary
const FADE = .1;    // half-width of the card content crossfade

function flight(local) {
    let v = VIEWS[0];
    for (let i = 1; i < N; i++) {
        const t = ease(range(local, i - MOVE, i + MOVE));
        if (t <= 0) break;
        v = mixView(v, VIEWS[i], t);
        // lift the camera mid-flight so it arcs over the ridges between summits
        v.pos.y += Math.sin(t * Math.PI) * 22;
    }
    return v;
}

const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
window.addEventListener("pointermove", e => {
    mouse.x = e.clientX / innerWidth - .5;
    mouse.y = e.clientY / innerHeight - .5;
});

function frame(time) {
    const t = time / 1000;
    uniforms.uTime.value = t;

    const r = section.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) { requestAnimationFrame(frame); return; }
    const total = section.offsetHeight - innerHeight;
    const p = clamp(-r.top / total);
    const local = clamp((p - P_START) / SEG, 0, N);

    // camera
    const intro = ease(range(p, 0, .14));
    let view = mixView(VIEW_START, VIEWS[0], intro);
    if (p > P_START) view = flight(local);

    mouse.sx = lerp(mouse.sx, mouse.x, .05);
    mouse.sy = lerp(mouse.sy, mouse.y, .05);
    camera.position.copy(view.pos);
    camera.position.x += mouse.sx * 6 + Math.sin(t * .2) * 1.2;
    camera.position.y += -mouse.sy * 4 + Math.sin(t * .27) * .8;
    camera.lookAt(view.target);
    renderer.render(scene, camera);

    // title + dim
    const tt = range(p, .03, .1);
    titleEl.style.opacity = 1 - tt;
    titleEl.style.transform = `translate(-50%, calc(-50% - ${tt * 40}px)) scale(${1 - tt * .06})`;
    titleEl.style.filter = `blur(${tt * 6}px)`;
    dimEl.style.opacity = .55 * (1 - range(p, 0, .1));

    // labels — only those near the current focus stay visible
    const labelIn = range(p, .09, .14);
    LABELS.forEach((l, i) => {
        const s = toScreen(l.p);
        const near = 1 - range(l.p.distanceTo(view.target), 45, 80);
        const el = labelEls[i];
        el.style.opacity = s.visible ? labelIn * near : 0;
        el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
    });

    // card
    const cardIn = easeOut(range(p, .1, .17));
    cardEl.style.transform = `translateY(${(1 - cardIn) * 110}vh)`;

    slides.forEach((s, i) => {
        const fin = i === 0 ? 1 : range(local, i - FADE, i + FADE);
        const fout = i === N - 1 ? 1 : 1 - range(local, i + 1 - FADE, i + 1 + FADE);
        s.style.opacity = Math.min(fin, fout);
    });
    barFills.forEach((b, i) => b.style.transform = `scaleX(${clamp(local - i)})`);

    // marker rides the nearest summit, fading out mid-flight
    // each stop owns [i, i+1); the flight happens around the integer boundaries between them
    const idx = Math.min(N - 1, Math.floor(local));
    const b = Math.round(local);
    const between = b > 0 && b < N ? Math.abs(local - b) : 1;   // 0 mid-flight, grows as we settle
    const top = summits[idx].clone().add(new THREE.Vector3(0, 2, 0));
    const m = toScreen(top);
    const mIn = easeOut(range(p, .15, .19)) * range(between, .12, .26);
    markerEl.style.opacity = m.visible ? mIn : 0;
    markerEl.style.transform = `translate3d(${m.x}px, ${m.y}px, 0) scale(${.4 + .6 * mIn})`;

    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
