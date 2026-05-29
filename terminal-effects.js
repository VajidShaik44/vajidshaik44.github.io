/* ===================================================================
   terminal-effects.js — Cinematic Script Effects Engine
   vajidshaik44.github.io  ·  Modular · Memory-safe · Premium
   =================================================================== */

(function () {
  'use strict';

  /* ── Effect Manager ─────────────────────────────────────────────── */
  const FX = {
    _active: null,          // currently running effect name
    _timers: [],            // setTimeout / setInterval IDs
    _rafs: [],              // requestAnimationFrame IDs
    _domNodes: [],          // injected DOM elements to clean up
    _bodyClasses: [],       // body classes to remove on cleanup

    /* Register a timer for managed cleanup */
    timer(fn, ms)   { const id = setTimeout(fn, ms);   this._timers.push(id); return id; },
    interval(fn, ms){ const id = setInterval(fn, ms);  this._timers.push(id); return id; },
    raf(fn)         { const id = requestAnimationFrame(fn); this._rafs.push(id); return id; },

    /* Add a body class and track it */
    addBodyClass(cls) {
      document.body.classList.add(cls);
      if (!this._bodyClasses.includes(cls)) this._bodyClasses.push(cls);
    },

    /* Inject an overlay into the body and track it */
    mountOverlay(id, html) {
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        document.body.appendChild(el);
        this._domNodes.push(el);
      }
      el.className = 'fx-overlay';
      el.innerHTML = html;
      return el;
    },

    /* Activate an overlay */
    showOverlay(el, delay = 30) {
      return new Promise(r => setTimeout(() => {
        el.classList.add('fx-active');
        r();
      }, delay));
    },

    /* Deactivate and optionally remove an overlay */
    hideOverlay(el, duration = 400) {
      return new Promise(r => {
        el.classList.remove('fx-active');
        setTimeout(r, duration);
      });
    },

    /* Full teardown — call between effects or on Ctrl+C */
    cleanup() {
      this._timers.forEach(id => { clearTimeout(id); clearInterval(id); });
      this._rafs.forEach(id => cancelAnimationFrame(id));
      this._timers = []; this._rafs = [];

      this._bodyClasses.forEach(cls => document.body.classList.remove(cls));
      this._bodyClasses = [];

      document.querySelectorAll('.fx-overlay').forEach(el => {
        el.classList.remove('fx-active');
      });

      this._active = null;
    },

    /* Sleep helper (non-blocking, respects cleanup) */
    sleep(ms) {
      return new Promise(r => this.timer(r, ms));
    },
  };

  /* Expose cleanup globally so terminal.js Ctrl+C can call it */
  window.TerminalFX = { cleanup: () => FX.cleanup(), isActive: () => !!FX._active };

  /* ── Shared: scanline div ───────────────────────────────────────── */
  function scanlines() { return '<div class="fx-scanlines"></div>'; }

  /* ── Audio helpers ─────────────────────────────────────────────── */
  function createAudioCtx() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      return Ctx ? new Ctx() : null;
    } catch(_) { return null; }
  }

  function playTone(freq, type, duration, volume = 0.1) {
    const ctx = createAudioCtx(); if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration / 1000);
    setTimeout(() => ctx.close(), duration + 100);
  }

  function playBeep(freq = 880, ms = 80)  { playTone(freq, 'square', ms, 0.06); }
  function playLowRumble(freq = 55, ms = 600) { playTone(freq, 'sawtooth', ms, 0.08); }
  function playSuccess() {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => playTone(f, 'sine', 180, 0.07), i * 110);
    });
  }
  function playAlert() {
    [1046, 880, 1046].forEach((f, i) => {
      setTimeout(() => playTone(f, 'square', 100, 0.08), i * 130);
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     1. MATRIX.SH
  ═══════════════════════════════════════════════════════════════ */
  async function fxMatrix(appendLine, sleep) {
    FX._active = 'matrix';

    const el = FX.mountOverlay('fxMatrix',
      `<canvas id="fxMatrixCanvas"></canvas>
       <div id="fxMatrixMsg">SYSTEM ACCESSED<br>
         <span style="font-size:0.45em;opacity:0.7;letter-spacing:0.2em;">KERNEL HANDSHAKE COMPLETE · vajid@devops</span>
       </div>
       ${scanlines()}`
    );

    await FX.showOverlay(el);

    /* Canvas rain */
    const canvas = document.getElementById('fxMatrixCanvas');
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]|';
    const cols  = Math.floor(canvas.width / 16);
    const drops = Array.from({ length: cols }, () => Math.random() * -50);

    let rafId;
    const draw = () => {
      if (!FX._active) return;
      ctx.fillStyle = 'rgba(0,0,0,0.055)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        const bright = Math.random() > 0.95;
        ctx.fillStyle = bright ? '#ffffff' : `hsl(${140 + Math.random()*20},100%,${40 + Math.random()*30}%)`;
        ctx.font = `${12 + Math.floor(Math.random()*4)}px 'JetBrains Mono', monospace`;
        ctx.fillText(ch, i * 16, drops[i] * 16);
        if (drops[i] * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.55;
      }
      rafId = requestAnimationFrame(draw);
      FX._rafs.push(rafId);
    };
    draw();

    appendLine('<span class="it-green">Initializing matrix interface...</span>');
    await sleep(600);
    appendLine('<span class="it-dim">Handshaking kernel modules...</span>');
    await sleep(500);
    appendLine('<span class="it-green">▸ Connection established · Layer-7 encrypted</span>');

    await sleep(1400);
    const msg = document.getElementById('fxMatrixMsg');
    if (msg) msg.classList.add('visible');
    playBeep(880, 120);

    await sleep(2200);

    await FX.hideOverlay(el);
    window.removeEventListener('resize', resize);
    appendLine('<span class="it-green">✓ Matrix sequence complete. You are in.</span>');
    FX._active = null;
  }

  /* ═══════════════════════════════════════════════════════════════
     2. OVERLOAD.SH
  ═══════════════════════════════════════════════════════════════ */
  async function fxOverload(appendLine, sleep) {
    FX._active = 'overload';

    const metricsHTML = [
      { id: 'cpu', label: 'CPU',    cls: 'danger',  target: 99 },
      { id: 'mem', label: 'MEM',    cls: 'warning', target: 87 },
      { id: 'tmp', label: 'TEMP',   cls: 'danger',  target: 94 },
      { id: 'io',  label: 'I/O',    cls: 'warning', target: 76 },
      { id: 'net', label: 'NET TX', cls: 'ok',      target: 43 },
    ].map(m => `
      <div class="fx-overload-row">
        <span class="fx-ol-label">${m.label}</span>
        <div class="fx-ol-bar-wrap"><div class="fx-ol-bar-fill ${m.cls}" id="ol-bar-${m.id}" style="width:0%"></div></div>
        <span class="fx-ol-val ${m.cls}" id="ol-val-${m.id}">0%</span>
      </div>`).join('');

    const alerts = [
      { cls: 'fx-alert-crit', text: '⚠ THERMAL THRESHOLD EXCEEDED · CORE #3 @ 98°C' },
      { cls: 'fx-alert-crit', text: '⚠ CPU SPIKE DETECTED · load avg: 28.4 28.2 24.8' },
      { cls: 'fx-alert-warn', text: '▸ SWAP USAGE CRITICAL · 14.2 GB / 16.0 GB' },
      { cls: 'fx-alert-warn', text: '▸ I/O BOTTLENECK · disk queue depth: 42' },
      { cls: 'fx-alert-info', text: '↻ systemd: restarting overloaded services...' },
    ];

    const el = FX.mountOverlay('fxOverload', `
      <div class="fx-overload-panel">
        <div class="fx-overload-header">
          <div class="fx-overload-blink"></div>
          <span class="fx-overload-title">⚡ SYS-MONITOR · CRITICAL STATE</span>
        </div>
        <div class="fx-overload-metrics">${metricsHTML}</div>
        <div class="fx-overload-alerts" id="olAlerts">
          ${alerts.map((a,i) => `<div class="fx-alert-line ${a.cls}" id="ol-alert-${i}">${a.text}</div>`).join('')}
        </div>
      </div>
      ${scanlines()}`
    );
    FX.addBodyClass('fx-overload-active');
    await FX.showOverlay(el);

    const metrics = [
      { id: 'cpu', target: 99 }, { id: 'mem', target: 87 },
      { id: 'tmp', target: 94 }, { id: 'io',  target: 76 }, { id: 'net', target: 43 }
    ];

    appendLine('<span class="it-red">⚠ CRITICAL: System resource spike detected</span>');

    /* Animate bars up */
    let step = 0;
    const totalSteps = 40;
    const barInterval = FX.interval(() => {
      step++;
      metrics.forEach(m => {
        const pct = Math.min(m.target, Math.round((m.target / totalSteps) * step + Math.random() * 4));
        const bar = document.getElementById(`ol-bar-${m.id}`);
        const val = document.getElementById(`ol-val-${m.id}`);
        if (bar) bar.style.width = pct + '%';
        if (val) val.textContent = pct + (m.id === 'tmp' ? '°C' : '%');
      });
      if (step >= totalSteps) clearInterval(barInterval);
    }, 60);

    /* Show alerts sequentially */
    for (let i = 0; i < alerts.length; i++) {
      await sleep(500 + i * 350);
      const a = document.getElementById(`ol-alert-${i}`);
      if (a) a.classList.add('show');
      if (i < 2) playBeep(660, 60);
    }

    appendLine('<span class="it-yellow">▸ Throttling services... engaging load shedding</span>');
    await sleep(800);
    appendLine('<span class="it-dim">↻ Rebalancing cluster workloads across nodes...</span>');
    await sleep(700);

    /* Bar spike simulation */
    let spiking = true;
    const spikeInterval = FX.interval(() => {
      if (!spiking) return;
      const bar = document.getElementById('ol-bar-cpu');
      const val = document.getElementById('ol-val-cpu');
      const spike = 90 + Math.floor(Math.random() * 10);
      if (bar) bar.style.width = spike + '%';
      if (val) val.textContent = spike + '%';
    }, 200);

    await sleep(2500);
    spiking = false;

    /* Wind down */
    const downInterval = FX.interval(() => {
      metrics.forEach(m => {
        const bar = document.getElementById(`ol-bar-${m.id}`);
        const val = document.getElementById(`ol-val-${m.id}`);
        if (!bar) return;
        const cur = parseFloat(bar.style.width) || 0;
        const next = Math.max(0, cur - 2.5);
        bar.style.width = next + '%';
        if (val) val.textContent = Math.round(next) + (m.id === 'tmp' ? '°C' : '%');
      });
    }, 80);

    await sleep(1800);
    clearInterval(downInterval);
    await FX.hideOverlay(el);
    document.body.classList.remove('fx-overload-active');
    appendLine('<span class="it-green">✓ Load spike resolved. System stabilized.</span>');
    FX._active = null;
  }

  /* ═══════════════════════════════════════════════════════════════
     3. BREACH.SH
  ═══════════════════════════════════════════════════════════════ */
  async function fxBreach(appendLine, sleep) {
    FX._active = 'breach';

    const logLines = [
      '[WARN]  iptables: anomalous inbound packets · SRC 103.41.*.* → DROP',
      '[ALERT] fail2ban: brute-force detected · /var/log/auth.log burst',
      '[CRIT]  nginx: 847 req/s from single IP · rate-limit EXCEEDED',
      '[ALERT] SSH: 342 failed login attempts · port 22 lockdown initiated',
      '[CRIT]  firewall: intrusion pattern matched · rule #47 TRIGGERED',
      '[WARN]  IDS: lateral movement signature · internal scan detected',
      '[INFO]  incident-response: runbook activated · team notified',
    ];

    const el = FX.mountOverlay('fxBreach', `
      <div class="fx-breach-alert">
        <span class="fx-breach-skull">☠</span>
        <div class="fx-breach-headline">INTRUSION DETECTED</div>
        <div class="fx-breach-sub">FIREWALL BREACH · INCIDENT RESPONSE ACTIVE</div>
      </div>
      <div class="fx-breach-logs" id="fxBreachLogs"></div>
      ${scanlines()}`
    );
    FX.addBodyClass('fx-breach-active');

    appendLine('<span class="it-red it-bold">⚠ SECURITY INCIDENT · breach.sh triggered</span>');
    playAlert();
    await FX.showOverlay(el);

    const logsEl = document.getElementById('fxBreachLogs');
    for (const [i, line] of logLines.entries()) {
      await sleep(320 + i * 180);
      if (logsEl) {
        const div = document.createElement('div');
        div.className = 'fx-breach-log-line';
        div.style.animationDelay = '0s';
        div.textContent = line;
        logsEl.appendChild(div);
      }
      if (i % 2 === 0) playBeep(440, 40);
      appendLine(`<span class="it-red">  ${line}</span>`);
    }

    await sleep(1200);
    appendLine('<span class="it-yellow">▸ Isolating affected nodes from cluster...</span>');
    await sleep(600);
    appendLine('<span class="it-yellow">▸ Rotating secrets · invalidating tokens...</span>');
    await sleep(700);

    await FX.hideOverlay(el);
    document.body.classList.remove('fx-breach-active');
    await sleep(200);
    appendLine('<span class="it-green">✓ Breach contained. Forensics log saved to /var/log/ir/</span>');
    appendLine('<span class="it-dim">Incident reference: IR-2024-0x4F · postmortem scheduled</span>');
    FX._active = null;
  }

  /* ═══════════════════════════════════════════════════════════════
     4. DEPLOY-PROD.SH
  ═══════════════════════════════════════════════════════════════ */
  async function fxDeploy(appendLine, sleep) {
    FX._active = 'deploy';

    const steps = [
      { icon: '●', cls: 'fx-step-run',  text: 'git checkout main · pulling latest HEAD',        time: '0.2s' },
      { icon: '✓', cls: 'fx-step-ok',   text: 'pre-flight checks passed · env validated',        time: '1.1s' },
      { icon: '✓', cls: 'fx-step-ok',   text: 'docker build · image tagged :prod-2024-r18',      time: '12.3s'},
      { icon: '✓', cls: 'fx-step-ok',   text: 'ecr push · digest sha256:a3f9c2...b4e1 pushed',  time: '8.7s' },
      { icon: '✓', cls: 'fx-step-ok',   text: 'kubectl apply -f k8s/prod-deploy.yaml',           time: '0.8s' },
      { icon: '●', cls: 'fx-step-run',  text: 'rolling update · 3 replicas · 0 disruptions',    time: '14.2s'},
      { icon: '✓', cls: 'fx-step-ok',   text: 'pod/app-deploy-1 · Running · 1/1',               time: '' },
      { icon: '✓', cls: 'fx-step-ok',   text: 'pod/app-deploy-2 · Running · 1/1',               time: '' },
      { icon: '✓', cls: 'fx-step-ok',   text: 'pod/app-deploy-3 · Running · 1/1',               time: '' },
      { icon: '✓', cls: 'fx-step-ok',   text: 'health checks passed · /healthz → 200 OK',       time: '2.1s' },
      { icon: '✓', cls: 'fx-step-ok',   text: 'smoke tests passed · 47/47 assertions green',    time: '6.3s' },
      { icon: '✓', cls: 'fx-step-ok',   text: 'slack notification sent · #deployments channel', time: '0.4s' },
    ];

    const stepsHTML = steps.map((s, i) =>
      `<div class="fx-deploy-step" id="dep-step-${i}">
         <span class="fx-deploy-step-icon ${s.cls}">${s.icon}</span>
         <span class="fx-step-text">${s.text}</span>
         ${s.time ? `<span class="fx-step-time">${s.time}</span>` : ''}
       </div>`
    ).join('');

    const el = FX.mountOverlay('fxDeploy', `
      <div class="fx-deploy-panel">
        <div class="fx-deploy-header">
          <div class="fx-deploy-spinner" id="depSpinner"></div>
          <span class="fx-deploy-title">⚡ CI/CD · PRODUCTION DEPLOYMENT · v2024-r18</span>
        </div>
        <div class="fx-deploy-steps">${stepsHTML}</div>
        <div class="fx-deploy-success" id="depSuccess">
          ✓ DEPLOYMENT COMPLETE · 0 ERRORS · 0 ROLLBACKS · SLA MAINTAINED
        </div>
      </div>
      ${scanlines()}`
    );

    await FX.showOverlay(el);
    appendLine('<span class="it-cyan">⚡ Initiating production deployment sequence...</span>');

    for (const [i, step] of steps.entries()) {
      await sleep(260 + Math.random() * 180);
      const el2 = document.getElementById(`dep-step-${i}`);
      if (el2) el2.classList.add('show');
      if (step.cls === 'fx-step-ok') playBeep(1047, 30);
      appendLine(`<span class="${step.cls === 'fx-step-ok' ? 'it-green' : 'it-cyan'}">  ${step.icon} ${step.text}</span>`);
    }

    await sleep(400);
    const spinner = document.getElementById('depSpinner');
    if (spinner) spinner.style.borderTopColor = '#00ff88';
    const success = document.getElementById('depSuccess');
    if (success) success.classList.add('show');
    playSuccess();

    await sleep(2000);
    await FX.hideOverlay(el);
    appendLine('<span class="it-green it-bold">✓ Production deployment successful · zero-downtime rollout complete</span>');
    appendLine('<span class="it-dim">Duration: 46.1s · Build: #218 · Commit: a3f9c2d</span>');
    FX._active = null;
  }

  /* ═══════════════════════════════════════════════════════════════
     5. BLACKOUT.SH
  ═══════════════════════════════════════════════════════════════ */
  async function fxBlackout(appendLine, sleep) {
    FX._active = 'blackout';

    const el = FX.mountOverlay('fxBlackout', `
      <div class="fx-emergency-lights">
        <div class="fx-emergency-beam" style="height:100%;animation-duration:3s;"></div>
        <div class="fx-emergency-beam" style="height:100%;animation-duration:3s;animation-delay:1.5s;"></div>
      </div>
      <div class="fx-blackout-content" id="blkContent">
        <span class="fx-blackout-icon">⚡</span>
        <div class="fx-blackout-text">POWER FAILURE</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,50,0,0.6);margin-top:12px;letter-spacing:0.2em;">
          EMERGENCY BACKUP SYSTEMS ACTIVATING
        </div>
        <div class="fx-restore-bar-wrap">
          <div class="fx-restore-bar" id="blkRestoreBar"></div>
        </div>
      </div>
      ${scanlines()}`
    );

    appendLine('<span class="it-yellow">⚡ Power fluctuation detected...</span>');
    playLowRumble(40, 500);

    /* Flicker the page before overlay */
    document.body.classList.add('fx-blackout-flicker');
    await sleep(450);
    document.body.classList.remove('fx-blackout-flicker');

    FX.addBodyClass('fx-blackout-active');
    await FX.showOverlay(el);
    await sleep(200);
    const content = document.getElementById('blkContent');
    if (content) content.classList.add('show');

    appendLine('<span class="it-red">✗ Main power interrupted · UPS switching online</span>');
    await sleep(600);
    appendLine('<span class="it-red">▸ Emergency systems: ACTIVE · generators starting</span>');

    /* Restore progress bar */
    const bar = document.getElementById('blkRestoreBar');
    let pct = 0;
    const barInt = FX.interval(() => {
      pct = Math.min(100, pct + 1.8);
      if (bar) bar.style.width = pct + '%';
    }, 80);

    await sleep(1000);
    appendLine('<span class="it-yellow">▸ UDC online · restoring primary circuits...</span>');
    await sleep(500);
    appendLine('<span class="it-yellow">▸ Kubernetes pods rescheduling · ETA 18s</span>');
    await sleep(1500);

    clearInterval(barInt);
    if (bar) bar.style.width = '100%';
    await sleep(300);

    /* Flicker back to life */
    document.body.classList.add('fx-blackout-flicker');
    await sleep(400);
    document.body.classList.remove('fx-blackout-flicker');

    await FX.hideOverlay(el);
    document.body.classList.remove('fx-blackout-active');
    appendLine('<span class="it-green">✓ Power restored. All systems nominal. Duration: 4.2s</span>');
    playSuccess();
    FX._active = null;
  }

  /* ═══════════════════════════════════════════════════════════════
     6. GRAVITY.SH
  ═══════════════════════════════════════════════════════════════ */
  async function fxGravity(appendLine, sleep) {
    FX._active = 'gravity';

    /* Create the background overlay */
    let bgOverlay = document.getElementById('fxGravityOverlay');
    if (!bgOverlay) {
      bgOverlay = document.createElement('div');
      bgOverlay.id = 'fxGravityOverlay';
      document.body.appendChild(bgOverlay);
      FX._domNodes.push(bgOverlay);
    }
    bgOverlay.classList.add('fx-active');

    appendLine('<span class="it-cyan">⟳ Reversing gravitational constants...</span>');
    await sleep(500);

    /* Select key UI elements to float */
    const targets = [
      document.querySelector('.hero-name'),
      document.querySelector('.hero-tagline'),
      document.querySelector('.hero-buttons'),
      document.querySelector('.hero-stats'),
      document.querySelector('nav'),
    ].filter(Boolean);

    /* Snapshot original transforms */
    const origStyles = targets.map(t => ({
      transform: t.style.transform,
      transition: t.style.transition,
      position: t.style.position,
    }));

    /* Animate float up */
    targets.forEach((t, i) => {
      t.style.transition = `transform ${0.8 + i * 0.15}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    });

    await sleep(100);
    const floatAmounts = targets.map(() => -(30 + Math.random() * 50));
    targets.forEach((t, i) => {
      t.style.transform = `translateY(${floatAmounts[i]}px) rotate(${(Math.random()-0.5)*3}deg)`;
    });

    appendLine('<span class="it-cyan">▸ Gravitational anomaly active · objects in freefall</span>');
    await sleep(600);
    appendLine('<span class="it-dim">  g = -9.81 m/s²  →  overridden  →  g = +2.4 m/s²</span>');

    /* Gentle oscillation */
    let tick = 0;
    const floatInterval = FX.interval(() => {
      tick += 0.04;
      targets.forEach((t, i) => {
        if (!t) return;
        const base = floatAmounts[i];
        const osc = Math.sin(tick + i * 0.8) * 12;
        t.style.transform = `translateY(${base + osc}px) rotate(${Math.sin(tick*0.7+i)*1.5}deg)`;
      });
    }, 30);

    await sleep(3500);
    clearInterval(floatInterval);

    appendLine('<span class="it-yellow">▸ Re-engaging gravity... restoring nominal physics</span>');

    /* Restore */
    targets.forEach((t, i) => {
      t.style.transition = `transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)`;
      t.style.transform = origStyles[i].transform || 'none';
    });
    await sleep(1300);
    targets.forEach((t, i) => {
      t.style.transition = origStyles[i].transition || '';
    });

    bgOverlay.classList.remove('fx-active');
    appendLine('<span class="it-green">✓ Gravity restored. Newtonian physics back online.</span>');
    FX._active = null;
  }

  /* ═══════════════════════════════════════════════════════════════
     7. PULSE.SH
  ═══════════════════════════════════════════════════════════════ */
  async function fxPulse(appendLine, sleep) {
    FX._active = 'pulse';

    /* Create pulse ring overlay */
    let pulseEl = document.getElementById('fxPulseOverlay');
    if (!pulseEl) {
      pulseEl = document.createElement('div');
      pulseEl.id = 'fxPulseOverlay';
      pulseEl.className = 'fx-overlay';
      pulseEl.innerHTML = '<div id="fxPulseRing"></div>';
      document.body.appendChild(pulseEl);
      FX._domNodes.push(pulseEl);
    }
    pulseEl.classList.add('fx-active');

    FX.addBodyClass('fx-pulse-active');

    appendLine('<span class="it-cyan">⬡ Synchronizing UI heartbeat...</span>');
    await sleep(400);

    /* Pulse beats with audio */
    const BEATS = 8;
    for (let i = 0; i < BEATS; i++) {
      playTone(220 + i * 30, 'sine', 200, 0.05);
      appendLine(`<span class="it-dim">  ▸ pulse ${i+1}/${BEATS} · freq: ${(1 + i*0.1).toFixed(1)} Hz · amplitude: ${(0.4+i*0.08).toFixed(2)}</span>`);
      await sleep(700);
      if (!FX._active) break;
    }

    appendLine('<span class="it-green">▸ Cardiac sync lock achieved · all components resonating</span>');
    await sleep(1000);

    /* Fade out */
    document.body.classList.remove('fx-pulse-active');
    pulseEl.classList.remove('fx-active');
    appendLine('<span class="it-green">✓ Pulse complete. UI resonance nominal.</span>');
    FX._active = null;
  }

  /* ═══════════════════════════════════════════════════════════════
     8. RAIN.SH
  ═══════════════════════════════════════════════════════════════ */
  async function fxRain(appendLine, sleep) {
    FX._active = 'rain';

    const el = FX.mountOverlay('fxRain', `
      <canvas id="fxRainCanvas"></canvas>
      <div class="fx-thunder-flash" id="thunderFlash"></div>`
    );
    await FX.showOverlay(el);
    FX.addBodyClass('fx-rain-active');

    /* Canvas rain drops */
    const canvas = document.getElementById('fxRainCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const drops = Array.from({ length: 220 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 6 + Math.random() * 10,
      len:   15 + Math.random() * 25,
      alpha: 0.2 + Math.random() * 0.5,
    }));

    let drawing = true;
    const draw = () => {
      if (!drawing) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(130,180,255,0.6)';
      ctx.lineWidth = 1;
      drops.forEach(d => {
        ctx.globalAlpha = d.alpha;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 1, d.y + d.len);
        ctx.stroke();
        d.y += d.speed;
        if (d.y > canvas.height) {
          d.y = -d.len;
          d.x = Math.random() * canvas.width;
        }
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    };
    draw();

    /* Thunder flashes */
    const flash = document.getElementById('thunderFlash');
    const doThunder = async () => {
      if (!FX._active) return;
      if (flash) flash.classList.add('on');
      playLowRumble(35, 400);
      await sleep(60);
      if (flash) flash.classList.remove('on');
      await sleep(80);
      if (Math.random() > 0.5) {
        if (flash) flash.classList.add('on');
        await sleep(40);
        if (flash) flash.classList.remove('on');
      }
    };

    appendLine('<span class="it-cyan">☁ Atmospheric disturbance — rain sequence active</span>');
    await sleep(400);
    appendLine('<span class="it-dim">  Precipitation: heavy · Visibility: 200m · Wind: 28 km/h</span>');

    /* Schedule random thunder */
    const thunderTimes = [800, 2100, 3400, 4800];
    thunderTimes.forEach(t => FX.timer(doThunder, t));

    await sleep(6000);
    drawing = false;
    document.body.classList.remove('fx-rain-active');
    await FX.hideOverlay(el);
    appendLine('<span class="it-green">✓ Storm passed. Clearing skies. Systems unaffected.</span>');
    FX._active = null;
  }

  /* ═══════════════════════════════════════════════════════════════
     9. NUCLEAR.SH
  ═══════════════════════════════════════════════════════════════ */
  async function fxNuclear(appendLine, sleep) {
    FX._active = 'nuclear';

    let countdown = 30;

    const statusLines = [
      'STRATEGIC COMMAND · AUTHENTICATION LEVEL 5',
      'WARHEAD AUTHORIZATION: STANDBY',
      'LAUNCH SEQUENCE: AWAITING CONFIRMATION',
    ];

    const el = FX.mountOverlay('fxNuclear', `
      <div class="fx-nuclear-panel">
        <div class="fx-defcon-label">DEFCON</div>
        <div class="fx-defcon-level">1</div>
        <div class="fx-nuclear-headline">⚠ LAUNCH AUTHORIZATION DETECTED</div>
        <div class="fx-countdown-wrap">
          <div class="fx-countdown-display" id="nukeCd">T−${String(countdown).padStart(2,'0')}s</div>
        </div>
        <div class="fx-nuclear-status-lines">
          ${statusLines.map(s => `<div>${s}</div>`).join('')}
        </div>
        <div class="fx-nuclear-aborted" id="nukeAborted">
          ✓ LAUNCH ABORTED — CIVILIZATION PRESERVED<br>
          <span style="font-size:0.6em;opacity:0.7;">Authorization cancelled by system override</span>
        </div>
      </div>
      ${scanlines()}`
    );

    FX.addBodyClass('fx-nuclear-active');
    playAlert();
    await FX.showOverlay(el);

    appendLine('<span class="it-red it-bold">⚠ DEFCON 1 · LAUNCH AUTHORIZATION SEQUENCE</span>');
    await sleep(400);
    appendLine('<span class="it-red">  Strategic command authenticated · countdown initiated</span>');

    /* Countdown */
    const cdDisplay = document.getElementById('nukeCd');
    const cdInterval = FX.interval(() => {
      countdown--;
      if (cdDisplay) cdDisplay.textContent = `T−${String(Math.max(0,countdown)).padStart(2,'0')}s`;
      if (countdown % 5 === 0) playBeep(880, 60);
      if (countdown <= 0) clearInterval(cdInterval);
    }, 1000);

    /* Show terminal updates */
    await sleep(1000); appendLine('<span class="it-red">  NORAD: tracking · target lock confirmed</span>');
    await sleep(1000); appendLine('<span class="it-red">  Crypto keys loaded · authentication complete</span>');
    await sleep(1000); appendLine('<span class="it-yellow">▸ System override detected · reviewing authorization...</span>');
    await sleep(1200); appendLine('<span class="it-yellow">▸ Override protocol engaged · abort sequence initiated</span>');
    await sleep(800);

    /* Abort */
    clearInterval(cdInterval);
    if (cdDisplay) {
      cdDisplay.style.color = '#00ff88';
      cdDisplay.style.textShadow = '0 0 20px rgba(0,255,136,0.9)';
      cdDisplay.textContent = 'ABORTED';
    }
    const aborted = document.getElementById('nukeAborted');
    if (aborted) aborted.classList.add('show');
    playSuccess();

    appendLine('<span class="it-green it-bold">✓ LAUNCH ABORTED · Authorization revoked</span>');
    await sleep(2000);

    await FX.hideOverlay(el);
    document.body.classList.remove('fx-nuclear-active');
    appendLine('<span class="it-green">✓ DEFCON status → 5 · All systems stand down</span>');
    appendLine('<span class="it-dim">Incident logged. Forensic audit scheduled. No warheads deployed.</span>');
    FX._active = null;
  }

  /* ═══════════════════════════════════════════════════════════════
     10. CLEANLOGS.SH
  ═══════════════════════════════════════════════════════════════ */
  async function fxCleanlogs(appendLine, sleep) {
    FX._active = 'cleanlogs';

    const logEntries = [
      { cls: 'fx-cl-deleted',  text: 'DEL  /var/log/nginx/access.log.14.gz      (2.1 MB)' },
      { cls: 'fx-cl-deleted',  text: 'DEL  /var/log/nginx/error.log.14.gz       (340 KB)' },
      { cls: 'fx-cl-archived', text: 'ARC  /var/log/app/app.log.7               → S3 cold storage' },
      { cls: 'fx-cl-deleted',  text: 'DEL  /var/log/journal/... 28 rotated entries (1.8 GB)' },
      { cls: 'fx-cl-archived', text: 'ARC  /var/log/elk/logstash.log.5          → S3 cold storage' },
      { cls: 'fx-cl-ok',       text: 'OK   /var/log/nginx/access.log            retained' },
      { cls: 'fx-cl-ok',       text: 'OK   /var/log/app/app.log                 retained' },
      { cls: 'fx-cl-deleted',  text: 'DEL  /tmp/build-artifacts-* 142 files     (4.7 GB)' },
      { cls: 'fx-cl-archived', text: 'ARC  /var/log/audit/audit.log.old         → S3 compliance' },
      { cls: 'fx-cl-ok',       text: 'OK   /var/log/auth.log                    retained (security)' },
      { cls: 'fx-cl-deleted',  text: 'DEL  /var/cache/apt/archives/*.deb        (892 MB)' },
      { cls: 'fx-cl-dim',      text: '...  28 more files processed' },
    ];

    const el = FX.mountOverlay('fxCleanlogs', `
      <div class="fx-cleanlogs-panel">
        <div class="fx-cleanlogs-header">
          <span class="fx-cleanlogs-icon">🗂</span>
          <span class="fx-cleanlogs-title">LOG MAINTENANCE · AUTOMATED CLEANUP</span>
        </div>
        <div class="fx-cleanlogs-progress">
          <div class="fx-cl-prog-label">
            <span>SCANNING · /var/log/</span>
            <span id="clPct">0%</span>
          </div>
          <div class="fx-cl-bar-wrap"><div class="fx-cl-bar" id="clBar"></div></div>
        </div>
        <div class="fx-cleanlogs-feed" id="clFeed">
          ${logEntries.map((e,i) => `<div class="fx-cl-log ${e.cls}" id="cl-log-${i}">${e.text}</div>`).join('')}
        </div>
        <div class="fx-cl-done" id="clDone">
          ✓ CLEANUP COMPLETE · 9.8 GB RECLAIMED · 0 ERRORS
        </div>
      </div>
      ${scanlines()}`
    );

    await FX.showOverlay(el);
    appendLine('<span class="it-cyan">🗂 Initiating log rotation and maintenance sweep...</span>');

    const bar = document.getElementById('clBar');
    const pctEl = document.getElementById('clPct');

    /* Progress bar */
    let pct = 0;
    const barInt = FX.interval(() => {
      pct = Math.min(100, pct + 1.2);
      if (bar) bar.style.width = pct + '%';
      if (pctEl) pctEl.textContent = Math.round(pct) + '%';
    }, 80);

    /* Show log lines */
    for (const [i, entry] of logEntries.entries()) {
      await sleep(230 + Math.random() * 120);
      const logEl = document.getElementById(`cl-log-${i}`);
      if (logEl) logEl.classList.add('show');
      const termCls = entry.cls === 'fx-cl-deleted' ? 'it-red' :
                      entry.cls === 'fx-cl-archived' ? 'it-yellow' :
                      entry.cls === 'fx-cl-ok' ? 'it-green' : 'it-dim';
      appendLine(`<span class="${termCls}">  ${entry.text}</span>`);
    }

    clearInterval(barInt);
    if (bar) bar.style.width = '100%';
    if (pctEl) pctEl.textContent = '100%';

    await sleep(400);
    const done = document.getElementById('clDone');
    if (done) done.classList.add('show');
    playSuccess();

    await sleep(1500);
    await FX.hideOverlay(el);
    appendLine('<span class="it-green">✓ Maintenance complete · 9.8 GB freed · cron job rescheduled</span>');
    appendLine('<span class="it-dim">Next run: 04:00 UTC · retention policy: 7d hot / 90d cold</span>');
    FX._active = null;
  }

  /* ═══════════════════════════════════════════════════════════════
     HIDDEN EASTER EGGS
  ═══════════════════════════════════════════════════════════════ */

  /* egg: coffee.sh / make coffee → enhanced version */
  async function fxCoffee(appendLine, sleep) {
    FX._active = 'coffee';
    const frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
    appendLine('<span class="it-yellow">☕ Brewing production-grade coffee...</span>');
    for (let i = 0; i < 20; i++) {
      await sleep(120);
      appendLine(`<span class="it-dim">${frames[i % frames.length]} Heating water: ${Math.min(100, i * 5)}°C</span>`);
    }
    appendLine('<span class="it-green">✓ Coffee ready. Caution: may cause 70% faster deploys.</span>');
    FX._active = null;
  }

  /* egg: konami code tracking */
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIdx = 0;
  document.addEventListener('keydown', e => {
    if (e.key === KONAMI[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0;
        /* Fire matrix as easter egg if terminal exists */
        const term = document.getElementById('heroTerminal');
        if (term && window.__terminalAppendLine && window.__terminalSleep) {
          fxMatrix(window.__terminalAppendLine, window.__terminalSleep);
        }
      }
    } else {
      konamiIdx = 0;
    }
  });

  /* ═══════════════════════════════════════════════════════════════
     RARE RANDOM EFFECT — 1% chance on any command
  ═══════════════════════════════════════════════════════════════ */
  function maybeRareEffect(appendLine, sleep) {
    if (Math.random() < 0.01) {
      /* rare: brief static flicker */
      document.body.style.filter = 'contrast(3) brightness(0.2) grayscale(1)';
      setTimeout(() => { document.body.style.filter = ''; }, 80);
      appendLine('<span class="it-dim">[static] signal interference · packet loss 0.001%</span>');
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     EXPORT — attach to window for terminal.js integration
  ═══════════════════════════════════════════════════════════════ */
  window.TerminalEffects = {
    matrix:      fxMatrix,
    overload:    fxOverload,
    breach:      fxBreach,
    deployProd:  fxDeploy,
    blackout:    fxBlackout,
    gravity:     fxGravity,
    pulse:       fxPulse,
    rain:        fxRain,
    nuclear:     fxNuclear,
    cleanlogs:   fxCleanlogs,
    coffee:      fxCoffee,
    rareEffect:  maybeRareEffect,
    cleanup:     () => FX.cleanup(),
  };

})();
