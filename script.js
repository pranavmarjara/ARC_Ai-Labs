(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- in-page links travel to their section instead of jumping ----------
     Eased in and out, a little longer for a longer trip. The section's place is read again every frame, so anything
     that grows or shrinks on the way (the milestones closing) cannot leave it short. A wheel, touch or key takes over */
  (() => {
    if (reduce) return;
    let run = 0;
    const stop = () => { run++; };
    ['wheel', 'touchstart', 'keydown'].forEach(t => addEventListener(t, stop, { passive: true }));
    const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);   // easeInOutCubic
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented) return;
      const id = a.getAttribute('href').slice(1);
      const el = id ? document.getElementById(id) : document.documentElement;
      if (!el) return;
      e.preventDefault();
      const goal = () => Math.max(0, Math.min(el.getBoundingClientRect().top + scrollY, document.documentElement.scrollHeight - innerHeight));
      const from = scrollY, dur = Math.min(1200, 450 + Math.abs(goal() - from) * 0.08);
      const me = ++run;
      let t0 = 0;
      const step = () => {
        if (me !== run) return;
        const now = performance.now();
        t0 = t0 || now;
        const t = Math.min(1, (now - t0) / dur);
        scrollTo(0, from + (goal() - from) * ease(t));
        if (t < 1) requestAnimationFrame(step);
        else if (id) history.replaceState(null, '', '#' + id);
      };
      requestAnimationFrame(step);
    });
  })();

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
    };
    btn.addEventListener('click', () => setOpen(!bar.classList.contains('open')));
    // a link in the sheet closes it on the way to its section
    nav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && bar.classList.contains('open')) { setOpen(false); btn.focus(); } });
    // widening past the phone layout drops the sheet
    matchMedia('(min-width: 761px)').addEventListener('change', m => { if (m.matches) setOpen(false); });
    // the pill's faint edge only once the page has left the very top (style.css)
    const edge = () => btn.classList.toggle('edged', scrollY > 4);
    addEventListener('scroll', edge, { passive: true });
    edge();
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
    // its darker paper starts in the navy too, and turns with the rest
    if (intro) tl.fromTo(intro, { '--ink': light, '--text': light, backgroundColor: '#0A1B2F' }, { '--ink': css('--ink'), '--text': css('--text'), backgroundColor: css('--paper-2') }, 0);
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
      scrollTo(0, target);
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

          const close = pressModal.querySelector(".pressmodalclose");

          if (close) {
              close.focus();
          }
      };

      const closePress = () => {
          pressModal.hidden = true;
          document.body.style.overflow = "";

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

  /* ---------- the voiceprint: a wave field holds still behind the page while the beats scroll past ----------
     Each beat's words arrive their own way, all tied to the scroll: grown up from the baseline, pulled into focus,
     letters rising, two rows passing each other. After the charcoal band come the old sections, with their own motion (below). */
  (() => {
    const vp = document.querySelector('.vp');
    if (!vp || reduce) return;
    const stage = vp.querySelector('.vp-stage'), cv = vp.querySelector('.vp-field'), band = vp.querySelector('.vp-band');
    const beats = [...vp.querySelectorAll('.vp-beat')].map(el => ({
      el, mode: el.dataset.in,
      say: el.querySelector('.vp-say'),
      side: [...el.querySelectorAll('.vp-kicker, .vp-note')],
      words: [], chars: [], rows: [], len: 0
    }));
    const N = beats.length;
    if (!N) return;
    vp.classList.add('live');

    // split a line into word spans (an italic word keeps its <em> inside its span), optionally each in a clipping mask
    const words = (root, masked) => {
      const out = [];
      const make = node => {
        const w = document.createElement('span');
        w.className = 'vp-w';
        if (!masked) { w.append(node); out.push(w); return w; }
        const m = document.createElement('span');
        m.className = 'vp-mask';
        w.append(node); m.append(w); out.push(w);
        return m;
      };
      const walk = parent => {
        for (const n of [...parent.childNodes]) {
          if (n.nodeType === Node.TEXT_NODE) {
            const parts = n.data.split(/(\s+)/).filter(Boolean);
            n.replaceWith(...parts.map(p => /^\s+$/.test(p) ? document.createTextNode(p) : make(document.createTextNode(p))));
          } else if (n.classList && n.classList.contains('vp-row')) walk(n);
          else { const holder = document.createElement('span'); n.before(holder); holder.replaceWith(make(n)); }
        }
      };
      walk(root);
      return out;
    };
    // split each word into letter spans
    const letters = w => {
      const host = w.querySelector('em') || w;
      const text = host.textContent;
      host.textContent = '';
      return [...text].map(ch => {
        const c = document.createElement('span');
        c.className = 'vp-ch';
        c.textContent = ch;
        host.append(c);
        return { el: c, ch };
      });
    };

    for (const b of beats) {
      b.say.setAttribute('aria-label', b.say.textContent.replace(/\s+/g, ' ').trim());
      if (b.mode === 'cross') b.rows = [...b.say.querySelectorAll('.vp-row')];
      else {
        b.words = words(b.say, b.mode === 'letters' || b.mode === 'stack').map(el => ({ el, x0: 0, w: 0 }));
        if (b.mode === 'letters') b.chars = b.words.flatMap(w => letters(w.el));
      }
      [...b.say.children].forEach(c => c.setAttribute('aria-hidden', 'true'));
    }

    let W = 0;
    const measure = () => {
      W = stage.clientWidth;
      if (field) field.resize();
      for (const b of beats) {
        // where each word sits on screen, and how far along the sentence it is in reading order
        let along = 0;
        for (const w of b.words) {
          const r = w.el.getBoundingClientRect();
          w.x0 = r.left; w.w = r.width; w.at = along;
          along += r.width + 24;
        }
        b.len = along;
      }
    };

    const clamp = v => Math.max(0, Math.min(1, v));
    const smooth = v => { v = clamp(v); return v * v * (3 - 2 * v); };
    const set = (el, o, tf) => { el.style.opacity = o; el.style.transform = tf; };
    // dark to light over a short stretch around the middle, for whatever has to stay readable as the page goes dark
    const flip = k => smooth((k - 0.4) / 0.2);

    /* ---------- the ground behind the words: a wave field (Scroll Wave Field, Originkit, ported from React to plain WebGL).
       A wide sheet of dots in perspective, heaving in slow swells and flowing toward the eye; scrolling pushes it on
       faster, and the pointer lifts a soft mound under itself that glows. At the gap the order goes out of it: the swells
       fall flat and the dots scatter up the whole screen. Dots in the hero's navy on the paper ---------- */
    const field = (() => {
      const FIELD_W = 3600, FIELD_D = 7000, SPACING = 36, CAM_Z0 = 700, FOV = 60, DPR_CAP = 1.5, TAU = Math.PI * 2;
      const CAM_Y_FULL = 550, CAM_REF_AREA = 1200 * 800, CAM_SCALE_MIN = 0.5, CAM_SCALE_MAX = 2.5, CURSOR_FOLLOW = 7;
      // the settings chosen in Originkit's editor
      const S = {
        colors: ['#0A1B2F', '#00314F'],
        dotSize: 2, scatter: 108, cameraHeight: 50,
        waveHeight: 200, waveLength: 2070, waveSpeed: 110,   // slowed well down from Originkit's 250
        tilt: 12, roll: 0, cursorRadius: 20, cursorLift: 25   // hover toned down from Originkit's 25 and 45
      };
      const flowSpeed = S.waveSpeed * (260 / 160);
      const hoverGlow = Math.min(400, Math.abs(S.cursorLift) * (100 / 45));
      const SCROLL_PUSH = 1.1;   // how far the field flows per pixel scrolled

      const VERT = `
        precision highp float;
        attribute vec2 aGrid;
        attribute vec2 aSeed;
        uniform vec2 uRes; uniform float uFocal; uniform float uTime; uniform float uAmp; uniform float uScatter;
        uniform float uFreq; uniform vec2 uDir; uniform float uFlow; uniform float uDepth; uniform float uCamY;
        uniform float uCamZ; uniform float uPitch; uniform float uRoll; uniform float uDot; uniform float uColorCount;
        uniform vec2 uJit; uniform vec3 uColors[8]; uniform vec3 uCursor; uniform float uCurR; uniform float uCurS;
        uniform float uHover;
        uniform float uChaos;
        varying vec3 vCol; varying float vA; varying float vHot;
        vec3 pickColor(float sel) {
          float idx = floor(sel * uColorCount);
          vec3 c = uColors[0];
          for (int i = 1; i < 8; i++) {
            if (float(i) >= uColorCount) break;
            if (float(i) == idx) c = uColors[i];
          }
          return c;
        }
        float surf(vec2 q) {
          return sin(q.x) * 0.55 + sin(q.x * 0.55 + q.y * 1.15) * 0.30 + sin(q.y * 0.75) * 0.22;
        }
        void main() {
          vec2 w = aGrid + (aSeed - 0.5) * uJit;
          w.y = uCamZ + mod(w.y - uFlow - uCamZ, uDepth);
          float h3 = fract(sin(dot(aSeed, vec2(91.37, 47.13))) * 12345.678);
          float h = surf(w * uFreq - uDir * uTime) * uAmp + (h3 - 0.5) * uScatter;
          float cd = length(w - uCursor.xy);
          float g = exp(-(cd * cd) / (uCurR * uCurR)) * uCursor.z;
          h += g * uCurS;
          float g2 = g * g; g2 = g2 * g2; g2 = g2 * g2;
          // scatter: the swells fall flat and each dot slips a short way off its place in the sheet and lifts to its own
          // random height, some of them up past the horizon into the top of the screen, without anything flying about.
          // The lift grows with distance so the dots spread evenly up the screen rather than bunching near the eye
          vec3 P = vec3(w.x, h, w.y);
          if (uChaos > 0.001) {
            float r1 = fract(sin(dot(aSeed, vec2(12.9898, 78.233))) * 43758.5453);
            float r2 = fract(sin(dot(aSeed, vec2(39.346, 11.135))) * 24634.6345);
            float r3 = fract(sin(dot(aSeed, vec2(73.156, 52.235))) * 13758.937);
            float dist = max(w.y - uCamZ, 200.0);
            vec3 S = vec3(w.x + (r1 - 0.5) * 520.0, uCamY + (r2 * 1.3 - 0.85) * dist, w.y + (r3 - 0.5) * 520.0);   // from the foot of the screen to past its top
            P = mix(P, S, uChaos);
          }
          vec3 p = vec3(P.x, P.y - uCamY, P.z - uCamZ);
          float c = cos(uPitch), s = sin(uPitch);
          float ry = p.y * c + p.z * s;
          float rz = -p.y * s + p.z * c;
          if (rz < 40.0) {
            gl_Position = vec4(2.0, 2.0, 0.0, 1.0); gl_PointSize = 0.0;
            vCol = uColors[0]; vA = 0.0; vHot = 0.0;
            return;
          }
          float cr = cos(uRoll), sr = sin(uRoll);
          float rx = p.x * cr - ry * sr;
          float ryr = p.x * sr + ry * cr;
          gl_Position = vec4((rx * uFocal / rz) / (uRes.x * 0.5), (ryr * uFocal / rz) / (uRes.y * 0.5), 0.0, 1.0);
          float rad = max(uDot * uFocal / rz, 0.55);
          gl_PointSize = clamp(rad * 2.0 * (1.0 + g2 * uHover * 0.20), 1.0, 220.0);
          float bri = 0.28 + h3 * 0.72;
          vec2 bq = w * vec2(0.0040, 0.0032) - uDir * uTime * 0.30;
          float band = sin(bq.x) + sin(bq.y);
          float sel = fract((band + 2.0) * 0.25 + (aSeed.y - 0.5) * 0.55);
          vCol = pickColor(sel);
          float lum = dot(vCol, vec3(0.299, 0.587, 0.114));
          vHot = (0.25 + 0.75 * lum) * bri * bri * 0.7 + g2 * uHover * 0.55;
          float fog = (1.0 - smoothstep(2800.0, 6400.0, rz)) * smoothstep(70.0, 240.0, rz);
          vA = bri * fog * (1.0 + g2 * uHover * 0.55);
        }`;
      const FRAG = `
        precision highp float;
        varying vec3 vCol; varying float vA; varying float vHot;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          if (d > 1.0) discard;
          float a = (1.0 - smoothstep(0.90, 1.0, d)) * vA;
          vec3 col = vCol + vec3(1.0) * pow(1.0 - d, 10.0) * vHot * 0.9;
          gl_FragColor = vec4(col * a, a);
        }`;

      const gl = cv.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, depth: false });
      if (!gl) return null;
      const compile = (type, src) => {
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src); gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn('wave field shader:', gl.getShaderInfoLog(sh));
        return sh;
      };
      const prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn('wave field link:', gl.getProgramInfoLog(prog)); return null; }
      gl.useProgram(prog);
      const aGrid = gl.getAttribLocation(prog, 'aGrid'), aSeed = gl.getAttribLocation(prog, 'aSeed');
      const U = n => gl.getUniformLocation(prog, n);
      const u = {
        res: U('uRes'), focal: U('uFocal'), time: U('uTime'), amp: U('uAmp'), scatter: U('uScatter'), freq: U('uFreq'),
        dir: U('uDir'), flow: U('uFlow'), depth: U('uDepth'), camY: U('uCamY'), camZ: U('uCamZ'), pitch: U('uPitch'),
        roll: U('uRoll'), dot: U('uDot'), colorCount: U('uColorCount'), jit: U('uJit'), colors: U('uColors[0]'),
        cursor: U('uCursor'), curR: U('uCurR'), curS: U('uCurS'), hover: U('uHover'), chaos: U('uChaos')
      };

      // the grid of dots, each with two random seeds. The dots keep one spacing (sparser than Originkit's default), and the
      // sheet is made as wide as the screen's shape needs for its sides to stay out of view all the way to the far fog
      const gridBuf = gl.createBuffer(), seedBuf = gl.createBuffer();
      let count = 0, builtW = 0;
      const spacingX = SPACING, spacingZ = SPACING;
      const buildGrid = fieldW => {
        const rnd = (a => () => {
          a |= 0; a = (a + 0x6d2b79f5) | 0;
          let t = Math.imul(a ^ (a >>> 15), 1 | a);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        })(0x5eed);
        const cols = Math.ceil(fieldW / spacingX), rows = Math.ceil(FIELD_D / spacingZ);
        count = cols * rows;
        const grid = new Float32Array(count * 2), seed = new Float32Array(count * 2);
        for (let r = 0, i = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++, i++) {
            grid[i * 2] = -fieldW / 2 + (c + 0.5) * spacingX; grid[i * 2 + 1] = r * spacingZ;
            seed[i * 2] = rnd(); seed[i * 2 + 1] = rnd();
          }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, gridBuf); gl.bufferData(gl.ARRAY_BUFFER, grid, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf); gl.bufferData(gl.ARRAY_BUFFER, seed, gl.STATIC_DRAW);
        builtW = fieldW;
      };
      const pal = new Float32Array(8 * 3);
      const palNow = new Float32Array(8 * 3);
      S.colors.forEach((c, i) => [1, 3, 5].forEach((o, j) => { pal[i * 3 + j] = parseInt(c.slice(o, o + 2), 16) / 255; }));

      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);

      let cssW = 0, cssH = 0, dpr = 1, areaScale = 1;
      const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
        cssW = stage.clientWidth; cssH = stage.clientHeight;
        areaScale = cssW > 0 && cssH > 0 ? Math.min(CAM_SCALE_MAX, Math.max(CAM_SCALE_MIN, Math.sqrt((cssW * cssH) / CAM_REF_AREA))) : 1;
        const w = Math.max(1, Math.round(cssW * dpr)), h = Math.max(1, Math.round(cssH * dpr));
        if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
        gl.viewport(0, 0, w, h);
        // half the view's width at the far fog (6400 deep, 60 degree view), with a margin; never narrower than the original sheet
        const need = Math.max(FIELD_W, Math.ceil(2 * 6400 * Math.tan(Math.PI / 6) * (cssW / Math.max(1, cssH)) * 1.15 / 400) * 400);
        if (need !== builtW) buildGrid(need);
      };

      // the pointer: where it is, eased toward, and how present it is (fades in on hover, out on leave)
      const ptr = { x: 0, y: 0, sx: 0, sy: 0, active: 0, target: 0 };
      vp.addEventListener('pointermove', e => {
        const r = stage.getBoundingClientRect();
        ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.target = 1;
      });
      vp.addEventListener('pointerleave', () => { ptr.target = 0; });

      // where the pointer's ray meets the ground, in field coordinates
      const groundHit = (mx, my, wDev, hDev, focal, pitch, roll, camY, camZ) => {
        const px = mx * dpr - wDev / 2, py = -(my * dpr - hDev / 2);
        const cr = Math.cos(roll), sr = Math.sin(roll);
        const dx = (px * cr + py * sr) / focal, dy = (-px * sr + py * cr) / focal;
        const c = Math.cos(pitch), s = Math.sin(pitch);
        const wy = dy * c - s, wz = dy * s + c;
        if (wy > -1e-4) return null;
        const t = -camY / wy;
        return { x: dx * t, z: camZ + wz * t };
      };

      let phase = 0, flow = 0, hitX = 0, hitZ = -1e6, lastY = scrollY, chaos = 0;
      // chaosGoal: 0 for the calm wave, 1 for every dot scattered (set by the beat on screen)
      const render = (dt, chaosGoal = 0) => {
        chaos += (chaosGoal - chaos) * (1 - Math.exp(-dt * 2.5));
        if (cssW <= 0 || cssH <= 0 || !count) { resize(); if (cssW <= 0 || cssH <= 0 || !count) return; }
        // the hover presence eases in and out instead of switching
        ptr.active += (ptr.target - ptr.active) * (1 - Math.exp(-dt * 10));
        if (ptr.active < 0.002) { ptr.sx = ptr.x; ptr.sy = ptr.y; }
        else { const k = 1 - Math.exp(-dt * CURSOR_FOLLOW); ptr.sx += (ptr.x - ptr.sx) * k; ptr.sy += (ptr.y - ptr.sy) * k; }

        // scrolling down pushes the field toward the eye, scrolling up draws it back
        const dy = scrollY - lastY; lastY = scrollY;
        phase += dt * (S.waveSpeed / 100);
        flow = ((flow + dt * flowSpeed + dy * SCROLL_PUSH) % FIELD_D + FIELD_D) % FIELD_D;

        const pitch = (S.tilt * Math.PI) / 180, roll = (-S.roll * Math.PI) / 180;
        const camY = (Math.min(100, Math.max(0, S.cameraHeight)) / 100) * CAM_Y_FULL * areaScale, camZ = CAM_Z0;
        const wDev = cv.width, hDev = cv.height;
        const focal = hDev / (2 * Math.tan(((FOV / 2) * Math.PI) / 180));

        if (ptr.active <= 0.001) { hitX = 0; hitZ = -1e6; }
        else {
          const hit = groundHit(ptr.sx, ptr.sy, wDev, hDev, focal, pitch, roll, camY, camZ);
          if (hit) { hitX = hit.x; hitZ = hit.z; } else if (hitZ === -1e6) { hitX = 0; hitZ = FIELD_D; }
        }

        gl.uniform2f(u.res, wDev, hDev);
        gl.uniform1f(u.focal, focal);
        gl.uniform1f(u.time, phase);
        gl.uniform1f(u.amp, S.waveHeight);
        gl.uniform1f(u.scatter, S.scatter);
        gl.uniform1f(u.freq, TAU / Math.max(50, S.waveLength));
        gl.uniform2f(u.dir, 0, -1);
        gl.uniform1f(u.flow, flow);
        gl.uniform1f(u.depth, FIELD_D);
        gl.uniform1f(u.camY, camY);
        gl.uniform1f(u.camZ, camZ);
        gl.uniform1f(u.pitch, pitch);
        gl.uniform1f(u.roll, roll);
        gl.uniform1f(u.dot, S.dotSize);
        gl.uniform1f(u.colorCount, S.colors.length);
        gl.uniform2f(u.jit, spacingX * 0.25, spacingZ * 0.7);
        // as the field scatters, its dots whiten, flipping quickly as the page behind them passes mid-grey (below),
        // so they never sit grey on grey
        const white = flip(chaos);
        for (let i = 0; i < pal.length; i++) palNow[i] = pal[i] + (1 - pal[i]) * white;
        gl.uniform3fv(u.colors, palNow);
        gl.uniform3f(u.cursor, hitX, hitZ, ptr.active);
        gl.uniform1f(u.curR, Math.max(1, (S.cursorRadius / 100) * (FIELD_W / 2)));
        gl.uniform1f(u.curS, S.cursorLift);
        gl.uniform1f(u.hover, hoverGlow / 100);
        gl.uniform1f(u.chaos, chaos);

        gl.bindBuffer(gl.ARRAY_BUFFER, gridBuf);
        gl.enableVertexAttribArray(aGrid);
        gl.vertexAttribPointer(aGrid, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
        gl.enableVertexAttribArray(aSeed);
        gl.vertexAttribPointer(aSeed, 2, gl.FLOAT, false, 0, 0);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, count);
      };
      return { resize, render, level: () => chaos };
    })();

    /* the gap goes dark: while the field is scattered the section fades to black and its words to white, and back again
       as it settles. Written only while it is (or was just) away from normal, so the colour flood above is left alone */
    const mixHex = (a, b, t) => {
      const ca = a.match(/\w\w/g).map(h => parseInt(h, 16)), cb = b.match(/\w\w/g).map(h => parseInt(h, 16));
      return `rgb(${ca.map((v, i) => Math.round(v + (cb[i] - v) * t)).join(', ')})`;
    };
    const PAPER = css('--paper-2').replace('#', ''), INK = css('--ink').replace('#', ''), TEXT = css('--text').replace('#', '');
    let shown = 0;
    const invert = k => {
      k = Math.round(k * 1000) / 1000;
      if (k === shown) return;
      shown = k;
      if (k <= 0.001) { vp.style.removeProperty('background-color'); vp.style.removeProperty('--ink'); vp.style.removeProperty('--text'); return; }
      // the paper eases into black; the words stay dark until it is half way, then turn white quickly, so they never
      // wash out against a grey of their own shade
      const t = flip(k);
      vp.style.backgroundColor = mixHex(PAPER, '050505', smooth(k));
      vp.style.setProperty('--ink', mixHex(INK, 'F5F5F5', t));
      vp.style.setProperty('--text', mixHex(TEXT, 'F5F5F5', t));
    };

    let on = false, raf = 0, last = 0;
    const frame = now => {
      raf = 0;
      if (!on) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      const vh = innerHeight;

      // q for each beat: 0 as its line comes up over the foot of the screen, 1 at the middle, 2 at the top
      let chaosGoal = 0;
      // every position is read before anything is written, so the browser lays the page out once a frame, not once a beat
      const tops = beats.map(b => { const r = b.say.getBoundingClientRect(); return r.top + r.height / 2; });
      const bandGone = band && band.getBoundingClientRect().bottom < 0;
      beats.forEach((b, i) => {
        let q = (vh - tops[i]) / (vh * 0.5);
        // the gap scatters the field as it comes up, and lets it settle again as the next beat arrives
        if (b.el.dataset.field === 'chaos') chaosGoal = smooth((q - 0.3) / 0.5) * (1 - smooth((q - 1.45) / 0.45));
        // off screen: set it once at the nearest end, so a beat never shows its words before they arrive
        if (q < -0.2 || q > 2.4) {
          q = q < 0 ? -0.2 : 2.4;
          if (b.q === q) return;
        }
        b.q = q;

        const side = smooth((q - 0.35) / 0.4);
        b.side.forEach(el => set(el, side.toFixed(3), `translateY(${((1 - side) * 14).toFixed(1)}px)`));

        if (b.mode === 'grow') {
          // the words grow up from their baseline in reading order
          const said = smooth((q - 0.25) / 0.7);
          const head = -80 + (b.len + 160) * said;
          for (const w of b.words) {
            const v = smooth((head - w.at) / (w.w + 60));
            set(w.el, v.toFixed(3), v > 0.999 ? 'none' : `translateY(${((1 - v) * 0.3).toFixed(3)}em) scaleY(${(0.12 + 0.88 * v).toFixed(3)})`);
          }
        } else if (b.mode === 'focus') {
          // heard, not measured: each word starts as a loose blur and is pulled into focus in turn, the last word last
          const n = b.words.length;
          b.words.forEach((w, j) => {
            const v = smooth((q - 0.2 - 0.6 * (j / n)) / 0.3);
            w.el.style.opacity = (0.25 + 0.75 * v).toFixed(3);
            w.el.style.filter = v > 0.999 ? 'none' : `blur(${((1 - v) * 14).toFixed(2)}px)`;
            // stretched wide as it blurs, drawn in as it sharpens; a transform, so the line never rewraps
            w.el.style.transformOrigin = '50% 50%';
            w.el.style.transform = v > 0.999 ? '' : `scaleX(${(1 + (1 - v) * 0.15).toFixed(3)})`;
          });
        } else if (b.mode === 'letters') {
          // letters rise out of their word's mask one after another
          const n = b.chars.length;
          b.chars.forEach((c, j) => {
            const v = smooth((q - 0.2 - 0.55 * (j / n)) / 0.25);
            c.el.style.transform = v > 0.999 ? 'none' : `translateY(${((1 - v) * 110).toFixed(1)}%)`;
          });
        } else if (b.mode === 'cross') {
          // the two rows come in from opposite sides, line up at the middle, and keep going past each other
          const x = (1 - q) * 30;
          const o = clamp(1.25 - Math.abs(1 - q) * 0.9);
          set(b.rows[0], o.toFixed(3), `translateX(${(-x).toFixed(2)}vw)`);
          set(b.rows[1], o.toFixed(3), `translateX(${x.toFixed(2)}vw)`);
        }
      });

      // once the charcoal band has gone up past the top, the paper below it covers the field: stop drawing it
      if (field && !bandGone) field.render(dt, chaosGoal);
      if (field) invert(field.level());
      raf = requestAnimationFrame(frame);
    };

    measure();
    new ResizeObserver(measure).observe(stage);
    document.fonts && document.fonts.ready.then(measure);
    new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      last = 0;
      if (on && !raf) raf = requestAnimationFrame(frame);
    }).observe(vp);
  })();

  /* ---------- milestones on request: the roadmap rests as a single screen (the terrain under its title) that the page
     scrolls straight past. Explore opens it into the full flight and glides into it; the cross (or Esc) closes it back to
     the resting screen, right where it is. It also closes once the page has scrolled on past its end or back up above it; closing
     behind the reader takes the flight's length back out of the scroll position too, so what is on screen stays put ---------- */
  (() => {
    const rm = document.getElementById('roadmap');
    const openBtn = document.getElementById('rm-open'), skipBtn = document.getElementById('rm-skip');
    if (!rm || !openBtn || !skipBtn) return;
    const to = y => scrollTo(0, y);
    const relayout = () => {
      if (hasGsap) ScrollTrigger.refresh();
    };
    const setOpen = on => {
      rm.classList.toggle('is-open', on);
      openBtn.setAttribute('aria-expanded', on);
      relayout();
    };
    // rounded up to a whole pixel: landing a fraction short leaves a hairline of the paper showing above the navy
    const top = () => Math.ceil(rm.getBoundingClientRect().top + scrollY);

    // Explore: glide the resting screen into place, then open the flight the moment it lands. Opened first, from partway
    // past the section's top, the camera would start some way into the flight. The glide is our own so it can end on
    // the open exactly, with no guessed wait: quick for a short move, a little longer for a long one
    let gliding = false;
    openBtn.addEventListener('click', () => {
      if (gliding || rm.classList.contains('is-open')) return;
      const y = top() + 1;   // a pixel past the top, so no sliver of paper can show above the stage on any screen
      const from = scrollY, dist = y - from;
      if (Math.abs(dist) < 2) { setOpen(true); return; }
      gliding = true;
      const dur = Math.min(600, 350 + Math.abs(dist) * 0.25);
      const ease = t => 1 - Math.pow(1 - t, 3);   // easeOutCubic: sets off at once, settles softly
      let t0 = 0;
      const step = () => {
        const now = performance.now();
        t0 = t0 || now;   // timed from the first frame, so a late first frame cannot cut the glide short
        const t = Math.min(1, (now - t0) / dur);
        scrollTo(0, from + dist * ease(t));
        if (t < 1) requestAnimationFrame(step);
        else { gliding = false; setOpen(true); }
      };
      requestAnimationFrame(step);
    });
    // at rest, the inverting circle rides on the pointer, easing after it, and swells while the pointer moves fast
    // (how far it trails behind is the measure of speed), settling back as it slows
    const stage = rm.querySelector('.rm-stage'), hint = document.getElementById('rm-cursor');
    if (hint && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let tx = 0, ty = 0, x = 0, y = 0, k = 1, raf = 0, over = false;
      const draw = () => {
        x += (tx - x) * 0.22; y += (ty - y) * 0.22;
        const swell = 1 + Math.min(Math.hypot(tx - x, ty - y) / 50, 1.5);   // up to 2.5 times its size
        k += (swell - k) * 0.15;
        hint.style.setProperty('--x', `${x.toFixed(1)}px`);
        hint.style.setProperty('--y', `${y.toFixed(1)}px`);
        hint.style.setProperty('--k', k.toFixed(3));
        raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 || k > 1.005 ? requestAnimationFrame(draw) : 0;
        if (!raf) { k = 1; hint.style.setProperty('--k', '1'); }
      };
      // where the pointer is is kept from the window, and checked against the screen on every move and every scroll:
      // scrolled under a still pointer, the browser sends no enter or leave until the mouse moves again, which made the
      // circle late to appear and late to go
      let px = 0, py = 0, has = false;
      const show = () => {
        const on = over && !rm.classList.contains('is-open');
        hint.classList.toggle('on', on);
        document.documentElement.classList.toggle('rm-cursor-on', on);
      };
      const check = scrolled => {
        if (!has) { over = false; show(); return; }
        const r = stage.getBoundingClientRect();
        const inside = px >= r.left && px < r.right && py >= r.top && py < r.bottom;
        tx = px - r.left; ty = py - r.top;
        // arriving, or carried by the scroll: sit right on the pointer rather than easing (or swelling) after it
        if ((inside && !over) || scrolled) {
          x = tx; y = ty;
          hint.style.setProperty('--x', `${x.toFixed(1)}px`);
          hint.style.setProperty('--y', `${y.toFixed(1)}px`);
        }
        over = inside;
        show();
        if (over && !raf) raf = requestAnimationFrame(draw);
      };
      addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; has = true; check(false); }, { passive: true });
      addEventListener('scroll', () => check(true), { passive: true });
      document.documentElement.addEventListener('pointerleave', () => { has = false; check(false); });
      new MutationObserver(show).observe(rm, { attributes: true, attributeFilter: ['class'] });
    }
    // at rest, a click anywhere on the screen opens it, the same as Explore
    stage.addEventListener('click', e => {
      if (rm.classList.contains('is-open') || e.target.closest('button, a')) return;
      openBtn.click();
    });
    const close = () => {
      if (!rm.classList.contains('is-open')) return;
      // noted before closing: once the page shortens, the browser clamps the scroll to the new end on its own
      const before = rm.offsetHeight, y = scrollY, passed = rm.getBoundingClientRect().bottom < 0;
      setOpen(false);
      // closed behind the reader: the page below has moved up by the flight's length, so move the scroll up with it
      if (passed) to(y - (before - rm.offsetHeight));
    };
    skipBtn.addEventListener('click', () => {
      setOpen(false);
      // back out of full screen onto the resting screen, staying on it rather than moving on
      to(top());
    });
    addEventListener('keydown', e => {
      if (e.key !== 'Escape' || !rm.classList.contains('is-open')) return;
      const r = rm.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) skipBtn.click();
    });
    // done with it: scrolled on past the end, or back up above the start
    const check = () => {
      if (!rm.classList.contains('is-open')) return;
      const r = rm.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) close();
    };
    // the page's own scroll event, which fires however the page moves (wheel, keys, the scroll pill, a link)
    addEventListener('scroll', check, { passive: true });
  })();

  /* ---------- the written sections between the hero and the milestones ----------
     Layered on the existing layout, nothing moves: the headlines rise word by word, the intro's quote inks in
     word by word as it is read, the body copy rises line by line, and the rules draw themselves. Runs before the reveals below, so the blocks it animates itself can drop
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
  })();

  /* ---------- milestones: the terrain's rounded panel comes up a little small and out of focus, and grows to full size
     and comes sharp as it reaches the top of the screen ---------- */
  (() => {
    const stage = document.querySelector('#roadmap .rm-stage');
    if (!hasGsap || reduce || !stage) return;
    const scroll = { trigger: '#roadmap', start: 'top bottom', end: 'top top', scrub: true };
    gsap.fromTo(stage, { scale: 0.94 }, { scale: 1, ease: 'none', scrollTrigger: scroll });
    // what is inside the panel blurs, not the panel itself, so its rounded edge stays crisp
    // (the title's own filter belongs to roadmap.js, which sets it every frame, so its text takes this blur instead)
    const inside = [...stage.children].map(el => el.id === 'rm-title' ? el.firstElementChild : el).filter(Boolean);
    gsap.fromTo(inside, { filter: 'blur(14px)' }, {
      filter: 'blur(0px)', ease: 'none', scrollTrigger: { ...scroll },
      // once it is sharp, drop the filter altogether so the flight draws at full speed
      onUpdate() { if (this.progress() === 1) inside.forEach(el => { el.style.filter = 'none'; }); }
    });
  })();

  /* ---------- the signal: what ARC-1 does, drawn as one line. It starts as everything the room hears (the voice buried
     in noise), the noise falls away to leave only the voice, and the voice then settles into a graph with its points
     and grid. It holds in the middle of the screen while that happens; the line itself keeps moving gently the whole time ---------- */
  (() => {
    const fig = document.getElementById('signal');
    if (!fig) return;
    const cv = fig.querySelector('.signal-cv'), ctx = cv.getContext('2d');
    const ink = css('--ink') || '#4757B3', grey = css('--text') || '#323232', rule = css('--rule');
    const smooth = v => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };
    let W = 0, H = 0, dpr = 1, p = reduce ? 1 : 0, t = 0, on = false, raf = 0;
    // the same noise every frame for a given x, shifted slowly in time
    const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
    const noise = (x, tt) => {
      const i = Math.floor(x * 220 + tt * 9), f = x * 220 + tt * 9 - i;
      return (hash(i) * (1 - f) + hash(i + 1) * f) * 2 - 1;
    };
    // the voice: bursts of a few words, each a run of vibration under its own envelope
    const voice = (x, tt) => {
      const env = Math.max(0, Math.sin(x * Math.PI * 5.2 + 0.6)) ** 1.6 * (0.55 + 0.45 * Math.sin(x * 9.1 + 1.3));
      return env * Math.sin(x * 160 + tt * 5) * (0.75 + 0.25 * Math.sin(x * 37 + tt * 2));
    };
    // the graph it becomes: a gentle trend across the strip
    const trend = x => 0.35 * Math.sin(x * Math.PI * 1.4 + 0.4) - 0.25 * x + 0.08 * Math.sin(x * 11);

    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      draw();
    };
    const draw = () => {
      if (!W) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const clean = smooth((p - 0.12) / 0.33), graph = smooth((p - 0.55) / 0.3);
      const mid = H / 2, amp = H * 0.4;
      // the graph's grid comes up behind the line
      if (graph > 0) {
        ctx.strokeStyle = rule; ctx.globalAlpha = graph; ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) { const y = H * (0.1 + 0.2 * i); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      // the room's noise: a grey scribble that thins away as the voice is picked out
      if (clean < 1) {
        ctx.strokeStyle = grey; ctx.globalAlpha = 0.35 * (1 - clean); ctx.lineWidth = 1;
        ctx.beginPath();
        for (let px = 0; px <= W; px += 2) {
          const x = px / W, y = mid + amp * (0.55 * noise(x, t) + 0.3 * noise(x * 3.1 + 5, t * 1.7));
          px ? ctx.lineTo(px, y) : ctx.moveTo(px, y);
        }
        ctx.stroke(); ctx.globalAlpha = 1;
      }
      // the line itself: voice plus whatever noise is left, easing into the graph
      ctx.strokeStyle = ink; ctx.lineWidth = 1.5 + graph; ctx.lineJoin = 'round';
      ctx.beginPath();
      const at = px => {
        const x = px / W;
        const wave = voice(x, t) * 0.8 + (1 - clean) * 0.5 * noise(x * 1.7 + 9, t * 1.3);
        return mid + amp * (wave * (1 - graph) + trend(x) * graph);
      };
      for (let px = 0; px <= W; px += 1.5) px ? ctx.lineTo(px, at(px)) : ctx.moveTo(px, at(px));
      ctx.stroke();
      // the measured points along the graph
      if (graph > 0.02) {
        ctx.fillStyle = ink;
        for (let i = 1; i < 12; i++) {
          const px = W * i / 12, r = 3.5 * smooth((graph - i * 0.03) / 0.4);
          if (r <= 0) continue;
          ctx.beginPath(); ctx.arc(px, at(px), r, 0, Math.PI * 2); ctx.fill();
        }
      }
    };
    const frame = now => {
      raf = 0;
      if (!on) return;
      t = now / 1000;
      draw();
      raf = requestAnimationFrame(frame);
    };
    size();
    new ResizeObserver(size).observe(cv);
    if (reduce) return;
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on && !raf) raf = requestAnimationFrame(frame); }).observe(fig);
    // noisy all the way up; once the text and the drawing under it are both on screen (the drawing at the foot), they hold
    // there together while the scroll cleans it and turns it into a graph, then let go and the page carries on.
    // A block taller than the screen holds from its top instead
    const hold = document.getElementById('arc-hold') || fig;
    if (hasGsap) ScrollTrigger.create({
      trigger: hold, pin: hold, scrub: true, end: '+=140%',
      start: () => hold.offsetHeight > innerHeight * 0.92 ? 'top top' : 'bottom bottom-=' + Math.round(innerHeight * 0.04),
      onUpdate: self => { p = self.progress; }
    });
    else p = 1;
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
