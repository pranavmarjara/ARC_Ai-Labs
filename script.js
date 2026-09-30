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

  /* ---------- hero entrance, and scroll states put straight where the page is ----------
     body starts as .is-loading (hero held back) and is released on the next frame so the hero plays in.
     Scroll-driven states (the colour flood) jump straight to where the page already is, both then and again once
     the page has loaded and a reload's scroll position has been restored, so they never fade in to catch up. */
  const settles = [];
  const settle = () => settles.forEach(f => f());
  requestAnimationFrame(() => requestAnimationFrame(() => {
    settle();
    document.body.classList.remove('is-loading');
  }));
  addEventListener('load', () => requestAnimationFrame(settle));

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
    const light = '#C9C9C9';
    const layer = document.createElement('div');
    layer.className = 'flood-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.prepend(layer);
    const tl = gsap.timeline({
      defaults: { duration: reduce ? 0.01 : 0.8, ease: 'sine.inOut' },
      // going down, it switches when the hero's bottom edge passes 70% down the screen
      scrollTrigger: { trigger: hero, start: 'bottom 70%', toggleActions: 'play none none none' }
    });
    // going up, it only switches back once the page reaches the very top
    ScrollTrigger.create({ start: 1, onLeaveBack: () => tl.reverse() });
    tl.fromTo(layer, { opacity: 1 }, { opacity: 0 }, 0);
    // the intro's blue and grey would vanish on navy, so they start light and settle into their own colours
    if (intro) tl.fromTo(intro, { '--ink': light, '--text': light }, { '--ink': css('--ink'), '--text': css('--text') }, 0);
    // a reload partway down lands straight on the paper and the intro's own colours, rather than fading to them
    settles.push(() => {
      const st = tl.scrollTrigger;
      if (st && scrollY >= st.start) tl.progress(1);
    });
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

  /* ---------- the written sections between the hero and the milestones ----------
     Layered on the existing layout, nothing moves: the headlines rise word by word, the intro's quote inks in
     word by word as it is read, the body copy rises line by line, the rules draw themselves, and the blue band carries a live voice trace
     that swells under the pointer. Runs before the reveals below, so the blocks it animates itself can drop
     their plain fade. */
  (() => {
    if (!hasGsap || reduce) return;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

    // wraps each word of a plain-text element in its own span; the spaces stay as text so lines break as before
    const splitWords = (el, make) => {
      const words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      return words.map((w, i) => {
        if (i) el.append(' ');
        const s = make(w);
        el.append(s);
        return s;
      });
    };

    /* headlines: each word rises from behind its own mask, a beat apart */
    const heads = [...document.querySelectorAll('#arc1 > h2.display, #why > h2.display, #why .trial .display')];
    heads.forEach(h => {
      h.classList.remove('reveal');
      h.classList.add('split-head');
      const said = h.textContent.trim();
      const inner = splitWords(h, w => {
        const wd = document.createElement('span');
        wd.className = 'wd';
        wd.setAttribute('aria-hidden', 'true');
        const inn = document.createElement('span');
        inn.className = 'wd-in';
        inn.textContent = w;
        wd.append(inn);
        return wd;
      }).map(wd => wd.firstChild);
      // screen readers get the sentence whole, not word by word
      const sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = said;
      h.append(sr);
      gsap.fromTo(inner, { yPercent: 130 }, {
        yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.07,
        scrollTrigger: { trigger: h, start: 'top 88%', once: true },
        onComplete: () => h.classList.add('risen')
      });
    });

    /* the intro's quote inks in word by word as it is read */
    document.querySelectorAll('#intro .quote').forEach(el => {
      const words = splitWords(el, w => {
        const s = document.createElement('span');
        s.className = 'ink-w';
        s.textContent = w;
        return s;
      });
      gsap.fromTo(words, { opacity: 0.15 }, {
        opacity: 1, ease: 'none', stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 55%', scrub: 0.5 }
      });
    });

    /* body copy: each line rises out of its own mask as it comes up the screen, tied to the scroll
       (the line mask reveal from webcomp/text animation/second.html) */
    (() => {
      const START = 0.96, END = 0.72;   // where on the screen a line starts and finishes rising, as a share of its height
      const STAGGER = 0.3;              // how much later each line starts than the one above it
      const blocks = [];
      const add = (el, offset = 0) => { el.dataset.text = el.textContent.trim(); blocks.push({ el, offset }); };
      document.querySelectorAll('#why .trial p.label').forEach(el => add(el));
      let lines = [], ticking = false, width = innerWidth;

      // let the browser break the text, read back where the breaks fell, then rebuild it one clipping box per line
      const split = () => {
        lines = [];
        for (const { el, offset } of blocks) {
          el.textContent = '';
          const probe = document.createElement('span');
          probe.style.display = 'block';
          el.append(probe);
          const marker = document.createElement('span');
          const rows = [];
          let current = '', lastTop = null;
          for (const word of el.dataset.text.split(/\s+/)) {
            probe.textContent = current ? current + ' ' + word : word;
            probe.append(marker);
            // measured from the probe's own top: text that sits at the foot of its box (the blue band) grows
            // upward as it wraps, so a new line would not move the marker on the screen
            const top = marker.getBoundingClientRect().top - probe.getBoundingClientRect().top;
            if (lastTop !== null && top > lastTop + 1) { rows.push(current); current = word; }
            else current = current ? current + ' ' + word : word;
            lastTop = top;
          }
          if (current) rows.push(current);
          probe.remove();
          rows.forEach((row, i) => {
            const mask = document.createElement('span');
            mask.className = 'line-mask';
            const inner = document.createElement('span');
            // the space at each break stays, so the text still reads (and copies) as one sentence
            inner.textContent = i < rows.length - 1 ? row + ' ' : row;
            mask.append(inner);
            el.append(mask);
            lines.push({ mask, inner, index: i + offset, top: 0, e: -1 });
          });
        }
        measure();
      };
      const measure = () => {
        for (const l of lines) l.top = l.mask.getBoundingClientRect().top + scrollY;
        update();
      };
      const update = () => {
        ticking = false;
        const vh = innerHeight, travel = vh * (START - END);
        for (const l of lines) {
          // a long paragraph on a phone would otherwise leave its last lines waiting near the top of the screen
          const begin = vh * START - travel * STAGGER * Math.min(l.index, 4);
          const p = Math.min(1, Math.max(0, (begin - (l.top - scrollY)) / travel));
          const e = 1 - Math.pow(1 - p, 3);   // eased, so each line arrives softly
          if (e === l.e) continue;
          l.e = e;
          l.inner.style.setProperty('--hidden', ((1 - e) * 110).toFixed(2) + '%');
        }
      };
      split();
      addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      // the breaks only move when the width does (a phone's address bar changes just the height)
      let wait = 0;
      addEventListener('resize', () => {
        clearTimeout(wait);
        wait = setTimeout(() => { if (innerWidth !== width) { width = innerWidth; split(); } else measure(); }, 150);
      });
      document.fonts && document.fonts.ready.then(split);
      ScrollTrigger.addEventListener('refresh', measure);
    })();

    /* why speech: a line of ink runs along each column's rule as the columns come in */
    const grid = document.querySelector('#why .c3');
    if (grid) {
      grid.classList.remove('reveal');
      const units = [...grid.querySelectorAll('.unit')];
      units.forEach((u, i) => u.style.setProperty('--d', (i * 0.14) + 's'));
      ScrollTrigger.create({ trigger: grid, start: 'top 86%', once: true, onEnter: () => units.forEach(u => u.classList.add('swept')) });
      // a soft light follows the pointer across the column it is over
      if (fine) units.forEach(u => u.addEventListener('pointermove', e => {
        const r = u.getBoundingClientRect();
        u.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        u.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }));
    }

    /* where we are: the lines arrive in turn, their rules sweep, and the numbers count up */
    const list = document.querySelector('#progress .persist');
    if (list) {
      const items = [...list.children];
      items.forEach((li, i) => {
        li.style.setProperty('--d', (i * 0.1) + 's');
        li.innerHTML = li.innerHTML.replace(/\d+/g, n => `<span class="count" data-to="${n}">${n}</span>`);
      });
      const counts = [...list.querySelectorAll('.count')];
      gsap.fromTo(items, { opacity: 0, x: -24 }, {
        opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: {
          trigger: list, start: 'top 88%', once: true,
          onEnter: () => {
            items.forEach(li => li.classList.add('swept'));
            counts.forEach(c => {
              const o = { v: 0 };
              c.textContent = '0';
              gsap.to(o, { v: +c.dataset.to, duration: 1.4, delay: 0.25, ease: 'power2.out', onUpdate: () => { c.textContent = Math.round(o.v); } });
            });
          }
        }
      });
    }

    /* the blue band: a voice trace runs behind the words, in bursts like syllables, and swells under the pointer */
    const trial = document.querySelector('#why .trial');
    if (trial) {
      const cv = document.createElement('canvas');
      cv.className = 'trial-wave';
      cv.setAttribute('aria-hidden', 'true');
      trial.prepend(cv);
      const ctx = cv.getContext('2d');
      let W = 0, H = 0, on = false, raf = 0, mx = -1e4, lift = 0, liftGoal = 0;
      new ResizeObserver(() => {
        W = trial.clientWidth; H = trial.clientHeight;
        cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      }).observe(trial);
      // three traces, the first bright and the others fainter echoes of it
      const traces = [{ a: 0.28, k: 0, w: 1.4 }, { a: 0.14, k: 1.9, w: 1 }, { a: 0.07, k: 3.4, w: 1 }];
      const draw = now => {
        raf = 0;
        if (!on || !ctx) return;
        const t = now / 1000, s = scrollY * 0.004;
        lift += (liftGoal - lift) * 0.06;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.clearRect(0, 0, W, H);
        const mid = H * 0.55, amp = H * 0.17;
        for (const tr of traces) {
          ctx.beginPath();
          for (let x = 0; x <= W; x += 3) {
            // a syllable envelope over a voiced carrier
            const syl = Math.max(0, Math.sin(x * 0.011 - t * 1.3 + tr.k)) * (0.65 + 0.35 * Math.sin(x * 0.0037 + t * 0.5));
            const carrier = Math.sin(x * 0.09 - t * 6 + s + tr.k) * 0.6 + Math.sin(x * 0.031 + t * 2.3 + tr.k * 2) * 0.4;
            const near = Math.exp(-((x - mx) ** 2) / 39200) * lift;   // a bump about 140px wide
            const y = mid + carrier * amp * (0.16 + syl * 0.84) * (1 + near * 1.8);
            if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y);
          }
          ctx.strokeStyle = `rgba(245, 245, 245, ${tr.a + lift * 0.08})`;
          ctx.lineWidth = tr.w;
          ctx.stroke();
        }
        raf = requestAnimationFrame(draw);
      };
      new IntersectionObserver(([e]) => {
        on = e.isIntersecting;
        if (on && !raf) raf = requestAnimationFrame(draw);
      }).observe(trial);
      trial.addEventListener('pointermove', e => { mx = e.clientX - trial.getBoundingClientRect().left; liftGoal = 1; });
      trial.addEventListener('pointerleave', () => { liftGoal = 0; });
    }
  })();

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
