# Vajid Shaik — DevOps Engineer Portfolio

[![GitHub Pages](https://img.shields.io/badge/deployed-GitHub%20Pages-00ff88?style=flat-square)](https://vajidshaik44.github.io)

A modern, production-ready DevOps portfolio website built with pure HTML, CSS, and JavaScript. Deployed on GitHub Pages at **https://vajidshaik44.github.io**.

---

## 📁 Project Structure

```
portfolio/
├── index.html              ← Main HTML (all sections)
├── styles.css              ← All styles (dark terminal theme)
├── script.js               ← JS: nav, typewriter, GitHub API, animations
├── assets/
│   ├── resume/
│   │   └── vajid-shaik-devops-resume.pdf   ← Your actual PDF resume
│   └── images/             ← (optional) profile/project screenshots
└── README.md
```

---

## 🚀 Deployment — GitHub Pages (Step-by-Step)

### Step 1 — Create the repository

1. Go to **https://github.com/new**
2. Set the repository name to exactly: `vajidshaik44.github.io`
3. Make it **Public**
4. Click **Create repository**

> ⚠️ The repo name MUST match your GitHub username (lowercase) + `.github.io`

---

### Step 2 — Add your resume PDF

Before pushing, place your actual resume PDF at:
```
assets/resume/vajid-shaik-devops-resume.pdf
```

If you don't have a PDF yet, create an empty placeholder:
```bash
mkdir -p assets/resume
touch assets/resume/vajid-shaik-devops-resume.pdf
```

---

### Step 3 — Push to GitHub

```bash
# Initialize git in the portfolio folder
cd portfolio
git init
git add .
git commit -m "feat: initial portfolio deployment"

# Add the remote (replace with your actual repo URL)
git remote add origin https://github.com/VajidShaik44/vajidshaik44.github.io.git

# Push to main branch
git branch -M main
git push -u origin main
```

---

### Step 4 — Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top tab)
3. In the left sidebar click **Pages**
4. Under **Source**, select **Deploy from a branch**
5. Set branch to `main`, folder to `/ (root)`
6. Click **Save**

---

### Step 5 — Wait ~2 minutes, then visit

```
https://vajidshaik44.github.io
```

🎉 Your portfolio is live!

---

## 🔁 Updating the Portfolio

After making any changes:

```bash
git add .
git commit -m "update: <what you changed>"
git push
```

GitHub Pages auto-deploys on every push to `main`. Changes go live in ~1-2 minutes.

---

## ✏️ How to Customize

### Change personal info
Edit `index.html` — search for any text you want to update:
- Name: `Vajid Shaik`
- Email: `shaikvajid484@gmail.com`
- Phone: `+91 9640781856`
- LinkedIn/GitHub URLs

### Add a project
Copy one of the `<div class="project-card">` blocks in `index.html` and update the content.

### Change colors
In `styles.css`, edit the `:root` CSS variables at the top:
```css
:root {
  --green:  #00ff88;   /* accent color */
  --blue:   #38bdf8;   /* secondary accent */
  --bg:     #080b10;   /* main background */
}
```

### Update resume
Replace `assets/resume/vajid-shaik-devops-resume.pdf` with your new PDF — keep the same filename.

### GitHub repos section
The GitHub section auto-fetches from the GitHub API using your username `VajidShaik44`. It shows your 9 most recently pushed non-fork repos automatically.

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Structure & semantic markup |
| CSS3 | Styling, animations, grid/flexbox layout |
| JavaScript (ES6+) | Interactions, GitHub API, typewriter effect |
| GitHub API v3 | Auto-fetch public repositories |
| Devicon CDN | Technology icons |
| Google Fonts | JetBrains Mono + Sora |
| GitHub Pages | Free static hosting |

No build tools, no Node.js, no dependencies to install. Pure vanilla.

---

## ✅ Features Checklist

- [x] Fully responsive (mobile, tablet, desktop)
- [x] Dark terminal/industrial aesthetic
- [x] Typewriter hero animation
- [x] Smooth scroll navigation with active highlighting
- [x] Floating terminal animation in hero
- [x] Skill categories with Devicon logos
- [x] Project cards with pipeline/K8s/Terraform visuals
- [x] Experience timeline
- [x] DevOps pipeline architecture diagram
- [x] Infinite-scroll tools marquee
- [x] Auto-fetch GitHub repositories via API
- [x] Resume download button
- [x] Contact form with mailto functionality
- [x] Scroll-triggered reveal animations
- [x] SEO meta tags and Open Graph
- [x] No external JS frameworks — works on GitHub Pages instantly

---

## 📄 License

MIT — feel free to fork and customize for your own portfolio.

---

*Built by Vajid Shaik · DevOps Engineer · Hyderabad, India*
