// Keep filename lowercase: script.js
// Minimal JS that proves defer executes and DOM APIs work without unsafe patterns
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const status = document.getElementById('status');
    const cta = document.getElementById('cta');
    const title = document.getElementById('hero-title');

    if (status) status.textContent = 'Status: JS ready (DOMContentLoaded)';

    if (cta) {
      cta.addEventListener('click', () => {
        const now = new Date().toLocaleTimeString();
        status.textContent = 'Button clicked at ' + now + ' — script running fine ✅';
        title.textContent = 'CSS + JS wired. Ship mode.';
        console.log('[OK] JS click handler ran at', now);
      });
    }
  });
})();
