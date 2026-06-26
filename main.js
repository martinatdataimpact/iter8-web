// ─────────────────────────────────────────────
// iter8.se — Shared JavaScript
// ─────────────────────────────────────────────

// ── Animated SVG background (same as original) ──
const path1 = document.getElementById('fluid');
const path2 = document.getElementById('fluid-2');

let time = 0;

function animateFluid() {
  time += 0.005;

  if (path1) {
    const points = [];
    for (let x = 0; x <= 100; x += 2) {
      const y = 30 + Math.sin(x * 0.05 + time) * 15 + Math.cos(time * 0.5) * 5;
      points.push(`${x},${y}`);
    }
    let d = `M0,100 L0,${points[0].split(',')[1]} `;
    for (let i = 1; i < points.length; i++) d += `L${points[i]} `;
    d += 'L100,100 Z';
    path1.setAttribute('d', d);
  }

  if (path2) {
    const points = [];
    for (let x = 0; x <= 100; x += 2) {
      const y = 45 + Math.sin(x * 0.03 - time) * 20 + Math.sin(time) * 10;
      points.push(`${x},${y}`);
    }
    let d = `M0,100 L0,${points[0].split(',')[1]} `;
    for (let i = 1; i < points.length; i++) d += `L${points[i]} `;
    d += 'L100,100 Z';
    path2.setAttribute('d', d);
  }

  requestAnimationFrame(animateFluid);
}

animateFluid();

// ── Navbar scroll state ──
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ── Mobile menu toggle ──
const toggle = document.getElementById('nav-toggle');
const links = document.getElementById('nav-links');

if (toggle && links) {
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });

  // Close menu on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
}

// ── Scroll reveal (Intersection Observer) ──
const revealEls = document.querySelectorAll('.reveal');

if (revealEls.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));
}

// ── Email signup handler (same Google Sheets endpoint) ──
function handleSignup(e) {
  e.preventDefault();
  const email = document.getElementById('signup-email').value.trim();
  if (!email) return false;

  fetch('https://script.google.com/macros/s/AKfycbx6OuZpeCFDUPBGqIYXpw9_AOE9OliaoWi35ci3EiNxlDCkoJ1ErmhZujVb9K-83TQo/exec', {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ email }),
  }).catch(() => {});

  document.getElementById('signup-form').hidden = true;
  document.getElementById('signup-thanks').hidden = false;

  // Track signup event
  if (typeof gtag === 'function') {
    gtag('event', 'signup', { event_category: 'engagement', event_label: 'email_signup' });
  }

  return false;
}

// ── Stat counter animation ──
const statNumbers = document.querySelectorAll('.stat-number');

if (statNumbers.length > 0) {
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const final = el.textContent;
          const numMatch = final.match(/^(\d+)/);

          if (numMatch) {
            const target = parseInt(numMatch[1], 10);
            const suffix = final.replace(numMatch[1], '');
            const duration = 1200;
            const start = performance.now();

            function tick(now) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
              const current = Math.round(target * eased);
              el.textContent = current + suffix;
              if (progress < 1) requestAnimationFrame(tick);
            }

            requestAnimationFrame(tick);
          }

          statObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach(el => statObserver.observe(el));
}

// ── Prova-väljare (self-service-app) ──
const buildBtn = document.getElementById('selector-build');
if (buildBtn) {
  buildBtn.addEventListener('click', () => {
    const foot = document.querySelector('.selector-foot');
    const status = document.getElementById('selector-status');
    const bar = document.getElementById('selector-bar');
    const text = document.getElementById('selector-status-text');
    const operator = document.getElementById('sel-operator').value;
    const line = document.getElementById('sel-line').value;

    foot.hidden = true;
    status.hidden = false;
    status.classList.remove('done');
    bar.style.width = '0%';

    const phases = [
      'Hämtar realtidsdata …',
      'Kopplar till vägnätet …',
      'Bygger din app …',
    ];

    let pct = 0;
    const interval = setInterval(() => {
      pct += 7 + Math.random() * 11;

      if (pct >= 100) {
        clearInterval(interval);
        bar.style.width = '100%';
        status.classList.add('done');
        status.innerHTML =
          '<div class="selector-check">✓</div>' +
          '<p>Din app för <strong>' + operator + ' · ' + line + '</strong> är redo</p>' +
          '<a href="#" class="btn btn-primary">Öppna appen →</a>';
        return;
      }

      bar.style.width = pct + '%';
      const idx = Math.min(phases.length - 1, Math.floor(pct / (100 / phases.length)));
      text.textContent = phases[idx];
    }, 320);
  });
}
