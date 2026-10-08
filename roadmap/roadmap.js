/* Roadmap section, imported from website drafts/Extra/projects topo.
   A contour-line terrain pinned in #roadmap; scrolling flies the camera summit to summit
   while the card on the right steps through the milestones.
   The title, card and bars run on their own; the 3D terrain is loaded on top of them, so a machine
   with no WebGL at all still gets every milestone on a plain navy ground.
   three is pinned at r162, the last release that still runs on WebGL1, and served from our own vendor/ folder. */
const THREE_URL = new URL("../vendor/three.module.js", import.meta.url).href;

/* ---------------- content ----------------
   One entry per mountain. x/z place the summit on the terrain,
   height/spread shape it, view sets where the camera stands (azimuth in degrees). */
const STOPS = [
    { phase: "Milestone 01", when: "Sep 2025", name: "The Idea", img: "images/roadmap/01-idea.jpg", pos: "50% 55%", alt: "Base camp",
      copy: "Where it starts: a question about what the voice can reveal, and the first sketch of an instrument that could answer it.",
      x: 0,    z: 0,    height: 30, spread: 9,  view: -25 },
    { phase: "Milestone 02", when: "Feb 2026", name: "Incubated", img: "images/roadmap/02-incubated.jpg", pos: "50% 22%", alt: "Incubated at IIT",
      copy: "The company is formally set up and joins incubation at IIT, giving the work a home, mentors and room to build.",
      x: -58,  z: -55,  height: 26, spread: 12, view: 10 },
    { phase: "Milestone 03", when: "Mar 2026", name: "Software Prototype", img: "images/roadmap/03-software.jpg", pos: "50% 60%", alt: "The first build",
      copy: "The first working software prototype: an end-to-end pipeline that takes a recording in and puts an analysis out.",
      x: 20,   z: -112, height: 34, spread: 11, view: -40 },
    { phase: "Milestone 04", when: "Apr 2026", name: "Idea Validation", img: "images/roadmap/04-validation.jpg", pos: "50% 60%", alt: "In the clinic",
      copy: "Conversations with surgeons and physicians, testing the problem and the approach against how clinical care actually works.",
      x: -42,  z: -170, height: 28, spread: 14, view: 20 },
    { phase: "Milestone 05", when: "May 2026", name: "Hardware Prototype", img: "images/roadmap/05-hardware.jpg", pos: "50% 68%", alt: "Built to listen",
      copy: "The instrument gets a body: a hardware prototype built to capture the voice cleanly enough for acoustic analysis.",
      x: -50,  z: -286, height: 32, spread: 13, view: 15 },
    { phase: "Milestone 06", when: "Jun 2026", name: "MVP", img: "images/roadmap/06-mvp.jpg", pos: "50% 25%", alt: "(Minimum viable product)",
      copy: "Software and hardware come together into a minimum viable product, complete enough to put in front of real users.",
      x: 12,   z: -344, height: 40, spread: 12, view: -30 },
    { phase: "Milestone 07", when: "Jul 2026", name: "Testing", img: "images/roadmap/07-testing.jpg", pos: "50% 60%", alt: "Put to the test",
      copy: "The MVP goes into testing, measuring how it performs, where it falls short and what has to change before it goes further.",
      x: -38,  z: -402, height: 34, spread: 14, view: 20 },
    { phase: "Milestone 08", when: "Aug 2026", name: "SISFS", img: "images/roadmap/08-sisf.jpg", pos: "58% 30%", alt: "Startup India Seed Fund",
      copy: "Backed by the Startup India Seed Fund Scheme, funding the next stretch of the climb.",
      x: 26,   z: -462, height: 36, spread: 13, view: -15 },
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

/* ---------------- dom ---------------- */
const section = document.getElementById("roadmap");
const canvas = document.getElementById("rm-terrain");
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
        fig.innerHTML = `<img src="${s.img}?v=5" alt="" loading="lazy" decoding="async"${s.pos ? ` style="object-position:${s.pos}"` : ""}>`;
        a.querySelector(".rm-eyebrow").after(fig);
    }
    slidesEl.appendChild(a);
    barsEl.insertAdjacentHTML("beforeend", "<i><b></b></i>");
});
const slides = [...slidesEl.children];
const barFills = [...barsEl.querySelectorAll("b")];

