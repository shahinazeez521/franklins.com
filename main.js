/* ==========================================================================
   Franklin's Lectures — cinematic motion system (from scratch)
   - IntersectionObserver reveals (fade up + mask reveal + stagger)
   - Mouse parallax (hero shapes)
   - 3D tilt interaction (cards + hero frame)
   - Swiper premium showcase (depth + autoplay + bg blur sync)
   - CTA ripple
   ========================================================================== */

function initReveal() {
  const els = document.querySelectorAll(".reveal, .mask-reveal");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );

  els.forEach((el) => io.observe(el));
}

function initMouseParallax() {
  const items = Array.from(document.querySelectorAll(".parallax[data-depth]"));
  if (!items.length) return;

  let raf = 0;
  let mx = 0;
  let my = 0;

  const update = () => {
    raf = 0;
    for (const el of items) {
      const depth = Number(el.getAttribute("data-depth") || "0.35");
      const tx = mx * 10 * depth;
      const ty = my * 10 * depth;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    }
  };

  window.addEventListener(
    "mousemove",
    (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(update);
    },
    { passive: true }
  );
}

function initTilt() {
  const cards = Array.from(document.querySelectorAll("[data-tilt]"));
  if (!cards.length) return;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  for (const el of cards) {
    let raf = 0;
    let rect;

    const onMove = (ev) => {
      if (!rect) rect = el.getBoundingClientRect();
      const px = (ev.clientX - rect.left) / rect.width;
      const py = (ev.clientY - rect.top) / rect.height;

      const rx = clamp((0.5 - py) * 10, -10, 10);
      const ry = clamp((px - 0.5) * 12, -12, 12);

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      });
    };

    const onEnter = () => {
      rect = el.getBoundingClientRect();
      el.style.transition = "transform 120ms ease";
    };

    const onLeave = () => {
      el.style.transition = "transform 520ms cubic-bezier(0.2, 0.8, 0.2, 1)";
      el.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg)";
      rect = null;
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
  }
}

function initShowcaseSwiper() {
  const root = document.querySelector(".showcase-swiper");
  if (!root || typeof Swiper === "undefined") return;

  const bg = document.querySelector(".showcase-bg");
  const prev = document.querySelector("[data-showcase-prev]");
  const next = document.querySelector("[data-showcase-next]");

  const slides = Array.from(root.querySelectorAll("img"));
  const initial = slides[0]?.getAttribute("src");
  if (bg && initial) bg.style.backgroundImage = `url('${initial}')`;

  const swiper = new Swiper(root, {
    loop: true,
    speed: 900,
    centeredSlides: true,
    slidesPerView: 1,
    spaceBetween: 18,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    pagination: {
      el: root.querySelector(".swiper-pagination"),
      clickable: true,
    },
    navigation: {
      prevEl: prev,
      nextEl: next,
    },
    breakpoints: {
      640: { slidesPerView: 1.3, spaceBetween: 18 },
      1024: { slidesPerView: 1.65, spaceBetween: 22 },
      1280: { slidesPerView: 2.1, spaceBetween: 24 },
    },
    on: {
      slideChangeTransitionStart() {
        const active = root.querySelector(".swiper-slide-active img");
        const src = active?.getAttribute("src");
        if (bg && src) bg.style.backgroundImage = `url('${src}')`;
      },
    },
  });

  // Extra pause control to keep it premium
  root.addEventListener("mouseenter", () => swiper.autoplay?.stop());
  root.addEventListener("mouseleave", () => swiper.autoplay?.start());
}

function initMobileMenu() {
  const btn = document.getElementById("mobile-menu-btn");
  const close = document.getElementById("mobile-menu-close");
  const menu = document.getElementById("mobile-menu");
  const links = document.querySelectorAll(".mobile-nav-link");

  if (!btn || !menu) return;

  const toggleMenu = (open) => {
    menu.classList.toggle("translate-x-full", !open);
    document.body.classList.toggle("overflow-hidden", open);
  };

  btn.addEventListener("click", () => toggleMenu(true));
  if (close) close.addEventListener("click", () => toggleMenu(false));

  links.forEach(link => {
    link.addEventListener("click", () => toggleMenu(false));
  });

  // Close on escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggleMenu(false);
  });
}

function initNavbarScroll() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  const updateNav = () => {
    if (window.scrollY > 20) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav(); // Initial check
}

function initParallaxOnScroll() {
  const parallaxEls = Array.from(document.querySelectorAll("[data-parallax]"));
  if (!parallaxEls.length) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY || 0;
    for (const el of parallaxEls) {
      const amt = Number(el.getAttribute("data-parallax") || "0.12");
      el.style.transform = `translate3d(0, ${y * amt}px, 0)`;
    }
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );
  update();
}

function initRipple() {
  const buttons = Array.from(document.querySelectorAll("[data-ripple]"));
  for (const btn of buttons) {
    btn.style.position = "relative";
    btn.style.overflow = "hidden";

    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const span = document.createElement("span");
      span.className = "ripple";
      span.style.left = `${x}px`;
      span.style.top = `${y}px`;
      btn.appendChild(span);

      window.setTimeout(() => span.remove(), 750);
    });
  }
}

function initHeroEntrance() {
  if (typeof gsap === "undefined") return;
  const frame = document.querySelector(".hero-frame");
  if (!frame) return;

  // Hero reveal logic is now triggered after preloader or on load
  gsap.fromTo(
    frame,
    { y: 40, opacity: 0, scale: 0.98, rotateX: 5 },
    { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 1.4, ease: "expo.out", delay: 0.1 }
  );

  // Stagger reveal other hero elements
  gsap.from(".hero-reveal", {
    y: 40,
    opacity: 0,
    stagger: 0.15,
    duration: 1.2,
    ease: "power4.out",
    delay: 0.4
  });
}

function initPreloader() {
  const preloader = document.getElementById("preloader");
  if (!preloader || typeof gsap === "undefined") return;

  const tl = gsap.timeline();

  // 1. Entrance: Logo & Glow
  tl.to("#preloader-logo-container", {
    opacity: 1,
    y: 0,
    duration: 1.4,
    ease: "expo.out"
  })
    .to("#preloader-glow", {
      scale: 1,
      duration: 1.8,
      ease: "power2.out"
    }, "-=1")
    .to("#preloader-text", {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: "power3.out"
    }, "-=1.4")
    .to("#preloader-bar", {
      width: "45%", // Simulated progress
      duration: 3,
      ease: "power1.inOut"
    }, "-=1");

  // 2. Transition to site
  const startTransition = () => {
    const exitTl = gsap.timeline({
      delay: 0.2, // Small beat of stillness
      onComplete: () => {
        preloader.style.display = "none";
        document.body.classList.remove("overflow-hidden");
        // Trigger hero after preloader is gone
        initHeroEntrance();
      }
    });

    exitTl.to("#preloader-bar", {
      width: "100%",
      duration: 0.4,
      ease: "power2.in"
    })
      .to(["#preloader-logo-container", "#preloader-text", "#preloader-bar", "#preloader-glow"], {
        y: -30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: "power4.in"
      })
      .to(preloader, {
        yPercent: -100, // Premium slide up
        duration: 1.2,
        ease: "expo.inOut"
      }, "-=0.5");
  };

  // If page is already loaded, transition immediately after entrance
  if (document.readyState === "complete") {
    startTransition();
  } else {
    window.addEventListener("load", startTransition);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initPreloader();
  initReveal();
  initMouseParallax();
  initTilt();
  initShowcaseSwiper();
  initNavbarScroll();
  initMobileMenu();
  initParallaxOnScroll();
  initRipple();
});

