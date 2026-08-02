import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function buildRoom(scene) {
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.85,
    metalness: 0.1,
  });
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x0d0d0d,
    roughness: 0.95,
    metalness: 0.05,
  });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.6;
  floor.receiveShadow = true;
  scene.add(floor);

  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), wallMat);
  wall.position.z = -4;
  wall.position.y = 3;
  wall.receiveShadow = true;
  scene.add(wall);

  const loader = new THREE.TextureLoader();
  loader.load('images/dots.png', (tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 4);
    const overlay = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 20),
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    overlay.position.copy(wall.position);
    overlay.position.z += 0.01;
    scene.add(overlay);
  });

  return { floor, wall };
}

function buildGlow() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,0.55)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.12)');
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
  sprite.scale.set(9, 9, 1);
  sprite.position.set(0, 1, -3.5);
  return sprite;
}

export function initHeroScene(canvasSelector) {
  const canvas = document.querySelector(canvasSelector);
  if (!canvas || typeof window === 'undefined') return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (err) {
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 6, 16);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.6, 5.4);
  camera.lookAt(0, 0.1, 0);

  buildRoom(scene);
  scene.add(buildGlow());

  scene.add(new THREE.AmbientLight(0x666666, 0.55));

  const key = new THREE.SpotLight(0xffffff, 30, 20, Math.PI / 7, 0.5, 1.2);
  key.position.set(1.2, 5.5, 3);
  key.target.position.set(0, 0, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key, key.target);

  const rim = new THREE.PointLight(0xdfe8ff, 10, 12, 2);
  rim.position.set(-1.5, 1.2, -2.5);
  scene.add(rim);

  const fill = new THREE.PointLight(0xffffff, 2.5, 10, 2);
  fill.position.set(-1.8, -0.4, 2.5);
  scene.add(fill);

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

    if (!REDUCED_MOTION) {
      camera.position.x += (pointer.x * 0.4 - camera.position.x) * 0.03;
      camera.position.y += (0.6 - pointer.y * 0.2 - camera.position.y) * 0.03;
      camera.lookAt(0, 0.1, 0);
    }

    renderer.render(scene, camera);
  }
  tick();

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) clock.start();
  });

  return {
    destroy() {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      renderer.dispose();
    },
  };
}
