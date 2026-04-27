/* ===================================================================
   terminal.js — Interactive Terminal · vajidshaik44.github.io
   Drop this file next to index.html and add:
     <script src="terminal.js"></script>   before </body>
   =================================================================== */

(function () {
  'use strict';

  /* ── DOM refs ─────────────────────────────────────────────────── */
  const terminal   = document.getElementById('heroTerminal');
  const termBody   = document.getElementById('terminalBody');
  const outputEl   = document.getElementById('it-output');
  const inputRow   = document.getElementById('it-input-row');
  const typedEl    = document.getElementById('it-typed');
  const cursorEl   = document.getElementById('it-cursor');
  const hintEl     = document.getElementById('it-hint');
  const titleEl    = document.getElementById('it-title');

  if (!terminal || !outputEl || !typedEl) return;

  /* ── State ────────────────────────────────────────────────────── */
  let isFocused    = false;
  let inputBuffer  = '';
  let historyStack = [];
  let historyIdx   = -1;
  let isProcessing = false;
  let abortFlag    = false;

  /* ── Helpers ──────────────────────────────────────────────────── */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function sleep(ms) {
    return new Promise(r => {
      const id = setTimeout(r, ms);
      // Allow abort to resolve early
      const check = setInterval(() => {
        if (abortFlag) { clearTimeout(id); clearInterval(check); r(); }
      }, 30);
      setTimeout(() => clearInterval(check), ms + 50);
    });
  }

  function appendLine(html, cls) {
    const div = document.createElement('div');
    div.className = 'it-line' + (cls ? ' ' + cls : '');
    div.innerHTML = html === '' ? '&nbsp;' : html;
    outputEl.appendChild(div);
    // Keep input row at bottom
    inputRow.parentNode.appendChild(inputRow);
    scrollBottom();
    return div;
  }

  function appendPromptLine(cmd) {
    appendLine(
      `<span class="it-prompt">vajid@devops:~$</span>&nbsp;<span class="it-white">${esc(cmd)}</span>`
    );
  }

  function scrollBottom() {
    termBody.scrollTop = termBody.scrollHeight;
  }

  function setProcessing(val) {
    isProcessing = val;
    if (titleEl) titleEl.textContent = val ? 'running...' : 'vajid@devops:~';
  }

  /* ── Focus ────────────────────────────────────────────────────── */
  function setFocus(on) {
    isFocused = on;
    terminal.classList.toggle('it-focused', on);
    if (hintEl) hintEl.style.opacity = on ? '0' : '';
    if (!on) cursorEl.style.animationPlayState = 'paused';
    else     cursorEl.style.animationPlayState = 'running';
  }

  /* ── Render input buffer ──────────────────────────────────────── */
  function renderInput() {
    typedEl.textContent = inputBuffer;
    scrollBottom();
  }

  /* ── Boot sequence ────────────────────────────────────────────── */
  const BOOT = [
    { h: 'Initializing interactive terminal...', c: 'it-dim' },
    { h: '<span class="it-green">  ✓ kernel loaded</span>  <span class="it-dim">— vajid-devops v2.0</span>' },
    { h: '<span class="it-green">  ✓ modules loaded</span> <span class="it-dim">— docker · k8s · terraform · nginx</span>' },
    { h: '<span class="it-green">  ✓ pipelines hot</span>  <span class="it-dim">— github actions wired up</span>' },
    { h: '' },
    { h: 'Type <span class="it-yellow">help</span> to see all commands.  Use <span class="it-dim">↑↓</span> for history, <span class="it-dim">Tab</span> to autocomplete.' },
    { h: '' },
  ];

  (async function boot() {
    await sleep(500);
    for (const l of BOOT) {
      appendLine(l.h, l.c || 'it-white');
      await sleep(160);
    }
  })();

  /* ──────────────────────────────────────────────────────────────── */
  /*  COMMANDS                                                        */
  /* ──────────────────────────────────────────────────────────────── */

  async function cmdHelp() {
    const rows = [
      ['', 'it-dim', '┌──────────────────────────────────────────────────────┐'],
      ['', 'it-white', '│  <span class="it-yellow it-bold">Available Commands — vajid@devops</span>                   │'],
      ['', 'it-dim', '├────────────────────┬─────────────────────────────────┤'],
      ['', 'it-white', '│ <span class="it-cyan">whoami</span>             │ about me                         │'],
      ['', 'it-white', '│ <span class="it-cyan">skills</span>             │ full tech stack                  │'],
      ['', 'it-white', '│ <span class="it-cyan">projects</span>           │ featured work                    │'],
      ['', 'it-white', '│ <span class="it-cyan">experience</span>         │ work history                     │'],
      ['', 'it-white', '│ <span class="it-cyan">contact</span>            │ get in touch                     │'],
      ['', 'it-white', '│ <span class="it-cyan">github</span>             │ open GitHub profile              │'],
      ['', 'it-dim', '├────────────────────┼─────────────────────────────────┤'],
      ['', 'it-white', '│ <span class="it-cyan">neofetch</span>           │ system info card                 │'],
      ['', 'it-white', '│ <span class="it-cyan">cat resume</span>         │ resume overview + download       │'],
      ['', 'it-white', '│ <span class="it-cyan">kubectl get pods</span>   │ cluster status                   │'],
      ['', 'it-white', '│ <span class="it-cyan">kubectl get nodes</span>  │ node list                        │'],
      ['', 'it-white', '│ <span class="it-cyan">docker ps</span>          │ running containers               │'],
      ['', 'it-white', '│ <span class="it-cyan">ping google.com</span>    │ network check                    │'],
      ['', 'it-dim', '├────────────────────┼─────────────────────────────────┤'],
      ['', 'it-white', '│ <span class="it-cyan">ls</span>                  │ list directory                   │'],
      ['', 'it-white', '│ <span class="it-cyan">pwd</span>                 │ working directory                │'],
      ['', 'it-white', '│ <span class="it-cyan">date</span>                │ current date & time              │'],
      ['', 'it-white', '│ <span class="it-cyan">uptime</span>              │ deployment stats                 │'],
      ['', 'it-white', '│ <span class="it-cyan">history</span>             │ command history                  │'],
      ['', 'it-white', '│ <span class="it-cyan">clear</span>               │ clear terminal                   │'],
      ['', 'it-dim', '├────────────────────┼─────────────────────────────────┤'],
      ['', 'it-white', '│ <span class="it-dim">sudo hire me</span>        │ 👀 ...                           │'],
      ['', 'it-white', '│ <span class="it-dim">sudo rm -rf /</span>       │ go ahead, try it                 │'],
      ['', 'it-dim', '└────────────────────┴─────────────────────────────────┘'],
      ['', 'it-dim', 'Keyboard: ↑↓ history  ·  Tab autocomplete  ·  Ctrl+C abort  ·  Ctrl+L clear'],
    ];
    for (const [, cls, h] of rows) { appendLine(h, cls); await sleep(28); }
  }

  async function cmdWhoami() {
    const lines = [
      ['it-yellow it-bold', '// Vajid Shaik'],
      ['', ''],
      ['it-white', '  <span class="it-cyan">name</span>       →  Vajid Shaik'],
      ['it-white', '  <span class="it-cyan">role</span>       →  DevOps Engineer'],
      ['it-white', '  <span class="it-cyan">company</span>    →  Zerocode Innovations Pvt Ltd'],
      ['it-white', '  <span class="it-cyan">location</span>   →  Hyderabad, India 🇮🇳'],
      ['it-white', '  <span class="it-cyan">focus</span>      →  CI/CD · Cloud Infrastructure · IaC'],
      ['it-white', '  <span class="it-cyan">os</span>         →  Ubuntu Linux 24.04 LTS'],
      ['it-white', '  <span class="it-cyan">shell</span>      →  bash 5.2 · zsh (when feeling fancy)'],
      ['it-white', '  <span class="it-cyan">impact</span>     →  <span class="it-green">70% faster deploys · 99.97% uptime SLA</span>'],
      ['', ''],
      ['it-dim', '  Promoted from Trainee → DevOps Engineer in production.'],
      ['it-dim', '  Debugs Nginx at 2 AM. Still ships on time.'],
      ['it-dim', '  Infrastructure runs so smooth, nobody notices it exists.'],
    ];
    for (const [cls, h] of lines) { appendLine(h, cls || 'it-white'); await sleep(45); }
  }

  async function cmdSkills() {
    const cats = [
      { icon: '☁️ ', label: 'Cloud',          items: ['AWS EC2', 'S3', 'IAM', 'VPC', 'Security Groups', 'CloudWatch'] },
      { icon: '🐳', label: 'Containers',      items: ['Docker', 'Kubernetes', 'kubectl', 'Helm', 'Docker Compose'] },
      { icon: '⚙️ ', label: 'CI/CD',           items: ['GitHub Actions', 'Jenkins', 'Maven', 'Artifact Mgmt'] },
      { icon: '🏗️ ', label: 'IaC',             items: ['Terraform', 'Ansible', 'HCL', 'YAML'] },
      { icon: '🌐', label: 'Web',             items: ['Nginx', 'Reverse Proxy', 'SSL/TLS', 'Load Balancing'] },
      { icon: '🗄️ ', label: 'Databases',       items: ['MySQL', 'MongoDB', 'Redis', 'Elasticsearch'] },
      { icon: '📊', label: 'Observability',   items: ['ELK Stack', 'Kibana', 'Logstash', 'Systemd Journald'] },
      { icon: '🐧', label: 'OS & Scripting',  items: ['Linux Ubuntu', 'Bash', 'Python Flask', 'Cron', 'ODBC'] },
    ];
    appendLine('<span class="it-yellow it-bold">// Tech Stack</span>');
    appendLine('');
    for (const cat of cats) {
      const items = cat.items.map(i => `<span class="it-green">${i}</span>`).join(' <span class="it-dim">·</span> ');
      appendLine(`  <span class="it-cyan it-bold">${cat.icon} ${cat.label.padEnd(14)}</span>${items}`);
      await sleep(65);
    }
  }

  async function cmdProjects() {
    const projects = [
      {
        tag: 'CI/CD',
        name: 'Pipeline Automation',
        desc: 'End-to-end GitHub Actions + Jenkins pipeline for Java WAR services.',
        stats: '70% faster deploys · S3 artifact storage · multi-server rollout',
        stack: 'GitHub Actions · Jenkins · AWS S3 · Bash · Java WAR',
      },
      {
        tag: 'K8s',
        name: 'Kubernetes Deployment',
        desc: 'Containerized workloads on K8s with rolling updates & auto-scaling.',
        stats: '3 replicas · self-healing pods · zero-downtime rolling update',
        stack: 'Kubernetes · Docker · kubectl · YAML manifests',
      },
      {
        tag: 'IaC',
        name: 'Terraform Infrastructure',
        desc: 'Complete AWS infra as code — dev / staging / prod environments.',
        stats: '12 tracked resources · version-controlled · repeatable envs',
        stack: 'Terraform · AWS EC2 · VPC · Security Groups · HCL',
      },
      {
        tag: 'ELK',
        name: 'Log Aggregation Pipeline',
        desc: 'ELK stack setup for centralised log ingestion and Kibana dashboards.',
        stats: '2 active Logstash pipelines · MySQL → Elasticsearch sync',
        stack: 'Elasticsearch · Logstash · Kibana · Nginx auth · Systemd',
      },
    ];

    appendLine('<span class="it-yellow it-bold">// Featured Projects</span>');
    for (const p of projects) {
      appendLine('');
      appendLine(
        `  <span class="it-dim">[</span><span class="it-green it-bold">${p.tag}</span><span class="it-dim">]</span>` +
        `  <span class="it-white it-bold">${p.name}</span>`
      );
      appendLine(`  <span class="it-dim">${p.desc}</span>`);
      appendLine(`  <span class="it-cyan">stats</span>  <span class="it-dim">→</span>  ${p.stats}`);
      appendLine(`  <span class="it-cyan">stack</span>  <span class="it-dim">→</span>  <span class="it-dim">${p.stack}</span>`);
      await sleep(80);
    }
    appendLine('');
    appendLine('  <span class="it-dim">→ scroll to</span> <span class="it-cyan">#projects</span> <span class="it-dim">section for full details and visuals</span>');
  }

  async function cmdExperience() {
    const lines = [
      ['it-yellow it-bold', '// Work Experience'],
      ['', ''],
      ['it-white', '  <span class="it-green it-bold">DevOps Engineer</span>  <span class="it-dim">·</span>  Zerocode Innovations Pvt Ltd'],
      ['it-dim', '  Hyderabad, India  ·  Jan 2024 → Present  ·  (Promoted from Trainee)'],
      ['', ''],
      ['it-white', '  <span class="it-dim">▹</span> Built CI/CD pipelines (GitHub Actions + Jenkins) → <span class="it-green">-70% deploy time</span>'],
      ['it-white', '  <span class="it-dim">▹</span> Docker containerisation + Kubernetes across prod & UAT environments'],
      ['it-white', '  <span class="it-dim">▹</span> AWS: EC2, S3, IAM, VPC, Security Groups — managed end-to-end'],
      ['it-white', '  <span class="it-dim">▹</span> Migrated Java WAR services from nohup → <span class="it-cyan">systemd unit files</span>'],
      ['it-white', '  <span class="it-dim">▹</span> ELK stack — Logstash pipelines, Kibana dashboards, log aggregation'],
      ['it-white', '  <span class="it-dim">▹</span> Production firefighting: MySQL, MongoDB, Redis, Nginx (inc. 2AM incidents)'],
      ['it-white', '  <span class="it-dim">▹</span> Python Flask APIs + Bash automation for operational tooling'],
      ['it-white', '  <span class="it-dim">▹</span> GoAccess analytics, SSL debugging, Azure MySQL backup infrastructure'],
      ['', ''],
      ['it-dim', '  Stack: GitHub Actions · Jenkins · Docker · K8s · AWS · Terraform · Nginx'],
      ['it-dim', '         ELK · MySQL · MongoDB · Redis · Linux Ubuntu · Python · Bash'],
    ];
    for (const [cls, h] of lines) { appendLine(h, cls || 'it-white'); await sleep(40); }
  }

  async function cmdContact() {
    const lines = [
      ['it-yellow it-bold', '// Contact Info'],
      ['', ''],
      ['it-white', '  <span class="it-cyan">email</span>     →  <a class="it-link" href="mailto:shaikvajid484@gmail.com">shaikvajid484@gmail.com</a>'],
      ['it-white', '  <span class="it-cyan">phone</span>     →  <a class="it-link" href="tel:+919640781856">+91 9640781856</a>'],
      ['it-white', '  <span class="it-cyan">linkedin</span>  →  <a class="it-link" href="https://linkedin.com/in/vajid-shaik" target="_blank" rel="noopener">linkedin.com/in/vajid-shaik</a>'],
      ['it-white', '  <span class="it-cyan">github</span>    →  <a class="it-link" href="https://github.com/VajidShaik44" target="_blank" rel="noopener">github.com/VajidShaik44</a>'],
      ['it-white', '  <span class="it-cyan">portfolio</span> →  <a class="it-link" href="https://vajidshaik44.github.io" target="_blank" rel="noopener">vajidshaik44.github.io</a>'],
      ['', ''],
      ['it-green', '  ✓ Open to DevOps · SRE · Cloud Engineering · Platform Engineering roles'],
      ['it-dim', '  Based in Hyderabad — open to remote & hybrid opportunities'],
    ];
    for (const [cls, h] of lines) { appendLine(h, cls || 'it-white'); await sleep(55); }
  }

  async function cmdGithub() {
    appendLine('  <span class="it-cyan">Fetching profile...</span>');
    await sleep(550);
    window.open('https://github.com/VajidShaik44', '_blank', 'noopener');
    appendLine('  <span class="it-green">✓ Launched → github.com/VajidShaik44</span>');
  }

  function cmdLs() {
    const rows = [
      ['it-cyan it-bold',  'drwxr-xr-x', 'projects/',    '← featured work'],
      ['it-cyan it-bold',  'drwxr-xr-x', 'experience/',  '← work history'],
      ['it-cyan it-bold',  'drwxr-xr-x', 'skills/',      '← tech stack'],
      ['it-cyan it-bold',  'drwxr-xr-x', 'pipeline/',    '← CI/CD artefacts'],
      ['it-green it-bold', '-rwxr--r--',  'pipeline.sh',  '← GitHub Actions workflow'],
      ['it-green it-bold', '-rwxr--r--',  'deploy.yaml',  '← K8s deployment manifest'],
      ['it-green it-bold', '-rw-r--r--',  'main.tf',      '← Terraform infrastructure'],
      ['it-green it-bold', '-rw-r--r--',  'resume.pdf',   '← ATS-optimised resume'],
      ['it-green it-bold', '-rw-r--r--',  'contact.txt',  '← shaikvajid484@gmail.com'],
    ];
    for (const [cls, perms, name, note] of rows) {
      appendLine(
        `<span class="${cls}">${perms}</span>  ${name.padEnd(18)}<span class="it-dim">${note}</span>`
      );
    }
  }

  function cmdPwd() {
    appendLine('/home/vajid/portfolio');
  }

  function cmdDate() {
    const now = new Date();
    const opts = { timeZone: 'Asia/Kolkata', weekday: 'short', year: 'numeric',
                   month: 'short', day: '2-digit', hour: '2-digit',
                   minute: '2-digit', second: '2-digit', hour12: false };
    const ist  = now.toLocaleString('en-IN', opts);
    appendLine(`  ${ist} IST`);
    appendLine(`  <span class="it-dim">UTC offset: +05:30  ·  Timezone: Asia/Kolkata</span>`);
  }

  async function cmdUptime() {
    appendLine('  <span class="it-cyan">Querying deployment metrics...</span>');
    await sleep(480);
    const start   = new Date('2024-01-15');
    const days    = Math.floor((Date.now() - start) / 86400000);
    const deploys = days * 3;
    appendLine('');
    appendLine(`  <span class="it-green it-bold">System uptime:</span>   ${days} days, 0 major incidents`);
    appendLine(`  <span class="it-green it-bold">Deployments:</span>     ${deploys}+ successful CI/CD runs`);
    appendLine(`  <span class="it-green it-bold">Uptime SLA:</span>      99.97%`);
    appendLine(`  <span class="it-green it-bold">Last incident:</span>   <span class="it-dim">that Nginx SSL thing. fixed in 12 min.</span>`);
    appendLine('');
    appendLine(`  <span class="it-dim">load avg: 0.12  0.08  0.05  ·  tasks: 3 running, 127 sleeping</span>`);
  }

  function cmdClear() {
    outputEl.innerHTML = '';
  }

  function cmdHistory() {
    if (!historyStack.length) {
      appendLine('<span class="it-dim">No commands in history yet.</span>');
      return;
    }
    historyStack.forEach((cmd, i) => {
      appendLine(
        `  <span class="it-dim">${String(i + 1).padStart(3, ' ')}</span>  ${esc(cmd)}`
      );
    });
  }

  async function cmdNeofetch() {
    const vs = [
      '   ██╗   ██╗ ███████╗   ',
      '   ██║   ██║ ██╔════╝   ',
      '   ██║   ██║ ███████╗   ',
      '   ╚██╗ ██╔╝ ╚════██║   ',
      '    ╚████╔╝  ███████║   ',
      '     ╚═══╝   ╚══════╝   ',
    ];
    const info = [
      `<span class="it-cyan it-bold">vajid</span><span class="it-dim">@</span><span class="it-cyan it-bold">devops</span>`,
      `<span class="it-dim">─────────────────────────────</span>`,
      `<span class="it-cyan">OS:</span>         Ubuntu 24.04 LTS`,
      `<span class="it-cyan">Role:</span>       DevOps Engineer`,
      `<span class="it-cyan">Company:</span>    Zerocode Innovations`,
      `<span class="it-cyan">Shell:</span>      bash 5.2.21`,
      `<span class="it-cyan">Infra:</span>      AWS · K8s · Docker`,
      `<span class="it-cyan">IaC:</span>        Terraform · Ansible`,
      `<span class="it-cyan">CI/CD:</span>      GitHub Actions · Jenkins`,
      `<span class="it-cyan">Location:</span>   Hyderabad, India 🇮🇳`,
      `<span class="it-cyan">Uptime SLA:</span> 99.97%`,
      ``,
      `<span style="background:#ff5f57;padding:0 7px">&nbsp;</span>` +
      `<span style="background:#ffbd2e;padding:0 7px">&nbsp;</span>` +
      `<span style="background:#28ca42;padding:0 7px">&nbsp;</span>` +
      `<span style="background:#00d4aa;padding:0 7px">&nbsp;</span>` +
      `<span style="background:#79c0ff;padding:0 7px">&nbsp;</span>` +
      `<span style="background:#c678dd;padding:0 7px">&nbsp;</span>`,
    ];

    for (let i = 0; i < Math.max(vs.length, info.length); i++) {
      const left  = vs[i]   ? `<span class="it-green">${vs[i]}</span>` : '                         ';
      const right = info[i] ?? '';
      appendLine(`${left}  ${right}`);
      await sleep(55);
    }
  }

  async function cmdResume() {
    const lines = [
      ['it-yellow it-bold', '// cat resume.pdf'],
      ['', ''],
      ['it-cyan it-bold',   '┌─ VAJID SHAIK — DevOps Engineer ─────────────────────────┐'],
      ['it-white',          '│  Hyderabad, India  ·  shaikvajid484@gmail.com           │'],
      ['it-white',          '│  +91 9640781856  ·  linkedin.com/in/vajid-shaik         │'],
      ['it-dim',            '├─────────────────────────────────────────────────────────┤'],
      ['it-yellow',         '│  EXPERIENCE                                             │'],
      ['it-white',          '│  DevOps Engineer @ Zerocode Innovations [2024–Present]  │'],
      ['it-white',          '│  • CI/CD pipelines → 70% faster deployment time        │'],
      ['it-white',          '│  • Docker + Kubernetes in production environments       │'],
      ['it-white',          '│  • AWS: EC2, S3, IAM, VPC, Security Groups             │'],
      ['it-white',          '│  • ELK stack, Terraform, Nginx, MySQL, MongoDB          │'],
      ['it-dim',            '├─────────────────────────────────────────────────────────┤'],
      ['it-yellow',         '│  SKILLS                                                 │'],
      ['it-white',          '│  AWS · Docker · Kubernetes · Terraform · Ansible        │'],
      ['it-white',          '│  GitHub Actions · Jenkins · Nginx · ELK · MySQL         │'],
      ['it-white',          '│  Linux Ubuntu · Bash · Python Flask · Redis             │'],
      ['it-dim',            '└─────────────────────────────────────────────────────────┘'],
      ['', ''],
      ['it-white',          `  <a class="it-link" href="assets/resume/vajid-shaik-devops-resume.pdf" download>⬇  Download full resume (ATS-optimised PDF)</a>`],
    ];
    for (const [cls, h] of lines) { appendLine(h, cls || 'it-white'); await sleep(38); }
  }

  async function cmdKubectl(raw) {
    if (raw.includes('nodes')) { await cmdKubectlNodes(); return; }

    appendLine(`<span class="it-dim">Connecting to cluster...</span>`);
    await sleep(340);
    appendLine('');
    appendLine(
      '<span class="it-dim">NAME               NAMESPACE   READY   STATUS    RESTARTS   AGE</span>'
    );
    appendLine('<span class="it-dim">──────────────────────────────────────────────────────────────</span>');
    await sleep(120);
    const pods = [
      ['app-deploy-1',     'production', '1/1', 'Running', '0', '7d2h'],
      ['app-deploy-2',     'production', '1/1', 'Running', '0', '7d2h'],
      ['app-deploy-3',     'production', '1/1', 'Running', '0', '7d2h'],
      ['nginx-ingress',    'infra',      '1/1', 'Running', '0', '30d' ],
      ['elk-logstash',     'monitoring', '1/1', 'Running', '0', '14d' ],
      ['redis-cache',      'production', '1/1', 'Running', '0', '30d' ],
    ];
    for (const [name, ns, ready, status, restarts, age] of pods) {
      appendLine(
        `<span class="it-green">${name.padEnd(18)} ${ns.padEnd(11)} ${ready}     ${status}   ${restarts.padEnd(10)} ${age}</span>`
      );
      await sleep(90);
    }
    appendLine('');
    appendLine('<span class="it-cyan">6/6 pods running  ·  0 failures  ·  All systems nominal ✓</span>');
  }

  async function cmdKubectlNodes() {
    appendLine('<span class="it-dim">NAME             STATUS   ROLES           AGE   VERSION</span>');
    appendLine('<span class="it-dim">────────────────────────────────────────────────────</span>');
    await sleep(200);
    const nodes = [
      ['node-master  ', 'Ready', 'control-plane', '30d', 'v1.29.0'],
      ['node-worker-1', 'Ready', 'worker',        '30d', 'v1.29.0'],
      ['node-worker-2', 'Ready', 'worker',        '30d', 'v1.29.0'],
    ];
    for (const [n, s, r, a, v] of nodes) {
      appendLine(`<span class="it-green">${n}  ${s}    ${r.padEnd(15)} ${a}   ${v}</span>`);
      await sleep(110);
    }
  }

  async function cmdDocker() {
    appendLine('<span class="it-dim">CONTAINER ID   IMAGE                COMMAND              STATUS         PORTS</span>');
    appendLine('<span class="it-dim">─────────────────────────────────────────────────────────────────────────────</span>');
    await sleep(220);
    const containers = [
      ['a3f9c2d1b4e', 'app:latest',          '"./startup.sh"',       'Up 7 days',  '8080/tcp'],
      ['b8e7d4c5f2a', 'nginx:alpine',         '"/docker-entry…"',     'Up 30 days', '80, 443/tcp'],
      ['c1d2e3f4a5b', 'elasticsearch:8.11',   '"/bin/tini"',          'Up 14 days', '9200/tcp'],
      ['d5e6f7a8b9c', 'redis:7-alpine',       '"docker-entryp…"',     'Up 30 days', '6379/tcp'],
      ['e9f0a1b2c3d', 'logstash:8.11',        '"/usr/local/bi…"',     'Up 14 days', '5044/tcp'],
    ];
    for (const [id, img, cmd, status, ports] of containers) {
      appendLine(
        `<span class="it-green">${id}   ${img.padEnd(20)} ${cmd.padEnd(20)} ${status.padEnd(13)} ${ports}</span>`
      );
      await sleep(90);
    }
    appendLine('');
    appendLine('<span class="it-cyan">5 containers running  ·  0 stopped  ·  0 exited</span>');
  }

  async function cmdPing() {
    appendLine('PING google.com (142.250.195.46): 56 data bytes');
    await sleep(300);
    for (let i = 1; i <= 5; i++) {
      const ms  = (Math.random() * 7 + 2).toFixed(3);
      appendLine(`<span class="it-green">64 bytes from 142.250.195.46: icmp_seq=${i} ttl=116 time=${ms} ms</span>`);
      await sleep(420);
      if (abortFlag) break;
    }
    appendLine('');
    appendLine('<span class="it-cyan">5 packets transmitted, 5 received, 0% packet loss</span>');
    appendLine('<span class="it-dim">rtt min/avg/max = 2.1/4.3/9.2 ms</span>');
  }

  async function cmdSudoHire() {
    appendLine('<span class="it-dim">[sudo] password for recruiter: ••••••••</span>');
    await sleep(900);
    appendLine('');
    appendLine('<span class="it-green it-bold">✓ Authentication successful.</span>');
    appendLine('');
    await sleep(300);
    appendLine('<span class="it-yellow it-bold">Executing: hire vajid-shaik --role devops --priority high</span>');
    appendLine('');
    await sleep(400);

    const checks = [
      ['Production experience',   '1.5+ years · Zerocode Innovations'],
      ['CI/CD pipelines',         'GitHub Actions + Jenkins · 70% faster deploys'],
      ['Cloud infrastructure',    'AWS EC2 · S3 · IAM · VPC managed end-to-end'],
      ['Container expertise',     'Docker + Kubernetes in production'],
      ['IaC',                     'Terraform · Ansible · version-controlled infra'],
      ['Observability',           'ELK stack · Kibana · Systemd · custom monitoring'],
      ['Battle hardened',         '2AM Nginx debug sessions. Still shipped on time.'],
    ];
    for (const [label, val] of checks) {
      appendLine(
        `  <span class="it-cyan">✓</span> <span class="it-white">${label.padEnd(26)}</span>` +
        `<span class="it-dim">${val}</span>`
      );
      await sleep(200);
    }

    appendLine('');
    appendLine('<span class="it-green it-bold">─────────────────────────────────────────────────</span>');
    appendLine('<span class="it-green it-bold">  Process complete. Let\'s build something great.</span>');
    appendLine('<span class="it-green it-bold">─────────────────────────────────────────────────</span>');
    appendLine('');
    appendLine(`  <a class="it-link" href="mailto:shaikvajid484@gmail.com">📧  shaikvajid484@gmail.com</a>`);
    appendLine(`  <a class="it-link" href="https://linkedin.com/in/vajid-shaik" target="_blank" rel="noopener">💼  linkedin.com/in/vajid-shaik</a>`);
    appendLine(`  <a class="it-link" href="assets/resume/vajid-shaik-devops-resume.pdf" download>📄  Download Resume (PDF)</a>`);
  }

  async function cmdSudoRm() {
    appendLine('<span class="it-dim">[sudo] password for root: ••••••••</span>');
    await sleep(700);
    appendLine('<span class="it-red">rm: cannot remove \'/\': Operation not permitted</span>');
    await sleep(300);
    appendLine('<span class="it-yellow">Nice try. This infra is bulletproof. 🛡️</span>');
    appendLine('<span class="it-dim">Incident logged. Alert sent to on-call. (jk)</span>');
  }

  /* ──────────────────────────────────────────────────────────────── */
  /*  COMMAND ROUTER                                                  */
  /* ──────────────────────────────────────────────────────────────── */

  const COMMANDS = {
    'help':             cmdHelp,
    'whoami':           cmdWhoami,
    'skills':           cmdSkills,
    'projects':         cmdProjects,
    'experience':       cmdExperience,
    'contact':          cmdContact,
    'github':           cmdGithub,
    'ls':               cmdLs,
    'pwd':              cmdPwd,
    'date':             cmdDate,
    'uptime':           cmdUptime,
    'clear':            cmdClear,
    'history':          cmdHistory,
    'neofetch':         cmdNeofetch,
    'cat resume':       cmdResume,
    'cat resume.pdf':   cmdResume,
    'kubectl':          cmdKubectl,
    'docker ps':        cmdDocker,
    'ping google.com':  cmdPing,
    'ping':             cmdPing,
    'sudo hire me':     cmdSudoHire,
    'sudo rm -rf /':    cmdSudoRm,
    'rm -rf /':         cmdSudoRm,
    'exit':             () => appendLine('<span class="it-yellow">There\'s no escaping. You\'re already hired. 😄</span>'),
    'sudo':             () => appendLine('<span class="it-red">usage: sudo hire me</span>'),
    'vim':              async () => { appendLine('Opening vim...'); await sleep(400); appendLine('<span class="it-yellow">just kidding. use neofetch instead.</span>'); },
    'nano':             async () => { appendLine('nano: command found'); await sleep(300); appendLine('<span class="it-dim">but honestly, vim was right there.</span>'); },
    'make coffee':      async () => { appendLine('Brewing...'); await sleep(800); appendLine('<span class="it-green">☕ Done. Deploy queued.</span>'); },
  };

  const ALL_CMDS = Object.keys(COMMANDS);

  async function runCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) { appendLine(''); return; }

    appendPromptLine(trimmed);

    // History dedup
    if (historyStack[historyStack.length - 1] !== trimmed) {
      historyStack.push(trimmed);
    }
    historyIdx = historyStack.length;

    const lower = trimmed.toLowerCase();

    // Exact match
    let fn = COMMANDS[lower];

    // Prefix match (e.g. "kubectl get pods" → matches "kubectl")
    if (!fn) {
      const key = ALL_CMDS.find(k => lower.startsWith(k));
      if (key) fn = COMMANDS[key];
    }

    if (fn) {
      setProcessing(true);
      abortFlag = false;
      try {
        await fn(lower);
      } catch (e) {
        appendLine(`<span class="it-red">Error: ${esc(e.message)}</span>`);
      }
      setProcessing(false);
    } else {
      appendLine(`<span class="it-red">bash: ${esc(trimmed)}: command not found</span>`);
      appendLine(`<span class="it-dim">Run <span class="it-yellow">help</span> to see available commands.</span>`);
    }

    appendLine('');
    scrollBottom();
  }

  /* ──────────────────────────────────────────────────────────────── */
  /*  KEYBOARD HANDLER                                                */
  /* ──────────────────────────────────────────────────────────────── */

  function handleKey(e) {
    if (!isFocused) return;

    // Ctrl+C — abort current command
    if (e.ctrlKey && e.key === 'c') {
      abortFlag = true;
      appendPromptLine(inputBuffer + '^C');
      inputBuffer = '';
      historyIdx  = historyStack.length;
      renderInput();
      setProcessing(false);
      e.preventDefault();
      return;
    }

    // Ctrl+L — clear
    if (e.ctrlKey && e.key === 'l') {
      cmdClear();
      e.preventDefault();
      return;
    }

    // Ignore other ctrl/meta combos (copy/paste etc)
    if (e.ctrlKey || e.metaKey) return;

    // Block new input while processing (except Ctrl+C above)
    if (isProcessing) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        const cmd = inputBuffer;
        inputBuffer = '';
        historyIdx  = historyStack.length;
        renderInput();
        runCommand(cmd);
        break;

      case 'Backspace':
        e.preventDefault();
        inputBuffer = inputBuffer.slice(0, -1);
        renderInput();
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (historyIdx > 0) {
          historyIdx--;
          inputBuffer = historyStack[historyIdx] || '';
          renderInput();
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (historyIdx < historyStack.length - 1) {
          historyIdx++;
          inputBuffer = historyStack[historyIdx] || '';
        } else {
          historyIdx  = historyStack.length;
          inputBuffer = '';
        }
        renderInput();
        break;

      case 'Tab':
        e.preventDefault();
        const partial  = inputBuffer.toLowerCase();
        const matches  = ALL_CMDS.filter(c => c.startsWith(partial));
        if (matches.length === 1) {
          inputBuffer = matches[0];
          renderInput();
        } else if (matches.length > 1) {
          appendPromptLine(inputBuffer);
          appendLine(
            matches.map(m => `<span class="it-cyan">${m}</span>`).join('  &nbsp;')
          );
        }
        break;

      default:
        if (e.key.length === 1) {
          inputBuffer += e.key;
          renderInput();
        }
    }
  }

  /* ──────────────────────────────────────────────────────────────── */
  /*  EVENT LISTENERS                                                 */
  /* ──────────────────────────────────────────────────────────────── */

  terminal.addEventListener('click', () => setFocus(true));

  document.addEventListener('click', e => {
    if (!terminal.contains(e.target)) setFocus(false);
  });

  document.addEventListener('keydown', handleKey);

  // Prevent page scroll on arrow keys when focused
  document.addEventListener('keydown', e => {
    if (isFocused && ['ArrowUp', 'ArrowDown', 'Tab'].includes(e.key)) {
      e.preventDefault();
    }
  }, { passive: false });

  // Mobile: show tap hint
  if ('ontouchstart' in window && hintEl) {
    hintEl.textContent = 'tap · try: help';
  }

})();