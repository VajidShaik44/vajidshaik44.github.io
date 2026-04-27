/* ===================================================
   script.js — Vajid Shaik Portfolio
   =================================================== */

/* ────────────────────────────────────────────────
   BOOT SCREEN
──────────────────────────────────────────────── */
(function () {
  const loader     = document.getElementById('loader');
  const bootLines  = document.getElementById('bootLines');
  const bootCursor = document.getElementById('bootCursor');

  if (!loader || !bootLines) return;

  const BOOT_LINES = [
    { html: '<span class="boot-time">[  0.000000]</span> BIOS-provided memory map: <span class="boot-ok">vajid-devops v2.0</span>',                          delay:   0 },
    { html: '<span class="boot-time">[  0.001234]</span> Loading kernel modules: <span class="boot-ok">docker</span>, <span class="boot-ok">k8s</span>, <span class="boot-ok">terraform</span>, <span class="boot-ok">nginx</span>...', delay: 220 },
    { html: '<span class="boot-time">[  0.002678]</span> Initializing <span class="boot-white">AWS/EC2</span> network interfaces...',                          delay: 460 },
    { html: '<span class="boot-time">[  0.003456]</span> Mounting <span class="boot-white">/dev/aws/ec2</span> .............................<span class="boot-ok">  [ OK ]</span>', delay: 680 },
    { html: '<span class="boot-time">[  0.004821]</span> Starting <span class="boot-white">github-actions</span> runner daemon .........<span class="boot-ok">  [ OK ]</span>',  delay: 900 },
    { html: '<span class="boot-time">[  0.005012]</span> Starting <span class="boot-white">systemd</span> services .....................<span class="boot-ok">  [ OK ]</span>',      delay: 1100 },
    { html: '<span class="boot-time">[  0.006390]</span> Mounting <span class="boot-white">kubernetes</span> cluster ...................<span class="boot-ok">  [ OK ]</span>',      delay: 1280 },
    { html: '<span class="boot-time">[  0.007891]</span> <span class="boot-ok">Portfolio initialized.</span> <span class="boot-white">Welcome.</span>',                                  delay: 1480 },
    { html: '',                                                                                                                                                 delay: 1600 },
    { html: '<span class="boot-dim">vajid@devops login:</span> <span class="boot-ok">vajid</span>',                                                             delay: 1780 },
    { html: '<span class="boot-dim">Password:</span> <span class="boot-dim">••••••••</span>',                                                                   delay: 2150 },
    { html: '',                                                                                                                                                 delay: 2400 },
    { html: '<span class="boot-dim">Last login: Sun Apr 27 2026 from 127.0.0.1</span>',                                                                        delay: 2520 },
    { html: '',                                                                                                                                                 delay: 2650 },
  ];

  BOOT_LINES.forEach(({ html, delay }) => {
    setTimeout(() => {
      const div = document.createElement('div');
      div.className = 'boot-line';
      div.innerHTML = html || '&nbsp;';
      bootLines.appendChild(div);
    }, delay);
  });

  // Fade out after last line + short hold
  const lastDelay = BOOT_LINES[BOOT_LINES.length - 1].delay;
  setTimeout(() => {
    if (bootCursor) bootCursor.style.display = 'none';
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
      initReveal();
    }, 800);
  }, lastDelay + 480);
})();


/* ────────────────────────────────────────────────
   SCROLL PROGRESS
──────────────────────────────────────────────── */
const scrollProgress = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const st = window.scrollY;
  const dh = document.documentElement.scrollHeight - window.innerHeight;
  const pct = dh > 0 ? (st / dh) * 100 : 0;
  scrollProgress.style.width = pct + '%';
}, { passive: true });


/* ────────────────────────────────────────────────
   NAVBAR
──────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
const mobileMenu = document.getElementById('mobile-menu');
const hamburger = document.getElementById('hamburger');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  highlightNav();
}, { passive: true });

hamburger && hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-link').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

function highlightNav() {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) current = section.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}


/* ────────────────────────────────────────────────
   CUSTOM CURSOR
──────────────────────────────────────────────── */
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

if (cursorDot && cursorRing) {
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .project-card, .skill-category, .repo-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
  });
}


/* ────────────────────────────────────────────────
   HERO TYPING EFFECT
──────────────────────────────────────────────── */
const roles = [
  'DevOps Engineer',
  'Cloud Architect',
  'CI/CD Specialist',
  'Kubernetes Engineer',
  'Infrastructure Wizard',
];
let roleIdx = 0;
let charIdx = 0;
let isDeleting = false;
const heroTitleText = document.querySelector('.hero-title-text');

function typeRole() {
  if (!heroTitleText) return;
  const current = roles[roleIdx];
  if (isDeleting) {
    charIdx--;
    heroTitleText.textContent = current.slice(0, charIdx);
    if (charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      setTimeout(typeRole, 400);
      return;
    }
    setTimeout(typeRole, 50);
  } else {
    charIdx++;
    heroTitleText.textContent = current.slice(0, charIdx);
    if (charIdx === current.length) {
      isDeleting = true;
      setTimeout(typeRole, 2200);
      return;
    }
    setTimeout(typeRole, 90);
  }
}
typeRole();


