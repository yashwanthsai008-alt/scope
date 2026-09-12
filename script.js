/* ================================================================
   SCOPE CLUB — script.js  (3D Premium Redesign)

   TABLE OF CONTENTS
   1.  DOM References
   2.  Theme Toggle
   3.  Scroll Progress Bar
   4.  Navbar — shadow + active link
   5.  Hamburger / Mobile Menu
   6.  Smooth Scrolling
   7.  Scroll Reveal (IntersectionObserver)
   8.  ★ 3D SCOPE Wordmark — mouse tilt
   9.  Hero Particle Canvas
   10. Hero Chip Parallax
   11. Terminal Typer Animation
   12. Animated Stat Counters
   13. Timeline Line Reveal
   14. Resource Category Filter
   15. Custom Cursor
   16. Contact Form Handler
   17. Scroll-to-Top Button
   18. Footer Year
   19. Unified Scroll Handler
   20. Init
================================================================ */

'use strict';

/* ================================================================
   1. DOM REFERENCES
================================================================ */

const html         = document.documentElement;
const navbar       = document.getElementById('navbar');
const hamburger    = document.getElementById('hamburger');
const mobileMenu   = document.getElementById('mobileMenu');
const themeToggle  = document.getElementById('themeToggle');
const scrollBar    = document.getElementById('scrollProgress');
const contactForm  = document.getElementById('contactForm');
const formSuccess  = document.getElementById('formSuccess');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const footerYear   = document.getElementById('footerYear');
const terminalBody = document.getElementById('terminalBody');
const heroCanvas   = document.getElementById('heroCanvas');
const scopeCursor  = document.getElementById('scopeCursor');
const cursorCore   = document.getElementById('cursorCore');
const cursorOrbit  = document.getElementById('cursorOrbit');
const cursorTrail  = document.getElementById('cursorTrail');
const cursorScan   = document.getElementById('cursorScan');
const cursorRipple = document.getElementById('cursorRipple');
const scopeScene   = document.getElementById('scopeScene');  // 3D tilt target
const heroExploreBtn = document.getElementById('heroExploreBtn');

const navLinks     = document.querySelectorAll('.nav-link');
const mobileLinks  = document.querySelectorAll('.mobile-nav-link');
const revealEls    = document.querySelectorAll('.reveal');
const sections     = document.querySelectorAll('section[id]:not(#stats):not(#tech-stack):not(#why-join)');
const statCards    = document.querySelectorAll('.stat-card');
const filterBtns   = document.querySelectorAll('.filter-btn');
const resCards     = document.querySelectorAll('.res-card');


/* ================================================================
   2. THEME TOGGLE
   Reads localStorage on load; saves on toggle.
================================================================ */

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('scopeTheme', theme);
}

function toggleTheme() {
  applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

function loadTheme() {
  applyTheme(localStorage.getItem('scopeTheme') || 'dark');
}

if (themeToggle) themeToggle.addEventListener('click', toggleTheme);


/* ================================================================
   3. SCROLL PROGRESS BAR
================================================================ */

function updateScrollProgress() {
  if (!scrollBar) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
}


/* ================================================================
   4. NAVBAR — SHADOW & ACTIVE LINK
================================================================ */

function handleNavbarScroll() {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 24);
}

function setActiveLink(id) {
  navLinks.forEach(l =>
    l.classList.toggle('active', l.getAttribute('href') === `#${id}`)
  );
}

const sectionObserver = new IntersectionObserver(
  entries => entries.forEach(e => e.isIntersecting && setActiveLink(e.target.id)),
  { threshold: 0.25, rootMargin: `-${68}px 0px -40% 0px` }
);
sections.forEach(s => sectionObserver.observe(s));


/* ================================================================
   5. HAMBURGER / MOBILE MENU
================================================================ */

function openMenu() {
  hamburger.classList.add('open');
  mobileMenu.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileMenu.setAttribute('aria-hidden', 'false');
}

function closeMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
}

if (hamburger) {
  hamburger.addEventListener('click', () =>
    hamburger.classList.contains('open') ? closeMenu() : openMenu()
  );
}

mobileLinks.forEach(l => l.addEventListener('click', closeMenu));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && hamburger?.classList.contains('open')) closeMenu();
});

document.addEventListener('click', e => {
  if (hamburger?.classList.contains('open') && navbar && !navbar.contains(e.target))
    closeMenu();
});


/* ================================================================
   6. SMOOTH SCROLLING
   Intercepts all in-page anchor clicks; offsets for sticky nav.
================================================================ */

