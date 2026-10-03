/* ═══════════════════════════════════════════════════════════════
   PROSZER — interakciók
   Reveal · hero rendszerfeltárás · szolgáltatásváltó · űrlap
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var d = document;
  var root = d.documentElement;
  root.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1. Scroll-reveal ─────────────────────────────────────── */
  var revealEls = Array.prototype.slice.call(d.querySelectorAll(".reveal"));

  if ("IntersectionObserver" in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          ro.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ── 2. Hero rendszerfeltárás (scrollozva tárul fel) ──────── */
  var heroFig = d.querySelector("[data-stage]");
  var iso = d.querySelector(".iso");
  if (heroFig && iso) {
    if ("IntersectionObserver" in window) {
      var ho = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            // a szöveg azonnal olvasható; az illusztráció szakaszosan tárul fel
            var delay = reduceMotion ? 0 : 350;
            window.setTimeout(function () { iso.classList.add("is-revealed"); }, delay);
            ho.disconnect();
          }
        });
      }, { threshold: 0.25 });
      ho.observe(heroFig);
    } else {
      iso.classList.add("is-revealed");
    }
  }

  /* ── 3. Szolgáltatásváltó ─────────────────────────────────── */
  var SVC = {
    viz: {
      title: "Víz és csatorna",
      desc: "Vízvezeték- és csatornaszerelés: új vezetékek kialakítása, elavult rendszerek cseréje, berendezések bekötése."
    },
    gaz: {
      title: "Gázszerelés",
      desc: "Gázvezetékek kiépítése és átalakítása, gázkészülékek biztonságos csatlakoztatása az előírások szerint."
    },
    futes: {
      title: "Fűtés és padlófűtés",
      desc: "Fűtési rendszerek telepítése és korszerűsítése: radiátoros körök, padlófűtés kialakítása, hidraulikus egyensúly."
    },
    klima: {
      title: "Klíma és hűtés",
      desc: "Hűtési rendszerek és klímatelepítés: beltéri és külső egységek telepítése, az épület adottságaihoz igazítva."
    },
    hsz: {
      title: "Hőszivattyús rendszerek",
      desc: "Hőszivattyús rendszerek telepítése — fűtéshez, hűtéshez és használati melegvízhez, az épülethez igazítva."
    }
  };

  var svcRows = Array.prototype.slice.call(d.querySelectorAll(".svc-row"));
  var svcTitle = d.querySelector("[data-svc-title]");
  var svcDesc = d.querySelector("[data-svc-desc]");
  var svcCta = d.querySelector("[data-svc-cta]");
  var svcSelect = d.getElementById("fSzolg");

  function prefillSelect(topic) {
    if (!svcSelect || !topic) return;
    for (var i = 0; i < svcSelect.options.length; i++) {
      if (svcSelect.options[i].value === topic) {
        if (svcSelect.value !== topic) {
          svcSelect.value = topic;
          svcSelect.classList.add("pre-selected");
        }
        return;
      }
    }
  }

  function setService(key, prefill) {
    var conf = SVC[key];
    if (!conf) return;
    svcRows.forEach(function (r) {
      var on = r.getAttribute("data-svc") === key;
      r.classList.toggle("active", on);
      r.setAttribute("aria-expanded", on ? "true" : "false");
    });
    Array.prototype.forEach.call(d.querySelectorAll(".svc-diagram .sd"), function (g) {
      g.classList.toggle("is-on", g.getAttribute("data-sd") === key);
    });
    if (svcTitle) svcTitle.textContent = conf.title;
    if (svcDesc) svcDesc.textContent = conf.desc;
    if (svcCta) svcCta.setAttribute("data-topic", conf.title);
    if (prefill) prefillSelect(conf.title);
  }

  svcRows.forEach(function (row) {
    row.addEventListener("click", function () {
      setService(row.getAttribute("data-svc"), true);
    });
  });

  if (svcCta) {
    svcCta.addEventListener("click", function () {
      prefillSelect(svcCta.getAttribute("data-topic"));
    });
  }

  // kezdeti állapot
  setService("viz");

  /* ── 3a+. Biztonsági háló: ha a böngésző nem támogatja a pathLength-alapú
     vonal-felhúzást, a rajzvonalak véglegesen láthatóvá tétele ── */
  window.setTimeout(function () {
    var probe = d.querySelector(".iso .draw");
    if (!probe) return;
    var cs = window.getComputedStyle(probe);
    var off = parseFloat(cs.strokeDashoffset);
    if (!isNaN(off) && off > 0.5) {
      root.classList.add("no-draw");
    }
  }, 2600);

  /* ── 3b. Fejléc-állapot + finom hero parallax ── */
  var header = d.querySelector(".site-header");
  if (header) {
    var onScrollHeader = function () {
      header.classList.toggle("is-scrolled", (window.scrollY || 0) > 12);
    };
    window.addEventListener("scroll", onScrollHeader, { passive: true });
    onScrollHeader();
  }

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var heroEl = d.querySelector(".hero");
  if (heroFig && iso && heroEl && finePointer && !reduceMotion) {
    var pTx = 0, pTy = 0, pRaf = null;
    var applyParallax = function () {
      pRaf = null;
      heroFig.style.transform = "perspective(1100px) rotateX(" + (-pTy * 0.6).toFixed(2) + "deg) rotateY(" + (pTx * 0.8).toFixed(2) + "deg)";
      iso.style.transform = "translate3d(" + (pTx * 3).toFixed(1) + "px," + (pTy * 3).toFixed(1) + "px,0)";
    };
    heroEl.addEventListener("pointermove", function (ev) {
      var r = heroFig.getBoundingClientRect();
      pTx = Math.max(-1, Math.min(1, (ev.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      pTy = Math.max(-1, Math.min(1, (ev.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      if (!pRaf) pRaf = window.requestAnimationFrame(applyParallax);
    });
    heroEl.addEventListener("pointerleave", function () {
      pTx = 0; pTy = 0;
      if (!pRaf) pRaf = window.requestAnimationFrame(applyParallax);
    });
  }

  /* ── 4. Űrlap: validáció + képelőnézet ───────────────────── */
  var form = d.getElementById("quoteForm");
  if (!form) return;

  var status = d.getElementById("formStatus");

  function setErr(input, msg) {
    var ff = input.closest(".ff");
    if (!ff) return;
    var err = ff.querySelector("[data-err]");
    ff.classList.toggle("invalid", !!msg);
    if (err) err.textContent = msg || "";
  }

  function validate(input) {
    var v = input.value.trim();
    var msg = "";
    switch (input.id) {
      case "fNev":
        if (v.length < 2) msg = "Kérjük, adja meg a nevét.";
        break;
      case "fTel":
        if (!/^[+0-9 ()\/-]{7,}$/.test(v)) msg = "Érvényes telefonszámot adjon meg (pl. +36 20 123 4567).";
        break;
      case "fEmail":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = "Érvényes e-mail címet adjon meg.";
        break;
      case "fVaros":
        if (v.length < 2) msg = "Kérjük, adja meg a települést.";
        break;
      case "fSzolg":
        if (!v) msg = "Válasszon szolgáltatást.";
        break;
    }
    setErr(input, msg);
    return msg;
  }

  var fields = Array.prototype.slice.call(form.querySelectorAll("input[required], select[required]"));
  fields.forEach(function (input) {
    input.addEventListener("blur", function () { validate(input); });
    input.addEventListener("input", function () {
      if (input.closest(".ff").classList.contains("invalid")) validate(input);
    });
  });

  /* képelőnézet */
  var fileInput = d.getElementById("fKep");
  var thumbs = d.getElementById("thumbs");

  if (fileInput && thumbs) {
    fileInput.addEventListener("change", function () {
      Array.prototype.slice.call(fileInput.files).forEach(function (file) {
        if (!file.type.match(/^image\//)) return;
        var url = URL.createObjectURL(file);
        var wrap = d.createElement("div");
        wrap.className = "thumb";
        var img = d.createElement("img");
        img.src = url;
        img.alt = "Feltöltött kép előnézete: " + file.name;
        var x = d.createElement("button");
        x.type = "button";
        x.className = "thumb-x";
        x.setAttribute("aria-label", "Kép eltávolítása");
        x.textContent = "×";
        x.addEventListener("click", function () {
          URL.revokeObjectURL(url);
          wrap.remove();
        });
        wrap.appendChild(img);
        wrap.appendChild(x);
        thumbs.appendChild(wrap);
      });
    });
  }

  /* beküldés — látványterv: NEM küld adatot */
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var firstBad = null;
    fields.forEach(function (input) {
      var msg = validate(input);
      if (msg && !firstBad) firstBad = input;
    });
    if (firstBad) {
      firstBad.focus();
      if (status) {
        status.textContent = "Kérjük, ellenőrizze a bejelölt mezőket.";
        status.className = "form-status err";
      }
      return;
    }
    if (status) {
      status.textContent = "Ez látványterv — az adatok nem kerülnek elküldésre. A kész oldalon közvetlenül a ProSzerhez jutnának.";
      status.className = "form-status ok";
    }
  });
})();
