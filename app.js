// ================================================================
// BALDO TECH — app.js
// Complete — all systems including form validation
// ================================================================
"use strict";


(function BalDoTechApp() {


  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


  /* ----------------------------------------------------------
     1. HEADER SHRINK ON SCROLL
  ---------------------------------------------------------- */
  function initHeaderShrink() {
    const header = qs(".site-header");
    if (!header) return;


    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 56);
    }


    window.addEventListener("scroll", update, { passive: true });
    update();
  }


  /* ----------------------------------------------------------
     2. CARD INTERACTION SYSTEM
        Mouse glow · Keyboard expand · Touch tap · Escape close
        One card active at a time
  ---------------------------------------------------------- */
  function initCards() {
    const cards   = qsa(".service-card");
    const isTouch = window.matchMedia("(hover: none)").matches;
    let activeCard = null;


    function activate(card) {
      if (activeCard && activeCard !== card) deactivate(activeCard);
      card.classList.add("is-active");
      card.setAttribute("aria-expanded", "true");
      const body = qs(".card-body", card);
      if (body) {
        body.removeAttribute("aria-hidden");
        qsa("li", body).forEach((li) => li.removeAttribute("aria-hidden"));
        const link = qs(".card-link", card);
        if (link) link.removeAttribute("tabindex");
      }
      activeCard = card;
    }


    function deactivate(card) {
      card.classList.remove("is-active");
      card.setAttribute("aria-expanded", "false");
      const body = qs(".card-body", card);
      if (body) {
        body.setAttribute("aria-hidden", "true");
        const link = qs(".card-link", card);
        if (link) link.setAttribute("tabindex", "-1");
      }
      if (activeCard === card) activeCard = null;
    }


    cards.forEach((card) => {
      card.setAttribute("aria-expanded", "false");


      /* Glow tracking */
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width)  * 100;
        const y = ((e.clientY - rect.top)  / rect.height) * 100;
        const glow = qs(".card-glow-layer", card);
        if (glow) {
          glow.style.setProperty("--gx", `${x}%`);
          glow.style.setProperty("--gy", `${y}%`);
        }
      });


      /* Touch tap toggle */
      if (isTouch) {
        card.addEventListener("click", (e) => {
          if (e.target.closest(".card-link")) return;
          card.classList.contains("is-active") ? deactivate(card) : activate(card);
        });
      }


      /* Keyboard expand */
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.classList.contains("is-active") ? deactivate(card) : activate(card);
        }
      });
    });


    /* Escape closes active card */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && activeCard) {
        const prev = activeCard;
        deactivate(activeCard);
        prev.focus();
      }
    });


    /* Tap / click outside closes card */
    document.addEventListener("pointerdown", (e) => {
      if (activeCard && !activeCard.contains(e.target)) {
        deactivate(activeCard);
      }
    });
  }


  /* ----------------------------------------------------------
     3. SCROLL REVEAL
        Cards fade + rise on viewport entry, staggered by index
  ---------------------------------------------------------- */
  function initScrollReveal() {
    const cards = qsa(".service-card");


    if (!("IntersectionObserver" in window)) {
      cards.forEach((c) => { c.style.opacity = "1"; });
      return;
    }


    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const idx = parseInt(entry.target.dataset.revealIndex || "0", 10);
        setTimeout(() => {
          entry.target.style.opacity   = "1";
          entry.target.style.transform = "translateY(0)";
        }, idx * 60);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });


    cards.forEach((card, i) => {
      card.dataset.revealIndex = i;
      card.style.opacity       = "0";
      card.style.transform     = "translateY(22px)";
      card.style.transition    =
        "opacity 0.65s cubic-bezier(0.16,1,0.3,1), " +
        "transform 0.65s cubic-bezier(0.16,1,0.3,1), " +
        "border-color 0.35s cubic-bezier(0.25,1,0.5,1), " +
        "box-shadow 0.35s cubic-bezier(0.25,1,0.5,1), " +
        "min-height 0.52s cubic-bezier(0.16,1,0.3,1), " +
        "background 0.35s cubic-bezier(0.25,1,0.5,1)";
      obs.observe(card);
    });
  }


  /* ----------------------------------------------------------
     4. PRINT SECTION REVEAL
        Sequential staggered entrance for 3D section elements
  ---------------------------------------------------------- */
  function initPrintReveal() {
    const section = qs(".print-section");
    if (!section) return;


    const badge   = qs(".print-badge",    section);
    const kicker  = qs(".print-kicker",   section);
    const title   = qs(".print-title",    section);
    const sub     = qs(".print-sub",      section);
    const ctaWrap = qs(".print-cta-wrap", section);
    const orb     = qs(".print-orb-ring", section);
    const feats   = qsa(".print-feature", section);


    const els = [badge, kicker, title, sub, ...feats, ctaWrap, orb].filter(Boolean);


    els.forEach((el) => {
      el.style.opacity    = "0";
      el.style.transform  = "translateY(22px)";
      el.style.transition =
        "opacity 0.7s cubic-bezier(0.16,1,0.3,1), " +
        "transform 0.7s cubic-bezier(0.16,1,0.3,1)";
    });


    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => { el.style.opacity = "1"; el.style.transform = "none"; });
      return;
    }


    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        els.forEach((el, i) => {
          setTimeout(() => {
            el.style.opacity   = "1";
            el.style.transform = "translateY(0)";
          }, i * 80);
        });
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12 });


    obs.observe(section);
  }


  /* ----------------------------------------------------------
     5. SMOOTH ANCHOR SCROLL
        Offset-aware for sticky header on all #anchor links
  ---------------------------------------------------------- */
  function initSmoothScroll() {
    const header = qs(".site-header");


    qsa('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;
        const target = qs(id);
        if (!target) return;
        e.preventDefault();
        const offset = (header ? header.offsetHeight : 0) + 8;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      });
    });
  }


  /* ----------------------------------------------------------
     6. HERO ENTRANCE ANIMATION
        Kicker · title · subtitle · CTA cascade in on load
  ---------------------------------------------------------- */
  function initHeroEntrance() {
    const els = [
      qs(".hero-kicker"),
      qs(".hero-title"),
      qs(".hero-sub"),
      qs(".hero-cta"),
    ].filter(Boolean);


    els.forEach((el, i) => {
      el.style.opacity    = "0";
      el.style.transform  = "translateY(26px)";
      el.style.transition =
        `opacity 0.75s ${0.1 + i * 0.13}s cubic-bezier(0.16,1,0.3,1), ` +
        `transform 0.75s ${0.1 + i * 0.13}s cubic-bezier(0.16,1,0.3,1)`;
    });


    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        els.forEach((el) => {
          el.style.opacity   = "1";
          el.style.transform = "translateY(0)";
        });
      });
    });
  }


  /* ----------------------------------------------------------
     7. CONTACT FORM
        Character counter · inline validation · loading state
        Success reveal · full reset flow
  ---------------------------------------------------------- */
  function initContactForm() {
    const form       = document.getElementById("contact-form");
    const successBox = document.getElementById("form-success");
    const resetBtn   = document.getElementById("form-reset-btn");
    const submitBtn  = document.getElementById("form-submit-btn");
    const textarea   = document.getElementById("cf-message");
    const charCount  = document.getElementById("cf-charcount");
    const MAX_CHARS  = 1000;


    if (!form) return;


    /* ---- Character counter ---- */
    if (textarea && charCount) {
      textarea.addEventListener("input", () => {
        let len = textarea.value.length;
        if (len > MAX_CHARS) {
          textarea.value = textarea.value.slice(0, MAX_CHARS);
          len = MAX_CHARS;
        }
        charCount.textContent = `${len} / ${MAX_CHARS}`;
        charCount.classList.toggle("is-warn",  len > MAX_CHARS * 0.8 && len <= MAX_CHARS);
        charCount.classList.toggle("is-limit", len >= MAX_CHARS);
      });
    }


    /* ---- Error helpers ---- */
    function showError(inputId, errorId, msg) {
      const input = document.getElementById(inputId);
      const error = document.getElementById(errorId);
      if (input) input.classList.add("is-error");
      if (error) error.textContent = msg;
    }


    function clearError(inputId, errorId) {
      const input = document.getElementById(inputId);
      const error = document.getElementById(errorId);
      if (input) input.classList.remove("is-error");
      if (error) error.textContent = "";
    }


    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    }


    /* ---- Full form validation ---- */
    function validate() {
      let valid = true;


      const nameEl    = document.getElementById("cf-name");
      const emailEl   = document.getElementById("cf-email");
      const messageEl = document.getElementById("cf-message");


      clearError("cf-name",    "cf-name-error");
      clearError("cf-email",   "cf-email-error");
      clearError("cf-message", "cf-message-error");


      if (!nameEl || nameEl.value.trim().length < 2) {
        showError("cf-name", "cf-name-error", "Please enter your full name (min. 2 characters).");
        valid = false;
      }


      if (!emailEl || !isValidEmail(emailEl.value)) {
        showError("cf-email", "cf-email-error", "Please enter a valid business email address.");
        valid = false;
      }


      if (!messageEl || messageEl.value.trim().length < 10) {
        showError("cf-message", "cf-message-error", "Please write a brief message (min. 10 characters).");
        valid = false;
      }


      return valid;
    }


    /* ---- Live blur + input clearing ---- */
    const nameInput  = document.getElementById("cf-name");
    const emailInput = document.getElementById("cf-email");
    const msgInput   = document.getElementById("cf-message");


    if (nameInput) {
      nameInput.addEventListener("blur", () => {
        if (nameInput.value.trim().length >= 2) clearError("cf-name", "cf-name-error");
      });
      nameInput.addEventListener("input", () => {
        if (nameInput.classList.contains("is-error") && nameInput.value.trim().length >= 2) {
          clearError("cf-name", "cf-name-error");
        }
      });
    }


    if (emailInput) {
      emailInput.addEventListener("blur", () => {
        if (isValidEmail(emailInput.value)) clearError("cf-email", "cf-email-error");
      });
      emailInput.addEventListener("input", () => {
        if (emailInput.classList.contains("is-error") && isValidEmail(emailInput.value)) {
          clearError("cf-email", "cf-email-error");
        }
      });
    }


    if (msgInput) {
      msgInput.addEventListener("blur", () => {
        if (msgInput.value.trim().length >= 10) clearError("cf-message", "cf-message-error");
      });
      msgInput.addEventListener("input", () => {
        if (msgInput.classList.contains("is-error") && msgInput.value.trim().length >= 10) {
          clearError("cf-message", "cf-message-error");
        }
      });
    }


    /* ---- Submit handler ---- */
    form.addEventListener("submit", (e) => {
      e.preventDefault();


      if (!validate()) {
        const firstError = form.querySelector(".is-error");
        if (firstError) {
          const offset = (qs(".site-header")?.offsetHeight || 0) + 16;
          const top    = firstError.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: "smooth" });
          firstError.focus();
        }
        return;
      }


      /* Loading state */
      if (submitBtn) {
        submitBtn.classList.add("is-loading");
        submitBtn.disabled = true;
      }


      /* ---- Send to Cloudflare Worker ---- */
      fetch("/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    document.getElementById("cf-name").value.trim(),
          company: document.getElementById("cf-company")?.value.trim() || "",
          email:   document.getElementById("cf-email").value.trim(),
          phone:   document.getElementById("cf-phone")?.value.trim() || "",
          service: document.getElementById("cf-service")?.value || "",
          message: document.getElementById("cf-message").value.trim(),
        }),
      })
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then(() => showSuccess())
      .catch(() => {
        showError("cf-message", "cf-message-error", "Something went wrong. Please try again.");
        if (submitBtn) {
          submitBtn.classList.remove("is-loading");
          submitBtn.disabled = false;
        }
      });
    });


    /* ---- Show success state ---- */
    function showSuccess() {
      if (submitBtn) {
        submitBtn.classList.remove("is-loading");
        submitBtn.disabled = false;
      }
      form.hidden = true;
      if (successBox) {
        successBox.hidden = false;
        successBox.focus();
      }
    }


    /* ---- Reset handler ---- */
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        form.reset();


        if (charCount) {
          charCount.textContent = "0 / 1000";
          charCount.classList.remove("is-warn", "is-limit");
        }


        qsa(".is-error", form).forEach((el) => el.classList.remove("is-error"));
        qsa(".form-error", form).forEach((el) => { el.textContent = ""; });


        if (successBox) successBox.hidden = true;
        form.hidden = false;


        const firstInput = form.querySelector("input, textarea, select");
        if (firstInput) setTimeout(() => firstInput.focus(), 50);
      });
    }
  }


  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  function init() {
    initHeaderShrink();
    initCards();
    initScrollReveal();
    initPrintReveal();
    initSmoothScroll();
    initHeroEntrance();
    initContactForm();
    initHeroCanvas(); 
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }


})();