document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href === '#') return;
  const target = document.getElementById(href.slice(1));
  if (!target) return;
  e.preventDefault();
  const offset = (navbar?.offsetHeight || 68) + 8;
  window.scrollTo({
    top: target.getBoundingClientRect().top + window.pageYOffset - offset,
    behavior: 'smooth'
  });
});


/* ================================================================
   7. SCROLL REVEAL (IntersectionObserver)
   Elements with .reveal animate in on viewport entry.
   Hero children are excluded — they use CSS keyframe animations.
================================================================ */

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('revealed');
      /* Stagger direct children (grid items, timeline items) */
      Array.from(el.children).forEach((child, i) => {
        child.style.transitionDelay = `${i * 75}ms`;
      });
      revealObserver.unobserve(el);
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
);

revealEls.forEach(el => {
  if (el.closest('.hero')) return; // hero uses CSS keyframes
  revealObserver.observe(el);
});


/* ================================================================
   8. ★ 3D SCOPE WORDMARK — MOUSE TILT
   On desktop, the hero section listens for mouse movement.
   Normalised cursor position (-0.5 → +0.5) is mapped to
   --rx (rotateX) and --ry (rotateY) CSS custom properties on
   the .scope-scene element, creating a subtle gyroscope effect.

   Design limits:
     rotateX: ± 12°  (up/down head-tilt)
     rotateY: ± 16°  (left/right)
   Default resting tilt (no mouse): rotateX=8°, rotateY=-4°
   — a slight downward angle that enhances 3D depth at rest.

   Disabled on:
     • Mobile / touch devices (matchMedia max-width 768px)
     • Users who prefer reduced motion
================================================================ */

