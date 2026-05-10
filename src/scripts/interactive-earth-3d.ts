/**
 * interactive-earth-3d
 *
 * Browser-only Three.js module that renders a single interactive Earth
 * sphere into a host element. Loaded lazily (dynamic import) by
 * LanguageGlobeSelector.astro when the language overlay first opens —
 * never imported from .astro frontmatter, never reached during SSR.
 *
 * Scope: Earth visual + interaction only. Language selection,
 * persistence, URL handling, and event dispatch stay in the host
 * component. This module has no knowledge of language codes; it just
 * accepts an optional initial focus point as { lat, lng } in degrees.
 *
 * Lifecycle contract:
 *   - createInteractiveEarth(container, options) builds the scene,
 *     mounts a single canvas inside `container`, starts the rAF loop,
 *     and returns a handle.
 *   - handle.setIdleRotation(false) pauses the rAF loop without tearing
 *     anything down — the host calls this when the overlay closes so
 *     a re-open is instant and no second canvas is ever created.
 *   - handle.destroy() stops the loop, removes listeners, disposes
 *     geometries / materials / textures / renderer, and removes the
 *     canvas from the DOM. The host calls this on `astro:before-swap`
 *     and on `beforeunload` so view transitions and full page exits
 *     don't leak GPU resources.
 *   - handle.focusLatLng(lat, lng) snaps the globe so a point faces
 *     the camera. Used today for initial focus only; the future
 *     header→center launch animation will animate this instead.
 */

import * as THREE from 'three';

export interface FocusPoint {
  lat: number;
  lng: number;
  /** Human-readable label for telemetry / logs. Not rendered. */
  label?: string;
}

export interface InteractiveEarthOptions {
  /** Snap the globe so this point faces the camera on first paint. */
  initialFocus?: FocusPoint | null;
  /** Idle rotation speed in radians/second. 0 disables idle spin. */
  idleSpeed?: number;
}

export interface InteractiveEarthHandle {
  /** Stop animation, remove listeners, dispose all GPU resources, remove canvas. */
  destroy(): void;
  /** Snap-rotate the globe so (lat, lng) faces the camera. */
  focusLatLng(lat: number, lng: number): void;
  /** Pause/resume idle rotation + rAF loop. Does NOT dispose. */
  setIdleRotation(enabled: boolean): void;
  /** Convenience flag for callers that want to know the canvas is up. */
  readonly canvas: HTMLCanvasElement;
}

const DEG = Math.PI / 180;
const POLE_CLAMP = Math.PI / 2 - 0.05;

