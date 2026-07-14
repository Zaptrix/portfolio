import {
  ACESFilmicToneMapping,
  BoxGeometry,
  Clock,
  Color,
  DirectionalLight,
  Group,
  IcosahedronGeometry,
  Mesh,
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
  const viewport = canvas?.closest(".scene-viewport");
  if (!canvas || !frame || !viewport || !window.WebGLRenderingContext) {
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
  const outer = new Mesh(new IcosahedronGeometry(1.34, 2), glass);
  const inner = new Mesh(new OctahedronGeometry(0.67, 1), innerMaterial);
  core.add(outer, inner);

  const ringA = new Mesh(new TorusGeometry(1.8, 0.045, 12, 128), ringGlass);
  ringA.rotation.set(1.18, 0.1, 0.42);
  system.add(ringA);

  const satellites = [
    [1.82, 0.76, 0.15, "#c8ff00", 0.16],
    [-1.55, -1.2, 0.35, "#ff5b12", 0.2]
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

  const projectScenes = [...document.querySelectorAll("[data-project-scene]")].map((projectCanvas, index) => {
    let projectRenderer;
    try {
      projectRenderer = new WebGLRenderer({ canvas: projectCanvas, alpha: true, antialias: true });
    } catch (_) {
      return null;
    }

    projectRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.3));
    projectRenderer.outputColorSpace = SRGBColorSpace;
    projectRenderer.toneMapping = ACESFilmicToneMapping;
    projectRenderer.toneMappingExposure = 1.2;

    const projectScene = new Scene();
    const projectCamera = new PerspectiveCamera(34, 1, 0.1, 20);
    projectCamera.position.z = 3.7;
    const projectGroup = new Group();
    projectScene.add(projectGroup);

    const shape = projectCanvas.dataset.shape;
    const geometry = shape === "torus"
      ? new TorusGeometry(0.72, 0.2, 16, 64)
      : shape === "icosahedron"
        ? new IcosahedronGeometry(0.86, 1)
        : shape === "cube"
          ? new BoxGeometry(1.28, 1.28, 1.28, 2, 2, 2)
          : new OctahedronGeometry(0.92, 1);
    const projectMaterial = new MeshPhysicalMaterial({
      color: new Color("#00e7ff"),
      emissive: new Color("#00e7ff"),
      emissiveIntensity: 0.35,
      metalness: 0.12,
      roughness: 0.12,
      transmission: 0.58,
      thickness: 0.8,
      ior: 1.4,
      clearcoat: 1,
      transparent: true,
      opacity: 0.94
    });
    const projectMesh = new Mesh(geometry, projectMaterial);
    projectGroup.add(projectMesh);

    const projectKey = new DirectionalLight("#ffffff", 3.5);
    projectKey.position.set(2, 3, 4);
    const projectGlow = new PointLight("#00e7ff", 8, 8, 2);
    projectGlow.position.set(-2, -1, 2);
    projectScene.add(projectKey, projectGlow);

    let projectVisible = true;
    const resizeProject = () => {
      const rect = projectCanvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      projectCamera.aspect = rect.width / rect.height;
      projectCamera.updateProjectionMatrix();
      projectRenderer.setSize(rect.width, rect.height, false);
    };
    const applyProjectTheme = (theme) => {
      const card = projectCanvas.closest(".project-card");
      const accent = getComputedStyle(card).getPropertyValue("--card-accent").trim() || "#00e7ff";
      const light = theme === "light";
      projectMaterial.color.set(accent);
      projectMaterial.emissive.set(accent);
      projectMaterial.emissiveIntensity = light ? 0.16 : 0.35;
      projectMaterial.roughness = light ? 0.2 : 0.12;
      projectGlow.color.set(accent);
      projectGlow.intensity = light ? 5 : 8;
      projectRenderer.toneMappingExposure = light ? 1.4 : 1.2;
    };

    new ResizeObserver(resizeProject).observe(projectCanvas);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { projectVisible = entry.isIntersecting; }, { rootMargin: "160px" }).observe(projectCanvas);
    }
    resizeProject();
    projectCanvas.classList.add("is-webgl");

    return {
      applyTheme: applyProjectTheme,
      render(elapsed) {
        if (!projectVisible) return;
        const time = reduceMotion.matches ? 0.75 + index * 0.3 : elapsed;
        projectGroup.rotation.x = time * (0.16 + index * 0.012) + index * 0.28;
        projectGroup.rotation.y = time * (0.22 + index * 0.014) + index * 0.5;
        projectRenderer.render(projectScene, projectCamera);
      }
    };
  }).filter(Boolean);

  const setLayout = () => {
    const { width, height } = viewport.getBoundingClientRect();
    const scale = Math.min(0.9, Math.max(0.58, Math.min(width, height) / 520));
    system.position.set(0, 0, 0);
    system.scale.setScalar(scale);
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
    keyLight.color.set(light ? "#fff4dc" : "#ffffff");
    keyLight.intensity = light ? 5.4 : 4.2;
    cyanLight.intensity = light ? 11 : 18;
    magentaLight.intensity = light ? 9 : 15;
    fillLight.intensity = light ? 5 : 8;
    projectScenes.forEach((projectScene) => projectScene.applyTheme(theme));
  };

  viewport.addEventListener("pointermove", (event) => {
    const rect = viewport.getBoundingClientRect();
    pointerTarget.set(
      ((event.clientX - rect.left) / rect.width - 0.5) * 0.5,
      ((event.clientY - rect.top) / rect.height - 0.5) * 0.35
    );
  }, { passive: true });
  viewport.addEventListener("pointerleave", () => pointerTarget.set(0, 0), { passive: true });
  window.addEventListener("portfolio-themechange", (event) => applyTheme(event.detail?.theme));

  const resizeObserver = new ResizeObserver(setLayout);
  resizeObserver.observe(viewport);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: "120px" }).observe(viewport);
  }

  setLayout();
  applyTheme();
  frame.classList.add("webgl-ready");

  const clock = new Clock();
  const render = () => {
    requestAnimationFrame(render);
    const elapsed = reduceMotion.matches ? 0.8 : clock.getElapsedTime();
    if (visible || reduceMotion.matches) {
      pointer.lerp(pointerTarget, 0.045);
      system.rotation.y = elapsed * 0.12 + pointer.x;
      system.rotation.x = Math.sin(elapsed * 0.16) * 0.08 + pointer.y;
      core.rotation.x = elapsed * 0.18;
      core.rotation.z = elapsed * -0.12;
      inner.rotation.y = elapsed * -0.34;
      ringA.rotation.z = 0.42 + elapsed * 0.1;
      satellites.forEach((satellite, index) => {
        satellite.scale.setScalar(1 + Math.sin(elapsed * 1.2 + index * 2) * 0.12);
      });
      renderer.render(scene, camera);
    }
    projectScenes.forEach((projectScene) => projectScene.render(elapsed));
  };

  render();
})();