/* ---------------- timeline ----------------
   p = progress through the pinned section (0 → 1)
   0.00–0.12  title fades, terrain brightens, camera descends to the first summit
   0.09–0.14  labels fade in
   0.10–0.17  card rises
   0.16–0.98  one segment per mountain; the last one shorter (see LAST)  */
const N = STOPS.length;
// every other stop spends the end of its segment flying on to the next summit; the last has nowhere to go, so it gets
// only the part the others spend standing still, and doesn't linger
const LAST = .55;
const P_START = .16, P_END = .98, SEG = (P_END - P_START) / (N - 1 + LAST);
const MOVE = .32;   // half-width (in segments) of the camera flight around each boundary
const FADE = .1;    // half-width of the card content crossfade

// the title, card and bars: plain DOM, so they work whether or not the terrain loaded
function updateDom(p, local) {
    const tt = range(p, .03, .1);
    titleEl.style.opacity = 1 - tt;
    titleEl.style.transform = `translate(-50%, calc(-50% - ${tt * 40}px)) scale(${1 - tt * .06})`;
    titleEl.style.filter = `blur(${tt * 6}px)`;
    // no veil over the land: the preview shows it plainly, and the flight opens on that same view
    dimEl.style.opacity = 0;

    const cardIn = easeOut(range(p, .1, .17));
    cardEl.style.transform = `translateY(${(1 - cardIn) * 110}vh)`;
    // the close cross waits until the card has brought in the first milestone (style.css)
    section.classList.toggle("rm-started", p >= P_START);

    slides.forEach((s, i) => {
        const fin = i === 0 ? 1 : range(local, i - FADE, i + FADE);
        const fout = i === N - 1 ? 1 : 1 - range(local, i + 1 - FADE, i + 1 + FADE);
        s.style.opacity = Math.min(fin, fout);
    });
    barFills.forEach((b, i) => b.style.transform = `scaleX(${clamp((local - i) / (i === N - 1 ? LAST : 1))})`);
}

/* ---------------- the land: every height, normal, speck of dust and summit ----------------
   About two seconds of arithmetic (a quarter of a million heights), so it runs in a worker, off the main thread:
   done here, it froze the page on every load, and scrolling and the entrance animations stuttered until it
   finished. buildLand is plain arithmetic with no DOM, so the worker is built from its own source. */
const LAND = { SIZE_X: 360, SIZE_Z: 680, SEG_X: 360, SEG_Z: 680, CENTER_Z: -230, DOTS: 4000 };

