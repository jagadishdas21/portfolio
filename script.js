// Safe, modern JS for the dark/light mode toggle and a couple helpers.
// This file replaces your previous script.js. It keeps behavior but avoids errors
// if optional elements are missing, and it persists the chosen mode.

(function(){
  const modeToggle = document.getElementById('modeToggle');
  const body = document.body;
  const STORAGE_KEY = 'jeddy_mode';

  // Initialize from localStorage if available
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark') {
    body.classList.add('dark-mode');
    if (modeToggle) modeToggle.textContent = 'Light Mode';
  } else {
    body.classList.remove('dark-mode');
    if (modeToggle) modeToggle.textContent = 'Dark Mode';
  }

  // Toggle handler (defensive - only attach if element exists)
  if (modeToggle) {
    modeToggle.addEventListener('click', () => {
      body.classList.toggle('dark-mode');
      const isDark = body.classList.contains('dark-mode');
      modeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
      // persist preference
      try { localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light'); } catch(e){}
    });
  }

  // Mailto anchor: ensure mailto is encoded and robust if you add a message field later.
  // Your HTML already contains the mailto href; this just ensures we don't break if element id's change.
  const emailAnchor = document.querySelector('.send-email-btn[href^="mailto:"]');
  if (emailAnchor) {
    // keep the existing mailto but ensure encoding is safe
    // parse current href, rebuild safely
    try {
      const url = new URL(emailAnchor.href);
      // nothing to change now; if you later add a message field, you can update body param here.
      // Example: url.searchParams.set('body', encodeURIComponent('Hello Jagadish...'));
      emailAnchor.href = url.toString();
    } catch (e) {
      // not a real URL (maybe mailto), so recreate mailto safely:
      const raw = emailAnchor.getAttribute('href') || '';
      if (raw.startsWith('mailto:')) {
        // try not to break it
        emailAnchor.setAttribute('href', raw);
      }
    }
  }

  // Auto-resize search-input if present (keeps central behavior but capped for aesthetics)
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    const adjust = () => {
      searchInput.style.height = 'auto';
      const h = Math.min(searchInput.scrollHeight, 120);
      searchInput.style.height = h + 'px';
    };
    searchInput.addEventListener('input', adjust);
    // initial call
    adjust();
  }

  // Defensive fixes: if any old code referenced missing elements, avoid console errors
  // e.g., safe get for sendEmailLink
  const sendEmailLink = document.getElementById('sendEmailLink');
  if (sendEmailLink) {
    sendEmailLink.addEventListener('click', function(){
      const messageInput = document.getElementById('message');
      const message = messageInput ? messageInput.value : '';
      const mailtoLink = `mailto:jagadishdas.nitrkl@gmail.com?subject=${encodeURIComponent('Inquiry')}&body=${encodeURIComponent(message)}`;
      this.href = mailtoLink;
    });
  }

})();