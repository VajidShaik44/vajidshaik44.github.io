document.addEventListener("DOMContentLoaded", function () {
  const terminalBody = document.getElementById("terminal-body-click");
  const terminalInput = document.getElementById("terminal-cli-input");
  const terminalOutput = document.getElementById("terminal-cli-output");

  if (!terminalBody || !terminalInput || !terminalOutput) return;

  const commands = [
    "help",
    "whoami",
    "cat experience.log",
    "cat projects.log",
    "cat skills.txt",
    "contact",
    "clear"
  ];
  const commandHistory = [];
  let historyIndex = 0;

  function appendLine(text, className = "") {
    const line = document.createElement("div");
    line.className = className;
    line.textContent = text;
    terminalOutput.append(line);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function showHelp() {
    appendLine(commands.join("\n"), "term-info");
  }

  function showProfile() {
    appendLine([
      "Name: Vajid Shaik",
      "Role: DevOps Engineer",
      "Company: Zerocode Innovations Pvt Ltd",
      "Location: Hyderabad, India",
      "Experience: About 2 years",
      "Kubernetes and Helm: Personal projects only"
    ].join("\n"), "term-info");
  }

  function showExperience() {
    appendLine([
      "DevOps Engineer | Zerocode Innovations Pvt Ltd | Hyderabad, India | Dec 2024 - Present",
      "Manage development, UAT, and production environments, supporting 20+ production deployments per month for business-critical production applications.",
      "Automate deployments with a push-triggered GitHub Actions pipeline that installs dependencies, builds, and deploys the latest code over SSH, replacing manual multi-step deployments with a repeatable pipeline.",
      "Build and support Java WAR workflows with Jenkins and Maven, Tomcat deployments, and S3-based build artifact storage.",
      "Create Bash monitoring scripts with Google Chat alerts, schedule them with systemd timers, and add MySQL health and thread alerting.",
      "Configure Nginx reverse proxy, SSL/TLS, and load balancing for application delivery across AWS EC2 and Ubuntu/Linux systems.",
      "Troubleshoot deployments and production operations through log analysis, Nginx and HTTP error investigation, SSL troubleshooting, and disk, memory, and resource monitoring."
    ].join("\n"), "term-info");
  }

  function showProjects() {
    appendLine([
      "Project A: End-to-End CI/CD Pipeline with Kubernetes (personal project)",
      "Stack: GitHub Actions, Docker, Kubernetes, Helm, Nginx Ingress, Prometheus, Grafana, Linux.",
      "",
      "Project B: BlogCMS deployment (personal project)",
      "Open-source Go API and Vue frontend cloned and deployed by Vajid; he did not author the application.",
      "Single-node K3s, API and frontend pods, 5Gi uploads PVC, host Nginx, Let's Encrypt TLS.",
      "Live: https://cmsapp.duckdns.org",
      "Operations: health/readiness endpoints, deployment scripts, and database backups."
    ].join("\n"), "term-info");
  }

  function showSkills() {
    appendLine([
      "Production experience:",
      "AWS (EC2, S3), Ubuntu/Linux, Git, GitHub Actions, Jenkins, Maven, Java WAR, Tomcat, systemd, PM2, Nginx, MySQL, MongoDB, Redis, Bash, ELK stack, GoAccess.",
      "",
      "Hands-on (projects):",
      "Docker, Kubernetes, Helm, Nginx Ingress, Prometheus, Grafana, K3s, Linux, GitHub Actions."
    ].join("\n"), "term-info");
  }

  function showContact() {
    appendLine([
      "Phone: +91 9640781856",
      "Email: shaikvajid484@gmail.com",
      "LinkedIn: linkedin.com/in/vajid-shaik",
      "GitHub: github.com/VajidShaik44"
    ].join("\n"), "term-info");
  }

  function executeCommand(rawCommand) {
    const command = rawCommand.trim().replace(/\s+/g, " ").toLowerCase();
    appendLine(`vajid@devops:~$ ${rawCommand}`, "term-dim");

    if (command === "help") showHelp();
    else if (command === "whoami") showProfile();
    else if (command === "cat experience.log") showExperience();
    else if (command === "cat projects.log") showProjects();
    else if (command === "cat skills.txt") showSkills();
    else if (command === "contact") showContact();
    else if (command === "clear") terminalOutput.replaceChildren();
    else appendLine("Command not found. Type help to view available profile commands.", "term-warning");
  }

  terminalBody.addEventListener("click", function () {
    terminalInput.focus();
  });

  terminalInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      const command = terminalInput.value.trim();
      terminalInput.value = "";
      if (!command) return;
      commandHistory.push(command);
      historyIndex = commandHistory.length;
      executeCommand(command);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (commandHistory.length) {
        historyIndex = Math.max(0, historyIndex - 1);
        terminalInput.value = commandHistory[historyIndex];
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      historyIndex = Math.min(commandHistory.length, historyIndex + 1);
      terminalInput.value = commandHistory[historyIndex] || "";
    } else if (event.key === "Tab") {
      event.preventDefault();
      const value = terminalInput.value.trim().toLowerCase();
      const matches = commands.filter(command => command.startsWith(value));
      if (matches.length === 1) terminalInput.value = matches[0];
    }
  });
});