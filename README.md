# Vajid Shaik — DevOps Engineer

Personal portfolio built with plain HTML, CSS, and JavaScript and hosted on GitHub Pages.

**Live site:** https://vajidshaik44.github.io/

## Files

- `index.html` — page content, projects, experience, and contact links
- `styles.css` — responsive layout and visual styles
- `script.js` — accessible mobile navigation
- `assets/resume/vajid-shaik-devops-resume.pdf` — ATS-friendly PDF résumé
- `assets/resume/Vajid_Shaik_DevOps_Engineer_Resume.docx` — editable résumé source

There is no build step or package installation.

## Preview locally

Open `index.html` in a browser, or start a local static server from this directory:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000.

## Publish updates

The GitHub Pages site is published from the root of the `main` branch. After updating the files:

```bash
git add .gitattributes README.md assets/resume/vajid-shaik-devops-resume.pdf assets/resume/Vajid_Shaik_DevOps_Engineer_Resume.docx
git commit -m "Refresh portfolio design"
git push origin main
```

GitHub Pages deploys the pushed changes automatically.

## Updating portfolio content

Edit the relevant sections in `index.html`. Project cards link to their source repositories and live site. Keep experience details, technology lists, and any measurable outcomes aligned with current, verifiable information.

The mobile navigation is implemented in `script.js`; it supports keyboard dismissal with Escape and updates its expanded state for assistive technology.
