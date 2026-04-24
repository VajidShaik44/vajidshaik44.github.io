/* ============================================================
   VAJID SHAIK — Portfolio JavaScript
   ============================================================ */

/* ── NAVBAR SCROLL ── */
(function () {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

/* ── HAMBURGER MENU ── */
(function () {
  const ham = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!ham || !menu) return;

  ham.addEventListener('click', () => {
    menu.classList.toggle('open');
    const open = menu.classList.contains('open');
    ham.setAttribute('aria-expanded', open);
    // Animate spans
    const spans = ham.querySelectorAll('span');
    if (open) {
      spans[0].style.cssText = 'transform:rotate(45deg) translate(5px,5px)';
      spans[1].style.cssText = 'opacity:0';
      spans[2].style.cssText = 'transform:rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s => s.style.cssText = '');
    }
  });

  // Close on link click
  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      ham.querySelectorAll('span').forEach(s => s.style.cssText = '');
    });
  });
})();

/* ── SMOOTH ACTIVE NAV HIGHLIGHT ── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();

/* ── HERO TYPEWRITER ── */
(function () {
  const el = document.getElementById('typedTitle');
  if (!el) return;

  const titles = [
    'DevOps Engineer',
    'CI/CD Architect',
    'Cloud Infrastructure',
    'Kubernetes Enthusiast',
    'Automation First'
  ];
  let tIdx = 0, cIdx = 0, deleting = false;

  function type() {
    const current = titles[tIdx];
    if (!deleting) {
      el.textContent = current.slice(0, ++cIdx);
      if (cIdx === current.length) {
        setTimeout(() => { deleting = true; type(); }, 2000);
        return;
      }
    } else {
      el.textContent = current.slice(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        tIdx = (tIdx + 1) % titles.length;
      }
    }
    setTimeout(type, deleting ? 40 : 80);
  }

  setTimeout(type, 800);
})();

/* ── SCROLL REVEAL ── */
(function () {
  const targets = document.querySelectorAll(
    '.skill-category, .project-card, .timeline-item, .contact-link-item, ' +
    '.arch-stage, .arch-detail-card, .highlight-item, .about-card, .metric-box, .repo-card'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 6) * 0.07}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
})();

/* ── GITHUB REPOS ── */
(function () {
  const grid = document.getElementById('reposGrid');
  if (!grid) return;

  const USERNAME = 'VajidShaik44';

  const LANG_COLORS = {
    JavaScript: '#f7df1e', Python: '#3776ab', Java: '#ed8b00',
    Shell: '#89e051', HTML: '#e34c26', CSS: '#563d7c',
    TypeScript: '#2b7489', Go: '#00add8', Rust: '#dea584',
    Dockerfile: '#384d54', HCL: '#5c4ee5', default: '#94a3b8'
  };

  async function fetchRepos() {
    try {
      const res = await fetch(
        `https://api.github.com/users/${USERNAME}/repos?sort=pushed&per_page=9`,
        { headers: { 'Accept': 'application/vnd.github.v3+json' } }
      );

      if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
      const repos = await res.json();

      if (!repos.length) {
        grid.innerHTML = `<div class="repo-empty">No public repositories found yet.</div>`;
        return;
      }

      const filtered = repos
        .filter(r => !r.fork)
        .slice(0, 9);

      grid.innerHTML = filtered.map(repo => {
        const color = LANG_COLORS[repo.language] || LANG_COLORS.default;
        return `
          <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-card reveal">
            <div class="repo-name">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
              ${repo.name}
            </div>
            <div class="repo-desc">${repo.description || 'No description provided.'}</div>
            <div class="repo-meta">
              ${repo.language ? `<div class="repo-lang"><span class="repo-lang-dot" style="background:${color}"></span>${repo.language}</div>` : ''}
              <div class="repo-stars">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ${repo.stargazers_count}
              </div>
              <div>Updated ${timeAgo(repo.pushed_at)}</div>
            </div>
          </a>
        `;
      }).join('');

      // Trigger reveal animations on new cards
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            observer.unobserve(e.target);
          }
        });
      }, { threshold: 0.1 });

      grid.querySelectorAll('.repo-card').forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.05}s`;
        observer.observe(card);
      });

    } catch (err) {
      console.warn('GitHub fetch error:', err);
      grid.innerHTML = `
        <div class="repo-empty">
          <p>Could not load repositories from GitHub API.</p>
          <p style="margin-top:8px;">
            <a href="https://github.com/${USERNAME}" target="_blank" rel="noopener" style="color:var(--blue)">
              View all repos on GitHub →
            </a>
          </p>
        </div>
      `;
    }
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr);
    const d = Math.floor(diff / 86400000);
    if (d === 0) return 'today';
    if (d === 1) return 'yesterday';
    if (d < 30) return `${d}d ago`;
    const m = Math.floor(d / 30);
    if (m < 12) return `${m}mo ago`;
    return `${Math.floor(m / 12)}y ago`;
  }

  // Load repos when GitHub section is in view
  const ghSection = document.getElementById('github');
  if (ghSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          fetchRepos();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(ghSection);
  }
})();

/* ── CONTACT FORM → FORMSPREE ── */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    const original = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = 'Sending...';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Message Sent!`;
        btn.style.background = '#27c93f';
        btn.style.color = '#000';
        form.reset();
        setTimeout(() => {
          btn.innerHTML = original;
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
        }, 4000);
      } else {
        throw new Error('Server error');
      }
    } catch {
      btn.innerHTML = 'Failed. Try again.';
      btn.style.background = '#e74c3c';
      btn.style.color = '#fff';
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 4000);
    }
  });
})();

/* ── METRIC RINGS ANIMATE ON SCROLL ── */
(function () {
  const rings = document.querySelectorAll('.ring-fill');
  if (!rings.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const dashArr = entry.target.getAttribute('stroke-dasharray') || '0, 100';
        entry.target.style.strokeDasharray = '0, 100';
        requestAnimationFrame(() => {
          setTimeout(() => {
            entry.target.style.transition = 'stroke-dasharray 1.5s ease';
            entry.target.style.strokeDasharray = dashArr;
          }, 200);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  rings.forEach(r => {
    const original = r.getAttribute('stroke-dasharray');
    r.setAttribute('data-target', original);
    r.style.strokeDasharray = '0, 100';
    observer.observe(r);
  });
})();

/* ── SECTION TITLE REVEAL ── */
(function () {
  const titles = document.querySelectorAll('.section-title');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.2 });

  titles.forEach(t => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(20px)';
    t.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(t);
  });
})();

/* ── ACTIVE NAV STYLE ── */
const style = document.createElement('style');
style.textContent = `.nav-links a.active { color: var(--green) !important; background: var(--green-glow); }`;
document.head.appendChild(style);
