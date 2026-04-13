document.addEventListener("DOMContentLoaded", () => {
  const menuIcon = document.getElementById("menuIcon");
  const navLinks = document.getElementById("navLinks");
  const modeToggle = document.getElementById("modeToggle");
  const sunIcon = document.getElementById("sunIcon");
  const moonIcon = document.getElementById("moonIcon");
  const body = document.body;
  const profilePics = document.querySelectorAll(".profile-pic");
  const STORAGE_KEY = "jeddy_mode";
  const LIGHT_PROFILE_SRC = "images/home.png";
  const DARK_PROFILE_SRC = "images/home.png";
  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setProfileSrc = (isDark) => {
    if (!profilePics.length) return;
    const src = isDark ? DARK_PROFILE_SRC : LIGHT_PROFILE_SRC;
    profilePics.forEach((img) => {
      img.src = src;
    });
  };

  // ================== ACTIVE NAV LINK ==================
  if (navLinks) {
    const page = window.location.pathname.split("/").pop().toLowerCase() || "index.html";
    navLinks.querySelectorAll("a").forEach((link) => {
      const href = (link.getAttribute("href") || "").toLowerCase();
      if (href && href === page) {
        link.classList.add("active");
      }
    });
  }

  // ================== PREFETCH INTERNAL PAGES (ON DEMAND) ==================
  (function () {
    const shouldPrefetch = () => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!connection) return true;
      if (connection.saveData) return false;
      const type = String(connection.effectiveType || "").toLowerCase();
      if (type.includes("2g")) return false;
      return true;
    };

    if (!shouldPrefetch()) return;

    const seen = new Set();

    const addPrefetch = (href) => {
      if (!href || seen.has(href)) return;
      if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "document";
      link.href = href;
      document.head.appendChild(link);
      seen.add(href);
    };

    const getInternalHref = (link) => {
      try {
        const url = new URL(link.getAttribute("href"), window.location.href);
        if (url.origin !== window.location.origin) return null;
        if (url.protocol !== "http:" && url.protocol !== "https:") return null;
        const path = url.pathname.split("/").pop() || "index.html";
        if (!path.endsWith(".html")) return null;
        if (url.href === window.location.href) return null;
        return path;
      } catch {
        return null;
      }
    };

    const warmPrefetch = (link) => {
      const href = getInternalHref(link);
      if (!href) return;
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => addPrefetch(href), { timeout: 800 });
      } else {
        window.setTimeout(() => addPrefetch(href), 300);
      }
    };

    document.querySelectorAll('a[href$=".html"]').forEach((link) => {
      link.addEventListener("pointerenter", () => warmPrefetch(link), { passive: true });
      link.addEventListener("focus", () => warmPrefetch(link));
      link.addEventListener("touchstart", () => warmPrefetch(link), { passive: true });
    });
  })();

  // ================== PAGE TRANSITIONS (ENTER/EXIT) ==================
  (function () {
    const root = document.documentElement;

    const parseMs = (value, fallback) => {
      if (!value) return fallback;
      const v = String(value).trim();
      if (!v) return fallback;
      if (v.endsWith("ms")) return Number.parseFloat(v);
      if (v.endsWith("s")) return Number.parseFloat(v) * 1000;
      return fallback;
    };

    if (prefersReducedMotion) {
      root.classList.remove("page-enter", "page-enter-active", "page-leaving");
      return;
    }

    if (root.classList.contains("page-enter")) {
      requestAnimationFrame(() => root.classList.add("page-enter-active"));
      const enterDur = parseMs(
        getComputedStyle(root).getPropertyValue("--page-enter-dur"),
        700
      );
      window.setTimeout(() => {
        root.classList.remove("page-enter", "page-enter-active");
      }, enterDur + 60);
    }

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.hasAttribute("download")) return;
      const target = link.getAttribute("target");
      if (target && target !== "_self") return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url;
      try {
        url = new URL(link.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (!url.pathname.endsWith(".html")) return;
      if (url.href === window.location.href) return;

      event.preventDefault();
      root.classList.add("page-leaving");

      const exitDur = parseMs(
        getComputedStyle(root).getPropertyValue("--page-exit-dur"),
        300
      );

      window.setTimeout(() => {
        window.location.href = url.href;
      }, exitDur);
    });
  })();

  // ================== DARK / LIGHT MODE ==================
  if (modeToggle && sunIcon && moonIcon) {
    // Apply saved theme (default to dark)
    const savedMode = localStorage.getItem(STORAGE_KEY);
    const startDark = savedMode !== "light";
    body.classList.toggle("dark-mode", startDark);
    setProfileSrc(startDark);
    // Show the opposite mode icon as the action affordance.
    sunIcon.style.opacity = startDark ? "1" : "0";
    moonIcon.style.opacity = startDark ? "0" : "1";

    // Toggle theme
    modeToggle.addEventListener("click", () => {
      const isDark = body.classList.toggle("dark-mode");
      sunIcon.style.opacity = isDark ? "1" : "0";
      moonIcon.style.opacity = isDark ? "0" : "1";
      localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
      setProfileSrc(isDark);
    });
  }

  // ================== HAMBURGER MOBILE MENU ==================
  if (menuIcon && navLinks) {
    const setMenuState = (open) => {
      navLinks.classList.toggle("show", open);
      menuIcon.classList.toggle("active", open);
      menuIcon.setAttribute("aria-expanded", String(open));
      body.classList.toggle("menu-open", open);
    };

    setMenuState(false);

    menuIcon.addEventListener("click", () => {
      const isOpen = navLinks.classList.contains("show");
      setMenuState(!isOpen);
    });

    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        setMenuState(false);
      });
    });

    document.addEventListener("click", (event) => {
      const clickedInsideMenu = navLinks.contains(event.target);
      const clickedMenuIcon = menuIcon.contains(event.target);
      if (!clickedInsideMenu && !clickedMenuIcon) {
        setMenuState(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuState(false);
      }
    });
  }

  // ================== TYPEWRITER (HOME HERO) ==================
  (function () {
    const typeEl = document.getElementById("typewriter");
    if (!typeEl) return;

    const wordsAttr = typeEl.getAttribute("data-words");
    const words = (wordsAttr ? wordsAttr.split("|") : ["Video Editor", "Cinematographer"])
      .map((word) => word.trim())
      .filter(Boolean);

    if (!words.length) return;
    if (prefersReducedMotion) {
      typeEl.textContent = words[0];
      return;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 85;
    const deleteSpeed = 55;
    const pauseDelay = 1200;

    const tick = () => {
      const currentWord = words[wordIndex];
      if (!isDeleting) {
        charIndex += 1;
        typeEl.textContent = currentWord.slice(0, charIndex);
        if (charIndex === currentWord.length) {
          isDeleting = true;
          window.setTimeout(tick, pauseDelay);
          return;
        }
      } else {
        charIndex -= 1;
        typeEl.textContent = currentWord.slice(0, charIndex);
        if (charIndex === 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }

      window.setTimeout(tick, isDeleting ? deleteSpeed : typingSpeed);
    };

    tick();
  })();

  // ================== SCROLL REVEAL ==================
  (function () {
    const reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;

    document.documentElement.classList.add("js-reveal");

    if (prefersReducedMotion) {
      reveals.forEach((el) => el.classList.add("active"));
      return;
    }

    reveals.forEach((el, index) => {
      const customDelay = el.getAttribute("data-reveal-delay");
      if (customDelay) {
        el.style.setProperty("--reveal-delay", customDelay);
        return;
      }
      const delay = Math.min(index, 8) * 80;
      el.style.setProperty("--reveal-delay", `${delay}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );

    reveals.forEach((el) => observer.observe(el));
  })();

  // ================== CONTACT APP LINKS ==================
  (function () {
    const appLinks = document.querySelectorAll("[data-app-link-ios], [data-app-link-android], [data-fallback-link]");
    if (!appLinks.length) return;

    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    const isMobile = isIOS || isAndroid;

    appLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const fallbackLink = link.getAttribute("data-fallback-link") || link.getAttribute("href");
        const forceWeb = link.getAttribute("data-force-web") === "true";
        const appLink = isIOS
          ? (link.getAttribute("data-app-link-ios") || link.getAttribute("data-app-link"))
          : (link.getAttribute("data-app-link-android") || link.getAttribute("data-app-link"));

        if (!fallbackLink) return;

        event.preventDefault();

        const openInNewTab = link.getAttribute("target") === "_blank";

        if (forceWeb || !isMobile || !appLink) {
          if (openInNewTab) {
            window.open(fallbackLink, "_blank", "noopener,noreferrer");
          } else {
            window.location.href = fallbackLink;
          }
          return;
        }

        const fallbackDelay = 900;
        let fallbackTimer;

        const cancelFallback = () => {
          if (fallbackTimer) {
            window.clearTimeout(fallbackTimer);
          }
        };

        fallbackTimer = window.setTimeout(() => {
          if (openInNewTab) {
            window.open(fallbackLink, "_blank", "noopener,noreferrer");
          } else {
            window.location.href = fallbackLink;
          }
        }, fallbackDelay);

        const cancelOnHidden = () => {
          if (document.hidden) {
            cancelFallback();
          }
        };

        window.addEventListener("pagehide", cancelFallback, { once: true });
        window.addEventListener("blur", cancelFallback, { once: true });
        document.addEventListener("visibilitychange", cancelOnHidden, { once: true });

        window.location.href = appLink;
      });
    });
  })();

  // ================== FILM FILTERS ==================
  (function () {
    const filterBar = document.querySelector(".film-filters");
    if (!filterBar) return;

    const buttons = filterBar.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".film-card[data-category]");

    const applyFilter = (filter) => {
      cards.forEach((card) => {
        const category = card.getAttribute("data-category");
        const show = filter === "all" || category === filter;
        card.classList.toggle("is-hidden", !show);
      });
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-filter");
        buttons.forEach((b) => {
          b.classList.toggle("active", b === btn);
          b.setAttribute("aria-selected", String(b === btn));
        });
        applyFilter(filter);
      });
    });

    applyFilter("all");
  })();

  // ================== FILM POSTER TO PLAYER ==================
  (function () {
    const wraps = document.querySelectorAll(".film-player-wrap[data-video-id]");
    if (!wraps.length) return;

    wraps.forEach((wrap) => {
      const launchBtn = wrap.querySelector(".film-launch");
      const videoId = wrap.getAttribute("data-video-id");
      if (!launchBtn || !videoId) return;

      launchBtn.addEventListener("click", () => {
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
        iframe.title = "YouTube video player";
        iframe.loading = "lazy";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        wrap.innerHTML = "";
        wrap.appendChild(iframe);
      }, { once: true });
    });
  })();
});
