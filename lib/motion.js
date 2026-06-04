// =============================================================================
// MOTION — Mouse Sparkles (Lucide Sparkle SVG trail + glow points) + Lenis
// React kodu vanilla'ya çevrildi (orijinal: shadcn/lucide demo)
// =============================================================================

const SPARKLES_CONFIG = {
    starAnimationDuration: 2400,     // uzun ve nazik düşüş
    minimumTimeBetweenStars: 180,    // daha sık spawn (420 → 180)
    minimumDistanceBetweenStars: 50, // daha sık spawn (130 → 50)
    glowDuration: 0,                  // 0 = glow trail KAPALI (beyaz çizgi yok)
    maximumGlowPointSpacing: 999,
    // Pembe + beyaz + altın — 3 renk rotasyonu için zengin palet
    colors: ['249 146 253', '252 254 255', '212 169 97'],
    // Daha büyük sparkle'lar (1.8 / 1.3 / 0.9 rem)
    sizes: ['1.8rem', '1.3rem', '0.9rem'],
    animations: ['fall-1', 'fall-2', 'fall-3']
};

// Lucide Sparkle SVG (4-uçlu yıldız)
const SPARKLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>`;

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function selectRandom(items) {
    return items[rand(0, items.length - 1)];
}
function calcDistance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// ----------------------------------------------------------------------------
// 1) Mouse Sparkles trail
// ----------------------------------------------------------------------------
function initSparkles() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cfg = SPARKLES_CONFIG;
    const last = {
        starTimestamp: Date.now(),
        starPosition: { x: 0, y: 0 },
        mousePosition: { x: 0, y: 0 }
    };
    let count = 0;

    function createStar(position) {
        const wrapper = document.createElement('div');
        const color = selectRandom(cfg.colors);
        const size = selectRandom(cfg.sizes);

        wrapper.className = 'mouse-sparkles-star';
        wrapper.style.left = position.x + 'px';
        wrapper.style.top = position.y + 'px';
        wrapper.style.fontSize = size;
        wrapper.style.color = `rgb(${color})`;
        wrapper.style.textShadow = `0px 0px 1.5rem rgb(${color} / 0.5)`;
        wrapper.style.animationName = cfg.animations[count++ % 3];
        wrapper.style.animationDuration = cfg.starAnimationDuration + 'ms';
        wrapper.innerHTML = SPARKLE_SVG;

        document.body.appendChild(wrapper);
        setTimeout(() => {
            if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
        }, cfg.starAnimationDuration);
    }

    function createGlowPoint(position) {
        const glow = document.createElement('div');
        glow.className = 'mouse-sparkles-glow-point';
        glow.style.left = position.x + 'px';
        glow.style.top = position.y + 'px';
        document.body.appendChild(glow);
        setTimeout(() => {
            if (glow.parentNode) glow.parentNode.removeChild(glow);
        }, cfg.glowDuration);
    }

    function createGlow(from, to) {
        const distance = calcDistance(from, to);
        const quantity = Math.max(Math.floor(distance / cfg.maximumGlowPointSpacing), 1);
        const dx = (to.x - from.x) / quantity;
        const dy = (to.y - from.y) / quantity;
        for (let i = 0; i < quantity; i++) {
            createGlowPoint({ x: from.x + dx * i, y: from.y + dy * i });
        }
    }

    function handleMove(e) {
        const mousePosition = { x: e.clientX, y: e.clientY };

        if (last.mousePosition.x === 0 && last.mousePosition.y === 0) {
            last.mousePosition = mousePosition;
        }

        const now = Date.now();
        const hasMovedFarEnough =
            calcDistance(last.starPosition, mousePosition) >= cfg.minimumDistanceBetweenStars;
        const hasBeenLongEnough = now - last.starTimestamp > cfg.minimumTimeBetweenStars;

        if (hasMovedFarEnough || hasBeenLongEnough) {
            createStar(mousePosition);
            last.starTimestamp = now;
            last.starPosition = mousePosition;
        }

        // Glow trail kapalı (beyaz çizgi sert oluyordu). Sadece sparkle'lar.
        if (cfg.glowDuration > 0) createGlow(last.mousePosition, mousePosition);
        last.mousePosition = mousePosition;
    }

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchmove', (e) => {
        if (e.touches[0]) handleMove(e.touches[0]);
    }, { passive: true });
    document.body.addEventListener('mouseleave', () => {
        last.mousePosition = { x: 0, y: 0 };
    });
}

// ----------------------------------------------------------------------------
// 2) Smooth scroll — Lenis
// ----------------------------------------------------------------------------
async function initSmoothScroll() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try {
        const mod = await import('https://cdn.jsdelivr.net/npm/lenis@1.1.20/+esm');
        const Lenis = mod.default || mod.Lenis;
        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.5,
            lerp: 0.1
        });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        window.__lenis = lenis;
    } catch (e) {
        console.warn('[motion] Lenis yüklenemedi', e);
    }
}

// ----------------------------------------------------------------------------
// Boot — Lenis ve Sparkles HERO ENTRANCE bitene kadar BAŞLAMAZ
// Aksi halde rAF loop ve mousemove handler entrance ile GPU/CPU rekabet ederdi.
// CSS keyframes ~2.1s'de biter → 2.3s sonra Lenis + sparkles devreye girer.
// ----------------------------------------------------------------------------
function boot() {
    // Entrance animasyonları çakışmasın — sparkles + lenis 2.3s sonra başlar
    setTimeout(() => {
        initSparkles();
        initSmoothScroll();
    }, 2300);
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