/* ----------------------------------------------------------
   8. HERO CANVAS — 3D Rotating Cube + Pyramid
---------------------------------------------------------- */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  const GOLD  = 'rgba(229,184,66,';
  const BLUE  = 'rgba(13,27,62,';

  /* ---- Matrix math ---- */
  function rotX(p, a) {
    return { x: p.x, y: p.y * Math.cos(a) - p.z * Math.sin(a), z: p.y * Math.sin(a) + p.z * Math.cos(a) };
  }
  function rotY(p, a) {
    return { x: p.x * Math.cos(a) + p.z * Math.sin(a), y: p.y, z: -p.x * Math.sin(a) + p.z * Math.cos(a) };
  }
  function rotZ(p, a) {
    return { x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a), z: p.z };
  }
  function project(p, cx, cy, fov) {
    const z = p.z + fov;
    const scale = fov / z;
    return { x: cx + p.x * scale, y: cy + p.y * scale, s: scale };
  }
  function drawEdge(a, b, alpha, width) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = GOLD + alpha + ')';
    ctx.lineWidth = width;
    ctx.stroke();
  }
  function drawFace(pts, fillAlpha, strokeAlpha) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fillStyle   = BLUE + fillAlpha + ')';
    ctx.strokeStyle = GOLD + strokeAlpha + ')';
    ctx.lineWidth   = 1.2;
    ctx.fill();
    ctx.stroke();
  }

  /* ---- CUBE ---- */
  const cubeSize = 120;
  const cubeVerts = [
    {x:-1,y:-1,z:-1},{x:1,y:-1,z:-1},{x:1,y:1,z:-1},{x:-1,y:1,z:-1},
    {x:-1,y:-1,z:1}, {x:1,y:-1,z:1}, {x:1,y:1,z:1}, {x:-1,y:1,z:1},
  ].map(v => ({ x: v.x * cubeSize, y: v.y * cubeSize, z: v.z * cubeSize }));

  const cubeFaces = [
    [0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[0,3,7,4],[1,2,6,5]
  ];

  /* ---- PYRAMID ---- */
  const pyBase = 150;
  const pyH    = 200;
  const pyVerts = [
    {x:-pyBase,y:pyH/2, z:-pyBase},
    {x: pyBase,y:pyH/2, z:-pyBase},
    {x: pyBase,y:pyH/2, z: pyBase},
    {x:-pyBase,y:pyH/2, z: pyBase},
    {x:0,      y:-pyH/2,z:0},
  ];
  const pyFaces = [
    [0,1,2,3],
    [0,1,4],[1,2,4],[2,3,4],[3,0,4],
  ];

  /* ---- Floating particles ---- */
  const particles = Array.from({ length: 28 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 1.5 + 0.5,
  }));

  let t = 0;

  function drawShape(verts, faces, cx, cy, rx, ry, rz) {
    const fov = 380;
    const rotated = verts.map(v => {
      let p = rotX(v, rx);
      p = rotY(p, ry);
      p = rotZ(p, rz);
      return p;
    });

    /* Sort faces back-to-front */
    const sorted = faces.map(face => {
      const avgZ = face.reduce((s, i) => s + rotated[i].z, 0) / face.length;
      return { face, avgZ };
    }).sort((a, b) => b.avgZ - a.avgZ);

    sorted.forEach(({ face }) => {
      const pts = face.map(i => project(rotated[i], cx, cy, fov));
      drawFace(pts, 0.25, 0.7);
    });
  }

  function drawParticles() {
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      /* Connect nearby particles */
      particles.forEach((q, j) => {
        if (j <= i) return;
        const dx = p.x - q.x, dy = p.y - q.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = GOLD + (1 - d/120) * 0.15 + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      });

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = GOLD + '0.4)';
      ctx.fill();
    });
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    t += 0.008;

    /* Cube — floats up/down gently, top-left area */
    const cubeX = W * 0.3 + Math.sin(t * 0.7) * 18;
    const cubeY = H * 0.38 + Math.cos(t * 0.5) * 14;
    drawShape(cubeVerts, cubeFaces, cubeX, cubeY, t * 0.6, t * 0.9, t * 0.3);

    /* Pyramid — floats opposite phase, bottom-right area */
    const pyX = W * 0.72 + Math.cos(t * 0.6) * 20;
    const pyY = H * 0.58 + Math.sin(t * 0.8) * 16;
    drawShape(pyVerts, pyFaces, pyX, pyY, t * 0.4, t * 0.7, t * 0.5);

    drawParticles();

    requestAnimationFrame(loop);
  }

  loop();
}