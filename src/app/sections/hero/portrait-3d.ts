/**
 * 3D-Kopf aus Foto + KI-Tiefenkarte (Depth Anything V2, lokal berechnet).
 * Eine dichte Fläche wird nach der Tiefenkarte geformt; der Kopf dreht sich um einen Punkt im Hals
 * zur Maus, die Schultern folgen nur leicht. Licht von oben links: die Schattierung wandert mit.
 *
 * Grenzen: Ein Foto zeigt nur die Vorderseite. Bis etwa ±15° wirkt die Drehung echt, darüber
 * würden Ohren und Wangen sichtbar gedehnt – deshalb ist der Winkel begrenzt.
 */
import * as THREE from 'three';

export interface Portrait3DHandle {
  destroy(): void;
}

// Die Tiefe steckt schon in der Geometrie (beim Laden berechnet); der Shader dreht nur.
const VERT = /* glsl */ `
  uniform vec2 uRot;      // x = Gieren (links/rechts), y = Nicken
  uniform vec3 uPivot;
  varying vec2 vUv;
  varying vec3 vNormal;
  vec3 turn(vec3 q, float yaw, float pitch) {
    q = vec3(q.x * cos(yaw) + q.z * sin(yaw), q.y, -q.x * sin(yaw) + q.z * cos(yaw));
    return vec3(q.x, q.y * cos(pitch) - q.z * sin(pitch), q.y * sin(pitch) + q.z * cos(pitch));
  }
  void main() {
    vUv = uv;
    // Kopf dreht voll, Schultern nur ein Viertel – wie eine echte Halsdrehung
    float w = 0.22 + 0.78 * smoothstep(-0.78, -0.42, position.y);
    float yaw = uRot.x * w, pitch = uRot.y * w;
    vec3 p = turn(position - uPivot, yaw, pitch) + uPivot;
    vNormal = normalize(normalMatrix * turn(normal, yaw, pitch));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uLight;
  uniform float uShade;
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vec4 c = texture2D(uMap, vUv);
    if (c.a < 0.03) discard;
    float l = clamp(dot(normalize(vNormal), normalize(uLight)), 0.0, 1.0);
    c.rgb *= 1.0 + uShade * (l - 0.72);
    gl_FragColor = c;
  }
`;

/** Liest die 16-Bit-Tiefenkarte (R = oberes, G = unteres Byte) als Float-Raster 0…1. */
function readDepth(img: HTMLImageElement): { w: number; h: number; data: Float32Array } {
  const w = img.naturalWidth,
    h = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true, colorSpace: 'srgb' });
  if (!ctx) throw new Error('Canvas 2D nicht verfügbar');
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, w, h).data;
  const data = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) data[i] = (px[i * 4] * 256 + px[i * 4 + 1]) / 65535;
  return { w, h, data };
}

function sampleDepth(
  d: { w: number; h: number; data: Float32Array },
  u: number,
  v: number,
): number {
  const fx = u * (d.w - 1),
    fy = (1 - v) * (d.h - 1);
  const x0 = Math.floor(fx),
    y0 = Math.floor(fy),
    x1 = Math.min(d.w - 1, x0 + 1),
    y1 = Math.min(d.h - 1, y0 + 1);
  const tx = fx - x0,
    ty = fy - y0,
    a = d.data;
  return (
    (a[y0 * d.w + x0] * (1 - tx) + a[y0 * d.w + x1] * tx) * (1 - ty) +
    (a[y1 * d.w + x0] * (1 - tx) + a[y1 * d.w + x1] * tx) * ty
  );
}