export function createInteractiveEarth(
  container: HTMLElement,
  options: InteractiveEarthOptions = {}
): InteractiveEarthHandle {
  const idleSpeed = options.idleSpeed ?? 0.06; // ≈ 3.4°/sec

  // ── Scene ────────────────────────────────────────────────────────
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 2.7);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  // Slight tone-mapped output keeps highlights from clipping when the
  // directional light hits the ocean specular at glancing angles.
  renderer.toneMapping = THREE.LinearToneMapping;

  const canvas = renderer.domElement;
  canvas.style.touchAction = 'none';
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  // ── Earth sphere ─────────────────────────────────────────────────
  const earthTexture = generateEarthTexture();
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    specular: new THREE.Color(0x2a4060),
    shininess: 14,
  });
  const earthGeometry = new THREE.SphereGeometry(1, 96, 96);
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earth);

  // Apply initial focus before the first paint so the user sees the
  // active language's region immediately, not a flash of lat=0/lng=0.
  if (options.initialFocus) {
    earth.rotation.y = -options.initialFocus.lng * DEG;
    earth.rotation.x = clamp(options.initialFocus.lat * DEG, -POLE_CLAMP, POLE_CLAMP);
  }

  // ── Atmospheric glow ─────────────────────────────────────────────
  // Soft Fresnel halo via a back-side sphere with additive blending.
  // No post-processing pass — this is a single extra mesh, ~12 KB on
  // the GPU, and reads as "atmosphere" without bloom or tone mapping.
  const atmosphereGeometry = new THREE.SphereGeometry(1.06, 64, 64);
  const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.85 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.5);
        gl_FragColor = vec4(0.40, 0.65, 1.0, 1.0) * clamp(intensity * 0.7, 0.0, 1.0);
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphere);

  // ── Lights ───────────────────────────────────────────────────────
  // Soft warm ambient + a single directional sun, biased so the lit
  // hemisphere lands roughly upper-right of the camera. Avoids the
  // rim-only look pure ambient gives on a sphere.
  const ambient = new THREE.AmbientLight(0xfff3dc, 0.42);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffffff, 1.05);
  sun.position.set(-2.0, 1.6, 3.2);
  scene.add(sun);

  // ── Resize handling ──────────────────────────────────────────────
  // ResizeObserver covers both initial mount and any container size
  // changes (e.g. orientation flip, overlay re-centering). The
  // renderer.setSize call uses `false` for the third arg so it won't
  // override the canvas's CSS sizing (we want CSS to drive layout).
  const sizeFromContainer = () => {
    const rect = container.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  sizeFromContainer();

  const resizeObserver = new ResizeObserver(sizeFromContainer);
  resizeObserver.observe(container);

  // ── Pointer drag rotation (mouse + touch + pen via Pointer Events) ──
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let activePointerId: number | null = null;

  const onPointerDown = (e: PointerEvent) => {
    if (activePointerId !== null) return;
    dragging = true;
    activePointerId = e.pointerId;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    // While dragging the canvas should not also try to scroll the
    // page on touch devices. touch-action:none on the canvas already
    // covers this; calling preventDefault here on the down event is
    // belt-and-suspenders for very old browsers.
    e.preventDefault();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging || e.pointerId !== activePointerId) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    earth.rotation.y += dx * 0.005;
    earth.rotation.x = clamp(earth.rotation.x + dy * 0.005, -POLE_CLAMP, POLE_CLAMP);
    lastX = e.clientX;
    lastY = e.clientY;
  };

  const endPointer = (e: PointerEvent) => {
    if (e.pointerId !== activePointerId) return;
    dragging = false;
    activePointerId = null;
    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('pointerleave', endPointer);

  // ── Animation loop ──────────────────────────────────────────────
  let idleEnabled = true;
  let rafId: number | null = null;
  let lastTime = 0;

  const tick = (time: number) => {
    rafId = null;
    if (!idleEnabled) return;
    const dt = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 0;
    lastTime = time;
    if (!dragging && idleSpeed > 0) {
      earth.rotation.y += idleSpeed * dt;
    }
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (rafId === null && idleEnabled) {
      lastTime = 0;
      rafId = requestAnimationFrame(tick);
    }
  };

  const stopLoop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  // First paint synchronously so the canvas isn't black for one frame
  // when the overlay opens — even on slower devices this keeps the
  // open feel instantaneous.
  renderer.render(scene, camera);
  startLoop();

  // ── Public handle ────────────────────────────────────────────────
  return {
    canvas,
    destroy(): void {
      stopLoop();
      idleEnabled = false;

      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', endPointer);
      canvas.removeEventListener('pointercancel', endPointer);
      canvas.removeEventListener('pointerleave', endPointer);

      resizeObserver.disconnect();

      earthGeometry.dispose();
      earthMaterial.dispose();
      earthTexture.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      renderer.dispose();

      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    },
    focusLatLng(lat: number, lng: number): void {
      earth.rotation.y = -lng * DEG;
      earth.rotation.x = clamp(lat * DEG, -POLE_CLAMP, POLE_CLAMP);
    },
    setIdleRotation(enabled: boolean): void {
      idleEnabled = enabled;
      if (enabled) {
        startLoop();
      } else {
        stopLoop();
      }
    },
  };
}

// ── Helpers ────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Build a 1024×512 equirectangular texture for the Earth on a 2D
 * canvas. Pure CPU canvas drawing — no remote assets, no hotlinking.
 *
 * The continents are abstract polygons in lat/lng space, projected to
 * canvas pixels. They aren't cartographically accurate; the goal is
 * "this reads as Earth on a rotating sphere," not a navigation map.
 *
 * Layers (back to front):
 *   1. Ocean — vertical gradient (lighter equatorial, deeper poles)
 *   2. Continents — green/teal land gradient
 *   3. Polar caps — soft white bands at top/bottom
 *   4. Subtle horizontal noise band along the equator (faint cloud-ish)
 */
function generateEarthTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    // CanvasTexture will still construct from an empty canvas; the
    // sphere just renders deep ocean color, which degrades gracefully.
    return new THREE.CanvasTexture(canvas);
  }

  // Ocean — vertical gradient
  const ocean = ctx.createLinearGradient(0, 0, 0, h);
  ocean.addColorStop(0, '#082246');
  ocean.addColorStop(0.5, '#0e3a72');
  ocean.addColorStop(1, '#082246');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, w, h);

  // Latitude/longitude → canvas pixels (equirectangular).
  const xy = (lat: number, lng: number): [number, number] => [
    ((lng + 180) / 360) * w,
    ((90 - lat) / 180) * h,
  ];

  const land = ctx.createLinearGradient(0, 0, 0, h);
  land.addColorStop(0, '#5b8a64');
  land.addColorStop(0.55, '#3a7152');
  land.addColorStop(1, '#23503c');

  const drawBlob = (
    coords: ReadonlyArray<readonly [number, number]>,
    fill: string | CanvasGradient
  ): void => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    coords.forEach(([lat, lng], i) => {
      const [x, y] = xy(lat, lng);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
  };

  // ── Continents (rough lat/lng polygons) ────────────────────────
  // Africa — single closed polygon traced clockwise from Morocco.
  drawBlob([
    [35, -10], [37, 0], [33, 12], [32, 22], [30, 32], [22, 38],
    [12, 43], [2, 46], [-12, 40], [-22, 35], [-30, 30], [-35, 18],
    [-25, 14], [-15, 12], [-5, 8], [5, 0], [12, -8], [20, -16], [30, -10],
  ], land);

  // Eurasia — Europe through far-east Asia.
  drawBlob([
    [60, -10], [70, 0], [72, 30], [78, 60], [78, 100], [72, 145],
    [62, 175], [50, 160], [38, 142], [25, 122], [12, 108], [5, 102],
    [10, 90], [22, 88], [25, 75], [22, 60], [25, 48], [38, 40],
    [42, 28], [38, 18], [42, 8], [48, -2], [55, -8],
  ], land);

  // North America.
  drawBlob([
    [72, -160], [72, -110], [70, -85], [60, -65], [48, -60], [38, -72],
    [25, -80], [22, -98], [16, -94], [22, -110], [40, -125], [55, -132],
    [65, -150], [72, -165],
  ], land);

  // South America.
  drawBlob([
    [12, -78], [8, -60], [-2, -45], [-15, -38], [-25, -42], [-38, -58],
    [-52, -68], [-55, -72], [-40, -73], [-22, -72], [-5, -78], [8, -82],
  ], land);

  // Australia.
  drawBlob([
    [-12, 113], [-12, 135], [-18, 148], [-30, 153], [-38, 145],
    [-35, 122], [-25, 113],
  ], land);

  // Greenland — its own small mass, otherwise the planet looks bare
  // when North America rotates out of view.
  drawBlob([
    [82, -55], [78, -20], [70, -22], [62, -50], [70, -55], [78, -62],
  ], land);

  // Indonesian island arc — a string of small blobs near the equator.
  for (const [lat, lng] of [
    [-2, 102], [-3, 115], [-5, 122], [-8, 128], [-1, 130],
  ]) {
    const [x, y] = xy(lat, lng);
    ctx.fillStyle = land;
    ctx.beginPath();
    ctx.ellipse(x, y, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // British Isles + Iceland — same reason as Greenland.
  for (const [lat, lng, rx, ry] of [
    [54, -3, 12, 18],
    [65, -19, 9, 7],
    [40, 14, 7, 14], // Italy peninsula hint
  ]) {
    const [x, y] = xy(lat, lng);
    ctx.fillStyle = land;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Polar caps ─────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(232, 240, 250, 0.85)';
  ctx.fillRect(0, 0, w, h * 0.045);
  ctx.fillRect(0, h * 0.955, w, h * 0.045);

  // ── Subtle equatorial cloud band ───────────────────────────────
  // A soft horizontal stripe with low alpha gives the texture a hint
  // of atmosphere without requiring a separate cloud sphere or noise
  // shader. Drawn after continents so it slightly veils them, which
  // is realistic.
  const cloud = ctx.createLinearGradient(0, h * 0.4, 0, h * 0.6);
  cloud.addColorStop(0, 'rgba(255,255,255,0)');
  cloud.addColorStop(0.5, 'rgba(255,255,255,0.07)');
  cloud.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = cloud;
  ctx.fillRect(0, h * 0.4, w, h * 0.2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