(function init3DTilt() {
  /* Guard: skip on mobile and reduced-motion */
  if (window.matchMedia('(max-width: 768px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!scopeScene) return;

  const hero = document.getElementById('home');
  if (!hero) return;

  /* Tilt limits in degrees */
  const MAX_RX = 12;
  const MAX_RY = 16;
  /* Default resting angles when mouse is not over hero */
  const REST_RX =  8;
  const REST_RY = -4;

  /* Current smooth values (lerp target) */
  let targetRx = REST_RX;
  let targetRy = REST_RY;
  let targetMx = 50;
  let targetMy = 50;
  /* Current rendered values */
  let currentRx = REST_RX;
  let currentRy = REST_RY;
  let currentMx = 50;
  let currentMy = 50;
  let rafTilt = null;
  let isHovering = false;

  /* Apply CSS variables to the scene element */
  function applyTilt(rx, ry, mx = 50, my = 50) {
    const degX = rx.toFixed(2) + 'deg';
    const degY = ry.toFixed(2) + 'deg';

    /* Set rotation variables for all supported naming conventions */
    scopeScene.style.setProperty('--rotate-x', degX);
    scopeScene.style.setProperty('--rotate-y', degY);
    scopeScene.style.setProperty('--rotateX', degX);
    scopeScene.style.setProperty('--rotateY', degY);
    scopeScene.style.setProperty('--rx', degX);
    scopeScene.style.setProperty('--ry', degY);

    /* Subtle depth scale depending on movement intensity */
    const dist = Math.min(Math.sqrt(rx * rx + ry * ry) / 20, 1);
    const depthVal = (1 + dist * 0.08).toFixed(3);
    scopeScene.style.setProperty('--depth', depthVal);

    /* Dynamic shared specular light hotspot across both SCOPE and CLUB */
    const lx = ((ry / MAX_RY + 1) * 50).toFixed(1) + '%';
    const ly = ((-rx / MAX_RX + 1) * 50).toFixed(1) + '%';
    scopeScene.style.setProperty('--light-x', lx);
    scopeScene.style.setProperty('--light-y', ly);
    scopeScene.style.setProperty('--lightX', lx);
    scopeScene.style.setProperty('--lightY', ly);

    /* Mouse coordinates percentage */
    scopeScene.style.setProperty('--mouse-x', `${mx.toFixed(1)}%`);
    scopeScene.style.setProperty('--mouse-y', `${my.toFixed(1)}%`);

    /* Also update the halo brightness and position subtly */
    const halo = document.querySelector('.hero-halo');
    if (halo) {
      /* Shift halo position slightly with the tilt */
      const hx = 50 + ry * 0.8; // percent
      const hy = 46 - rx * 0.5;
      halo.style.background = `radial-gradient(ellipse at ${hx}% ${hy}%,
        rgba(59,130,246,0.24) 0%,
        rgba(139,92,246,0.14) 40%,
        transparent 70%)`;
    }
  }

  /* Smooth interpolation loop */
  function tiltLoop() {
    const lerpSpeed = isHovering ? 0.10 : 0.05; // faster response on hover, slow return

    currentRx += (targetRx - currentRx) * lerpSpeed;
    currentRy += (targetRy - currentRy) * lerpSpeed;
    currentMx += (targetMx - currentMx) * lerpSpeed;
    currentMy += (targetMy - currentMy) * lerpSpeed;

    applyTilt(currentRx, currentRy, currentMx, currentMy);

    /* Keep looping while values haven't settled */
    const dRx = Math.abs(targetRx - currentRx);
    const dRy = Math.abs(targetRy - currentRy);
    if (dRx > 0.01 || dRy > 0.01) {
      rafTilt = requestAnimationFrame(tiltLoop);
    } else {
      /* Snap to final value and stop */
      currentRx = targetRx;
      currentRy = targetRy;
      currentMx = targetMx;
      currentMy = targetMy;
      applyTilt(currentRx, currentRy, currentMx, currentMy);
      rafTilt = null;
    }
  }

  function startTiltLoop() {
    if (!rafTilt) rafTilt = requestAnimationFrame(tiltLoop);
  }

  /* Mouse move handler */
  hero.addEventListener('mousemove', e => {
    isHovering = true;
    const rect = hero.getBoundingClientRect();
    /* Normalise to -0.5 … +0.5 */
    const nx = (e.clientX - rect.left)  / rect.width  - 0.5;
    const ny = (e.clientY - rect.top)   / rect.height - 0.5;
    /* Map to rotation angles */
    targetRy =  nx * MAX_RY * 2;       // left = negative (tilt left)
    targetRx = -ny * MAX_RX * 2;       // up = positive (lean forward)
    targetMx = (nx + 0.5) * 100;
    targetMy = (ny + 0.5) * 100;
    startTiltLoop();
  });

  /* Enhanced direct 3D Logo proximity response */
  const scopeWrapper = document.getElementById('scope3d');
  if (scopeWrapper) {
    scopeWrapper.addEventListener('mousemove', e => {
      isHovering = true;
      const sRect = scopeWrapper.getBoundingClientRect();
      const snx = (e.clientX - sRect.left) / sRect.width - 0.5;
      const sny = (e.clientY - sRect.top) / sRect.height - 0.5;
      /* Heightened, tighter tilt and specular highlight directly under cursor */
      targetRy = snx * MAX_RY * 2.2;
      targetRx = -sny * MAX_RX * 2.2;
      targetMx = (snx + 0.5) * 100;
      targetMy = (sny + 0.5) * 100;
      startTiltLoop();
    });
  }

  /* On mouse leave: return to rest position */
  hero.addEventListener('mouseleave', () => {
    isHovering = false;
    targetRx = REST_RX;
    targetRy = REST_RY;
    targetMx = 50;
    targetMy = 50;
    startTiltLoop();
  });

  /* Set initial rest tilt immediately */
  applyTilt(REST_RX, REST_RY, 50, 50);
})();


/* ================================================================
   9. HERO PARTICLE CANVAS
   Lightweight canvas particles with connecting lines.
   Disabled on mobile and reduced-motion.
================================================================ */

(function initParticles() {
  if (!heroCanvas) return;
  if (window.matchMedia('(max-width: 768px)').matches) {
    heroCanvas.style.display = 'none'; return;
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroCanvas.style.display = 'none'; return;
  }

  const ctx = heroCanvas.getContext('2d');
  let W, H, particles = [], raf = null;
  let heroMouse = { x: -1000, y: -1000 };

  const COUNT    = 52;
  const MAX_DIST = 115;
  const SPEED    = 0.30;

  const heroElem = heroCanvas.parentElement;
  if (heroElem) {
    heroElem.addEventListener('mousemove', e => {
      const rect = heroCanvas.getBoundingClientRect();
      heroMouse.x = e.clientX - rect.left;
      heroMouse.y = e.clientY - rect.top;
    });
    heroElem.addEventListener('mouseleave', () => {
      heroMouse.x = -1000;
      heroMouse.y = -1000;
    });
  }

  function resize() {
    const hero = heroCanvas.parentElement;
    W = heroCanvas.width  = hero.offsetWidth;
    H = heroCanvas.height = hero.offsetHeight;
  }

  function Particle() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * SPEED;
    this.vy = (Math.random() - 0.5) * SPEED;
    this.r  = Math.random() * 1.6 + 0.7;
    const palette = ['rgba(96,165,250,', 'rgba(167,139,250,', 'rgba(34,211,238,'];
    this.base = palette[Math.floor(Math.random() * palette.length)];
  }

  Particle.prototype.update = function () {
    /* Subtle mouse repulsion */
    const mdx = this.x - heroMouse.x;
    const mdy = this.y - heroMouse.y;
    const md = Math.sqrt(mdx * mdx + mdy * mdy);
    if (md < 90 && md > 0) {
      const force = ((90 - md) / 90) * 0.75;
      this.x += (mdx / md) * force;
      this.y += (mdy / md) * force;
    }

    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  };

  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.base + '0.7)';
    ctx.fill();
  };

  function spawn() {
    particles = [];
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());
  }

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d > MAX_DIST) continue;
        const alpha = (1 - d / MAX_DIST) * 0.16;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(96,165,250,${alpha})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    connect();
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(animate);
  }

  /* Pause when hero scrolls out of view */
  const heroVis = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (!raf) raf = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(raf); raf = null;
    }
  }, { threshold: 0 });
  heroVis.observe(heroCanvas.parentElement);

  resize(); spawn();
  raf = requestAnimationFrame(animate);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); spawn(); }, 200);
  });
})();


