// =============================================================================
// Mistik imleç ışıması + iz (cursor glow + trail) — bağımsız, kendi kendine
// başlayan modül. Ana sayfadaki (animation.js) imleç efektinin BİREBİR aynısı.
// PDF yükleme overlay'inin göründüğü ama animation.js yüklenmeyen sayfalarda
// (ör. hesap/analiz.html "PDF tekrar indir") de aynı imleç animasyonu olsun
// diye ayrı modüle alındı. CSS sınıfları (.cursor-glow, .cursor-trail-dot)
// styles.css içinde tanımlı — bu modülü kullanan sayfa styles.css'i yüklemeli.
//
// Tek <script src="/lib/cursor-glow.js"></script> ile eklenir.
// window.__cursorGlowMounted bayrağı çift mount'u engeller (animation.js ile
// aynı bayrağı paylaşır).
// =============================================================================
(function () {
  'use strict';
  if (window.__cursorGlowMounted) return;

  // Sayfa styles.css yüklemese bile çalışsın diye CSS'i kendimiz enjekte ederiz
  // (whatsapp-fab.js ile aynı desen). styles.css'teki .cursor-glow ile birebir aynı;
  // --gold-bright her sayfada tanımlı olmayabileceğinden renk burada sabit yazıldı.
  var CURSOR_CSS = [
    '.cursor-glow{position:fixed;top:0;left:0;width:40px;height:40px;border-radius:50%;',
    'pointer-events:none;z-index:100001;background:radial-gradient(circle,rgba(212,175,55,0.5) 0%,',
    'rgba(212,175,55,0.18) 35%,transparent 70%);mix-blend-mode:screen;filter:blur(4px);',
    'transform:translate(var(--x,-100px),var(--y,-100px)) scale(var(--scale,0.5));will-change:transform;',
    'transition:transform-origin 0.2s,background 0.25s ease;}',
    '.cursor-glow.cursor-glow--hover{--scale:1;background:radial-gradient(circle,rgba(212,175,55,0.6) 0%,',
    'rgba(212,175,55,0.25) 40%,transparent 75%);}',
    '.cursor-glow.cursor-glow--matrix{--scale:1;background:radial-gradient(circle,rgba(147,112,219,0.55) 0%,',
    'rgba(147,112,219,0.22) 40%,transparent 75%);}',
    '.cursor-trail-dot{position:fixed;top:0;left:0;width:5px;height:5px;border-radius:50%;background:#D4AF37;',
    'box-shadow:0 0 6px rgba(212,175,55,0.9),0 0 12px rgba(212,175,55,0.4);pointer-events:none;z-index:100000;',
    'will-change:transform,opacity;animation:cursorTrailFade 0.4s ease-out forwards;}',
    '@keyframes cursorTrailFade{0%{opacity:0.85;transform:translate(var(--tx),var(--ty)) scale(1);}',
    '100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0.25);}}',
    '@media (pointer:coarse){.cursor-glow,.cursor-trail-dot{display:none!important;}}',
    '@media (prefers-reduced-motion:reduce){.cursor-glow,.cursor-trail-dot{display:none!important;}}'
  ].join('');

  function injectStyles() {
    if (document.getElementById('cursorGlowStyles')) return;
    var st = document.createElement('style');
    st.id = 'cursorGlowStyles';
    st.textContent = CURSOR_CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  function init() {
    if (window.__cursorGlowMounted) return;
    // Dokunmatik / kaba işaretçi ve reduced-motion cihazlarda atla
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!document.body) return;
    window.__cursorGlowMounted = true;

    injectStyles();

    // Işıma takipçisi elementi
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var glowX = mouseX;
    var glowY = mouseY;
    var LERP = 0.18; // yumuşak ~100ms gecikmeli takip

    var lastTrailX = mouseX;
    var lastTrailY = mouseY;
    var TRAIL_DISTANCE = 22; // noktalar arası px

    var lastTargetCheck = 0;
    var TARGET_CHECK_MS = 60;

    function updateHoverState(target) {
      if (!target || !target.closest) return;
      // Matris düğümü — ametist tonu
      if (target.closest('.node-circle')) {
        glow.classList.add('cursor-glow--matrix');
        glow.classList.remove('cursor-glow--hover');
        return;
      }
      var interactive = target.closest(
        'button, a, input, textarea, select, ' +
        '.result-card, .city-option, ' +
        '[onclick], [role="button"]'
      );
      if (interactive) {
        glow.classList.add('cursor-glow--hover');
        glow.classList.remove('cursor-glow--matrix');
      } else {
        glow.classList.remove('cursor-glow--hover', 'cursor-glow--matrix');
      }
    }

    function spawnTrailDot(x, y) {
      var dot = document.createElement('span');
      dot.className = 'cursor-trail-dot';
      dot.style.setProperty('--tx', (x - 2.5) + 'px');
      dot.style.setProperty('--ty', (y - 2.5) + 'px');
      document.body.appendChild(dot);
      setTimeout(function () {
        if (dot.parentNode) dot.parentNode.removeChild(dot);
      }, 420);
    }

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      var dx = mouseX - lastTrailX;
      var dy = mouseY - lastTrailY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= TRAIL_DISTANCE) {
        spawnTrailDot(mouseX, mouseY);
        lastTrailX = mouseX;
        lastTrailY = mouseY;
      }
      var now = performance.now();
      if (now - lastTargetCheck > TARGET_CHECK_MS) {
        lastTargetCheck = now;
        updateHoverState(e.target);
      }
    }, { passive: true });

    // İmleç pencereden çıkınca ışımayı gizle
    document.addEventListener('mouseleave', function () { glow.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { glow.style.opacity = ''; });

    // rAF ile yumuşak lerp döngüsü
    function animate() {
      glowX += (mouseX - glowX) * LERP;
      glowY += (mouseY - glowY) * LERP;
      // 40px genişlik: merkez imleçte dursun diye yarısı kadar kaydır
      glow.style.setProperty('--x', (glowX - 20) + 'px');
      glow.style.setProperty('--y', (glowY - 20) + 'px');
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
