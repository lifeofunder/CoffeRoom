"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  AdditiveBlending,
  Box3,
  Clock,
  Color,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  InstancedMesh,
  MathUtils,
  MeshPhysicalMaterial,
  Object3D,
  Plane,
  PointLight,
  PMREMGenerator,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  LinearFilter,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useTheme } from "next-themes";
import { ArrowRight, Mail, Menu, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

class X {
  #config: any;
  #resizeObserver?: ResizeObserver;
  #intersectionObserver?: IntersectionObserver;
  #resizeTimer?: number;
  #animationFrameId: number = 0;
  #clock: Clock = new Clock();
  #animationState = { elapsed: 0, delta: 0 };
  #isAnimating: boolean = false;
  #isVisible: boolean = false;
  #maxFps: number = 60;
  #lastFrameMs: number = 0;
  canvas: HTMLCanvasElement;
  camera: PerspectiveCamera;
  scene: Scene;
  renderer: WebGLRenderer;
  size: any = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
  onBeforeRender: (state: { elapsed: number; delta: number }) => void = () => {};
  onAfterResize: (size: any) => void = () => {};

  constructor(config: any) {
    this.#config = config;
    this.#maxFps = typeof this.#config.maxFps === "number" && this.#config.maxFps > 0 ? this.#config.maxFps : 60;
    this.canvas = this.#config.canvas;
    this.camera = new PerspectiveCamera(50, 1, 0.1, 100);
    this.scene = new Scene();
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      powerPreference: "high-performance",
      alpha: true,
      // antialias на слабых устройствах резко роняет FPS
      antialias: false,
      ...this.#config.rendererOptions,
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.canvas.style.display = "block";
    this.#initObservers();
    this.resize();
  }

  #initObservers() {
    const parentEl = this.#config.size === "parent" ? (this.canvas.parentNode as Element) : null;
    if (parentEl) {
      this.#resizeObserver = new ResizeObserver(this.#onResize.bind(this));
      this.#resizeObserver.observe(parentEl);
    } else {
      window.addEventListener("resize", this.#onResize.bind(this));
    }
    this.#intersectionObserver = new IntersectionObserver(this.#onIntersection.bind(this), { threshold: 0 });
    this.#intersectionObserver.observe(this.canvas);
    document.addEventListener("visibilitychange", this.#onVisibilityChange.bind(this));
  }

  #onResize() {
    if (this.#resizeTimer) clearTimeout(this.#resizeTimer);
    this.#resizeTimer = window.setTimeout(this.resize.bind(this), 100);
  }

  resize() {
    const parentEl = this.#config.size === "parent" ? (this.canvas.parentNode as HTMLElement) : null;
    const w = parentEl ? parentEl.offsetWidth : window.innerWidth;
    const h = parentEl ? parentEl.offsetHeight : window.innerHeight;
    this.size.width = w;
    this.size.height = h;
    this.size.ratio = w / h;
    this.camera.aspect = this.size.ratio;
    this.camera.updateProjectionMatrix();
    const fovRad = (this.camera.fov * Math.PI) / 180;
    this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.z;
    this.size.wWidth = this.size.wHeight * this.camera.aspect;
    this.renderer.setSize(w, h);
    const maxPixelRatio =
      typeof this.#config.maxPixelRatio === "number" && this.#config.maxPixelRatio > 0 ? this.#config.maxPixelRatio : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
    this.onAfterResize(this.size);

    // Ensure animation starts for window-fixed canvas.
    if (this.#config.size === "window") {
      this.#isAnimating = true;
      this.#startAnimation();
    }
  }

  #onIntersection(e: any) {
    // For viewport-fixed canvas (size="window") we keep animation running.
    // IntersectionObserver can occasionally report "not intersecting" on refresh,
    // which results in the moon disappearing until the next scroll/reflow.
    if (this.#config.size === "window") {
      this.#isAnimating = true;
      this.#startAnimation();
      return;
    }

    this.#isAnimating = e[0].isIntersecting;
    this.#isAnimating ? this.#startAnimation() : this.#stopAnimation();
  }

  #onVisibilityChange() {
    if (this.#isAnimating) document.hidden ? this.#stopAnimation() : this.#startAnimation();
  }

  #startAnimation() {
    if (this.#isVisible) return;
    this.#isVisible = true;
    this.#clock.start();
    this.#lastFrameMs = performance.now();
    const f = () => {
      this.#animationFrameId = requestAnimationFrame(f);
      const now = performance.now();
      const minFrameMs = 1000 / this.#maxFps;
      if (now - this.#lastFrameMs < minFrameMs) return;
      this.#lastFrameMs = now;

      // избегаем "скачков" после сворачивания/лагов
      this.#animationState.delta = Math.min(this.#clock.getDelta(), 1 / 30);
      this.#animationState.elapsed += this.#animationState.delta;
      this.onBeforeRender(this.#animationState);
      this.renderer.render(this.scene, this.camera);
    };
    f();
  }

  #stopAnimation() {
    if (this.#isVisible) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#isVisible = false;
      this.#clock.stop();
    }
  }

  dispose() {
    this.#stopAnimation();
    this.#resizeObserver?.disconnect();
    this.#intersectionObserver?.disconnect();
    window.removeEventListener("resize", this.#onResize.bind(this));
    document.removeEventListener("visibilitychange", this.#onVisibilityChange.bind(this));
    this.scene.clear();
    this.renderer.dispose();
  }
}

class W {
  config: any;
  positionData: Float32Array;
  velocityData: Float32Array;
  sizeData: Float32Array;
  homeData: Float32Array;
  phaseData: Float32Array;
  center: Vector3 = new Vector3();
  #rng: () => number;

  constructor(config: any) {
    this.config = config;
    const seed = typeof config.seed === "number" ? config.seed : 1;
    this.#rng = mulberry32(seed);
    this.positionData = new Float32Array(3 * config.count);
    this.velocityData = new Float32Array(3 * config.count);
    this.sizeData = new Float32Array(config.count);
    this.homeData = new Float32Array(3 * config.count);
    this.phaseData = new Float32Array(config.count);
    this.#initializePositions();
    this.setSizes();
  }

  #initializePositions() {
    const { count, maxX, maxY, maxZ } = this.config;
    this.center.toArray(this.positionData, 0);
    for (let i = 1; i < count; i++) {
      const idx = 3 * i;
      this.positionData[idx] = (this.#rng() * 2 - 1) * 2 * maxX;
      this.positionData[idx + 1] = (this.#rng() * 2 - 1) * 2 * maxY;
      this.positionData[idx + 2] = (this.#rng() * 2 - 1) * 2 * maxZ;
    }

    // "дом" для каждого шара: небольшая область парения вокруг этой точки
    this.homeData.set(this.positionData);
    for (let i = 0; i < count; i++) {
      this.phaseData[i] = this.#rng() * Math.PI * 2;
    }
  }

  setSizes() {
    const { count, size0, minSize, maxSize } = this.config;
    this.sizeData[0] = size0;
    for (let i = 1; i < count; i++) this.sizeData[i] = minSize + (maxSize - minSize) * this.#rng();
  }

  update(deltaInfo: { delta: number; elapsed?: number }) {
    const { config, center, positionData, sizeData, velocityData } = this;
    const startIdx = config.controlSphere0 ? 1 : 0;
    const t = deltaInfo.elapsed ?? 0;
    const collisionsEnabled = Boolean(config.collisions) && config.count <= 60;

    // временные векторы — чтобы не плодить GC каждый кадр
    const pos = new Vector3();
    const vel = new Vector3();
    const home = new Vector3();
    const toHome = new Vector3();
    const toCursor = new Vector3();
    const otherPos = new Vector3();
    const diff = new Vector3();

    if (config.controlSphere0) {
      pos.fromArray(positionData, 0).lerp(center, 0.1).toArray(positionData, 0);
      velocityData[0] = 0;
      velocityData[1] = 0;
      velocityData[2] = 0;
    }

    for (let i = startIdx; i < config.count; i++) {
      const base = 3 * i;
      pos.fromArray(positionData, base);
      vel.fromArray(velocityData, base);

      // 1) якорь: шар "зависает" в своей небольшой области
      const springK = config.floatSpring ?? 0.9; // больше = сильнее держится около дома
      home.fromArray(this.homeData, base);
      toHome.subVectors(home, pos).multiplyScalar(springK * deltaInfo.delta);
      vel.add(toHome);

      // 2) плавное дрожание по траектории (без постоянного падения вниз)
      const phase = this.phaseData[i] || 0;
      const floatAmp = config.floatAmplitude ?? 0.35; // "радиус" области парения (в world units)
      const floatSpeed = config.floatSpeed ?? 0.35;
      vel.x += Math.sin(t * floatSpeed + phase) * floatAmp * deltaInfo.delta;
      vel.y += Math.cos(t * floatSpeed * 0.9 + phase * 1.3) * floatAmp * 0.9 * deltaInfo.delta;
      vel.z += Math.sin(t * floatSpeed * 0.7 + phase * 0.7) * floatAmp * 0.8 * deltaInfo.delta;

      // 3) опционально: лёгкая реакция на курсор (НЕ тянет вниз)
      if (config.followCursor) {
        toCursor.subVectors(center, pos).multiplyScalar((config.cursorAttract ?? 0.05) * deltaInfo.delta);
        vel.add(toCursor);
      }

      vel.multiplyScalar(config.friction);
      vel.clampLength(0, config.maxVelocity);
      pos.add(vel);

      if (collisionsEnabled) {
        for (let j = i + 1; j < config.count; j++) {
          const otherBase = 3 * j;
          otherPos.fromArray(positionData, otherBase);
          diff.subVectors(otherPos, pos);
          const dist = diff.length();
          const sumRadius = sizeData[i] + sizeData[j];
          if (dist < sumRadius) {
            const overlap = (sumRadius - dist) * 0.5;
            diff.normalize();
            pos.addScaledVector(diff, -overlap);
            otherPos.addScaledVector(diff, overlap);
            otherPos.toArray(positionData, otherBase);
          }
        }
      }

      if (Math.abs(pos.x) + sizeData[i] > config.maxX) {
        pos.x = Math.sign(pos.x) * (config.maxX - sizeData[i]);
        vel.x *= -config.wallBounce;
      }
      if (pos.y - sizeData[i] < -config.maxY) {
        pos.y = -config.maxY + sizeData[i];
        vel.y *= -config.wallBounce;
      }
      if (Math.abs(pos.z) + sizeData[i] > config.maxZ) {
        pos.z = Math.sign(pos.z) * (config.maxZ - sizeData[i]);
        vel.z *= -config.wallBounce;
      }

      pos.toArray(positionData, base);
      vel.toArray(velocityData, base);
    }
  }
}

const U = new Object3D();
class Z extends InstancedMesh {
  config: any;
  physics: W;
  ambientLight: AmbientLight;
  light: PointLight;

  constructor(renderer: WebGLRenderer, params: any) {
    const pmrem = new PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment()).texture;
    pmrem.dispose();

    const geometry = new SphereGeometry(1, 24, 24);
    const material = new MeshPhysicalMaterial({ envMap: envTexture, ...params.materialParams });
    super(geometry, material, params.count);

    this.config = params;
    this.physics = new W(this.config);
    this.ambientLight = new AmbientLight(0xffffff, params.ambientIntensity);
    this.add(this.ambientLight);
    this.light = new PointLight(0xffffff, params.lightIntensity, 100, 1);
    this.add(this.light);
    this.setColors(this.config.colors);
  }

  setColors(colors: (string | Color)[]) {
    if (!Array.isArray(colors) || !colors.length) return;
    const colorObjs = colors.map((c) => (c instanceof Color ? c : new Color(c)));
    for (let i = 0; i < this.count; i++) this.setColorAt(i, colorObjs[i % colorObjs.length]);
    if (this.instanceColor) this.instanceColor.needsUpdate = true;
  }

  update(deltaInfo: { delta: number }) {
    this.physics.update(deltaInfo);
    for (let i = 0; i < this.count; i++) {
      U.position.fromArray(this.physics.positionData, 3 * i);
      U.scale.setScalar(this.physics.sizeData[i]);
      U.updateMatrix();
      this.setMatrixAt(i, U.matrix);
    }
    this.instanceMatrix.needsUpdate = true;
    if (this.config.controlSphere0) this.light.position.fromArray(this.physics.positionData, 0);
  }
}

const pointer = new Vector2();
function onPointerMove(e: PointerEvent) {
  pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
}

const defaultBallpitConfig = {
  count: 160,
  rendererOptions: {},
  materialParams: { metalness: 0.7, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.2 },
  minSize: 0.3,
  maxSize: 0.8,
  size0: 1.0,
  gravity: 0,
  friction: 0.998,
  wallBounce: 0.2,
  maxVelocity: 0.06,
  maxX: 10,
  maxY: 10,
  maxZ: 10,
  controlSphere0: false,
  followCursor: false,
  floatSpring: 0.9,
  floatAmplitude: 0.35,
  floatSpeed: 0.35,
  cursorAttract: 0.05,
  lightIntensity: 3,
  ambientIntensity: 1.5,
  collisions: false,
  seed: 42,
  maxPixelRatio: 1.5,
  maxFps: 60,
};

const lightColors = ["#E5E5E5", "#CCCCCC", "#B2B2B2"];
const darkColors = ["#444444", "#222222", "#111111"];

type BallpitProps = Partial<typeof defaultBallpitConfig & { colors: (string | Color)[] }>;

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
function withBasePath(p: string) {
  if (!p.startsWith("/")) return `${BASE_PATH}/${p}`;
  return `${BASE_PATH}${p}`;
}

interface InteractiveHeroProps {
  brandName?: string;
  heroTitle?: string;
  heroDescription?: string;
  emailPlaceholder?: string;
  className?: string;
  ballpitConfig?: BallpitProps;
  showChrome?: boolean;
  children?: React.ReactNode;
}

export const InteractiveHero: React.FC<InteractiveHeroProps> = ({
  brandName = "КОФЕРУМ",
  heroTitle = "Кофе и знаки судьбы",
  heroDescription = "Ежедневные «знаки судьбы» от профессионального астролога — в самом сердце Костромы.",
  emailPlaceholder = "your@email.com",
  className,
  ballpitConfig = {},
  showChrome = true,
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const devicePerf = useMemo(() => {
    if (typeof window === "undefined") return { tier: "mid" as const, reducedMotion: false, isMobileLike: false };
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    const small = window.matchMedia?.("(max-width: 640px)")?.matches ?? false;
    const touch =
      window.matchMedia?.("(hover: none) and (pointer: coarse)")?.matches ??
      // fallback: many mobile browsers report coarse pointer even if hover query unsupported
      window.matchMedia?.("(pointer: coarse)")?.matches ??
      false;
    const maxTouchPoints = typeof navigator !== "undefined" ? (navigator as any).maxTouchPoints : 0;
    const hasTouchEvents = typeof window !== "undefined" && ("ontouchstart" in window);
    const isMobileLike = Boolean(small || touch || maxTouchPoints > 0 || hasTouchEvents);
    const hc = typeof navigator !== "undefined" ? (navigator as any).hardwareConcurrency : undefined;
    const tier = reducedMotion || isMobileLike || (typeof hc === "number" && hc <= 4) ? ("low" as const) : ("mid" as const);
    return { tier, reducedMotion, isMobileLike };
  }, []);

  const config = useMemo(
    () => ({
      ...defaultBallpitConfig,
      ...ballpitConfig,
      colors: theme === "dark" ? darkColors : lightColors,
      staticBackground: false as boolean,
      // авто-адаптация под слабые устройства
      ...(devicePerf.reducedMotion
        ? { count: 0, maxFps: 1 } // почти статично и дёшево
        : devicePerf.isMobileLike
          ? {
              // mobile/touch: полностью статичный фон (без "дрожи" и без обновления физики)
              staticBackground: true,
              count: Math.min((ballpitConfig as any)?.count ?? defaultBallpitConfig.count, 44),
              maxPixelRatio: 1,
              maxFps: 1,
              floatSpring: 0,
              floatAmplitude: 0,
              floatSpeed: 0,
              cursorAttract: 0,
              followCursor: false,
              maxVelocity: 0,
              friction: 1,
              wallBounce: 0,
              collisions: false,
            }
        : devicePerf.tier === "low"
          ? {
              count: Math.min((ballpitConfig as any)?.count ?? defaultBallpitConfig.count, 44),
              maxPixelRatio: 1,
              maxFps: 40,
              // на touch-устройствах большой "float" выглядит как тряска на 30–40fps
              floatAmplitude: 0.16,
              floatSpeed: 0.22,
              maxVelocity: 0.034,
              friction: 0.995,
              wallBounce: 0.12,
            }
          : { count: Math.min((ballpitConfig as any)?.count ?? defaultBallpitConfig.count, 72), maxPixelRatio: 1.5, maxFps: 60 }),
    }),
    // важно: не завязываемся на ссылку ballpitConfig,
    // чтобы не пересоздавать сцену при каждом рендере родителя
    [theme, devicePerf.tier, devicePerf.reducedMotion, devicePerf.isMobileLike, JSON.stringify(ballpitConfig)]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // We render a rotating GLB model, so don't clamp FPS to "almost static" for touch devices
    // (previously used to avoid sphere jitter).
    const maxFps = devicePerf.reducedMotion ? 1 : devicePerf.isMobileLike ? 30 : 60;
    // When showChrome={false} we fix the canvas to the viewport so the moon stays centered on scroll.
    const sizeMode = showChrome ? "parent" : "window";
    const three = new X({ canvas, size: sizeMode, maxPixelRatio: config.maxPixelRatio, maxFps, rendererOptions: config.rendererOptions });
    three.renderer.toneMapping = ACESFilmicToneMapping;
    three.camera.position.set(0, 0, 20);

    // Environment lighting for PBR GLB materials.
    const pmrem = new PMREMGenerator(three.renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment()).texture;
    pmrem.dispose();
    three.scene.environment = envTexture;

    let mounted = true;
    let modelRoot: Object3D | null = null;
    let modelMaxDim = 1;

    const fitModelToView = (view: { wWidth: number; wHeight: number } | null) => {
      if (!modelRoot) return;
      if (!view) return;

      const minSpan = Math.min(view.wWidth, view.wHeight) * 0.78; // leave some margins
      const safeMaxDim = modelMaxDim || 1;
      const s = minSpan / safeMaxDim;
      modelRoot.scale.setScalar(s);
    };

    // Lights: enough for PBR GLB moon model.
    const ambient = new AmbientLight(0xffffff, 1.4);
    three.scene.add(ambient);
    const point = new PointLight(0xffffff, 2.6, 100, 2);
    point.position.set(10, 8, 10);
    three.scene.add(point);

    // Stars background (static particle field).
    // Keep it lightweight on mobile.
    const starsCount = devicePerf.reducedMotion || devicePerf.isMobileLike ? 450 : 900;
    const starsRadius = 80;
    const starsPositions = new Float32Array(starsCount * 3);
    const starsColors = new Float32Array(starsCount * 3);
    const rng = mulberry32((config as any)?.seed ?? 42);
    for (let i = 0; i < starsCount; i++) {
      // random point on/inside a sphere
      const u = rng();
      const v = rng();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = starsRadius * Math.cbrt(rng());
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      starsPositions[i * 3 + 0] = x;
      starsPositions[i * 3 + 1] = y;
      starsPositions[i * 3 + 2] = z;

      // Slightly varied star color + brightness for a more realistic look.
      const brightness = 0.55 + rng() * 0.75;
      const tint = rng();
      // Mostly white with a hint of cool/yellow.
      const rC = 0.95 + tint * 0.08;
      const gC = 0.98 + (1 - tint) * 0.06;
      const bC = 1.0 - tint * 0.12;
      starsColors[i * 3 + 0] = rC * brightness;
      starsColors[i * 3 + 1] = gC * brightness;
      starsColors[i * 3 + 2] = bC * brightness;
    }
    const starsGeometry = new BufferGeometry();
    starsGeometry.setAttribute("position", new BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute("color", new BufferAttribute(starsColors, 3));

    // Star sprite texture to turn "pixels" into glowing points.
    const starSprite = document.createElement("canvas");
    starSprite.width = 64;
    starSprite.height = 64;
    const ctx = starSprite.getContext("2d");
    if (ctx) {
      const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0.0, "rgba(255,255,255,1)");
      grd.addColorStop(0.25, "rgba(255,255,255,0.85)");
      grd.addColorStop(0.55, "rgba(255,255,255,0.25)");
      grd.addColorStop(1.0, "rgba(255,255,255,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 64, 64);
    }
    const starTexture = new CanvasTexture(starSprite);
    starTexture.colorSpace = SRGBColorSpace;
    starTexture.needsUpdate = true;

    const starsMaterial = new PointsMaterial({
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      // Additive looks like glow.
      blending: AdditiveBlending,
      alphaTest: 0.01,
      size: devicePerf.reducedMotion || devicePerf.isMobileLike ? 0.7 : 1.0,
      sizeAttenuation: true,
    });
    const stars = new Points(starsGeometry, starsMaterial);
    three.scene.add(stars);

    const gltfLoader = new GLTFLoader();
    const modelUrl = withBasePath("/models/moon.glb");
    gltfLoader.load(
      modelUrl,
      (gltf) => {
        if (!mounted) return;
        modelRoot = gltf.scene;
        // Center model so its bounding box center sits at origin.
        const box = new Box3().setFromObject(modelRoot);
        const center = box.getCenter(new Vector3());
        modelRoot.position.sub(center);

        const size = box.getSize(new Vector3());
        modelMaxDim = Math.max(size.x, size.y, size.z) || 1;

        // Initial fit using current view.
        fitModelToView({ wWidth: three.size.wWidth, wHeight: three.size.wHeight });

        modelRoot.rotation.set(0, 0, 0);
        three.scene.add(modelRoot);

        // Force an immediate render so the moon appears even if the RAF loop
        // hasn't started yet (IntersectionObserver timing on refresh).
        three.renderer.render(three.scene, three.camera);
      },
      undefined,
      () => {
        // If model fails to load, keep empty scene (no hard crash).
      }
    );

    const rotateSpeed = 0.12; // slow rotation around its axis
    three.onBeforeRender = ({ elapsed }) => {
      if (!modelRoot) return;
      // rotate around its local Y axis
      modelRoot.rotation.y = elapsed * rotateSpeed;
    };

    // Render at least once even before GLB load completes.
    three.renderer.render(three.scene, three.camera);

    // Keep model perfectly centered and fully visible after any resize.
    three.onAfterResize = (size) => {
      fitModelToView(size);
    };

    return () => {
      mounted = false;
      if (modelRoot) three.scene.remove(modelRoot);
      three.scene.remove(stars);
      starsGeometry.dispose();
      (starsMaterial as PointsMaterial).map?.dispose?.();
      three.scene.remove(ambient);
      three.scene.remove(point);
      three.dispose();
    };
  }, [config, showChrome]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // noop demo handler
    // eslint-disable-next-line no-console
    console.log("Email submitted:", email);
  };

  return (
    <div className={cn("relative w-full overflow-hidden bg-background", showChrome ? "h-screen" : "min-h-[520px]", className)}>
      <canvas
        ref={canvasRef}
        className={cn(
          "z-0 pointer-events-none",
          showChrome ? "absolute inset-0 w-full h-full" : "fixed inset-0 w-screen h-screen"
        )}
      />

      {showChrome ? (
        <>
          <header className="relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between gap-4">
              <a href="#" className="font-bold text-2xl text-foreground tracking-tight">
                {brandName}
              </a>
              <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <a href="#about" className="hover:text-foreground px-3 py-2 transition-colors rounded-md">
                  О нас
                </a>
                <a href="#sign" className="hover:text-foreground px-3 py-2 transition-colors rounded-md">
                  Знак
                </a>
                <a href="#contacts" className="hover:text-foreground px-3 py-2 transition-colors rounded-md">
                  Контакты
                </a>
              </nav>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="bg-secondary/50 hover:bg-secondary flex-shrink-0 p-2.5 rounded-full transition-colors"
                  aria-label="Переключить тему"
                >
                  <Sun className="h-5 w-5 text-foreground dark:hidden" />
                  <Moon className="h-5 w-5 text-foreground hidden dark:block" />
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2.5"
                  aria-label="Открыть меню"
                >
                  <Menu className="h-6 w-6 text-foreground" />
                </button>
              </div>
            </div>
          </header>

          <main className="relative z-10 flex h-[calc(100%-100px)] items-center justify-center text-center px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl text-foreground font-bold tracking-tighter">{heroTitle}</h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">{heroDescription}</p>
              <form
                onSubmit={handleEmailSubmit}
                className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
              >
                <div className="relative w-full">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder={emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary/50 border border-transparent hover:border-border/50 focus:border-border text-foreground placeholder-muted-foreground font-medium pl-11 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-full font-semibold transition-colors flex items-center justify-center gap-2 flex-shrink-0"
                >
                  Получить <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </main>

          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-0 left-0 w-full h-full bg-background/80 backdrop-blur-sm z-20">
              <div className="absolute top-24 right-8 p-4 bg-card border shadow-lg rounded-xl w-56">
                <nav className="flex flex-col gap-2 text-muted-foreground font-medium">
                  <a
                    href="#about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:text-foreground px-3 py-2 text-sm transition-colors rounded-lg"
                  >
                    О нас
                  </a>
                  <a
                    href="#sign"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:text-foreground px-3 py-2 text-sm transition-colors rounded-lg"
                  >
                    Знак
                  </a>
                  <a
                    href="#contacts"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:text-foreground px-3 py-2 text-sm transition-colors rounded-lg"
                  >
                    Контакты
                  </a>
                </nav>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="relative z-10 h-full">
          {children}
        </div>
      )}
    </div>
  );
};

