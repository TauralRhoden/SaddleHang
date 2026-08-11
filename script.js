(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- hero parallax ---------- */
  const parallaxEls = document.querySelectorAll("[data-parallax]");
  if (parallaxEls.length && !prefersReducedMotion) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0;
        const r = el.getBoundingClientRect();
        const offset = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translateY(${(-offset * speed).toFixed(1)}px)`;
      });
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* ---------- gentle scroll reveal ----------
     Classes are added here (not baked into the HTML), so content stays
     fully visible if JS fails to load or reduced-motion is on. */
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll(
      ".hero-copy, .section-head, .showcase, .thumb, .detail-media, .detail-copy, .product-card, .how-grid li, .notify h2, .notify .lede, .notify-form"
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach((el, i) => {
      el.classList.add("reveal-init");
      el.style.transitionDelay = `${Math.min(i % 3, 2) * 90}ms`;
      io.observe(el);
    });
  }

  /* ---------- notify form ---------- */
  const form = document.getElementById("notify-form");
  const success = document.getElementById("notify-success");
  const successEmail = document.getElementById("notify-email");
  const errorEl = document.getElementById("notify-error");
  const emailInput = document.getElementById("email");

  const isValidEmail = (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();

      if (!isValidEmail(email)) {
        errorEl.hidden = false;
        emailInput.setAttribute("aria-invalid", "true");
        return;
      }
      errorEl.hidden = true;
      emailInput.removeAttribute("aria-invalid");

      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;

      // Submit to Netlify Forms (no-op locally / on non-Netlify hosts —
      // the success state still shows either way).
      const data = new FormData(form);
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString(),
      }).catch(() => {
        /* ignore — still show success state below */
      }).finally(() => {
        successEmail.textContent = email;
        form.hidden = true;
        success.hidden = false;
      });
    });

    emailInput.addEventListener("input", () => {
      if (!errorEl.hidden) errorEl.hidden = true;
    });
  }
})();
