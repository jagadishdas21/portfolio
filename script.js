// DARK / LIGHT MODE TOGGLE WITH LOCAL STORAGE
(function () {
  const modeToggle = document.getElementById("modeToggle");
  const body = document.body;
  const STORAGE_KEY = "jeddy_mode";

  // Apply saved mode on load
  const savedMode = localStorage.getItem(STORAGE_KEY);
  if (savedMode === "dark") {
    body.classList.add("dark-mode");
    modeToggle.classList.add("dark");
  }

  // Toggle theme on click
  modeToggle?.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    modeToggle.classList.toggle("dark");
    const isDark = body.classList.contains("dark-mode");
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  });
})();

// TYPEWRITER ANIMATION
(function () {
  const roles = [
    "Dancer",
    "Content Creator",
    "Video Editor",
    "Cinematographer"
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
    } 
    else if (isDeleting && charIndex > 0) {
      charIndex--;
      setTimeout(typeEffect, eraseSpeed);
    }
    else {
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
    const mail = `mailto:jagadishdas.nitrkl@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mail;
  });
})();

// ================== SCROLL REVEAL ==================
(function() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('active');
        obs.unobserve(entry.target); // animate only once
      }
    });
  }, { threshold: 0.2 });

  reveals.forEach(el => observer.observe(el));
})();
