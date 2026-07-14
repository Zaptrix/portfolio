(() => {
  "use strict";

  const doc = document.documentElement;
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const themeButtons = [...document.querySelectorAll("[data-theme-choice]")];
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  doc.classList.add("js");

  const applyTheme = (preference, persist = true) => {
    const safePreference = ["system", "light", "dark"].includes(preference) ? preference : "system";
    const resolvedTheme = safePreference === "system" ? (colorScheme.matches ? "dark" : "light") : safePreference;

    doc.dataset.themePreference = safePreference;
    doc.dataset.theme = resolvedTheme;
    themeMeta?.setAttribute("content", resolvedTheme === "dark" ? "#070707" : "#f0eee7");
    themeButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === safePreference));
    });

    if (persist) {
      try { localStorage.setItem("portfolio-theme", safePreference); } catch (_) { /* Storage can be unavailable in hardened browsers. */ }
    }

    window.dispatchEvent(new CustomEvent("portfolio-themechange", {
      detail: { preference: safePreference, theme: resolvedTheme }
    }));
  };

  applyTheme(doc.dataset.themePreference || "system", false);
  themeButtons.forEach((button) => {
    button.addEventListener("click", () => applyTheme(button.dataset.themeChoice));
  });
  colorScheme.addEventListener?.("change", () => {
    if (doc.dataset.themePreference === "system") applyTheme("system", false);
  });

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const updateScrollState = () => {
    const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
    doc.style.setProperty("--scroll", Math.min(1, window.scrollY / scrollable));
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", updateScrollState, { passive: true });

  const setMenu = (open) => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute("aria-expanded", String(open));
    navigation.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };

  menuButton?.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  navigation?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  const revealNodes = [...document.querySelectorAll(".reveal")];
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.1 });

    revealNodes.forEach((node) => revealObserver.observe(node));
  }

})();
