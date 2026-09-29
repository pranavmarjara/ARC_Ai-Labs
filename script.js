(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  /* ---------- smooth scroll: Lenis driven by the GSAP ticker, same settings as the Header draft ---------- */
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const hasLenis = typeof Lenis !== 'undefined';
  let lenis = null;
  if (hasLenis && !reduce) {
    lenis = new Lenis({
      // how much of the remaining distance is covered each frame: higher is snappier, lower is floatier
      lerp: 0.085,
      smoothWheel: true,
      // how far one wheel notch travels: below 1 slows the whole page down
      wheelMultiplier: 0.6,
      touchMultiplier: 1.1
    });
  }
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  // one clock for both: the GSAP ticker drives Lenis, so nothing runs a second loop
  if (lenis && hasGsap) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else if (lenis) {
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  // in-page links glide instead of jumping
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !lenis) return;
    const id = a.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target);
  });

  /* ---------- phone menu: the section links open as a full-screen sheet ---------- */
  (() => {
    const bar = document.querySelector('.bar');
    const btn = bar && bar.querySelector('.menu-btn');
    const nav = document.getElementById('site-nav');
    if (!btn || !nav) return;
    const label = btn.querySelector('.menu-btn__label');
    const setOpen = open => {
      bar.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open);
      label.textContent = open ? 'Close' : 'Menu';
      document.documentElement.classList.toggle('menu-open', open);
      if (lenis) open ? lenis.stop() : lenis.start();
    };
    btn.addEventListener('click', () => setOpen(!bar.classList.contains('open')));
    // close before the document-level handler above glides to the section (a stopped Lenis would ignore it)
    nav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && bar.classList.contains('open')) { setOpen(false); btn.focus(); } });
    // widening past the phone layout drops the sheet
    matchMedia('(min-width: 761px)').addEventListener('change', m => { if (m.matches) setOpen(false); });
  })();


  /* ---------- team photos: show the placeholder until a real image loads ---------- */
  document.querySelectorAll('.photo img, .logo img').forEach(img => {
    const miss = () => { img.hidden = true; };
    const hit = () => { const ph = img.nextElementSibling; if (ph) ph.hidden = true; };
    img.addEventListener('error', miss); img.addEventListener('load', hit);
    if (img.complete) (img.naturalWidth ? hit : miss)();
  });

  /* ---------- hero entrance: body starts as .is-loading (hero held back), released on the next frame so it plays in ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('is-loading')));

  /* ---------- hero tagline: letters light up and thicken around the cursor ----------
     Each line is split into one span per letter. Their centres are measured at rest (relative to
     the tagline, so scrolling doesn't move them); on every frame each letter eases towards a
     strength set by how close the cursor is, and writes it to --h, which style.css turns into
     weight and brightness. */
  (() => {
    const tag = document.querySelector('.hero-tag');
    if (!tag || !matchMedia('(hover: hover)').matches) return;
    const chars = [];
    for (const span of tag.querySelectorAll('.line > span')) {
      const text = span.textContent;
      span.textContent = '';
      span.setAttribute('aria-hidden', 'true');
      for (const ch of text) {
        const c = document.createElement('span');
        c.className = 'ch';
        c.textContent = ch;
        span.appendChild(c);
        if (ch.trim()) chars.push({ el: c, x: 0, y: 0, h: 0 });
      }
    }

    let stale = true, px = -1e4, py = -1e4, raf = 0, reach = 100;
    const build = () => {
      stale = false;
      const tr = tag.getBoundingClientRect();
      for (const c of chars) {
        const r = c.el.getBoundingClientRect();
        c.x = r.left + r.width / 2 - tr.left; c.y = r.top + r.height / 2 - tr.top;
      }
      // how far the glow spreads: about one and a half letters' height
      reach = parseFloat(getComputedStyle(tag).fontSize) * 1.5;
    };
    addEventListener('resize', () => { stale = true; });
    document.fonts && document.fonts.ready.then(() => { stale = true; });
    // the lines rise into place as the page loads; measure again once they have settled
    addEventListener('transitionend', e => { if (tag.contains(e.target)) stale = true; });

    const tick = () => {
      raf = 0;
      let moving = false;
      for (const c of chars) {
        const d = Math.hypot(px - c.x, py - c.y);
        const t = Math.max(0, 1 - d / reach);
        const goal = t * t * (3 - 2 * t); // smoothstep falloff
        c.h += (goal - c.h) * 0.18;
        if (Math.abs(goal - c.h) < 0.002) c.h = goal; else moving = true;
        c.el.style.setProperty('--h', c.h.toFixed(3));
      }
      if (moving) raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

    addEventListener('pointermove', e => {
      if (stale) build();
      const r = tag.getBoundingClientRect();
      px = e.clientX - r.left; py = e.clientY - r.top;
      kick();
    }, { passive: true });
    document.addEventListener('pointerleave', () => { px = py = -1e4; kick(); });
  })();

  /* ---------- colour flood: the page behind the sections starts in the hero's navy, and flips to paper in one quick switch
     once the hero is mostly scrolled away; on the way back up it holds the paper until the page is right back at the top.
     The hero itself always stays navy */
  (() => {
    const hero = document.getElementById('hero'), intro = document.getElementById('intro');
    if (!hasGsap || !hero) return;
    const navy = '#0A1B2F', paper = css('--paper'), light = '#C9C9C9';
    document.documentElement.classList.add('flood');
    const tl = gsap.timeline({
      defaults: { duration: reduce ? 0.01 : 0.5, ease: 'power2.inOut' },
      // going down, it switches when the hero's bottom edge passes 70% down the screen
      scrollTrigger: { trigger: hero, start: 'bottom 70%', toggleActions: 'play none none none' }
    });
    // going up, it only switches back once the page reaches the very top
    ScrollTrigger.create({ start: 1, onLeaveBack: () => tl.reverse() });
    tl.fromTo(document.body, { backgroundColor: navy }, { backgroundColor: paper }, 0);
    // the intro's blue and grey would vanish on navy, so they start light and settle into their own colours
    if (intro) tl.fromTo(intro, { '--ink': light, '--text': light }, { '--ink': css('--ink'), '--text': css('--text') }, 0);
  })();

  /* ---------- scroll pill ---------- */
  const bar = document.getElementById('scrollbar'), thumb = document.getElementById('scrollthumb');
  const minThumb = 40;
  const darkZones = [document.getElementById('hero'), document.getElementById('roadmap'), document.getElementById('communication')].filter(Boolean);
  let track = 0, scrollable = 0, thumbH = 0, pending = false;
  function measureThumb() {
    const doc = document.documentElement;
    track = bar.clientHeight;
    scrollable = doc.scrollHeight - innerHeight;
    thumbH = Math.max(minThumb, track * (innerHeight / doc.scrollHeight));
    thumb.style.display = scrollable > 0 ? 'block' : 'none';
    thumb.style.height = thumbH + 'px';
    updateThumb();
  }
  function updateThumb() {
    pending = false;
    if (scrollable <= 0) return;
    const top = (scrollY / scrollable) * (track - thumbH);
    thumb.style.transform = 'translateY(' + top + 'px)';
    // the dark hero, roadmap and footer would swallow the pill, so it goes light while it sits over them
    const mid = bar.getBoundingClientRect().top + top + thumbH / 2;
    bar.classList.toggle('on-dark', darkZones.some(z => {
      const r = z.getBoundingClientRect(); return mid >= r.top && mid <= r.bottom;
    }));
  }
  addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(updateThumb); } }, { passive: true });
  addEventListener('resize', measureThumb);
  new ResizeObserver(measureThumb).observe(document.body);
  thumb.addEventListener('pointerdown', e => {
    e.preventDefault();
    const startY = e.clientY, startTop = (scrollY / Math.max(1, scrollable)) * (track - thumbH);
    const range = track - thumb.offsetHeight;
    thumb.classList.add('dragging');
    thumb.setPointerCapture(e.pointerId);
    const onMove = m => {
      const top = Math.min(Math.max(0, startTop + m.clientY - startY), range);
      const target = (top / range) * scrollable;
      // the thumb must track the pointer exactly, so this one bypasses the easing
      if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
      else scrollTo(0, target);
    };
    const onUp = () => {
      thumb.classList.remove('dragging');
      thumb.removeEventListener('pointermove', onMove);
      thumb.removeEventListener('pointerup', onUp);
    };
    thumb.addEventListener('pointermove', onMove);
    thumb.addEventListener('pointerup', onUp);
  });
  measureThumb();

  /* ---------- contact footer, imported from website drafts/Header (index.js) ---------- */
  // CONTACT — the headline fills the top of the card
  const contactWord = document.getElementById("contactword");
  const contactPanel = document.getElementById("contactpanel");
  const contactBody = document.getElementById("commsbody");

  if (contactWord && contactPanel && contactBody) {
      const cardHead = contactPanel.querySelector(".cardhead");

      const fitContact = () => {
          const room = cardHead.clientWidth;

          // a hidden page has no width to fit to
          if (room <= 0) {
              return;
          }

          const gap = parseFloat(getComputedStyle(cardHead).columnGap) || 0;

          // measure it at a known size, then scale it to fill the row — less the room the old
          // year stamp took beside it (about 35% of the word's width), so it keeps its size
          contactWord.style.fontSize = "100px";

          const spare = room - gap;
          // on a phone every pixel counts, so there the word takes the whole row
          const wanted = contactWord.scrollWidth * (matchMedia("(max-width: 760px)").matches ? 1.02 : 1.355);

          if (spare <= 0 || wanted <= 0) {
              return;
          }

          contactWord.style.fontSize = (100 * spare / wanted) + "px";
      };

      fitContact();
      window.addEventListener("resize", fitContact);
      window.addEventListener("load", fitContact);

      // the word's height changes once the font lands, which moves everything below it
      document.fonts.ready.then(() => {
          fitContact();

      });

      // the letters rise and the card settles the first time the section comes into view
      const contactSectionEl = document.getElementById("communication");

      if (reduce || !("IntersectionObserver" in window)) {
          contactSectionEl.classList.add("inview");
      } else {
          const seen = new IntersectionObserver((entries) => {
              if (entries.some((entry) => entry.isIntersecting)) {
                  fitContact();
                  contactSectionEl.classList.add("inview");
                  seen.disconnect();
              }
          }, { threshold: 0.2 });

          seen.observe(contactWord);
      }
  }

  // check the fields, send them through Web3Forms, then show the thank-you
  const contactForm = document.getElementById("contactform");
  const contactStatus = document.getElementById("contactstatus");

  if (contactForm && contactPanel) {
      contactForm.addEventListener("submit", (event) => {
          event.preventDefault();

          let first = null;

          contactForm.querySelectorAll("[required]").forEach((input) => {
              const holder = input.closest(".contactfield, .contactconsent");
              const ok = input.type === "checkbox" ? input.checked : input.checkValidity() && input.value.trim() !== "";

              holder.classList.toggle("missing", !ok);

              if (!ok && !first) {
                  first = input;
              }
          });

          if (first) {
              contactStatus.textContent = first.type === "checkbox"
                  ? "Please tick the box so we can reply."
                  : "A couple of fields still need filling in.";
              first.focus();
              return;
          }

          const send = contactForm.querySelector(".contactsend");
          const data = new FormData(contactForm);
          data.set("name", `${data.get("first")} ${data.get("last")}`.trim());
          data.delete("consent");

          send.disabled = true;
          contactStatus.textContent = "Sending…";

          fetch(contactForm.action, { method: "POST", headers: { Accept: "application/json" }, body: data })
              .then((res) => res.json())
              .then((json) => {
                  if (!json.success) throw new Error(json.message);
                  contactPanel.classList.add("sent");
                  contactForm.reset();
              })
              .catch(() => {
                  contactStatus.textContent = "Something went wrong. Please try again, or email us directly.";
              })
              .finally(() => { send.disabled = false; });
      });

      contactForm.addEventListener("input", (event) => {
          const holder = event.target.closest(".contactfield, .contactconsent");

          if (holder) {
              holder.classList.remove("missing");
          }
      });
  }

  // the enquiries address copies itself instead of opening a mail app; the link text confirms, then comes back
  document.querySelectorAll(".copymail").forEach((link) => {
      const address = link.textContent;
      let timer = 0;

      link.addEventListener("click", (event) => {
          if (!navigator.clipboard) {
              return;
          }

          event.preventDefault();

          navigator.clipboard.writeText(address).then(() => {
              link.textContent = "Copied to clipboard";
              clearTimeout(timer);
              timer = setTimeout(() => { link.textContent = address; }, 1800);
          }, () => { location.href = link.href; });
      });
  });

  /* ---------- press release, imported from website drafts/Header (index.js) ---------- */
  // PRESS — the cards show a preview; clicking one opens the full excerpt over the page
  const pressModal = document.getElementById("pressmodal");
  const pressModalBody = document.getElementById("pressmodalbody");
  const pressModalFoot = document.getElementById("pressmodalfoot");

  if (pressModal && pressModalBody) {
      let lastFocused = null;

      const openPress = (card) => {
          const text = card.querySelector(".presstext");
          const foot = card.querySelector(".presscardfoot");

          pressModalBody.innerHTML = text ? text.innerHTML : "";
          pressModalFoot.innerHTML = foot ? foot.innerHTML : "";

          lastFocused = document.activeElement;

          pressModal.hidden = false;
          document.body.style.overflow = "hidden";

          // Lenis owns the wheel; stopping it leaves the panel free to scroll natively
          if (lenis) {
              lenis.stop();
          }

          const close = pressModal.querySelector(".pressmodalclose");

          if (close) {
              close.focus();
          }
      };

      const closePress = () => {
          pressModal.hidden = true;
          document.body.style.overflow = "";

          if (lenis) {
              lenis.start();
          }

          if (lastFocused) {
              lastFocused.focus();
          }
      };

      document.querySelectorAll(".presscard").forEach((card) => {
          card.addEventListener("click", (event) => {
              const link = event.target.closest(".presslink");

              // a real outlet link goes where it points; a placeholder one opens the excerpt
              if (link) {
                  const href = link.getAttribute("href");

                  if (href && href !== "#") {
                      return;
                  }

                  event.preventDefault();
              }

              openPress(card);
          });

          card.addEventListener("keydown", (event) => {
              if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openPress(card);
              }
          });
      });

      pressModal.querySelectorAll("[data-close]").forEach((el) => {
          el.addEventListener("click", closePress);
      });

      const panel = pressModal.querySelector(".pressmodalpanel");

      if (panel) {
          // a gentler travel than the browser default, to match the rest of the page
          const modalWheelRate = 0.45;

          panel.addEventListener("wheel", (event) => {
              event.stopPropagation();
              panel.scrollTop += event.deltaY * modalWheelRate;
              event.preventDefault();
          }, { passive: false });
      }

      document.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && !pressModal.hidden) {
              closePress();
          }
      });
  }

  // each clip takes its poster straight from YouTube once a video id is set on it
  document.querySelectorAll(".pressclip").forEach((clip) => {
      const id = clip.dataset.video;

      if (!id || id === "VIDEO_ID") {
          return;
      }

      clip.href = "https://www.youtube.com/watch?v=" + id;

      const thumb = clip.querySelector(".pressclipthumb");

      if (thumb) {
          thumb.src = "https://img.youtube.com/vi/" + id + "/maxresdefault.jpg";
          thumb.alt = "Watch on YouTube";

          // not every video has a maxres poster; fall back to the one that always exists
          thumb.addEventListener("error", () => {
              thumb.src = "https://img.youtube.com/vi/" + id + "/hqdefault.jpg";
          }, { once: true });
      }
  });

  // a photo slot with no file behind it yet simply steps aside
  document.querySelectorAll(".pressphoto img").forEach((photo) => {
      photo.addEventListener("error", () => {
          const frame = photo.closest(".pressphoto");

          if (frame) {
              frame.style.display = "none";
          }
      }, { once: true });
  });

  /* ---------- reveals: fade up as each block enters, same as the Header draft ---------- */
  const revealables = document.querySelectorAll('.reveal');
  if (!hasGsap || reduce) {
    revealables.forEach(el => el.classList.add('shown'));
  } else {
    gsap.set(revealables, { opacity: 0, y: 20 });
    gsap.utils.toArray('.reveal').forEach(el => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
    addEventListener('load', () => ScrollTrigger.refresh());
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* ---------- the charcoal band: breath, muscle, timing, thought rise in as it scrolls into view ---------- */
  const convene = document.getElementById('convene');
  if (convene && !reduce && 'IntersectionObserver' in window) {
    convene.classList.add('armed');
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      convene.classList.add('is-in');
      io.disconnect();
    }, { rootMargin: '0px 0px -18% 0px' });
    io.observe(convene);
  }

  /* ---------- text selection: swap each element's text and background colors ----------
     ::selection reads --sel-fg / --sel-bg, set here on every element the selection touches */
  const opaque = c => { const m = c.match(/[\d.]+/g); return m && (m.length < 4 || +m[3] > 0) ? `rgb(${m[0]}, ${m[1]}, ${m[2]})` : null; };
  const bgOf = el => {
    for (; el; el = el.parentElement) {
      const c = opaque(getComputedStyle(el).backgroundColor);
      if (c) return c;
    }
    return css('--paper');
  };
  document.addEventListener('selectionchange', () => {
    const sel = getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const root = range.commonAncestorContainer;
    const els = new Set();
    if (root.nodeType === Node.TEXT_NODE) els.add(root.parentElement);
    else {
      const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n; (n = walk.nextNode()) && els.size < 2000;) {
        if (n.parentElement && n.data.trim() && range.intersectsNode(n)) els.add(n.parentElement);
      }
    }
    els.forEach(el => {
      el.style.setProperty('--sel-fg', bgOf(el));
      el.style.setProperty('--sel-bg', opaque(getComputedStyle(el).color) || css('--ink'));
    });
  });

})();
