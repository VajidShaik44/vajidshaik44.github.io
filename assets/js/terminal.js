/* ===================================================================
   terminal.js — Interactive Terminal Engine & Status Ticker
   Branch: devops-portfolio-v2
   =================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  'use strict';

  /* ── 1. OPERATIONS STATUS TICKER UPDATER ── */
  const clockVal = document.getElementById("ticker-time-val");
  const podsVal = document.getElementById("ticker-pods-val");
  const podsDot = document.getElementById("ticker-pods-dot");
  const cicdVal = document.getElementById("ticker-cicd-val");
  const cicdDot = document.getElementById("ticker-cicd-dot");
  const elkVal = document.getElementById("ticker-elk-val");
  const elkDot = document.getElementById("ticker-elk-dot");

  let buildMinutes = 2;

  // Live IST Clock (Asia/Kolkata)
  function updateClock() {
    if (!clockVal) return;
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    clockVal.textContent = formatter.format(now) + " IST";
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Status Ticker Wandering Changes (Every 30s)
  setInterval(function () {
    // 1. Increment CI/CD build minutes
    buildMinutes++;
    if (buildMinutes >= 60) {
      buildMinutes = 0;
      // Simulate build completion flash
      if (cicdDot) {
        cicdDot.className = "status-dot amber";
        cicdVal.textContent = "building... ⚡";
        setTimeout(() => {
          cicdDot.className = "status-dot green";
          cicdVal.textContent = "last build just now ✓";
        }, 8000);
      }
    } else {
      if (cicdVal && (!cicdVal.textContent.includes("building"))) {
        cicdVal.textContent = `last build ${buildMinutes}m ago ✓`;
      }
    }

    // 2. Pod Flickering Warning Simulator (96% static running)
    const roll = Math.random();
    if (roll > 0.85) {
      if (podsDot && podsVal) {
        podsDot.className = "status-dot amber";
        podsVal.textContent = "2/3 pods running";
        
        setTimeout(() => {
          podsDot.className = "status-dot green";
          podsVal.textContent = "3/3 pods running";
        }, 5000);
      }
    }

    // 3. ELK temporary logs warnings
    if (roll < 0.15) {
      if (elkDot && elkVal) {
        elkDot.className = "status-dot amber";
        elkVal.textContent = "2 warnings logged";
        
        setTimeout(() => {
          elkDot.className = "status-dot green";
          elkVal.textContent = "0 errors";
        }, 6000);
      }
    }
  }, 30000);


  /* ── 2. INTERACTIVE TERMINAL SIMULATOR ── */
  const terminalBody = document.getElementById("terminal-body-click");
  const terminalInput = document.getElementById("terminal-cli-input");
  const terminalOutput = document.getElementById("terminal-cli-output");

  if (!terminalInput || !terminalOutput || !terminalBody) return;

  let commandHistory = [];
  let historyIndex = -1;
  let isStreaming = false;

  // Auto-focus input
  terminalInput.focus();
  terminalBody.addEventListener("click", () => {
    if (!isStreaming) terminalInput.focus();
  });

  // Complete List of Supported Commands
  const COMMAND_LIST = [
    "help",
    "whoami",
    "cat experience.log",
    "kubectl get pods -n production",
    "systemctl status cms-deploy.service",
    "cat /etc/nginx/sites-enabled/apollo-cms",
    "terraform plan",
    "tail -f /var/log/deploy.log",
    "aws ec2 describe-instances",
    "matrix",
    "clear"
  ];

  // System key inputs
  terminalInput.addEventListener("keydown", function (e) {
    if (isStreaming) {
      e.preventDefault();
      return;
    }

    if (e.key === "Enter") {
      const rawInput = terminalInput.value;
      const cmd = rawInput.trim();
      terminalInput.value = "";
      
      if (cmd) {
        commandHistory.push(cmd);
        historyIndex = commandHistory.length;
        executeCommand(cmd);
      } else {
        appendLine("\n");
      }
    } 
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        historyIndex = Math.max(0, historyIndex - 1);
        terminalInput.value = commandHistory[historyIndex];
      }
    } 
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        historyIndex = Math.min(commandHistory.length, historyIndex + 1);
        if (historyIndex === commandHistory.length) {
          terminalInput.value = "";
        } else {
          terminalInput.value = commandHistory[historyIndex];
        }
      }
    } 
    else if (e.key === "Tab") {
      e.preventDefault();
      handleAutocomplete();
    }
  });

  // Append lines to the console screen
  function appendLine(htmlText) {
    terminalOutput.innerHTML += htmlText;
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  // Autocomplete matching
  function handleAutocomplete() {
    const val = terminalInput.value.toLowerCase().trim();
    if (!val) return;

    // Filter commands that start with user value
    const matches = COMMAND_LIST.filter(c => c.startsWith(val));

    if (matches.length === 1) {
      terminalInput.value = matches[0];
    } else if (matches.length > 1) {
      appendLine(`\n<span class="term-dim">vajid@devops:~$</span> ${terminalInput.value}\n`);
      appendLine(`<span class="term-dim">${matches.join("    ")}</span>\n`);
    }
  }

  // Core Command Exec Router
  function executeCommand(input) {
    appendLine(`\n<span class="term-dim">vajid@devops:~$</span> <span class="term-bold">${escapeHtml(input)}</span>\n`);

    const cleanInput = input.trim().replace(/\s+/g, ' ');
    const lowerInput = cleanInput.toLowerCase();

    if (lowerInput === "help") {
      appendLine(`Available system commands:
  <span class="term-info">help</span>                      Show this help manual
  <span class="term-info">whoami</span>                    Display engineer profile card
  <span class="term-info">cat experience.log</span>        Print career logs and timelines
  <span class="term-info">kubectl get pods -n prod</span>  Query production pod statuses (alias: kubectl get pods)
  <span class="term-info">systemctl status cms-deploy</span>Get deployment systemd status
  <span class="term-info">cat /etc/nginx/...</span>        View Apollo Nginx reverse proxy configs
  <span class="term-info">terraform plan</span>            Preview IaC infrastructure plans
  <span class="term-info">tail -f /var/log/deploy</span>   Follow deployment logs in real-time
  <span class="term-info">aws ec2 describe</span>          Inspect running cloud resources (describe-instances)
  <span class="term-info">matrix</span>                    Engage neural Matrix overlay
  <span class="term-info">clear</span>                     Flush terminal display buffer\n`);
    }
    else if (lowerInput === "whoami") {
      appendLine(`<span class="term-success term-bold">[ Vajid Shaik Profile Card ]</span>
----------------------------------------------------
<span class="term-info">Name:</span>        Vajid Shaik
<span class="term-info">Role:</span>        DevOps Engineer
<span class="term-info">Experience:</span>  1.5 Years Production (Zerocode Innovations)
<span class="term-info">Location:</span>    Hyderabad, India
<span class="term-info">Stack:</span>       GitHub Actions, Jenkins, AWS (EC2/S3/VPC/IAM),
             Docker, Kubernetes, Terraform, Ansible,
             ELK Stack, Nginx, Redis, MySQL, MongoDB
<span class="term-info">Status:</span>      Active - Open to Opportunities [<span class="term-success term-bold">YES</span>]
----------------------------------------------------\n`);
    }
    else if (lowerInput === "cat experience.log") {
      appendLine(`<span class="term-dim">[2024-01-15 09:00:00]</span> <span class="term-success">INFO</span>: Init session DevOps Engineer @ Zerocode Innovations
<span class="term-dim">[2024-03-10 14:23:10]</span> <span class="term-info">WORK</span>: Designed CI/CD Jenkins &amp; Actions pipelines for Java WAR services
<span class="term-dim">[2024-06-01 10:15:32]</span> <span class="term-success">IMPT</span>: Achieved 70% deployment speed reduction (45m -&gt; 13m build cycles)
<span class="term-dim">[2024-08-18 11:45:00]</span> <span class="term-info">WORK</span>: Modernized legacy nohup apps to systemd auto-healing services
<span class="term-dim">[2024-11-05 16:30:12]</span> <span class="term-info">WORK</span>: Configured ELK pipeline monitoring Apollo Pharmacy CMS platforms
<span class="term-dim">[2025-02-12 03:14:55]</span> <span class="term-warning">WARN</span>: Resolved MySQL slow query memory leak on 32-core production node
<span class="term-dim">[2026-05-29 17:13:00]</span> <span class="term-info">LIVE</span>: Session active. Observing nominal metrics.\n`);
    }
    else if (lowerInput === "kubectl get pods -n production" || lowerInput === "kubectl get pods" || lowerInput === "kubectl get pods -n prod") {
      appendLine(`NAME                           READY   STATUS    RESTARTS   AGE
<span class="term-success">apollo-cms-app-7d58f4b9-x12c</span>   1/1     Running   0          18d
<span class="term-success">apollo-lms-app-6c9cf8a5-p34k</span>   1/1     Running   0          18d
<span class="term-success">api-gateway-5f7bc8d9-q89z</span>      1/1     Running   0          45d
<span class="term-success">redis-cache-0</span>                  1/1     Running   0          45d
<span class="term-success">mongodb-primary-0</span>              1/1     Running   0          92d\n`);
    }
    else if (lowerInput.startsWith("systemctl status")) {
      appendLine(`● cms-deploy.service - Apollo Pharmacy CMS Platform Deployment Daemon
     Loaded: loaded (/etc/systemd/system/cms-deploy.service; enabled; vendor preset: enabled)
     Active: <span class="term-success term-bold">active (running)</span> since Sat 2026-05-23 04:12:10 UTC; 6 days ago
   Main PID: 2845 (java)
      Tasks: 42 (limit: 4915)
     Memory: 1.8G (limit: 4.0G)
        CPU: 42m 12.89s
     CGroup: /system.slice/cms-deploy.service
             └─2845 /usr/bin/java -jar /var/www/apollo-cms/cms-app.war

May 23 04:12:10 prod-srv-01 systemd[1]: Started Apollo Pharmacy CMS Platform Deployment Daemon.
May 23 04:12:12 prod-srv-01 cms-deploy[2845]: <span class="term-dim">[INFO] Starting Tomcat servlet engine...</span>
May 23 04:12:15 prod-srv-01 cms-deploy[2845]: <span class="term-dim">[INFO] Spring Boot application initialized successfully.</span>
May 23 04:12:16 prod-srv-01 cms-deploy[2845]: <span class="term-dim">[INFO] Connected to MongoDB at 10.0.2.15:27017.</span>
May 23 04:12:18 prod-srv-01 cms-deploy[2845]: <span class="term-dim">[INFO] Synchronized cache cluster with Redis on node-1.</span>\n`);
    }
    else if (lowerInput === "cat /etc/nginx/sites-enabled/apollo-cms" || lowerInput === "cat /etc/nginx/sites-enabled/apollo-cms.conf") {
      appendLine(`upstream apollo_cms_backend {
    server 10.0.1.10:8080 max_fails=3 fail_timeout=10s;
    server 10.0.1.11:8080 max_fails=3 fail_timeout=10s;
    keepalive 32;
}

server {
    listen 80;
    server_name cms.apollopharmacy.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cms.apollopharmacy.in;

    ssl_certificate /etc/letsencrypt/live/cms.apollopharmacy.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cms.apollopharmacy.in/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    access_log /var/log/nginx/apollo_cms_access.log main;
    error_log /var/log/nginx/apollo_cms_error.log warn;

    location / {
        proxy_pass http://apollo_cms_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}\n`);
    }
    else if (lowerInput === "terraform plan") {
      appendLine(`Terraform used the selected providers to generate the following execution plan.
Resource actions are indicated with the following symbols:
  <span class="term-success">+ create</span>

Terraform will perform the following actions:

  <span class="term-bold"># aws_instance.web_servers[0]</span> will be created
  <span class="term-success">+</span> resource "aws_instance" "web_servers" {
      <span class="term-success">+</span> ami                  = "ami-0c7217cdde317cfec"
      <span class="term-success">+</span> instance_type        = "t3.medium"
      <span class="term-success">+</span> key_name             = "vajid-prod-key"
      <span class="term-success">+</span> subnet_id            = "subnet-0e241bc3c921018fa"
      <span class="term-success">+</span> tags                 = {
          <span class="term-success">+</span> "Environment" = "Production"
          <span class="term-success">+</span> "Name"        = "Apollo-CMS-Srv-01"
        }
    }

  <span class="term-bold"># aws_security_group.sg_web</span> will be created
  <span class="term-success">+</span> resource "aws_security_group" "sg_web" {
      <span class="term-success">+</span> name        = "allow-http-https"
      <span class="term-success">+</span> vpc_id      = "vpc-06d9a117b4c92ef9a"
    }

  <span class="term-bold"># aws_vpc.prod_vpc</span> will be created
  <span class="term-success">+</span> resource "aws_vpc" "prod_vpc" {
      <span class="term-success">+</span> cidr_block           = "10.0.0.0/16"
      <span class="term-success">+</span> enable_dns_hostnames = true
    }

<span class="term-bold">Plan:</span> <span class="term-success">3 to add, 0 to change, 0 to destroy.</span>

─────────────────────────────────────────────────────────────────────────────

Note: You didn't use the -out option to save this plan, so Terraform can't
guarantee to take exactly these actions if you run "terraform apply" now.\n`);
    }
    else if (lowerInput === "tail -f /var/log/deploy.log" || lowerInput === "tail -f /var/log/deploy") {
      runStreamingLogs();
    }
    else if (lowerInput === "aws ec2 describe-instances" || lowerInput === "aws ec2 describe") {
      appendLine(`<span class="term-info">{
    "Reservations": [
        {
            "Groups": [],
            "Instances": [
                {
                    "InstanceId": "i-08a6a24128f9cf310",
                    "ImageId": "ami-0c7217cdde317cfec",
                    "State": {
                        "Code": 16,
                        "Name": "running"
                    },
                    "InstanceType": "t3.medium",
                    "LaunchTime": "2026-05-11T09:23:44+00:00",
                    "Placement": {
                        "AvailabilityZone": "ap-south-1a"
                    },
                    "PrivateIpAddress": "10.0.1.10",
                    "Tags": [
                        {
                            "Key": "Name",
                            "Value": "Apollo-CMS-Srv-01"
                        }
                    ]
                }
            ]
        }
    ]
}</span>\n`);
    }
    else if (lowerInput === "matrix") {
      runMatrixTakeover();
    }
    else if (lowerInput === "clear") {
      terminalOutput.innerHTML = "";
    }
    else {
      appendLine(`bash: ${escapeHtml(cleanInput)}: command not found.
Type <span class="term-warning term-bold">help</span> to view available system commands.\n`);
    }
  }

  // 10 Lines streaming deploy log
  function runStreamingLogs() {
    isStreaming = true;
    terminalInput.disabled = true;
    terminalInput.placeholder = "Streaming... Wait or press Ctrl+C (disabled)";

    const logs = [
      "[17:15:32.011] INFO: GitHub Actions trigger received. Deployment pipeline active.",
      "[17:15:33.512] INFO: Fetching build artifacts from AWS S3 bucket: apollo-deploy-binaries",
      "[17:15:35.015] INFO: Artifact package size: 124MB. Verifying integrity checksum... OK.",
      "[17:15:36.518] INFO: Initiating rolling deployment on web host node 10.0.1.10",
      "[17:15:38.021] INFO: Stopping application service cms-deploy.service... DONE.",
      "[17:15:39.524] INFO: Extracting cms-app.war to deployment target... DONE.",
      "[17:15:41.028] INFO: Re-starting cms-deploy.service... DONE.",
      "[17:15:42.531] INFO: Testing endpoint healthcheck http://10.0.1.10:8080/health... Status 200 OK.",
      "[17:15:44.034] INFO: Rolling deployment complete for host node 10.0.1.10.",
      "SUCCESS: Rolling update complete. 0 errors, services nominal."
    ];

    let counter = 0;
    const interval = setInterval(() => {
      if (counter >= logs.length) {
        clearInterval(interval);
        isStreaming = false;
        terminalInput.disabled = false;
        terminalInput.placeholder = "";
        terminalInput.focus();
        appendLine("\n");
        return;
      }

      const logLine = logs[counter];
      if (logLine.startsWith("SUCCESS")) {
        appendLine(`<span class="term-success term-bold">${logLine}</span>\n`);
      } else {
        appendLine(`<span class="term-dim">${logLine}</span>\n`);
      }
      counter++;
    }, 1500);
  }

  // Matrix Takeover
  function runMatrixTakeover() {
    isStreaming = true;
    terminalInput.disabled = true;

    // Create a temporary canvas directly overlaying the terminal body
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "100";
    canvas.style.backgroundColor = "rgba(10, 12, 15, 0.95)";
    
    const parent = terminalBody;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    parent.style.position = "relative";
    parent.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const COLS = Math.floor(canvas.width / 14);
    const drops = Array(COLS).fill(1);
    const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]|&%$#";

    let frameCount = 0;
    let animId;

    function draw() {
      ctx.fillStyle = "rgba(10, 12, 15, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#39d353"; // GitHub green
      ctx.font = "12px 'JetBrains Mono', monospace";

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(char, i * 14, drops[i] * 14);

        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      frameCount++;
      animId = requestAnimationFrame(draw);
    }
    
    draw();

    // Terminate matrix overlay after 6.5s
    setTimeout(() => {
      cancelAnimationFrame(animId);
      canvas.style.transition = "opacity 0.6s ease";
      canvas.style.opacity = "0";
      setTimeout(() => {
        canvas.remove();
        isStreaming = false;
        terminalInput.disabled = false;
        terminalInput.focus();
        appendLine("Connection to core host restored.\n\n");
      }, 600);
    }, 6500);
  }

  function escapeHtml(string) {
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
});