function buildLand(o) {
    const { SIZE_X, SIZE_Z, SEG_X, SEG_Z, CENTER_Z, DOTS } = o;
    const cols = SEG_X + 1, rows = SEG_Z + 1, n = cols * rows;
    const sx = SIZE_X / SEG_X, sz = SIZE_Z / SEG_Z;
    const position = new Float32Array(n * 3), normal = new Float32Array(n * 3), hs = new Float32Array(n);
    // the same grid three's PlaneGeometry lays out, already turned to lie flat and moved back along z
    for (let iy = 0; iy < rows; iy++) {
        const z = iy * sz - SIZE_Z / 2 + CENTER_Z;
        for (let ix = 0; ix < cols; ix++) {
            const x = ix * sx - SIZE_X / 2, k = iy * cols + ix, h = heightAt(x, z);
            hs[k] = h;
            position[k * 3] = x; position[k * 3 + 1] = h; position[k * 3 + 2] = z;
        }
    }
    // normals from the slope of the height grid: the same upward-facing surface computeVertexNormals gave
    for (let iy = 0; iy < rows; iy++) {
        const y0 = Math.max(iy - 1, 0), y1 = Math.min(iy + 1, rows - 1);
        for (let ix = 0; ix < cols; ix++) {
            const x0 = Math.max(ix - 1, 0), x1 = Math.min(ix + 1, cols - 1), k = iy * cols + ix;
            const dx = (hs[iy * cols + x1] - hs[iy * cols + x0]) / (sx * (x1 - x0));
            const dz = (hs[y1 * cols + ix] - hs[y0 * cols + ix]) / (sz * (y1 - y0));
            const len = Math.hypot(dx, 1, dz);
            normal[k * 3] = -dx / len; normal[k * 3 + 1] = 1 / len; normal[k * 3 + 2] = -dz / len;
        }
    }
    // two triangles per cell, wound the way PlaneGeometry winds them so they face up
    const index = new Uint32Array(SEG_X * SEG_Z * 6);
    let p = 0;
    for (let iy = 0; iy < SEG_Z; iy++) for (let ix = 0; ix < SEG_X; ix++) {
        const a = ix + cols * iy, b = ix + cols * (iy + 1), c = ix + 1 + cols * (iy + 1), d = ix + 1 + cols * iy;
        index[p++] = a; index[p++] = b; index[p++] = d;
        index[p++] = b; index[p++] = c; index[p++] = d;
    }
    // scattered dust sitting on the surface
    const dotPos = new Float32Array(DOTS * 3), dotSeed = new Float32Array(DOTS);
    for (let i = 0; i < DOTS; i++) {
        const x = (Math.random() - .5) * SIZE_X * .95;
        const z = CENTER_Z + (Math.random() - .5) * SIZE_Z * .95;
        dotPos[i * 3] = x; dotPos[i * 3 + 1] = heightAt(x, z) + .35; dotPos[i * 3 + 2] = z;
        dotSeed[i] = Math.random();
    }
    // the warp shifts each peak a little, so find the true highest point near each stop
    const summits = STOPS.map(s => {
        let best = [s.x, -Infinity, s.z];
        for (let dx = -24; dx <= 24; dx += 1) for (let dz = -24; dz <= 24; dz += 1) {
            const y = heightAt(s.x + dx, s.z + dz);
            if (y > best[1]) best = [s.x + dx, y, s.z + dz];
        }
        return best;
    });
    return { position, normal, index, dotPos, dotSeed, summits };
}

const LAND_SRC = [
    `const lerp = ${lerp};`,
    hash, vnoise, fbm, heightAt, buildLand,
    `const HILLS = ${JSON.stringify(HILLS)};`,
    `const STOPS = ${JSON.stringify(STOPS.map(({ x, z, height, spread }) => ({ x, z, height, spread })))};`,
    `onmessage = e => { const r = buildLand(e.data);
        postMessage(r, [r.position.buffer, r.normal.buffer, r.index.buffer, r.dotPos.buffer, r.dotSeed.buffer]); };`,
].join("\n");

function landOffThread() {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(new Blob([LAND_SRC], { type: "text/javascript" }));
        const done = () => { worker.terminate(); URL.revokeObjectURL(url); };
        const worker = new Worker(url);
        worker.onmessage = e => { done(); resolve(e.data); };
        worker.onerror = e => { done(); reject(e); };
        worker.postMessage(LAND);
    });
}