/* ================================================================
   10. HERO CHIP PARALLAX
   The floating code chips shift slightly with mouse movement.
   Separate from the 3D tilt — adds another depth layer.
   Desktop only.
================================================================ */

(function initChipParallax() {
  if (window.matchMedia('(max-width: 768px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const chips = document.querySelectorAll('.chip');
  const orbs  = document.querySelectorAll('.orb');
  const hero  = document.getElementById('home');
  if (!hero || !chips.length) return;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const nx = (e.clientX - rect.left)  / rect.width  - 0.5;
    const ny = (e.clientY - rect.top)   / rect.height - 0.5;

    chips.forEach((chip, i) => {
      const depth = (i % 3 + 1) * 4;
      chip.style.transform = `translateY(${ny * depth * -1}px) translateX(${nx * depth}px)`;
    });

    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 7;
      orb.style.transform = `translate(${nx * depth}px, ${ny * depth}px)`;
    });
  });

  hero.addEventListener('mouseleave', () => {
    chips.forEach(c => (c.style.transform = ''));
    orbs.forEach(o  => (o.style.transform = ''));
  });
})();


/* ================================================================
   10b. INTERACTIVE CARD 3D TILT & SPOTLIGHT
   Calculates mouse position relative to cards for dynamic
   --card-rx, --card-ry, --mouse-x, and --mouse-y CSS variables.
   Disabled on mobile and prefers-reduced-motion.
================================================================ */

(function initCardTilt() {
  if (window.matchMedia('(max-width: 768px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const tiltCards = document.querySelectorAll('.bento-card, .acard, .identity-card, .why-card, .res-card');
  if (!tiltCards.length) return;

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
      card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);

      const nx = (x / rect.width) - 0.5;
      const ny = (y / rect.height) - 0.5;

      const maxTilt = 6; // degrees
      const rx = (-ny * maxTilt).toFixed(2);
      const ry = (nx * maxTilt).toFixed(2);

      card.style.setProperty('--card-rx', `${rx}deg`);
      card.style.setProperty('--card-ry', `${ry}deg`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--card-rx', '0deg');
      card.style.setProperty('--card-ry', '0deg');
    });
  });
})();


/* ================================================================
   11. TERMINAL TYPER ANIMATION
   Typing effect in the hero terminal card.
================================================================ */

(function initTerminal() {
  if (!terminalBody) return;

  const script = [
    { type: 'prompt',  text: 'join scope',                 delay: 400 },
    { type: 'output',  text: 'Initializing student...',    delay: 700 },
    { type: 'output',  text: 'Connecting to community...', delay: 650 },
    { type: 'success', text: 'Access granted ✓',           delay: 550 },
    { type: 'success', text: 'Welcome to SCOPE CLUB 🚀',   delay: 350 },
  ];

  let lineIdx  = 0;
  let charIdx  = 0;
  let currEl   = null;
  let cursorEl = null;

  function makeCursor() {
    const c = document.createElement('span');
    c.className = 'term-cursor';
    c.setAttribute('aria-hidden', 'true');
    return c;
  }

  function startLine() {
    if (lineIdx >= script.length) return;
    const item = script[lineIdx];
    const line = document.createElement('div');
    line.className = 'term-line';

    if (item.type === 'prompt') {
      const p = document.createElement('span');
      p.className = 'term-prompt'; p.textContent = '$ ';
      line.appendChild(p);
      const c = document.createElement('span');
      c.className = 'term-cmd';
      line.appendChild(c);
      currEl = c;
    } else if (item.type === 'output') {
      const p = document.createElement('span');
      p.className = 'term-out'; p.textContent = '> ';
      line.appendChild(p);
      const c = document.createElement('span');
      line.appendChild(c);
      currEl = c;
    } else {
      currEl = document.createElement('span');
      currEl.className = 'term-success';
      line.appendChild(currEl);
    }

    if (cursorEl?.parentNode) cursorEl.parentNode.removeChild(cursorEl);
    cursorEl = makeCursor();
    line.appendChild(cursorEl);
    terminalBody.appendChild(line);
    terminalBody.scrollTop = terminalBody.scrollHeight;

    charIdx = 0;
    setTimeout(typeChar, item.delay);
  }

  function typeChar() {
    const text = script[lineIdx].text;
    if (charIdx < text.length) {
      currEl.textContent += text[charIdx++];
      terminalBody.scrollTop = terminalBody.scrollHeight;
      setTimeout(typeChar, 42 + Math.random() * 38);
    } else {
      lineIdx++;
      setTimeout(startLine, 270);
    }
  }

  setTimeout(startLine, 900);
})();


