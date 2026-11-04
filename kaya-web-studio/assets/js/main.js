(() => {
  "use strict";

  const CONTACT_EMAIL = "contact@kayawebstudio.com";
  const WHATSAPP_NUMBER = "905358305572";
  const SESSION_KEY = "kws-intro-seen";
  const LOGO_WIDTH = (40 * 352) / 120;
  const LOGO_HEIGHT = 40;
  const ESTD_OFFSET = (40 * 128) / 120;
  const LOCKUP_TOTAL_HEIGHT = (40 * 152) / 120;

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const canAnimate = Boolean(window.gsap && window.ScrollTrigger) && !prefersReducedMotion;
  const state = { lenis: null };

  const select = (selector, scope = document) => scope.querySelector(selector);
  const selectAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const random = (min, max) => min + Math.random() * (max - min);
  const isCompact = () => window.innerWidth < 760;

  function refreshScrollTriggers() {
    if (canAnimate) {
      ScrollTrigger.refresh();
    }
  }

  function debounce(callback, wait) {
    let timer = 0;

    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => callback(...args), wait);
    };
  }

  function getTemplateSources(selector) {
    const template = select(selector);

    if (!template) {
      return [];
    }

    return Array.from(template.content.querySelectorAll("img")).map((image) => image.getAttribute("src"));
  }

  function createImageCard(className, source, loading = "eager") {
    const card = document.createElement("div");
    const image = document.createElement("img");

    card.className = className;
    image.src = source;
    image.alt = "";
    image.loading = loading;
    image.decoding = "async";
    card.append(image);

    return card;
  }

  function splitIntoWords(element, className) {
    const words = element.textContent.trim().split(/\s+/);
    const fragment = document.createDocumentFragment();
    const targets = [];

    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.className = className;
      span.textContent = word;
      fragment.append(span);
      targets.push(span);

      if (index < words.length - 1) {
        fragment.append(" ");
      }
    });

    element.replaceChildren(fragment);
    return targets;
  }

  function splitIntoCharacters(heading) {
    const text = heading.textContent.trim();
    const words = text.split(/\s+/);
    const fragment = document.createDocumentFragment();
    const characters = [];

    words.forEach((word, index) => {
      const mask = document.createElement("span");
      mask.className = "mask-word";
      mask.setAttribute("aria-hidden", "true");

      Array.from(word).forEach((character) => {
        const span = document.createElement("span");
        span.className = "split-char";
        span.textContent = character;
        mask.append(span);
        characters.push(span);
      });

      fragment.append(mask);

      if (index < words.length - 1) {
        fragment.append(" ");
      }
    });

    heading.setAttribute("aria-label", text);
    heading.replaceChildren(fragment);
    return characters;
  }

  function resolveHashTarget(hash) {
    if (hash === "#top") {
      return document.body;
    }

    return hash.length > 1 ? select(hash) : null;
  }

  function scrollToHash(hash) {
    const isTop = hash === "#top";
    const target = resolveHashTarget(hash);

    if (!target) {
      return;
    }

    if (state.lenis) {
      state.lenis.scrollTo(isTop ? 0 : target, { offset: isTop ? 0 : -20, duration: 1.4 });
    } else if (isTop) {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    } else {
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  }

  function setMenuOpen(open) {
    const toggle = select(".header__toggle");

    root.classList.toggle("is-menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");

    if (!state.lenis) {
      return;
    }

    if (open) {
      state.lenis.stop();
    } else {
      state.lenis.start();
    }
  }

  function initAnchors() {
    selectAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const hash = link.getAttribute("href");

        if (!resolveHashTarget(hash)) {
          return;
        }

        event.preventDefault();
        setMenuOpen(false);
        scrollToHash(hash);
      });
    });
  }

  function initMenu() {
    select(".header__toggle").addEventListener("click", () => {
      setMenuOpen(!root.classList.contains("is-menu-open"));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    });
  }

  function initServices() {
    const services = selectAll(".service");

    const setOpen = (service, open) => {
      const toggle = select(".service__toggle", service);
      const panel = select(".service__panel", service);

      toggle.setAttribute("aria-expanded", String(open));
      service.classList.toggle("service--open", open);

      if (!canAnimate) {
        panel.style.height = open ? "auto" : "0px";
        return;
      }

      gsap.to(panel, {
        height: open ? "auto" : 0,
        duration: 0.75,
        ease: "expo.inOut",
        overwrite: true,
        onComplete: refreshScrollTriggers,
      });

      if (open) {
        gsap.from(selectAll(".service__text, .service__tag", panel), {
          y: 18,
          autoAlpha: 0,
          duration: 0.7,
          delay: 0.2,
          stagger: 0.05,
          ease: "expo.out",
        });
      }
    };

    services.forEach((service) => {
      select(".service__toggle", service).addEventListener("click", () => {
        const shouldOpen = !service.classList.contains("service--open");

        services
          .filter((other) => other !== service && other.classList.contains("service--open"))
          .forEach((other) => setOpen(other, false));

        setOpen(service, shouldOpen);
      });
    });
  }

  function initCopyButtons() {
    selectAll("[data-copy]").forEach((button) => {
      const defaultLabel = button.textContent;

      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(button.dataset.copy);
          button.textContent = "Kopyalandı";
        } catch (error) {
          button.textContent = "Kopyalanamadı";
        }

        window.setTimeout(() => {
          button.textContent = defaultLabel;
        }, 1800);
      });
    });
  }

  function initContactForm() {
    const form = select(".form");
    const status = select(".form__status", form);
    const whatsappButton = select('[data-channel="whatsapp"]', form);
    const fields = {
      name: select("#form-name", form),
      reach: select("#form-reach", form),
      message: select("#form-message", form),
    };

    const composeMessage = () => {
      const services = selectAll('input[name="services"]:checked', form).map((input) => input.value);
      const lines = ["Merhaba Kaya Web Studio,", "", fields.message.value.trim(), ""];

      if (services.length > 0) {
        lines.push(`İlgilendiğim hizmetler: ${services.join(", ")}`);
      }

      lines.push(`Ad: ${fields.name.value.trim()}`, `İletişim: ${fields.reach.value.trim()}`);
      return lines.join("\n");
    };

    const buildEmailUrl = () => {
      const name = fields.name.value.trim();
      const subject = name ? `Proje talebi – ${name}` : "Proje talebi";

      return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(composeMessage())}`;
    };

    const updateWhatsappLink = () => {
      whatsappButton.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(composeMessage())}`;
    };

    const validate = () => {
      let firstInvalid = null;

      Object.values(fields).forEach((input) => {
        const invalid = input.value.trim() === "";
        input.closest(".form__field").classList.toggle("form__field--invalid", invalid);
        input.setAttribute("aria-invalid", String(invalid));

        if (invalid && !firstInvalid) {
          firstInvalid = input;
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
      }

      return firstInvalid === null;
    };

    form.addEventListener("input", (event) => {
      updateWhatsappLink();

      const field = event.target.closest(".form__field");

      if (field && event.target.value.trim() !== "") {
        field.classList.remove("form__field--invalid");
        event.target.setAttribute("aria-invalid", "false");
      }
    });

    form.addEventListener("change", updateWhatsappLink);

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!validate()) {
        status.textContent = "Göndermeden önce işaretli alanları doldurun.";
        return;
      }

      window.location.href = buildEmailUrl();
      status.textContent = `Mesajınız e-posta uygulamanızda hazırlandı; göndermek için uygulamada “Gönder”e basın. Uygulama açılmadıysa ${CONTACT_EMAIL} adresine yazabilirsiniz.`;
    });

    whatsappButton.addEventListener("click", (event) => {
      if (!validate()) {
        event.preventDefault();
        status.textContent = "Göndermeden önce işaretli alanları doldurun.";
        return;
      }

      updateWhatsappLink();
      status.textContent = "Mesajınız WhatsApp’ta hazırlandı; göndermek için WhatsApp’ta “Gönder”e basın.";
    });

    updateWhatsappLink();
  }

  function initQuickBrief() {
    const quick = select(".quick");
    const input = select(".quick__input", quick);
    const message = select("#form-message");
    const chips = selectAll(".wall__chip");
    const formOptions = selectAll('input[name="services"]');

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const pressed = chip.getAttribute("aria-pressed") !== "true";
        const option = formOptions.find((item) => item.value === chip.dataset.service);

        chip.setAttribute("aria-pressed", String(pressed));

        if (option) {
          option.checked = pressed;
          option.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    });

    formOptions.forEach((option) => {
      option.addEventListener("change", () => {
        const chip = chips.find((item) => item.dataset.service === option.value);

        if (chip) {
          chip.setAttribute("aria-pressed", String(option.checked));
        }
      });
    });

    quick.addEventListener("submit", (event) => {
      event.preventDefault();

      const idea = input.value.trim();

      if (idea) {
        message.value = idea;
        message.dispatchEvent(new Event("input", { bubbles: true }));
      }

      scrollToHash("#contact-form");
      window.setTimeout(() => select("#form-name").focus({ preventScroll: true }), 1400);
    });
  }

  function createWall({ animate }) {
    const wall = select(".wall");
    const rowsElement = select(".wall__rows");
    const sources = getTemplateSources(".wall__sources");
    const rows = [];
    let active = false;

    const render = (seconds) => {
      const radius = wall.clientWidth * 0.78;

      rows.forEach((row) => {
        row.offset = (((row.offset + row.speed * seconds) % row.span) + row.span) % row.span;

        row.cards.forEach((card, index) => {
          const position = (index * row.step + row.offset) % row.span;
          const theta = (position - row.span / 2) / radius;

          if (Math.abs(theta) > 1.05) {
            card.style.visibility = "hidden";
            return;
          }

          const x = Math.sin(theta) * radius;
          const z = (1 - Math.cos(theta)) * radius * 0.85;

          card.style.visibility = "visible";
          card.style.transform = `translate3d(${x.toFixed(1)}px, 0, ${z.toFixed(1)}px) rotateY(${(-theta).toFixed(4)}rad)`;
        });
      });
    };

    const build = () => {
      const width = wall.clientWidth;
      const height = wall.clientHeight;
      const cardSize = Math.round(Math.min(Math.max(width * 0.13, 104), 210));
      const step = cardSize + Math.round(cardSize * 0.1);
      const rowCount = Math.ceil((height * 1.15) / step) + 1;
      const perRow = Math.ceil((width * 2.1) / step) + 2;

      rows.length = 0;
      rowsElement.replaceChildren();
      rowsElement.style.setProperty("--wall-card", `${cardSize}px`);

      for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
        const rowElement = document.createElement("div");
        const cards = [];

        rowElement.className = "wall__row";

        for (let cardIndex = 0; cardIndex < perRow; cardIndex += 1) {
          const source = sources[(rowIndex * 5 + cardIndex * 3) % sources.length];
          const card = createImageCard("wall__card", source, "lazy");

          rowElement.append(card);
          cards.push(card);
        }

        rowsElement.append(rowElement);
        rows.push({
          cards,
          step,
          span: step * perRow,
          offset: Math.random() * step * perRow,
          speed: (rowIndex % 2 === 0 ? 1 : -1) * (16 + (rowIndex % 3) * 7),
        });
      }

      render(0);
    };

    const tick = (time, deltaTime) => render(Math.min(deltaTime, 64) / 1000);

    build();
    window.addEventListener("resize", debounce(build, 250));

    return {
      setActive(nextActive) {
        if (!animate || nextActive === active) {
          return;
        }

        active = nextActive;

        if (active) {
          gsap.ticker.add(tick);
        } else {
          gsap.ticker.remove(tick);
        }
      },
    };
  }

  function initSmoothScroll() {
    if (!window.Lenis) {
      return;
    }

    state.lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    state.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => state.lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    state.lenis.stop();
  }

  function createHeroFlow() {
    const hero = select(".hero");
    const layer = select(".hero__flow");
    const markSvg = select(".hero__mark svg");
    const sources = getTemplateSources(".gear-sources");
    const directions = [180, 225, 135];
    const timelines = new Set();
    let sourceIndex = 0;
    let running = false;

    const cards = Array.from({ length: isCompact() ? 5 : 10 }, () => {
      const card = createImageCard("flow-card", sources[0]);
      layer.append(card);
      return card;
    });

    const origin = () => {
      const heroBox = hero.getBoundingClientRect();
      const markBox = markSvg.getBoundingClientRect();

      return {
        x: markBox.left - heroBox.left + markBox.width * 0.88,
        y: markBox.top - heroBox.top + markBox.height * 0.5,
      };
    };

    const launch = (card, delay = 0) => {
      const start = origin();
      const angle = ((directions[sourceIndex % directions.length] + random(-16, 16)) * Math.PI) / 180;
      const distance = Math.max(hero.clientWidth, hero.clientHeight) * random(0.65, 1);
      const duration = random(3.6, 5.4);

      card.firstElementChild.src = sources[sourceIndex % sources.length];
      sourceIndex += 1;

      const timeline = gsap.timeline({
        delay,
        onComplete: () => {
          timelines.delete(timeline);

          if (running) {
            launch(card);
          }
        },
      });

      timeline
        .set(card, {
          x: start.x,
          y: start.y,
          xPercent: -50,
          yPercent: -50,
          scale: 0.03,
          rotation: random(-12, 12),
          autoAlpha: 0,
        })
        .to(card, { autoAlpha: 1, duration: 0.5, ease: "power1.out" }, 0)
        .to(
          card,
          {
            x: start.x + Math.cos(angle) * distance,
            y: start.y + Math.sin(angle) * distance,
            scale: random(0.8, 1.45),
            rotation: random(-5, 5),
            duration,
            ease: "power2.in",
            onUpdate: () => {
              card.style.zIndex = String(Math.round(Number(gsap.getProperty(card, "scale")) * 100));
            },
          },
          0,
        )
        .to(card, { autoAlpha: 0, duration: duration * 0.22, ease: "power1.in" }, duration * 0.78);

      timelines.add(timeline);
    };

    return {
      start() {
        if (running) {
          return;
        }

        running = true;
        cards.forEach((card, index) => launch(card, index * 0.5));
      },
      setActive(active) {
        timelines.forEach((timeline) => timeline.paused(!active));
      },
    };
  }

  function createHeroTimeline(flow) {
    const heroMark = select(".hero__mark svg");
    const titleLines = selectAll(".hero__title .mask-line__inner");
    const leadWords = splitIntoWords(select(".hero__lead"), "hero__lead-word");
    const markBar = select(".mark__bar", heroMark);
    const markSpokes = selectAll(".mark__spoke", heroMark);
    const details = [".hero__actions", ".hero__meta"];

    gsap.set(titleLines, { yPercent: 108 });
    gsap.set(markBar, { scaleY: 0, transformOrigin: "50% 50%" });
    gsap.set(markSpokes, { scaleX: 0, transformOrigin: "100% 50%" });
    gsap.set(leadWords, { y: 16, autoAlpha: 0 });
    gsap.set(details, { y: 28, autoAlpha: 0 });

    return gsap
      .timeline({ paused: true, defaults: { ease: "expo.out" } })
      .to(titleLines, { yPercent: 0, duration: 1.3, stagger: 0.1 }, 0)
      .to(markBar, { scaleY: 1, duration: 1.1 }, 0.15)
      .to(markSpokes, { scaleX: 1, duration: 1.2, stagger: 0.1 }, 0.35)
      .to(leadWords, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.018 }, 0.3)
      .to(details, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.09 }, 0.45)
      .add(() => flow.start(), 0.7);
  }

  function addIntroFlow(timeline, center) {
    const layer = select(".intro__flow");
    const sources = getTemplateSources(".gear-sources");
    const count = isCompact() ? 7 : 10;
    const reach = Math.hypot(window.innerWidth, window.innerHeight) * 0.6;

    for (let index = 0; index < count; index += 1) {
      const card = createImageCard("flow-card", sources[index % sources.length]);
      const angle = (index / count) * Math.PI * 2 + random(-0.3, 0.3);
      const start = 0.1 + index * 0.12;

      layer.append(card);
      gsap.set(card, {
        x: center.x,
        y: center.y,
        xPercent: -50,
        yPercent: -50,
        scale: 0.03,
        rotation: random(-14, 14),
        autoAlpha: 0,
      });

      timeline.to(card, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, start).to(
        card,
        {
          x: center.x + Math.cos(angle) * reach,
          y: center.y + Math.sin(angle) * reach,
          scale: random(0.85, 1.3),
          rotation: random(-6, 6),
          duration: random(1.4, 1.8),
          ease: "power2.in",
        },
        start,
      );
    }
  }

  function initIntro(heroTimeline) {
    const intro = select(".intro");
    const lockup = select(".intro__lockup");
    const estd = select(".intro__estd");
    const headerLogo = select(".header__brand .brand__logo");
    const headerBrand = select(".header__brand");
    const headerItems = [".header__nav", ".header__cta", ".header__toggle"];
    const bar = select(".intro__bar", lockup);
    const spokes = selectAll(".intro__spoke", lockup);
    const lines = selectAll(".intro__line", lockup);
    const estdParts = selectAll(".intro__estd-part", estd);

    let seenBefore = false;

    try {
      seenBefore = window.sessionStorage.getItem(SESSION_KEY) === "1";
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch (error) {
      seenBefore = false;
    }

    const complete = () => {
      if (!intro.isConnected) {
        return;
      }

      intro.remove();

      if (state.lenis) {
        state.lenis.start();
      }

      refreshScrollTriggers();
    };

    const forceComplete = () => {
      if (!intro.isConnected) {
        return;
      }

      gsap.set([headerBrand, ...headerItems], { autoAlpha: 1, y: 0 });
      heroTimeline.progress(1);
      complete();
    };

    const safetyTimer = window.setTimeout(forceComplete, 9000);

    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const layout = () => {
      const scale = Math.min(
        (window.innerWidth * 0.72) / LOGO_WIDTH,
        (window.innerHeight * 0.26) / LOCKUP_TOTAL_HEIGHT,
        3.8,
      );
      const x = (window.innerWidth - LOGO_WIDTH * scale) / 2;
      const y = (window.innerHeight - LOCKUP_TOTAL_HEIGHT * scale) / 2 - LOCKUP_TOTAL_HEIGHT * scale * 0.1;

      center.x = x + (LOGO_WIDTH * scale) / 2;
      center.y = y + (LOGO_HEIGHT * scale) / 2;
      gsap.set(lockup, { x, y, scale, visibility: "visible" });
      gsap.set(estd, { x, y: y + ESTD_OFFSET * scale, scale, visibility: "visible" });
    };

    layout();
    window.addEventListener("resize", layout);

    gsap.set(headerBrand, { autoAlpha: 0 });
    gsap.set(headerItems, { autoAlpha: 0, y: -12 });
    gsap.set(bar, { scaleY: 0, transformOrigin: "50% 50%" });
    gsap.set(spokes, { scaleX: 0, transformOrigin: "100% 50%" });
    gsap.set(lines, { y: 80 });
    gsap.set(estdParts, { autoAlpha: 0, y: 6 });

    const timeline = gsap.timeline({ defaults: { ease: "expo.out" } });

    timeline
      .to(".intro__progress-bar", { scaleX: 1, duration: 2, ease: "power2.inOut" }, 0)
      .to(bar, { scaleY: 1, duration: 0.8 }, 0.15)
      .to(spokes, { scaleX: 1, duration: 1, stagger: 0.1 }, 0.4)
      .to(lines, { y: 0, duration: 1.1, stagger: 0.14 }, 0.62)
      .to(estdParts, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }, 1.1)
      .addLabel("reveal", 2.15)
      .add(() => window.removeEventListener("resize", layout), "reveal")
      .to(
        [estd, ".intro__progress", ".intro__flow"],
        { autoAlpha: 0, duration: 0.35, ease: "power2.out" },
        "reveal",
      )
      .to(
        lockup,
        {
          x: () => headerLogo.getBoundingClientRect().left,
          y: () => headerLogo.getBoundingClientRect().top,
          scale: () => headerLogo.getBoundingClientRect().height / LOGO_HEIGHT,
          duration: 1.15,
          ease: "expo.inOut",
        },
        "reveal+=0.1",
      )
      .to(".intro__panel--base", { yPercent: -100, duration: 1.15, ease: "expo.inOut" }, "reveal+=0.25")
      .to(".intro__panel--accent", { yPercent: -100, duration: 1.15, ease: "expo.inOut" }, "reveal+=0.4")
      .add(() => heroTimeline.play(), "reveal+=0.8")
      .to(headerItems, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.06 }, "reveal+=1.2")
      .add(() => {
        window.clearTimeout(safetyTimer);
        gsap.set(headerBrand, { autoAlpha: 1 });
        lockup.style.visibility = "hidden";
      }, "reveal+=1.25")
      .add(complete, "reveal+=1.6");

    addIntroFlow(timeline, center);

    if (seenBefore) {
      timeline.timeScale(1.6);
    }
  }

  function initHeroMotion(flow) {
    const markInner = select(".hero__mark-inner");

    if (hasFinePointer) {
      const moveX = gsap.quickTo(markInner, "x", { duration: 1.2, ease: "power3" });
      const moveY = gsap.quickTo(markInner, "y", { duration: 1.2, ease: "power3" });
      const rotate = gsap.quickTo(markInner, "rotation", { duration: 1.4, ease: "power3" });

      select(".hero").addEventListener("pointermove", (event) => {
        const offsetX = event.clientX / window.innerWidth - 0.5;
        const offsetY = event.clientY / window.innerHeight - 0.5;

        moveX(offsetX * -36);
        moveY(offsetY * -28);
        rotate(offsetX * 4);
      });
    }

    const scrollOut = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };

    gsap.to(".hero__mark", { yPercent: -28, ease: "none", scrollTrigger: { ...scrollOut } });
    gsap.to(".hero__title", { yPercent: -14, ease: "none", scrollTrigger: { ...scrollOut } });
    gsap.to(".hero__flow", { yPercent: -10, autoAlpha: 0.4, ease: "none", scrollTrigger: { ...scrollOut } });

    ScrollTrigger.create({
      trigger: ".hero",
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => flow.setActive(self.isActive),
    });
  }

  function initHeader() {
    const header = select(".header");
    const progress = select(".header__progress");

    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        header.classList.toggle("header--solid", self.scroll() > 40);
        gsap.set(progress, { scaleX: self.progress });
      },
    });
  }

  function initMarquee() {
    const track = select(".marquee__track");
    const group = select(".marquee__group");

    track.append(group.cloneNode(true));

    const loop = gsap.to(track, { xPercent: -50, ease: "none", duration: 26, repeat: -1 });
    loop.totalTime(loop.duration() * 50);

    ScrollTrigger.create({
      trigger: ".marquee",
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const direction = self.direction;
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 5);

        gsap.to(loop, { timeScale: direction * boost, duration: 0.25, overwrite: true });
        gsap.to(loop, { timeScale: direction, duration: 1.2, delay: 0.25, ease: "power2.out" });
      },
    });
  }

  function initAbout() {
    const statement = select(".about__statement");
    const words = splitIntoWords(statement, "about__word");

    gsap.fromTo(
      words,
      { opacity: 0.16 },
      {
        opacity: 1,
        ease: "none",
        stagger: 0.1,
        scrollTrigger: { trigger: statement, start: "top 82%", end: "bottom 48%", scrub: true },
      },
    );

    selectAll(".facts__number[data-count]").forEach((number) => {
      const target = Number(number.dataset.count);
      const counter = { value: 0 };

      number.textContent = "0";

      ScrollTrigger.create({
        trigger: number,
        start: "top 88%",
        once: true,
        onEnter: () =>
          gsap.to(counter, {
            value: target,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => {
              number.textContent = String(Math.round(counter.value));
            },
          }),
      });
    });

    gsap.from(".facts__item", {
      y: 40,
      autoAlpha: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.1,
      scrollTrigger: { trigger: ".facts", start: "top 85%" },
    });
  }

  function initSectionHeadings() {
    selectAll("[data-split]").forEach((heading) => {
      const characters = splitIntoCharacters(heading);

      gsap.from(characters, {
        yPercent: 115,
        rotation: 8,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.028,
        scrollTrigger: { trigger: heading, start: "top 86%" },
      });
    });

    selectAll(".section-intro").forEach((intro) => {
      gsap.from(intro, {
        y: 24,
        autoAlpha: 0,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: intro, start: "top 90%" },
      });
    });
  }

  function initServicesReveal() {
    gsap.from(".service", {
      y: 50,
      autoAlpha: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.07,
      scrollTrigger: { trigger: ".service-list", start: "top 85%" },
    });

    gsap.from(".services__note", {
      y: 20,
      autoAlpha: 0,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: { trigger: ".services__note", start: "top 92%" },
    });
  }

  function initProcess() {
    const steps = selectAll(".step");
    const media = gsap.matchMedia();

    media.add("(min-width: 1081px)", () => {
      gsap.fromTo(
        ".steps__progress",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".steps",
            start: "top 78%",
            end: "top 30%",
            scrub: true,
            onUpdate: (self) => {
              steps.forEach((step, index) => {
                step.classList.toggle("step--active", self.progress >= index / steps.length + 0.02);
              });
            },
          },
        },
      );
    });

    media.add("(max-width: 1080px)", () => {
      steps.forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 72%",
          onEnter: () => step.classList.add("step--active"),
          onLeaveBack: () => step.classList.remove("step--active"),
        });
      });
    });

    gsap.from(steps, {
      y: 50,
      autoAlpha: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.1,
      scrollTrigger: { trigger: ".steps", start: "top 82%" },
    });
  }

  function initWallMotion(wallController) {
    const wall = select(".wall");

    gsap.fromTo(
      ".wall__rows",
      { rotationX: 16, yPercent: 6 },
      {
        rotationX: -4,
        yPercent: -6,
        ease: "none",
        scrollTrigger: { trigger: wall, start: "top bottom", end: "bottom top", scrub: true },
      },
    );

    gsap.from(".wall__title .mask-line__inner", {
      yPercent: 110,
      duration: 1.3,
      ease: "expo.out",
      stagger: 0.12,
      scrollTrigger: { trigger: wall, start: "top 60%" },
    });

    gsap.from([".wall__lead", ".quick", ".wall__chip"], {
      y: 24,
      autoAlpha: 0,
      duration: 1,
      ease: "expo.out",
      stagger: 0.05,
      scrollTrigger: { trigger: wall, start: "top 50%" },
    });

    ScrollTrigger.create({
      trigger: wall,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => wallController.setActive(self.isActive),
    });
  }

  function initContactReveal() {
    gsap.from(".contact__title .mask-line__inner", {
      yPercent: 108,
      duration: 1.3,
      ease: "expo.out",
      stagger: 0.1,
      scrollTrigger: { trigger: ".contact__title", start: "top 82%" },
    });

    gsap.from([".contact__lead", ".contact-item", ".form"], {
      y: 40,
      autoAlpha: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.08,
      scrollTrigger: { trigger: ".contact__grid", start: "top 85%" },
    });
  }

  function initFooterLogo() {
    const logo = select(".footer__logo");
    const bar = select(".footer-logo__bar", logo);
    const spokes = selectAll(".footer-logo__spoke", logo);
    const lines = selectAll(".footer-logo__line", logo);

    gsap.set(bar, { scaleY: 0, transformOrigin: "50% 50%" });
    gsap.set(spokes, { scaleX: 0, transformOrigin: "100% 50%" });
    gsap.set(lines, { y: 80 });

    gsap
      .timeline({
        defaults: { ease: "expo.out" },
        scrollTrigger: { trigger: logo, start: "top 92%" },
      })
      .to(bar, { scaleY: 1, duration: 1 }, 0)
      .to(spokes, { scaleX: 1, duration: 1.1, stagger: 0.08 }, 0.2)
      .to(lines, { y: 0, duration: 1.2, stagger: 0.12 }, 0.35);
  }

  function initCursor() {
    if (!hasFinePointer) {
      return;
    }

    const cursor = select(".cursor");
    const interactive = "a, button, label.chip";

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    const moveX = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    const moveY = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });

    window.addEventListener(
      "pointermove",
      (event) => {
        moveX(event.clientX);
        moveY(event.clientY);
        cursor.classList.add("cursor--visible");
      },
      { passive: true },
    );

    root.addEventListener("mouseleave", () => cursor.classList.remove("cursor--visible"));

    document.addEventListener("pointerover", (event) => {
      cursor.classList.toggle("cursor--active", Boolean(event.target.closest(interactive)));
    });
  }

  function initMagneticButtons() {
    if (!hasFinePointer) {
      return;
    }

    selectAll("[data-magnetic]").forEach((element) => {
      const moveX = gsap.quickTo(element, "x", { duration: 0.5, ease: "power3" });
      const moveY = gsap.quickTo(element, "y", { duration: 0.5, ease: "power3" });

      element.addEventListener("pointermove", (event) => {
        const bounds = element.getBoundingClientRect();

        moveX((event.clientX - bounds.left - bounds.width / 2) * 0.28);
        moveY((event.clientY - bounds.top - bounds.height / 2) * 0.38);
      });

      element.addEventListener("pointerleave", () => {
        gsap.to(element, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  function initStaticPage() {
    const intro = select(".intro");

    if (intro) {
      intro.remove();
    }

    selectAll(".step").forEach((step) => step.classList.add("step--active"));
    createWall({ animate: false });
  }

  function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    if (window.Flip) {
      gsap.registerPlugin(Flip);
    }

    const flow = createHeroFlow();
    const wall = createWall({ animate: true });

    initSmoothScroll();
    initIntro(createHeroTimeline(flow));
    initHeroMotion(flow);
    initHeader();
    initMarquee();
    initAbout();
    initSectionHeadings();
    initServicesReveal();
    initProcess();
    initWallMotion(wall);
    initContactReveal();
    initFooterLogo();
    initCursor();
    initMagneticButtons();

    ScrollTrigger.sort();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refreshScrollTriggers);
    }

    window.addEventListener("load", refreshScrollTriggers);
  }

  function init() {
    initAnchors();
    initMenu();
    initServices();
    initCopyButtons();
    initContactForm();
    initQuickBrief();

    if (canAnimate) {
      initAnimations();
    } else {
      initStaticPage();
    }
  }

  init();
})();
