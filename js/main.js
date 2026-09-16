/*
 * vitormach.dev — comportamento da pagina.
 * JavaScript puro, sem dependencias e sem passo de build. Tudo aqui e progressivo:
 * com o script bloqueado ou quebrado, a pagina continua legivel e navegavel.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* --- Tema -----------------------------------------------------------------
   * O tema inicial ja foi aplicado pelo script inline no <head>, antes da
   * primeira pintura. Aqui so cuidamos do botao e da persistencia.
   */
  var toggle = document.getElementById('theme-toggle');

  function currentTheme() {
    var explicit = root.getAttribute('data-theme');
    if (explicit) return explicit;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function syncToggle() {
    if (!toggle) return;
    var dark = currentTheme() === 'dark';
    toggle.setAttribute('aria-checked', String(dark));
    toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  if (toggle) {
    syncToggle();
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* modo privado */ }
      syncToggle();
    });
  }

  // Se o visitante nunca escolheu, acompanha a preferencia do sistema ao vivo.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (!root.getAttribute('data-theme')) syncToggle();
  });

  /* --- Menu mobile ---------------------------------------------------------- */
  var burger = document.getElementById('nav-burger');
  var links = document.getElementById('nav-links');
  var backdrop = document.getElementById('nav-backdrop');

  function setMenu(open) {
    if (!burger || !links) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    burger.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
    links.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
    if (backdrop) backdrop.classList.toggle('is-open', open);
    if (open) {
      var first = links.querySelector('a');
      if (first) first.focus();
    }
  }

  if (burger) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (backdrop) backdrop.addEventListener('click', function () { setMenu(false); });
  if (links) {
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger && burger.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      burger.focus();
    }
  });

  /* --- Sombra da navbar ----------------------------------------------------- */
  var nav = document.querySelector('.nav');
  var sentinel = document.querySelector('.nav-sentinel');

  if (nav && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* --- Scrollspy ------------------------------------------------------------ */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link[href^="#"]'));
  var sections = navLinks
    .map(function (a) {
      var id = a.getAttribute('href').slice(1);
      var el = id === 'top' ? document.getElementById('home') : document.getElementById(id);
      return el ? { el: el, link: a } : null;
    })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove('is-active'); });
        var match = sections.filter(function (s) { return s.el === entry.target; })[0];
        if (match) match.link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s.el); });
  }

  /* --- Reveal on scroll ----------------------------------------------------- */
  var revealables = document.querySelectorAll('.reveal');

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-visible'); });
  } else {
    var reveal = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    Array.prototype.forEach.call(revealables, function (el) { reveal.observe(el); });
  }

  /* --- Baloes do retrato -----------------------------------------------------
   * Cada balao fica visivel de 4 a 6 segundos, some, e reaparece em outra das
   * seis posicoes com outra tecnologia. Os tres ciclos sao independentes e
   * comecam desencontrados, para nunca trocarem todos ao mesmo tempo.
   */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.portrait__chip'));

  if (chips.length && !reduceMotion.matches) {
    var TECHS = [
      'TypeScript', 'React', 'React Native', 'Next.js', 'Node.js', 'AWS',
      'PostgreSQL', 'Elasticsearch', 'GraphQL', 'Java', 'Python', 'Docker',
      'Playwright', 'Jest', 'RabbitMQ', 'Azure', 'Agentic AI'
    ];
    var POSITIONS = 6;
    var FADE = 500;           // casa com --dur-slow
    var MIN_HOLD = 4000;
    var MAX_HOLD = 6000;

    // o que ja esta na tela nao deve ser sorteado de novo
    var usedPos = chips.map(function (c) { return Number(c.dataset.pos); });
    var usedTech = chips.map(function (c) { return c.textContent.trim(); });

    function pick(list, taken) {
      var free = list.filter(function (v) { return taken.indexOf(v) === -1; });
      return free[Math.floor(Math.random() * free.length)];
    }

    function cycle(chip, slot) {
      var hold = MIN_HOLD + Math.random() * (MAX_HOLD - MIN_HOLD);

      setTimeout(function () {
        chip.classList.add('is-out');

        setTimeout(function () {
          var allPos = [];
          for (var i = 0; i < POSITIONS; i++) allPos.push(i);

          // enquanto este balao esta invisivel, ele nao disputa posicao nem texto
          var othersPos = usedPos.filter(function (_, i) { return i !== slot; });
          var othersTech = usedTech.filter(function (_, i) { return i !== slot; });

          var nextPos = pick(allPos, othersPos.concat([usedPos[slot]]));
          var nextTech = pick(TECHS, othersTech.concat([usedTech[slot]]));

          usedPos[slot] = nextPos;
          usedTech[slot] = nextTech;

          chip.dataset.pos = String(nextPos);
          chip.textContent = nextTech;
          chip.classList.remove('is-out');

          cycle(chip, slot);
        }, FADE);
      }, hold);
    }

    chips.forEach(function (chip, slot) {
      // desencontra o inicio de cada ciclo
      setTimeout(function () { cycle(chip, slot); }, slot * 1600);
    });
  }

  /* --- Malha de pontos do hero ----------------------------------------------
   * Decorativa. Pausa quando o hero sai da viewport ou a aba fica oculta, e
   * desenha um unico quadro estatico sob prefers-reduced-motion.
   */
  var canvas = document.getElementById('mesh');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var hero = canvas.parentElement;
  var points = [];
  var frame = null;
  var visible = true;
  var LINK_DIST = 130;

  function ink() {
    return getComputedStyle(root).getPropertyValue('--mesh-ink').trim() || '255, 255, 255';
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = hero.offsetWidth;
    var h = hero.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var count = Math.min(56, Math.round((w * h) / 26000));
    points = [];
    for (var i = 0; i < count; i++) {
      points.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22
      });
    }
  }

  function draw() {
    var w = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
    var h = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));
    var rgb = ink();

    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      for (var j = i + 1; j < points.length; j++) {
        var q = points[j];
        var dx = p.x - q.x;
        var dy = p.y - q.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > LINK_DIST) continue;
        ctx.strokeStyle = 'rgba(' + rgb + ',' + (0.16 * (1 - dist / LINK_DIST)).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(' + rgb + ',.35)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function step() {
    var w = hero.offsetWidth;
    var h = hero.offsetHeight;
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    draw();
    frame = requestAnimationFrame(step);
  }

  function play() {
    if (frame || reduceMotion.matches) return;
    frame = requestAnimationFrame(step);
  }

  function pause() {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = null;
  }

  resize();
  draw();

  if (!reduceMotion.matches) {
    play();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !document.hidden) play(); else pause();
      }, { threshold: 0 }).observe(hero);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden || !visible) pause(); else play();
    });
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { resize(); draw(); }, 150);
  });

  reduceMotion.addEventListener('change', function () {
    if (reduceMotion.matches) { pause(); draw(); } else { play(); }
  });
})();
