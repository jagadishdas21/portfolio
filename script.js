document.addEventListener("DOMContentLoaded", () => {
  const menuIcon = document.getElementById("menuIcon");
  const navLinks = document.getElementById("navLinks");
  const modeToggle = document.getElementById("modeToggle");
  const sunIcon = document.getElementById("sunIcon");
  const moonIcon = document.getElementById("moonIcon");
  const body = document.body;
  const root = document.documentElement;
  const profilePics = document.querySelectorAll(".profile-pic");
  const STORAGE_KEY = "jeddy_mode";
  const PAGE_EXIT_MS = 1200;
  const LIGHT_PROFILE_SRC = "images/profile.jpeg";
  const DARK_PROFILE_SRC = "images/profile.jpeg";

  const setProfileSrc = (isDark) => {
    if (!profilePics.length) return;
    const src = isDark ? DARK_PROFILE_SRC : LIGHT_PROFILE_SRC;
    profilePics.forEach((img) => {
      img.src = src;
    });
  };

  // ================== PAGE ENTER ==================
  if (root.classList.contains("page-enter")) {
    requestAnimationFrame(() => {
      root.classList.add("page-enter-active");
    });
    window.setTimeout(() => {
      root.classList.remove("page-enter", "page-enter-active");
    }, PAGE_EXIT_MS);
  }

  // ================== PAGE EXIT (SMOOTH NAV) ==================
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    if (link.hasAttribute("download")) return;
    if (link.target && link.target !== "_self") return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    let targetUrl;
    try {
      targetUrl = new URL(link.href, window.location.href);
    } catch {
      return;
    }

    if (targetUrl.origin !== window.location.origin) return;
    if (targetUrl.protocol === "mailto:" || targetUrl.protocol === "tel:") return;
    if (targetUrl.href === window.location.href) return;

    event.preventDefault();

    if (root.classList.contains("page-leaving")) return;
    root.classList.add("page-leaving");

    window.setTimeout(() => {
      window.location.href = targetUrl.href;
    }, PAGE_EXIT_MS);
  });

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

  // ================== TYPEWRITER ANIMATION ==================
  (function () {
    const roles = [
      "Video Editor",
      "Cinematographer", 
      "Filmmaker"
    ];

    let index = 0;
    let charIndex = 0;
    let isDeleting = false;
    const speed = 100;
    const eraseSpeed = 60;
    const delayBetweenWords = 700;

    const typewriterEl = document.getElementById("typewriter");
    if (!typewriterEl) return;

    function typeEffect() {
      const current = roles[index];
      const visibleText = current.substring(0, charIndex);
      typewriterEl.textContent = visibleText;

      if (!isDeleting && charIndex < current.length) {
        charIndex++;
        setTimeout(typeEffect, speed);
      } else if (isDeleting && charIndex > 0) {
        charIndex--;
        setTimeout(typeEffect, eraseSpeed);
      } else {
        if (!isDeleting) {
          isDeleting = true;
          setTimeout(typeEffect, delayBetweenWords);
        } else {
          isDeleting = false;
          index = (index + 1) % roles.length;
          setTimeout(typeEffect, 200);
        }
      }
    }

    typeEffect();
  })();

  // ================== SEND EMAIL BUTTON ==================
  (function () {
    const sendEmailBtn = document.getElementById("sendEmailBtn");
    if (!sendEmailBtn) return;

    sendEmailBtn.addEventListener("click", () => {
      const subject = encodeURIComponent("Inquiry regarding services");
      const body = encodeURIComponent("Hi Jagadish,\n\nI would like to get in touch with you.");
      const mail = `mailto:hello.jeddyworks@gmail.com?subject=${subject}&body=${body}`;
      window.location.href = mail;
    });
  })();

  // ================== CONTACT GMAIL BUTTON ==================
  (function () {
    const gmailBtn = document.getElementById("gmailComposeBtn");
    if (!gmailBtn) return;

    const to = "hello.jeddyworks@gmail.com";
    const subject = "Project Inquiry";
    const body = [
      "Dear Jagadish,",
      "",
      "I hope you're doing well. I'm reaching out about a potential [project type] and would like to discuss how we can work together.",
      "",
      "Project overview:",
      "- [summary]",
      "- [requirements]",
      "",
      "Timeline: [desired timeline]",
      "Budget: [budget range, if any]",
      "",
      "Please let me know a convenient time to connect, or feel free to suggest next steps.",
      "",
      "Regards,",
      "[Your Name]"
    ].join("\n");

    const encodedTo = encodeURIComponent(to);
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSubject}&body=${encodedBody}`;
    const mailtoUrl = `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
    const gmailIosUrl = `googlegmail:///co?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`;
    const gmailAndroidIntent =
      `intent://compose?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}` +
      "#Intent;scheme=mailto;package=com.google.android.gm;end";

    gmailBtn.addEventListener("click", (event) => {
      event.preventDefault();

      const ua = navigator.userAgent || "";
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/i.test(ua);

      // Desktop/laptop: keep direct compose in Gmail web.
      if (!isIOS && !isAndroid) {
        window.open(gmailWebUrl, "_blank", "noopener,noreferrer");
        return;
      }

      // Mobile: try Gmail app first, then mailto fallback, then Gmail web.
      const fallbackToMailto = window.setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 450);

      const fallbackToWeb = window.setTimeout(() => {
        window.open(gmailWebUrl, "_blank", "noopener,noreferrer");
      }, 1100);

      const cancelFallbacks = () => {
        window.clearTimeout(fallbackToMailto);
        window.clearTimeout(fallbackToWeb);
      };

      window.addEventListener("pagehide", cancelFallbacks, { once: true });
      window.addEventListener("blur", cancelFallbacks, { once: true });

      if (isIOS) {
        window.location.href = gmailIosUrl;
        return;
      }

      window.location.href = gmailAndroidIntent;
    });
  })();

  // ================== SCROLL REVEAL ==================
  (function () {
    const reveals = Array.from(document.querySelectorAll(".reveal"));
    if (!reveals.length) return;

    root.classList.add("js-reveal");

    // Add gentle stagger for card-based sections (projects, films)
    const staggerTargets = reveals.filter((el) =>
      el.classList.contains("film-card") ||
      el.classList.contains("project-card") ||
      el.classList.contains("info-card")
    );

    staggerTargets.forEach((el, index) => {
      const delay = Math.min(index, 12) * 120;
      el.style.setProperty("--reveal-delay", `${delay}ms`);
    });

    const activate = (el) => el.classList.add("active");

    if (!("IntersectionObserver" in window)) {
      reveals.forEach(activate);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activate(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    reveals.forEach((el) => observer.observe(el));
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
