const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll(".project-screenshot img").forEach((image) => {
  const figure = image.closest(".project-screenshot");
  const revealLoadedImage = () => {
    if (image.naturalWidth > 0) {
      figure.classList.add("is-loaded");
    }
  };

  image.addEventListener("load", revealLoadedImage, { once: true });
  image.addEventListener("error", () => {
    figure.classList.remove("is-loaded");
  }, { once: true });

  if (image.complete) {
    revealLoadedImage();
  }
});

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealTargets = document.querySelectorAll(
    ".about-copy, .project-card, .experience-card, .skill-group, .contact-inner",
  );

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((element) => {
    element.classList.add("reveal-on-scroll");
    revealObserver.observe(element);
  });
}

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  navLinks.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  navLinks.classList.toggle("is-open", !isOpen);
});

navLinks.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuToggle.focus();
  }
});