/* ────────────────────────────────────────────────
   PARTICLES CANVAS
──────────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const NUM = 55;
  const particles = Array.from({ length: NUM }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.8 + 0.4,
    alpha: Math.random() * 0.4 + 0.15,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Connect nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,255,136,${(0.08 * (1 - dist / 130)).toFixed(3)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,255,136,${p.alpha.toFixed(3)})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(0,255,136,0.5)';
      ctx.fill();
      ctx.shadowBlur = 0;

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();


/* ────────────────────────────────────────────────
   SCROLL REVEAL
──────────────────────────────────────────────── */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}
// Also call on DOMContentLoaded for cases where loader isn't shown
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('loader')) initReveal();
});


/* ────────────────────────────────────────────────
   3D CARD TILT
──────────────────────────────────────────────── */
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const maxTilt = 8;
    card.style.transform = `perspective(800px) rotateY(${dx * maxTilt}deg) rotateX(${-dy * maxTilt}deg) translateZ(8px)`;

    const shine = card.querySelector('.tilt-shine');
    if (shine) {
      const px = ((e.clientX - rect.left) / rect.width)  * 100;
      const py = ((e.clientY - rect.top)  / rect.height) * 100;
      shine.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.06) 0%, transparent 60%)`;
    }
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


/* ────────────────────────────────────────────────
   ANIMATED SKILL RINGS
──────────────────────────────────────────────── */
function animateRings() {
  document.querySelectorAll('.ring-fill').forEach(ring => {
    const pct = parseFloat(ring.dataset.pct || 0);
    const r = parseFloat(ring.getAttribute('r'));
    const circumference = 2 * Math.PI * r;
    ring.style.strokeDasharray = `0 ${circumference}`;
    setTimeout(() => {
      ring.style.transition = 'stroke-dasharray 1.4s cubic-bezier(0.25,1,0.5,1)';
      ring.style.strokeDasharray = `${circumference * pct / 100} ${circumference}`;
    }, 400);
  });
}

const metricsObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    animateRings();
    metricsObs.disconnect();
  }
}, { threshold: 0.3 });

const metricsEl = document.querySelector('.about-metrics');
if (metricsEl) metricsObs.observe(metricsEl);


/* ────────────────────────────────────────────────
   COUNTER ANIMATION (stats)
──────────────────────────────────────────────── */
function animateCounters() {
  document.querySelectorAll('[data-count], [data-target]').forEach(el => {
    const target = parseFloat(el.dataset.count ?? el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1600;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = target * eased;
      el.textContent = prefix + (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const statsObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateCounters();
      statsObs.disconnect();
    }
  }, { threshold: 0.5 });
  statsObs.observe(heroStats);
}


/* ────────────────────────────────────────────────
   GITHUB REPOS
──────────────────────────────────────────────── */
async function fetchRepos() {
  const grid = document.getElementById('reposGrid');
  if (!grid) return;

  const langColors = {
    Python: '#3572A5', Shell: '#89e051', Dockerfile: '#384d54',
    JavaScript: '#f1e05a', HCL: '#844FBA', YAML: '#cb171e',
    HTML: '#e34c26', CSS: '#563d7c', Go: '#00ADD8', Ruby: '#701516',
    TypeScript: '#3178c6', Java: '#b07219', Makefile: '#427819',
  };

  try {
    const res = await fetch('https://api.github.com/users/VajidShaik44/repos?per_page=12&sort=updated', {
      headers: { Accept: 'application/vnd.github.v3+json' }
    });
    if (!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();

    grid.innerHTML = '';
    if (!repos.length) {
      grid.innerHTML = '<div class="repo-empty">No public repositories found.</div>';
      return;
    }
    repos.forEach(repo => {
      const langColor = langColors[repo.language] || '#8b949e';
      const card = document.createElement('a');
      card.className = 'repo-card reveal';
      card.href = repo.html_url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.innerHTML = `
        <div class="repo-name">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
          </svg>
          ${repo.name}
        </div>
        <div class="repo-desc">${repo.description || 'No description provided.'}</div>
        <div class="repo-meta">
          ${repo.language ? `
          <div class="repo-lang">
            <span class="repo-lang-dot" style="background:${langColor}"></span>
            ${repo.language}
          </div>` : ''}
          <div class="repo-stars">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.873 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
            </svg>
            ${repo.stargazers_count}
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Trigger reveal for newly added cards
    initReveal();
  } catch (err) {
    grid.innerHTML = '<div class="repo-empty">Could not load repositories. <a href="https://github.com/VajidShaik44" target="_blank" rel="noopener" style="color:var(--blue)">View on GitHub →</a></div>';
  }
}
fetchRepos();


/* ────────────────────────────────────────────────
   CONTACT FORM
──────────────────────────────────────────────── */
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.submit-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>Sending...</span>';
    btn.disabled = true;

    // Simulate submission (wire up to Formspree/EmailJS as needed)
    await new Promise(r => setTimeout(r, 1400));

    btn.innerHTML = '<span>✓ Sent!</span>';
    btn.style.background = 'var(--green)';
    btn.style.color = '#000';
    form.reset();
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
      btn.style.background = '';
      btn.style.color = '';
    }, 3000);
  });
}


/* ────────────────────────────────────────────────
   SMOOTH SCROLL
──────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = document.getElementById('navbar')?.offsetHeight || 64;
      window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
    }
  });
});
