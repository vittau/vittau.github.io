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
      var el = document.getElementById(id);
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


  /* --- Nos da linha do tempo -------------------------------------------------
   * Cada emprego acende o seu no quando o topo cruza o meio da tela, junto com o
   * preenchimento coral do trilho (animacao ligada a rolagem, no CSS).
   */
  var jobs = document.querySelectorAll('.job');

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(jobs, function (el) { el.classList.add('is-lit'); });
  } else {
    var lit = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-lit');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -48% 0px' });
    Array.prototype.forEach.call(jobs, function (el) { lit.observe(el); });
  }

  /* --- Rede do hero: um modelo SIR -----------------------------------------
   * Decorativa, e um easter egg sem legenda na pagina: uma epidemia SIR num grafo
   * aleatorio de vizinhos mais proximos (o artigo do doutorado discute uma
   * variacao do SIR). Cada no e Suscetivel (ponto neutro), Infectado (coral,
   * com pulso) ou Recuperado (anel neutro, imune). A cada passo, cada infectado
   * contagia cada vizinho suscetivel com probabilidade BETA e se recupera com
   * probabilidade GAMMA. Quando nao resta infectado, a epidemia acabou: o estado
   * fica um instante na tela, se desfaz e outra comeca num no diferente.
   * Pausa fora da viewport ou com a aba oculta; sob prefers-reduced-motion
   * desenha um unico quadro, com uma epidemia ja em andamento.
   */
  var canvas = document.getElementById('net');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var hero = canvas.parentElement;
  var STEP = 420;          // ms entre passos da epidemia
  var TRAVEL = 0.8;        // fracao do passo que o contagio leva para cruzar a aresta
  var BETA = 0.55;         // chance de contagio por aresta, por passo
  var GAMMA = 0.4;         // chance de recuperacao por passo (~2,5 passos infectado)
  var RECOVER = 400;       // ms da transicao visual infectado -> recuperado
  var PULSE = 900;         // ms do pulso ao ser infectado
  var HOLD = 700;          // ms com o saldo final na tela
  var FADE = 800;          // ms para desfazer antes da proxima

  var nodes = [];
  var edges = [];
  var adj = [];
  var phase = 'spread';
  var phaseAt = 0;
  var lastStep = 0;
  var frame = null;
  var visible = true;
  var W = 0;
  var H = 0;
  var dpr = 1;
  var inkRGB = '255, 255, 255';
  var coralRGB = '204, 104, 104';

  function readColors() {
    var cs = getComputedStyle(root);
    inkRGB = cs.getPropertyValue('--net-ink').trim() || inkRGB;
    coralRGB = cs.getPropertyValue('--brand-coral-rgb').trim() || coralRGB;
  }

  // grade com jitter: espalha os nos sem aglomerados nem buracos grandes
  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.offsetWidth;
    H = hero.offsetHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var target = Math.max(22, Math.min(86, Math.round((W * H) / 15000)));
    var cols = Math.max(4, Math.round(Math.sqrt(target * W / H)));
    var rows = Math.max(4, Math.round(target / cols));
    var cw = W / cols;
    var ch = H / rows;
    var i, j;

    nodes = [];
    for (i = 0; i < rows; i++) {
      for (j = 0; j < cols; j++) {
        nodes.push({
          x0: (j + 0.5 + (Math.random() - 0.5) * 0.7) * cw,
          y0: (i + 0.5 + (Math.random() - 0.5) * 0.7) * ch,
          ph: Math.random() * Math.PI * 2,
          at: null,        // instante da infeccao (null: suscetivel). Pode ser negativo:
                           // o paciente zero nasce 'no passado' para ja aparecer aceso
          from: -1,        // de quem veio o contagio
          rec: null        // instante da recuperacao (null: ainda nao)
        });
      }
    }

    // cada no liga aos 3 vizinhos mais proximos, sem arestas longas demais
    var maxD = Math.max(cw, ch) * 1.9;
    var seen = {};
    edges = [];
    adj = nodes.map(function () { return []; });
    nodes.forEach(function (a, ai) {
      var near = nodes
        .map(function (b, bi) { return { bi: bi, d: Math.hypot(a.x0 - b.x0, a.y0 - b.y0) }; })
        .filter(function (o) { return o.bi !== ai && o.d < maxD; })
        .sort(function (p, q) { return p.d - q.d; })
        .slice(0, 3);
      near.forEach(function (o) {
        var key = ai < o.bi ? ai + '-' + o.bi : o.bi + '-' + ai;
        if (seen[key]) return;
        seen[key] = true;
        edges.push([ai, o.bi]);
        adj[ai].push(o.bi);
        adj[o.bi].push(ai);
      });
    });
  }

  // O paciente zero nasce do lado do retrato, onde a mascara do CSS deixa a rede
  // visivel, mas nunca atras da foto: la a epidemia comecaria escondida.
  function behindPortrait(n) {
    var img = hero.querySelector('.portrait');
    if (!img) return false;
    var h = hero.getBoundingClientRect();
    var r = img.getBoundingClientRect();
    var m = 12;
    return n.x0 > r.left - h.left - m && n.x0 < r.right - h.left + m &&
           n.y0 > r.top - h.top - m && n.y0 < r.bottom - h.top + m;
  }

  function seed(now) {
    nodes.forEach(function (n) { n.at = null; n.from = -1; n.rec = null; });
    var pool = nodes
      .map(function (n, i) { return i; })
      .filter(function (i) {
        var n = nodes[i];
        return n.x0 > W * 0.5 && n.y0 > H * 0.12 && n.y0 < H * 0.8 && !behindPortrait(n);
      });
    var s = pool.length ? pool[Math.floor(Math.random() * pool.length)] : 0;
    nodes[s].at = now - STEP * TRAVEL;   // ja nasce infectado e aceso
    phase = 'spread';
    phaseAt = now;
    lastStep = now;
  }

  // Um passo da epidemia. So quem ja estava infectado antes do passo contagia ou
  // se recupera: um recem-infectado passa pelo menos um passo inteiro doente.
  function advance(now) {
    var sick = [];
    nodes.forEach(function (n, i) { if (n.at !== null && n.rec === null) sick.push(i); });

    sick.forEach(function (u) {
      adj[u].forEach(function (v) {
        if (nodes[v].at !== null || Math.random() > BETA) return;
        nodes[v].at = now;
        nodes[v].from = u;
      });
    });
    sick.forEach(function (u) {
      if (Math.random() < GAMMA) nodes[u].rec = now;
    });

    // Sem nenhum infectado vizinho de um suscetivel, a epidemia ja acabou: em vez
    // de esperar cada um se recuperar no sorteio, todos se recuperam agora, num
    // leque curto para nao apagarem ao mesmo tempo.
    var alive = nodes.some(function (n, i) {
      return n.at !== null && n.rec === null &&
        adj[i].some(function (v) { return nodes[v].at === null; });
    });
    if (!alive) {
      nodes.forEach(function (n) {
        if (n.at !== null && n.rec === null) n.rec = now + Math.random() * STEP;
      });
      phase = 'hold';
      phaseAt = now + STEP + RECOVER;
    }
  }

  function tick(now) {
    if (phase === 'spread' && now - lastStep >= STEP) { lastStep = now; advance(now); }
    else if (phase === 'hold' && now - phaseAt >= HOLD) { phase = 'fade'; phaseAt = now; }
    else if (phase === 'fade' && now - phaseAt >= FADE) { seed(now); }
  }

  function draw(now, still) {
    var fade = phase === 'fade' ? Math.max(0, 1 - (now - phaseAt) / FADE) : 1;
    var t = still ? 0 : now / 1000;
    var travel = STEP * TRAVEL;
    var i;

    ctx.clearRect(0, 0, W, H);

    // posicao atual: cada no respira alguns pixels em torno da posicao base
    for (i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x = n.x0 + Math.sin(t * 0.35 + n.ph) * 4;
      n.y = n.y0 + Math.cos(t * 0.3 + n.ph * 1.3) * 4;
      // 0 = infectado, 1 = recuperado; a transicao dura RECOVER ms
      n.r = n.rec === null ? 0 : (still ? 1 : Math.min(1, Math.max(0, (now - n.rec) / RECOVER)));
    }

    // arestas neutras
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(' + inkRGB + ', .09)';
    ctx.beginPath();
    edges.forEach(function (e) {
      ctx.moveTo(nodes[e[0]].x, nodes[e[0]].y);
      ctx.lineTo(nodes[e[1]].x, nodes[e[1]].y);
    });
    ctx.stroke();

    // cadeia de contagio: forte enquanto o infectado esta doente, um rastro
    // fraco depois que ele se recupera, e o contagio viajando na ponta
    for (i = 0; i < nodes.length; i++) {
      var v = nodes[i];
      if (v.from < 0) continue;
      var u = nodes[v.from];
      var k = still ? 1 : Math.min(1, (now - v.at) / travel);
      var x = u.x + (v.x - u.x) * k;
      var y = u.y + (v.y - u.y) * k;
      var alpha = (0.55 - 0.4 * v.r) * fade;
      ctx.strokeStyle = 'rgba(' + coralRGB + ',' + alpha.toFixed(3) + ')';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(u.x, u.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      if (k < 1) {
        ctx.fillStyle = 'rgba(' + coralRGB + ', .95)';
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // nos: S ponto neutro; I coral com pulso ao ser infectado; R anel neutro
    for (i = 0; i < nodes.length; i++) {
      var m = nodes[i];
      var litAt = m.at === null ? 0 : m.at + (m.from < 0 ? 0 : travel);
      var hit = m.at !== null && (still || now >= litAt);

      if (!hit) {
        ctx.fillStyle = 'rgba(' + inkRGB + ', .26)';
        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      var age = still ? 9999 : now - litAt;
      if (age < PULSE) {
        var q = age / PULSE;
        ctx.strokeStyle = 'rgba(' + coralRGB + ',' + ((1 - q) * 0.5 * fade).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 3 + q * 18, 0, Math.PI * 2);
        ctx.stroke();
      }

      // infectado: disco coral, que se apaga conforme o no se recupera
      if (m.r < 1) {
        ctx.fillStyle = 'rgba(' + coralRGB + ',' + ((0.95 * (1 - m.r)) * fade).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // recuperado: anel neutro, imune; volta a ser ponto no fade final
      if (m.r > 0) {
        ctx.strokeStyle = 'rgba(' + inkRGB + ',' + (0.5 * m.r * fade).toFixed(3) + ')';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 3.2, 0, Math.PI * 2);
        ctx.stroke();
        if (fade < 1) {
          ctx.fillStyle = 'rgba(' + inkRGB + ',' + (0.26 * (1 - fade)).toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  function loop(now) {
    tick(now);
    draw(now, false);
    frame = requestAnimationFrame(loop);
  }

  function play() {
    if (frame || reduceMotion.matches) return;
    frame = requestAnimationFrame(loop);
  }

  function pause() {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = null;
  }

  // Quadro unico: uma epidemia de alguns passos, com infectados e recuperados.
  // Sorteia de novo (ate 8 vezes) se ela morrer cedo demais para aparecer.
  function still() {
    var now = performance.now();
    for (var tries = 0; tries < 8; tries++) {
      seed(now);
      for (var s = 0; s < 6 && phase === 'spread'; s++) advance(now);
      var hit = nodes.filter(function (n) { return n.at !== null; }).length;
      if (hit >= 8) break;
    }
    phase = 'spread';   // no quadro estatico nao ha fade
    draw(now, true);
  }

  readColors();
  build();

  if (reduceMotion.matches) {
    still();
  } else {
    seed(performance.now());
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

  // o tema muda as cores da rede
  new MutationObserver(function () {
    readColors();
    if (reduceMotion.matches) still();
  }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    readColors();
    if (reduceMotion.matches) still();
  });

  var resizeTimer;
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    // no mobile a barra de endereco muda a altura a cada rolagem; so a largura
    // justifica refazer o grafo
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      build();
      if (reduceMotion.matches) still(); else seed(performance.now());
    }, 150);
  });

  reduceMotion.addEventListener('change', function () {
    if (reduceMotion.matches) { pause(); still(); } else { seed(performance.now()); play(); }
  });
})();
