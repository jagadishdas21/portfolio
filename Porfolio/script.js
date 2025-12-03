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

  document.getElementById("sendEmailBtn").addEventListener("click", function (e) {
  e.preventDefault(); // prevent empty navigation

  const email = "jagadishdas.nitrkl@gmail.com";
  const subject = encodeURIComponent("Inquiry");
  const body = ""; // you can add textarea message later

  // final mailto URL
  const mailtoURL = `mailto:${email}?subject=${subject}&body=${body}`;

  // WORKS in laptops + mobile browsers
  window.location.href = mailtoURL;
});