/* ================================================================
   12. ANIMATED STAT COUNTERS
   Counts from 0 to target when scrolled into view.
   Uses ease-out cubic interpolation for a premium feel.
================================================================ */

function animateCounter(el) {
  const target   = parseInt(el.getAttribute('data-target'), 10);
  const suffix   = el.getAttribute('data-suffix') || '';
  const duration = 1800;
  const start    = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target + suffix;
      el.closest('.stat-card')?.classList.add('counted');
    }
  }

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const numEl = entry.target.querySelector('.stat-number');
      if (numEl && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(numEl);
      }
      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.4 }
);
statCards.forEach(card => counterObserver.observe(card));


/* ================================================================
   13. TIMELINE LINE REVEAL
   The vertical glowing line inside .timeline animates in
   when the timeline section scrolls into view.
================================================================ */

const timelineEl = document.querySelector('.timeline');
if (timelineEl) {
  const tlObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        tlObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.15 }
  );
  tlObserver.observe(timelineEl);
}


/* ================================================================
   14. RESOURCE CATEGORY FILTER
   Show / hide resource cards by data-category attribute.
================================================================ */

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    resCards.forEach(card => {
      const match = filter === 'all' || card.getAttribute('data-category') === filter;
      if (match) {
        card.classList.remove('hidden');
        /* Re-trigger entrance animation */
        card.style.animation = 'none';
        void card.offsetHeight; // force reflow
        card.style.animation = '';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});


/* ================================================================
   15. SIGNATURE SCOPE FUTURISTIC INTERACTIVE CURSOR
   Orbital HUD Energy System:
   - High-precision Lerp physics: Core, Orbit, Trailing Ring, 4 Particles
   - Velocity tracking & smooth directional orbit stretch (no angle snapping)
   - Proximity magnetic element attraction with smooth micro-displacement
   - Card scanning radar sweep with dynamic surface reflection
   - 3D SCOPE & CLUB logo celestial coupling
   - Contextual state machine (hover-button, hover-link, hover-card, hover-logo, idle)
   - Clean 380ms expanding UI click ripple feedback & instant wake-up
   - Mobile / coarse touch & reduced-motion safeguards
================================================================ */

(function initSignatureCursor() {
  /* Guard: Disable on touch devices or small screens */
  if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768) return;
  if (!scopeCursor || !cursorCore || !cursorOrbit || !cursorTrail) return;

  scopeCursor.style.display = 'block';
  document.body.classList.add('custom-cursor-active');

  const p1 = scopeCursor.querySelector('.cursor-particle.p1');
  const p2 = scopeCursor.querySelector('.cursor-particle.p2');
  const p3 = scopeCursor.querySelector('.cursor-particle.p3');
  const p4 = scopeCursor.querySelector('.cursor-particle.p4');
  const scanLayer = cursorScan || scopeCursor.querySelector('.cursor-scan');

  let rawMouseX = -200, rawMouseY = -200;
  let targetX   = -200, targetY   = -200;
  let coreX     = -200, coreY     = -200;
  let orbitX    = -200, orbitY    = -200;
  let trailX    = -200, trailY    = -200;
  let scanX     = -200, scanY     = -200;

  let prevMouseX = -200, prevMouseY = -200;
  let vx = 0, vy = 0, speed = 0, filteredSpeed = 0;
  let currentOrbitAngle = 0;

  let activeMagneticEl = null;
  let idleTimer = null;
  let isIdle = false;
  let currentState = 'default';

  /* 4 Micro Energy Particles with alternating harmonic orbits */
  const particles = [
    { el: p1, x: -200, y: -200, lerp: 0.088, radius: 15, speed: 0.0028, phase: 0 },
    { el: p2, x: -200, y: -200, lerp: 0.068, radius: 21, speed: -0.0021, phase: 1.8 },
    { el: p3, x: -200, y: -200, lerp: 0.052, radius: 27, speed: 0.0025, phase: 3.6 },
    { el: p4, x: -200, y: -200, lerp: 0.060, radius: 18, speed: -0.0019, phase: 5.1 }
  ];

  /* --------------------------------------------------
     Main Animation Loop (Single requestAnimationFrame)
  -------------------------------------------------- */
  function cursorLoop(timestamp) {
    const now = timestamp || performance.now();

    /* 1. Velocity & Momentum Calculation */
    vx = rawMouseX - prevMouseX;
    vy = rawMouseY - prevMouseY;
    speed = Math.hypot(vx, vy);
    filteredSpeed += (speed - filteredSpeed) * 0.20;
    prevMouseX = rawMouseX;
    prevMouseY = rawMouseY;

    /* 2. Magnetic Attraction Calculation */
    if (activeMagneticEl && document.body.contains(activeMagneticEl)) {
      const rect = activeMagneticEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = rawMouseX - centerX;
      const dy = rawMouseY - centerY;
      const dist = Math.hypot(dx, dy);
      const magneticRadius = Math.max(rect.width, rect.height) * 0.70 + 44;

      if (dist < magneticRadius) {
        const pullFactor = Math.pow(1 - dist / magneticRadius, 1.3) * 0.40;
        targetX = rawMouseX - dx * pullFactor;
        targetY = rawMouseY - dy * pullFactor;

        /* Subtle displacement on the interactive element (clamped to 5px max) */
        const maxShift = 5;
        const shiftX = Math.max(-maxShift, Math.min(maxShift, -dx * 0.12)).toFixed(1);
        const shiftY = Math.max(-maxShift, Math.min(maxShift, -dy * 0.12)).toFixed(1);
        activeMagneticEl.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
      } else {
        activeMagneticEl.style.transform = '';
        if (activeMagneticEl.classList.contains('magnetic-active')) {
          activeMagneticEl.classList.remove('magnetic-active');
        }
        activeMagneticEl = null;
        targetX = rawMouseX;
        targetY = rawMouseY;
      }
    } else {
      targetX = rawMouseX;
      targetY = rawMouseY;
    }

    /* 3. Core: Ultra-responsive follow (lerp factor 0.82) */
    coreX += (targetX - coreX) * 0.82;
    coreY += (targetY - coreY) * 0.82;
    cursorCore.style.transform = `translate3d(${coreX.toFixed(1)}px, ${coreY.toFixed(1)}px, 0)`;

    /* 4. Orbit: Smooth follow with dynamic velocity stretch */
    orbitX += (targetX - orbitX) * 0.44;
    orbitY += (targetY - orbitY) * 0.44;

    if (filteredSpeed > 1.2 && !isIdle && currentState !== 'hover-logo') {
      const targetAngle = Math.atan2(vy, vx) * (180 / Math.PI);
      let diffAngle = (targetAngle - currentOrbitAngle) % 360;
      if (diffAngle > 180) diffAngle -= 360;
      if (diffAngle < -180) diffAngle += 360;
      currentOrbitAngle += diffAngle * 0.20;

      const stretchX = (1 + Math.min(filteredSpeed * 0.012, 0.30)).toFixed(2);
      const stretchY = (1 - Math.min(filteredSpeed * 0.007, 0.16)).toFixed(2);
      cursorOrbit.style.transform = `translate3d(${orbitX.toFixed(1)}px, ${orbitY.toFixed(1)}px, 0) rotate(${currentOrbitAngle.toFixed(1)}deg) scale(${stretchX}, ${stretchY})`;
    } else {
      cursorOrbit.style.transform = `translate3d(${orbitX.toFixed(1)}px, ${orbitY.toFixed(1)}px, 0)`;
    }

    /* 5. Trailing Ring: Fluid lagging inertia (lerp factor 0.13) */
    trailX += (targetX - trailX) * 0.13;
    trailY += (targetY - trailY) * 0.13;
    cursorTrail.style.transform = `translate3d(${trailX.toFixed(1)}px, ${trailY.toFixed(1)}px, 0)`;

    /* 6. Card Scanning Layer */
    if (scanLayer) {
      scanX += (targetX - scanX) * 0.35;
      scanY += (targetY - scanY) * 0.35;
      scanLayer.style.transform = `translate3d(${scanX.toFixed(1)}px, ${scanY.toFixed(1)}px, 0)`;
    }

    /* 7. Energy Particles: Orbital harmonic lag & speed-driven visibility */
    const pOpacity = isIdle ? 0 : Math.min(Math.max((filteredSpeed - 0.35) / 2.8, 0), 0.90);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!p.el) continue;

      const orbitAngle = now * p.speed + p.phase;
      const offX = Math.cos(orbitAngle) * p.radius;
      const offY = Math.sin(orbitAngle) * p.radius;

      p.x += (trailX + offX - p.x) * p.lerp;
      p.y += (trailY + offY - p.y) * p.lerp;

      p.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
      p.el.style.opacity   = pOpacity.toFixed(2);
    }

    requestAnimationFrame(cursorLoop);
  }
  requestAnimationFrame(cursorLoop);

  /* --------------------------------------------------
     Mouse Movement & Idle Tracking
  -------------------------------------------------- */
  document.addEventListener('mousemove', e => {
    rawMouseX = e.clientX;
    rawMouseY = e.clientY;

    if (isIdle) {
      isIdle = false;
      scopeCursor.removeAttribute('data-idle');
      scopeCursor.setAttribute('data-state', currentState);
    }

    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      isIdle = true;
      scopeCursor.setAttribute('data-idle', 'true');
      if (currentState === 'default') {
        scopeCursor.setAttribute('data-state', 'idle');
      }
    }, 2400);

    /* Dynamic Card Scanning Surface Reflection */
    if (currentState === 'hover-card') {
      const card = e.target.closest('.bento-card, .acard, .why-card, .res-card, .event-card, .contact-form-wrap');
      if (card) {
        const cRect = card.getBoundingClientRect();
        const cx = ((e.clientX - cRect.left) / cRect.width * 100).toFixed(1) + '%';
        const cy = ((e.clientY - cRect.top) / cRect.height * 100).toFixed(1) + '%';
        card.style.setProperty('--card-scan-x', cx);
        card.style.setProperty('--card-scan-y', cy);
      }
    }
  }, { passive: true });

  /* --------------------------------------------------
     Click Ripple Feedback
  -------------------------------------------------- */
  function triggerRipple(x, y) {
    if (!cursorRipple) return;
    cursorRipple.style.transform = `translate3d(${x}px, ${y}px, 0) scale(0.3)`;
    cursorRipple.classList.remove('animate');
    void cursorRipple.offsetWidth; // Reflow trigger
    cursorRipple.classList.add('animate');
  }

  document.addEventListener('pointerdown', e => {
    triggerRipple(e.clientX, e.clientY);
  }, { passive: true });

  /* --------------------------------------------------
     Contextual Cursor State Detection
  -------------------------------------------------- */
  const magneticSelector = '.btn, #heroExploreBtn, .nav-link, .tech-badge, .filter-btn, .social-link, .footer-link, .theme-toggle';

  document.addEventListener('mouseover', e => {
    const target = e.target;

    /* 3D SCOPE & CLUB Logo hover */
    if (target.closest('.scope-3d-wrapper, .scope-3d-group, #scopeScene, .scope-word-3d, .club-word-3d')) {
      currentState = 'hover-logo';
      scopeCursor.setAttribute('data-state', 'hover-logo');
      return;
    }

    /* Button hover */
    if (target.closest('.btn, button, .theme-toggle, [role="button"]')) {
      currentState = 'hover-button';
      scopeCursor.setAttribute('data-state', 'hover-button');
      const mag = target.closest(magneticSelector);
      if (mag) {
        activeMagneticEl = mag;
        if (mag.id === 'heroExploreBtn') {
          mag.classList.add('magnetic-active');
        }
      }
      return;
    }

    /* Card hover (Bento, About, Why, Resources, Events) */
    if (target.closest('.bento-card, .acard, .identity-card, .why-card, .res-card, .event-card, .contact-form-wrap')) {
      currentState = 'hover-card';
      scopeCursor.setAttribute('data-state', 'hover-card');
      return;
    }

    /* Link / Nav hover */
    if (target.closest('a, .nav-link, .footer-link, .social-link, input, textarea, select')) {
      currentState = 'hover-link';
      scopeCursor.setAttribute('data-state', 'hover-link');
      const mag = target.closest(magneticSelector);
      if (mag) activeMagneticEl = mag;
      return;
    }
  });

  document.addEventListener('mouseout', e => {
    const rel = e.relatedTarget;
    if (!rel || !rel.closest('a, button, .btn, .bento-card, .acard, .identity-card, .res-card, .why-card, .event-card, .contact-form-wrap, .scope-3d-wrapper, .scope-3d-group, #scopeScene, input, textarea, select')) {
      currentState = 'default';
      scopeCursor.setAttribute('data-state', 'default');
    }

    if (activeMagneticEl && (!rel || !rel.closest(magneticSelector) || rel.closest(magneticSelector) !== activeMagneticEl)) {
      activeMagneticEl.style.transform = '';
      if (activeMagneticEl.classList.contains('magnetic-active')) {
        activeMagneticEl.classList.remove('magnetic-active');
      }
      activeMagneticEl = null;
    }
  });

  /* --------------------------------------------------
     Special "EXPLORE SCOPE →" Interaction
  -------------------------------------------------- */
  if (heroExploreBtn) {
    heroExploreBtn.addEventListener('click', e => {
      e.preventDefault();
      triggerRipple(e.clientX, e.clientY);
      const targetSection = document.getElementById('about');
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* --------------------------------------------------
     Viewport Boundary & Window Focus Handling
  -------------------------------------------------- */
  document.addEventListener('mouseleave', () => {
    scopeCursor.style.opacity = '0';
    if (activeMagneticEl) {
      activeMagneticEl.style.transform = '';
      if (activeMagneticEl.classList.contains('magnetic-active')) {
        activeMagneticEl.classList.remove('magnetic-active');
      }
      activeMagneticEl = null;
    }
  });

  document.addEventListener('mouseenter', () => {
    scopeCursor.style.opacity = '1';
  });

  window.addEventListener('blur', () => {
    scopeCursor.style.opacity = '0';
    if (activeMagneticEl) {
      activeMagneticEl.style.transform = '';
      if (activeMagneticEl.classList.contains('magnetic-active')) {
        activeMagneticEl.classList.remove('magnetic-active');
      }
      activeMagneticEl = null;
    }
  });

  window.addEventListener('focus', () => {
    scopeCursor.style.opacity = '1';
  });
})();


/* ================================================================
   16. CONTACT FORM HANDLER
   Static site — validates and shows success message.
   No data is sent anywhere.
================================================================ */

function showSuccess() {
  if (!formSuccess || !contactForm) return;
  const btn = contactForm.querySelector('button[type="submit"]');
  if (btn) btn.disabled = true;
  formSuccess.classList.add('visible');
  formSuccess.setAttribute('aria-hidden', 'false');
  setTimeout(() => contactForm.reset(), 800);
  setTimeout(() => {
    formSuccess.classList.remove('visible');
    formSuccess.setAttribute('aria-hidden', 'true');
    if (btn) btn.disabled = false;
  }, 6000);
}

function validateForm() {
  const name  = document.getElementById('formName');
  const email = document.getElementById('formEmail');
  const msg   = document.getElementById('formMessage');
  [name, email, msg].forEach(f => f && (f.style.borderColor = ''));
  if (!name?.value.trim())                          { name?.focus();  return false; }
  if (!email?.value.trim() || !email.validity.valid){ email?.focus(); return false; }
  if (!msg?.value.trim())                           { msg?.focus();   return false; }
  return true;
}

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    if (validateForm()) showSuccess();
  });
}


