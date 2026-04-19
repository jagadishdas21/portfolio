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
    let timerId = null;
    let isTransitioning = false;
    const visibleDelay = 3600;
    const fadeDuration = 1100;

    typeEl.textContent = words[0];

    const queueNext = (delay = visibleDelay) => {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(swapWord, delay);
    };

    const swapWord = () => {
      if (isTransitioning) return;
      isTransitioning = true;
      typeEl.classList.add("is-fade-hidden");

      window.setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        typeEl.textContent = words[wordIndex];
        requestAnimationFrame(() => {
          typeEl.classList.remove("is-fade-hidden");
          window.setTimeout(() => {
            isTransitioning = false;
            queueNext(visibleDelay);
          }, fadeDuration);
        });
      }, fadeDuration);
    };

    queueNext(visibleDelay);
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
      const delay = Math.min(index, 8) * 65;
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
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    reveals.forEach((el) => observer.observe(el));
  })();

  // ================== CONTACT APP LINKS ==================
  (function () {
    const appLinks = document.querySelectorAll("[data-app-link-ios], [data-app-link-android], [data-fallback-link]");
    if (!appLinks.length) return;

    const ua = navigator.userAgent || navigator.vendor || window.opera || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    const isTouchDevice = window.matchMedia &&
      window.matchMedia("(hover: none), (pointer: coarse)").matches;

    appLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        if (!isTouchDevice) return;

        const href = link.getAttribute("href");
        const fallbackLink = link.getAttribute("data-fallback-link") || href;
        const iosLink = link.getAttribute("data-app-link-ios");
        const androidLink = link.getAttribute("data-app-link-android");
        const appLink = isIOS ? iosLink : (isAndroid ? androidLink : null);

        if (!fallbackLink) return;

        event.preventDefault();

        if (!appLink || appLink === fallbackLink) {
          window.location.assign(fallbackLink);
          return;
        }

        let fallbackTimer = window.setTimeout(() => {
          window.location.assign(fallbackLink);
        }, 650);

        const clearFallback = () => {
          if (!fallbackTimer) return;
          window.clearTimeout(fallbackTimer);
          fallbackTimer = null;
        };

        document.addEventListener("visibilitychange", clearFallback, { once: true });
        window.addEventListener("pagehide", clearFallback, { once: true });

        window.location.assign(appLink);
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

      window.dispatchEvent(new CustomEvent("films:layoutchange"));
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

  // ================== FILM SPOTLIGHT ==================
  (function () {
    const spotlight = document.getElementById("filmSpotlight");
    const launch = document.getElementById("filmSpotlightLaunch");
    const poster = document.getElementById("filmSpotlightPoster");
    const kicker = document.getElementById("filmSpotlightKicker");
    const screen = spotlight ? spotlight.querySelector(".film-spotlight-screen") : null;
    const title = spotlight ? spotlight.querySelector(".film-spotlight-title") : null;
    const role = spotlight ? spotlight.querySelector(".film-spotlight-role") : null;
    const cards = document.querySelectorAll(".film-card[data-category]");
    const desktopQuery = window.matchMedia("(min-width: 1025px)");
    if (!spotlight || !launch || !poster || !kicker || !title || !role || !screen || !cards.length) return;

    const launchMarkup = launch.outerHTML;

    let activeCard = null;

    const getVisibleCards = () => Array.from(cards).filter((card) => !card.classList.contains("is-hidden"));

    const restoreLaunch = () => {
      screen.innerHTML = launchMarkup;
      return screen.querySelector(".film-spotlight-launch");
    };

    const fillSpotlight = (card) => {
      if (!card) return;
      activeCard = card;

      cards.forEach((item) => item.classList.toggle("is-active", item === card));

      const posterImg = card.querySelector(".film-poster");
      const cardTitle = card.querySelector(".film-meta h3");
      const cardCategory = card.querySelector(".film-category");
      const cardRole = card.querySelector(".film-role");
      const videoId = card.querySelector(".film-player-wrap")?.getAttribute("data-video-id") || "";
      const nextLaunch = restoreLaunch();
      const nextPoster = screen.querySelector(".film-spotlight-poster");
      const nextKicker = screen.querySelector(".film-spotlight-kicker");

      if (posterImg && nextPoster) {
        nextPoster.src = posterImg.currentSrc || posterImg.src;
        nextPoster.alt = posterImg.alt || "";
      }

      title.textContent = cardTitle ? cardTitle.textContent.trim() : "Selected Project";
      if (nextKicker) {
        nextKicker.textContent = cardCategory ? cardCategory.textContent.trim() : "";
      }
      role.textContent = cardRole ? cardRole.textContent.trim() : "";
      if (nextLaunch) {
        nextLaunch.setAttribute("data-video-id", videoId);
        nextLaunch.setAttribute("aria-label", `Play ${title.textContent}`);
        nextLaunch.addEventListener("click", () => {
          const currentVideoId = nextLaunch.getAttribute("data-video-id");
          if (!currentVideoId) return;

          const iframe = document.createElement("iframe");
          iframe.src = `https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
          iframe.title = "YouTube video player";
          iframe.loading = "lazy";
          iframe.referrerPolicy = "strict-origin-when-cross-origin";
          iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
          iframe.allowFullscreen = true;
          screen.innerHTML = "";
          screen.appendChild(iframe);
        }, { once: true });
      }
    };

    cards.forEach((card) => {
      card.addEventListener("click", (event) => {
        if (!desktopQuery.matches) return;
        event.preventDefault();
        fillSpotlight(card);
      });
    });

    const syncSpotlight = () => {
      const visibleCards = getVisibleCards();
      const nextCard = visibleCards.includes(activeCard) ? activeCard : visibleCards[0];
      if (nextCard) fillSpotlight(nextCard);
    };

    window.addEventListener("films:layoutchange", syncSpotlight);
    syncSpotlight();
  })();

  // ================== DESKTOP FILM REEL ==================
  (function () {
    const reel = document.querySelector(".films-reel");
    const grid = reel ? reel.querySelector(".films-grid") : null;
    if (!reel || !grid) return;

    const desktopQuery = window.matchMedia("(min-width: 1025px)");
    const originalCards = Array.from(grid.querySelectorAll(".film-card[data-category]"));

    const clearClones = () => {
      grid.querySelectorAll(".film-card.is-clone").forEach((card) => card.remove());
      grid.classList.remove("is-marquee");
      grid.style.removeProperty("--films-marquee-shift");
      grid.style.removeProperty("--films-marquee-duration");
      grid.style.setProperty("--films-offset", "0px");
    };

    const syncMarquee = () => {
      clearClones();

      if (!desktopQuery.matches || prefersReducedMotion) return;

      const visibleCards = originalCards.filter((card) => !card.classList.contains("is-hidden"));
      if (visibleCards.length < 2) return;

      const gap = parseFloat(getComputedStyle(grid).gap || "16") || 16;
      const originalWidth = visibleCards.reduce((total, card, index) => {
        return total + card.getBoundingClientRect().width + (index ? gap : 0);
      }, 0);

      if (originalWidth <= reel.clientWidth) return;

      visibleCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.classList.add("is-clone");
        clone.classList.remove("reveal", "active", "is-active");
        clone.setAttribute("aria-hidden", "true");
        const launch = clone.querySelector(".film-launch");
        if (launch) {
          launch.setAttribute("tabindex", "-1");
        }
        grid.appendChild(clone);
      });

      const duration = Math.max(42, Math.round(originalWidth / 28));
      grid.style.setProperty("--films-marquee-shift", `${originalWidth}px`);
      grid.style.setProperty("--films-marquee-duration", `${duration}s`);
      grid.classList.add("is-marquee");
    };

    window.addEventListener("resize", () => window.requestAnimationFrame(syncMarquee));
    window.addEventListener("load", syncMarquee, { once: true });
    window.addEventListener("films:layoutchange", () => window.requestAnimationFrame(syncMarquee));

    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", syncMarquee);
    } else if (typeof desktopQuery.addListener === "function") {
      desktopQuery.addListener(syncMarquee);
    }

    syncMarquee();
  })();

  // ================== FILM POSTER TO PLAYER ==================
  (function () {
    const wraps = document.querySelectorAll(".film-player-wrap[data-video-id]");
    if (!wraps.length) return;
    const desktopSpotlight = document.getElementById("filmSpotlight");
    const desktopQuery = window.matchMedia("(min-width: 1025px)");

    wraps.forEach((wrap) => {
      wrap.dataset.posterMarkup = wrap.innerHTML;
    });

    const restoreWrap = (wrap) => {
      if (!wrap || !wrap.dataset.posterMarkup) return;
      if (!wrap.querySelector("iframe")) return;
      wrap.innerHTML = wrap.dataset.posterMarkup;
      bindLaunch(wrap);
    };

    const restoreOthers = (activeWrap) => {
      wraps.forEach((wrap) => {
        if (wrap !== activeWrap) restoreWrap(wrap);
      });
    };

    const buildIframe = (videoId) => {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
      iframe.title = "YouTube video player";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      return iframe;
    };

    function bindLaunch(wrap) {
      const launchBtn = wrap.querySelector(".film-launch");
      const videoId = wrap.getAttribute("data-video-id");
      if (!launchBtn || !videoId) return;

      launchBtn.addEventListener("click", (event) => {
        if (desktopSpotlight && desktopQuery.matches) {
          event.preventDefault();
          const card = wrap.closest(".film-card");
          if (card) {
            card.click();
          }
          return;
        }

        restoreOthers(wrap);
        const iframe = buildIframe(videoId);
        wrap.innerHTML = "";
        wrap.appendChild(iframe);
      }, { once: true });
    }

    wraps.forEach((wrap) => {
      bindLaunch(wrap);
    });
  })();
});
