import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  Clock,
  Color,
  DirectionalLight,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PointLight,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  WebGLRenderer
} from "three";

(() => {
  "use strict";

  const canvas = document.querySelector("[data-system-scene]");
  const frame = canvas?.closest(".hero-frame");
  if (!canvas || !frame || !window.WebGLRenderingContext) {
    frame?.classList.add("webgl-failed");
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = new Vector2();
  const pointerTarget = new Vector2();
  let visible = true;
  let renderer;

  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  } catch (_) {
    frame.classList.add("webgl-failed");
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 7.4);

  const system = new Group();
  const core = new Group();
  scene.add(system);
  system.add(core);

  const glass = new MeshPhysicalMaterial({
    color: new Color("#b7f7ff"),
    metalness: 0.02,
    roughness: 0.08,
    transmission: 0.92,
    thickness: 1.6,
    ior: 1.42,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    iridescence: 0.72,
    iridescenceIOR: 1.36,
    transparent: true,
    opacity: 0.88
  });
  const ringGlass = new MeshPhysicalMaterial({
    color: new Color("#ff4fca"),
    metalness: 0.08,
    roughness: 0.12,
    transmission: 0.68,
    thickness: 0.7,
    ior: 1.5,
    clearcoat: 1,
    transparent: true,
    opacity: 0.82
  });
  const innerMaterial = new MeshPhysicalMaterial({
    color: new Color("#3159ff"),
    emissive: new Color("#162a88"),
    emissiveIntensity: 1.15,
    metalness: 0.35,
    roughness: 0.2,
    clearcoat: 0.9
  });
  const wireMaterial = new MeshBasicMaterial({
    color: new Color("#c8ff00"),
    wireframe: true,
    transparent: true,
    opacity: 0.28,
    blending: AdditiveBlending
  });

  const outer = new Mesh(new IcosahedronGeometry(1.34, 2), glass);
  const inner = new Mesh(new OctahedronGeometry(0.67, 1), innerMaterial);
  const wire = new Mesh(new IcosahedronGeometry(1.55, 1), wireMaterial);
  core.add(outer, inner, wire);

  const ringA = new Mesh(new TorusGeometry(1.8, 0.045, 12, 128), ringGlass);
  ringA.rotation.set(1.18, 0.1, 0.42);
  const ringB = new Mesh(new TorusGeometry(2.15, 0.025, 10, 128), wireMaterial.clone());
  ringB.material.color.set("#00e7ff");
  ringB.material.opacity = 0.42;
  ringB.rotation.set(0.35, 1.05, -0.2);
  system.add(ringA, ringB);

  const satellites = [
    [2.1, 0.75, 0.15, "#c8ff00", 0.17],
    [-1.8, -1.25, 0.35, "#ff5b12", 0.23],
    [0.45, 2.0, -0.25, "#00e7ff", 0.13]
  ].map(([x, y, z, color, radius]) => {
    const material = new MeshPhysicalMaterial({
      color: new Color(color),
      emissive: new Color(color),
      emissiveIntensity: 0.45,
      roughness: 0.12,
      transmission: 0.35,
      clearcoat: 1
    });
    const satellite = new Mesh(new SphereGeometry(radius, 20, 20), material);
    satellite.position.set(x, y, z);
    system.add(satellite);
    return satellite;
  });

  const keyLight = new DirectionalLight("#ffffff", 4.2);
  keyLight.position.set(3.5, 4.5, 5);
  const cyanLight = new PointLight("#00e7ff", 18, 12, 2);
  cyanLight.position.set(-3, 1.5, 3);
  const magentaLight = new PointLight("#ff22c7", 15, 10, 2);
  magentaLight.position.set(2.8, -2, 2.5);
  const fillLight = new PointLight("#c8ff00", 8, 9, 2);
  fillLight.position.set(-1.5, -3, 1);
  scene.add(keyLight, cyanLight, magentaLight, fillLight);

  const setLayout = () => {
    const { width, height } = frame.getBoundingClientRect();
    const compact = height / Math.max(1, width) > 1.45;
    system.position.set(compact ? 0 : -1.25, compact ? 1.55 : 0.1, 0);
    system.scale.setScalar(compact ? 0.76 : Math.min(0.78, width / 560));
    camera.aspect = Math.max(0.1, width / Math.max(1, height));
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  const applyTheme = (theme = document.documentElement.dataset.theme || "dark") => {
    const light = theme === "light";
    renderer.toneMappingExposure = light ? 1.35 : 1.08;
    glass.color.set(light ? "#dffaff" : "#83eaff");
    glass.roughness = light ? 0.16 : 0.08;
    glass.opacity = light ? 0.72 : 0.88;
    ringGlass.color.set(light ? "#bd007f" : "#ff4fca");
    innerMaterial.color.set(light ? "#1838bd" : "#3159ff");
    innerMaterial.emissive.set(light ? "#09124b" : "#162a88");
    wireMaterial.color.set(light ? "#5c7900" : "#c8ff00");
    keyLight.color.set(light ? "#fff4dc" : "#ffffff");
    keyLight.intensity = light ? 5.4 : 4.2;
    cyanLight.intensity = light ? 11 : 18;
    magentaLight.intensity = light ? 9 : 15;
    fillLight.intensity = light ? 5 : 8;
  };

  frame.addEventListener("pointermove", (event) => {
    const rect = frame.getBoundingClientRect();
    pointerTarget.set(
      ((event.clientX - rect.left) / rect.width - 0.5) * 0.5,
      ((event.clientY - rect.top) / rect.height - 0.5) * 0.35
    );
  }, { passive: true });
  frame.addEventListener("pointerleave", () => pointerTarget.set(0, 0), { passive: true });
  window.addEventListener("portfolio-themechange", (event) => applyTheme(event.detail?.theme));

  const resizeObserver = new ResizeObserver(setLayout);
  resizeObserver.observe(frame);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: "120px" }).observe(frame);
  }

  setLayout();
  applyTheme();
  frame.classList.add("webgl-ready");

  const clock = new Clock();
  const render = () => {
    requestAnimationFrame(render);
    if (!visible && !reduceMotion.matches) return;

    const elapsed = reduceMotion.matches ? 0.8 : clock.getElapsedTime();
    pointer.lerp(pointerTarget, 0.045);
    system.rotation.y = elapsed * 0.12 + pointer.x;
    system.rotation.x = Math.sin(elapsed * 0.16) * 0.08 + pointer.y;
    core.rotation.x = elapsed * 0.18;
    core.rotation.z = elapsed * -0.12;
    inner.rotation.y = elapsed * -0.34;
    ringA.rotation.z = 0.42 + elapsed * 0.1;
    ringB.rotation.y = 1.05 - elapsed * 0.08;
    satellites.forEach((satellite, index) => {
      satellite.scale.setScalar(1 + Math.sin(elapsed * 1.2 + index * 2) * 0.12);
    });
    renderer.render(scene, camera);
  };

  render();
})();