/* ================================================================
   17. SCROLL-TO-TOP BUTTON
================================================================ */

function handleScrollTop() {
  if (!scrollTopBtn) return;
  scrollTopBtn.classList.toggle('visible', window.scrollY > 450);
}

if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
}


/* ================================================================
   18. FOOTER YEAR
================================================================ */

function setYear() {
  if (footerYear) footerYear.textContent = new Date().getFullYear();
}


/* ================================================================
   19. UNIFIED SCROLL HANDLER
   Single passive listener combines all scroll-dependent work.
================================================================ */

function handleHeroScrollTransition() {
  const hero = document.getElementById('home');
  if (!hero) return;
  const heroHeight = hero.offsetHeight || 800;
  const scrollY = window.scrollY;
  const ratio = Math.min(Math.max(scrollY / (heroHeight * 0.85), 0), 1);
  document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
  document.documentElement.style.setProperty('--scroll-ratio', ratio.toFixed(3));
}

function onScroll() {
  updateScrollProgress();
  handleNavbarScroll();
  handleScrollTop();
  handleHeroScrollTransition();
}

window.addEventListener('scroll', onScroll, { passive: true });


/* ================================================================
   20. INIT
================================================================ */

function init() {
  loadTheme();
  setYear();
  onScroll(); // sync initial state

  console.log('✅ SCOPE Club — 3D redesign initialized.');
}

document.addEventListener('DOMContentLoaded', init);