export async function createPortrait3D(
  host: HTMLElement,
  canvas: HTMLCanvasElement,
  imageUrl: string,
  depthUrl: string,
): Promise<Portrait3DHandle | null> {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return null; // kein WebGL → das normale Foto bleibt stehen
  }
  const win = window;
  const reduce = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(2, win.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // Farben 1:1 wie im Foto

  const loader = new THREE.TextureLoader();
  let map: THREE.Texture, depthImg: HTMLImageElement;
  try {
    [map, depthImg] = await Promise.all([
      loader.loadAsync(imageUrl),
      new THREE.ImageLoader().loadAsync(depthUrl),
    ]);
  } catch {
    renderer.dispose();
    return null;
  }
  map.colorSpace = THREE.NoColorSpace;
  map.anisotropy = renderer.capabilities.getMaxAnisotropy();

  // Fläche im Seitenverhältnis des Fotos (Höhe 2), nach der Tiefenkarte geformt
  const img = map.image as HTMLImageElement;
  const aspect = img.width / img.height;
  const geo = new THREE.PlaneGeometry(2 * aspect, 2, 220, 252);
  const depth = readDepth(depthImg);
  // Wie stark das Gesicht plastisch wird. Höher = mehr Tiefe, aber Kinn/Stirn wirken schnell spitz.
  const DEPTH_SCALE = 0.32;
  const posAttr = geo.attributes['position'] as THREE.BufferAttribute;
  const uvAttr = geo.attributes['uv'] as THREE.BufferAttribute;
  for (let i = 0; i < posAttr.count; i++) {
    posAttr.setZ(i, (sampleDepth(depth, uvAttr.getX(i), uvAttr.getY(i)) - 0.5) * DEPTH_SCALE);
  }
  geo.computeVertexNormals();
  const uniforms = {
    uMap: { value: map },
    uRot: { value: new THREE.Vector2() },
    uPivot: { value: new THREE.Vector3(0, -0.15, -0.1) },
    uLight: { value: new THREE.Vector3(-0.55, 0.65, 1.0) },
    uShade: { value: 0.22 },
  };
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    transparent: true,
  });
  const mesh = new THREE.Mesh(geo, mat);
  const scene = new THREE.Scene();
  scene.add(mesh);

  // Die Leinwand ist etwas größer als der Bildrahmen (Platz zum Drehen); die Kamera
  // wird so gesetzt, dass das Foto genau den Rahmen füllt.
  const camera = new THREE.PerspectiveCamera(16, 1, 0.1, 50);
  const frameBox = host; // Rahmen des Porträts
  const resize = () => {
    const cw = canvas.clientWidth,
      ch = canvas.clientHeight,
      fh = frameBox.clientHeight || ch;
    renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch;
    const visibleH = 2 * (ch / fh); // Weltgröße der Leinwandhöhe
    const dist = visibleH / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    // Leinwand ragt nur nach oben/seitlich über den Rahmen hinaus → Mitte nach oben verschieben
    const offsetY = (visibleH - 2) / 2;
    camera.position.set(0, offsetY, dist);
    camera.lookAt(0, offsetY, 0);
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(() => {
    resize();
    if (reduce) renderer.render(scene, camera);
  });
  ro.observe(canvas);
  resize();

  // Eingaben
  const pointer = { x: 0, y: 0, last: -1e9 };
  const onMove = (e: PointerEvent) => {
    const r = frameBox.getBoundingClientRect();
    // relativ zum Kopf: Maus links vom Kopf → schaut nach links
    pointer.x = Math.max(
      -1,
      Math.min(1, (e.clientX - (r.left + r.width / 2)) / (win.innerWidth / 2)),
    );
    pointer.y = Math.max(
      -1,
      Math.min(1, (e.clientY - (r.top + r.height * 0.35)) / (win.innerHeight / 2)),
    );
    pointer.last = performance.now();
  };
  win.addEventListener('pointermove', onMove, { passive: true });
  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(canvas);

  // Nur eine leichte Bewegung: ≈ 6° zur Seite, ≈ 2° hoch/runter
  const MAX_YAW = 0.1,
    MAX_PITCH = 0.035;
  const cur = { x: 0, y: 0 };
  let raf = 0;
  const frame = (t: number) => {
    raf = win.requestAnimationFrame(frame);
    if (!visible) return;
    const idle = t - pointer.last > 2500;
    const tx = idle ? Math.sin(t / 2600) * 0.6 : pointer.x;
    const ty = idle ? Math.sin(t / 3900) * 0.3 : pointer.y;
    cur.x += (tx - cur.x) * 0.07;
    cur.y += (ty - cur.y) * 0.07;
    uniforms.uRot.value.set(cur.x * MAX_YAW, cur.y * MAX_PITCH);
    renderer.render(scene, camera);
  };
  if (reduce) renderer.render(scene, camera);
  else raf = win.requestAnimationFrame(frame);

  return {
    destroy() {
      win.cancelAnimationFrame(raf);
      win.removeEventListener('pointermove', onMove);
      ro.disconnect();
      io.disconnect();
      geo.dispose();
      mat.dispose();
      map.dispose();
      renderer.dispose();
    },
  };
}