/* ---------------- three: the terrain, camera flight, summit labels and marker ---------------- */
function setupTerrain(THREE, land) {
    // tries WebGL2, then WebGL1; throws only when the browser has neither, which is caught below
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x071724, 1);   // roadmap --paper

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .5, 900);

    // terrain mesh — the contour lines are drawn in the fragment shader from height
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(land.position, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(land.normal, 3));
    geo.setIndex(new THREE.BufferAttribute(land.index, 1));

    const uniforms = {
        uTime: { value: 0 },
        uReveal: { value: 0 },
        uFogNear: { value: 70 },
        uFogFar: { value: 300 },
    };

    const terrainMat = new THREE.ShaderMaterial({
        uniforms,
        extensions: { derivatives: true },   // fwidth() in the contour shader needs this on WebGL1
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
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.BufferAttribute(land.dotPos, 3));
    dotGeo.setAttribute("seed", new THREE.BufferAttribute(land.dotSeed, 1));
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

    /* camera keyframes */
    const summits = land.summits.map(s => new THREE.Vector3(...s));

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

    // the opening view, behind the title: a close view of the first summit and its neighbours, a little further back than
    // the flight's own first stop and swaying gently from side to side while the section rests closed. Opening it, the
    // sway holds where it is and the flight starts from exactly that view, so nothing jumps when Explore is pressed
    function overview(t) {
        const s = STOPS[0], top = summits[0];
        const az = THREE.MathUtils.degToRad(s.view) + Math.sin(t * .07) * .22;
        const dist = 46 + top.y * 1.15 + 34, lift = top.y * .85 + 34;
        return {
            pos: new THREE.Vector3(top.x + Math.sin(az) * dist, lift, top.z + Math.cos(az) * dist),
            target: new THREE.Vector3(top.x, top.y * .5, top.z),
        };
    }
    let sway = 0, lastT = null;   // the sway's own clock: it only runs while the section rests closed

    function mixView(a, b, t) {
        return { pos: a.pos.clone().lerp(b.pos, t), target: a.target.clone().lerp(b.target, t) };
    }

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

    // labels: each summit gets its name, pinned at the top beside the marker ring
    const LABELS = STOPS.map((s, i) => ({
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

    /* sizing */
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
            camera.setViewOffset(W, H, 0, H * .16, W, H);
        }
        camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);
    // the panel itself changes size too (it goes full screen while the flight is open), so follow the canvas, not just the window
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
    cardBelow.addEventListener("change", resize);
    // one frame now, while the reader is still up the page, so the shaders compile and the land reaches the
    // graphics card here rather than as a hitch on the first scroll into the section
    renderer.render(scene, camera);

    const tmp = new THREE.Vector3();
    function toScreen(v) {
        tmp.copy(v).project(camera);
        return { x: (tmp.x * .5 + .5) * W, y: (-tmp.y * .5 + .5) * H, visible: tmp.z < 1 };
    }

    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    window.addEventListener("pointermove", e => {
        mouse.x = e.clientX / innerWidth - .5;
        mouse.y = e.clientY / innerHeight - .5;
    });

    // one frame of the 3D layer, driven by the same progress as the card
    return function draw(p, local, t, resting) {
        uniforms.uTime.value = t;
        if (resting && lastT !== null) sway += t - lastT;
        lastT = t;

        // camera: from the opening view down to the first summit, then summit to summit
        const intro = ease(range(p, 0, .14));
        let view = mixView(overview(sway), VIEWS[0], intro);
        if (p > P_START) view = flight(local);

        mouse.sx = lerp(mouse.sx, mouse.x, .05);
        mouse.sy = lerp(mouse.sy, mouse.y, .05);
        camera.position.copy(view.pos);
        camera.position.x += mouse.sx * 6 + Math.sin(t * .2) * 1.2;
        camera.position.y += -mouse.sy * 4 + Math.sin(t * .27) * .8;
        camera.lookAt(view.target);
        renderer.render(scene, camera);

        // labels — only those near the current focus stay visible
        const labelIn = range(p, .09, .14);
        LABELS.forEach((l, i) => {
            const s = toScreen(l.p);
            const near = 1 - range(l.p.distanceTo(view.target), 45, 80);
            const el = labelEls[i];
            // no names until the flight is under way: the preview shows the land, the milestones are kept for the flight
            el.style.opacity = s.visible ? labelIn * near : 0;
            el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
        });

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
    };
}

/* ---------------- loop ---------------- */
let draw = null;   // set once the terrain is up

function frame(time) {
    const r = section.getBoundingClientRect();
    if (r.bottom >= 0 && r.top <= innerHeight) {
        const total = section.offsetHeight - innerHeight;
        // closed, the section is a single screen with no scroll to fly through: it rests on the overview
        const resting = total <= 1;
        const p = resting ? 0 : clamp(-r.top / total);
        const local = clamp((p - P_START) / SEG, 0, N);
        updateDom(p, local);
        if (draw) {
            try { draw(p, local, time / 1000, resting); }
            catch (err) { console.warn("Roadmap terrain stopped:", err); draw = null; }
        }
    }
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// the land is worked out in the background while three loads; a browser without workers does it here instead
const land = landOffThread().catch(() => buildLand(LAND));
Promise.all([import(THREE_URL), land])
    .then(([THREE, l]) => { draw = setupTerrain(THREE, l); })
    .catch(err => { console.warn("Roadmap terrain unavailable, showing milestones without it:", err); });
