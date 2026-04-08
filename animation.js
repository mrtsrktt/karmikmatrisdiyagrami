// ============================================================
// ANIMATION.JS — Mistik Lüks Animasyon Sistemi (GSAP + Canvas)
// CLAUDE.md tasarım kılavuzuna uygun
// Hesaplama mantığına DOKUNMAZ, sadece görsel katman
// ============================================================

// --- Star Particle Canvas System ---
(function initStarCanvas() {
    const canvas = document.getElementById('starCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    let goldParticles = [];
    const STAR_COUNT = 180;
    const GOLD_PARTICLE_COUNT = 12;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create stars
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() < 0.85 ? 0.5 + Math.random() * 0.8 : 1 + Math.random() * 1.2,
            baseOpacity: 0.2 + Math.random() * 0.5,
            twinkleSpeed: 0.3 + Math.random() * 1.5,
            twinkleOffset: Math.random() * Math.PI * 2,
            // Slight color tint for some
            color: getStarColor()
        });
    }

    // Create floating gold particles
    for (let i = 0; i < GOLD_PARTICLE_COUNT; i++) {
        goldParticles.push({
            x: Math.random() * canvas.width,
            y: canvas.height + Math.random() * 200,
            r: 1 + Math.random() * 2,
            speed: 0.15 + Math.random() * 0.35,
            opacity: 0.15 + Math.random() * 0.35,
            drift: (Math.random() - 0.5) * 0.3,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 0.5
        });
    }

    function getStarColor() {
        const r = Math.random();
        if (r < 0.06) return 'rgba(212, 175, 55, 0.8)';       // gold
        if (r < 0.12) return 'rgba(199, 125, 186, 0.7)';       // pink-amethyst
        if (r < 0.16) return 'rgba(126, 184, 218, 0.6)';       // celestial
        if (r < 0.19) return 'rgba(212, 80, 122, 0.5)';        // rose-pink
        return 'rgba(245, 230, 233, 0.85)';                     // pink-cream
    }

    function animate(time) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw stars with twinkle
        stars.forEach(s => {
            const twinkle = Math.sin(time * 0.001 * s.twinkleSpeed + s.twinkleOffset);
            const opacity = s.baseOpacity + twinkle * 0.25;
            const scale = 1 + twinkle * 0.15;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * scale, 0, Math.PI * 2);
            ctx.fillStyle = s.color.replace(/[\d.]+\)$/, Math.max(0, opacity).toFixed(2) + ')');
            ctx.fill();
        });

        // Draw floating gold particles
        goldParticles.forEach(p => {
            p.y -= p.speed;
            p.x += p.drift;
            p.rotation += p.rotSpeed;

            // Reset when above screen
            if (p.y < -20) {
                p.y = canvas.height + 20;
                p.x = Math.random() * canvas.width;
            }

            const fadeZone = canvas.height * 0.2;
            let alpha = p.opacity;
            if (p.y < fadeZone) alpha *= p.y / fadeZone;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.beginPath();
            // Diamond shape
            ctx.moveTo(0, -p.r);
            ctx.lineTo(p.r * 0.6, 0);
            ctx.lineTo(0, p.r);
            ctx.lineTo(-p.r * 0.6, 0);
            ctx.closePath();
            ctx.fillStyle = `rgba(212, 175, 55, ${alpha.toFixed(2)})`;
            ctx.fill();
            ctx.restore();
        });

        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
})();


// --- Update starfield colors for new palette ---
(function updateStarfieldColors() {
    // Override the CSS star colors to match new palette
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        const r = Math.random();
        if (r < 0.06) star.style.background = 'rgba(212, 175, 55, 0.8)';
        else if (r < 0.12) star.style.background = 'rgba(199, 125, 186, 0.7)';
        else if (r < 0.16) star.style.background = 'rgba(126, 184, 218, 0.6)';
        else if (r < 0.19) star.style.background = 'rgba(212, 80, 122, 0.5)';
        else star.style.background = 'rgba(245, 230, 233, 0.85)';
    });
})();


// --- Wait for GSAP to load, then init ---
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure GSAP is loaded
    setTimeout(initGSAPAnimations, 100);
});

function initGSAPAnimations() {
    if (typeof gsap === 'undefined') {
        // Retry if GSAP not loaded yet (max ~3s)
        initGSAPAnimations._tries = (initGSAPAnimations._tries || 0) + 1;
        if (initGSAPAnimations._tries > 15) {
            // Give up — drop loader so user isn't stuck on a black screen
            document.body.classList.remove('is-loading');
            return;
        }
        setTimeout(initGSAPAnimations, 200);
        return;
    }

    // Register ScrollTrigger if available
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // ========================
    // 0. Mystic intro loader (gates everything else)
    // ========================
    runIntroLoader(function () {
        // ====================
        // 1. Page Load Ceremony
        // ====================
        pageLoadCeremony();

        // ====================
        // 2. Info cards scroll reveal
        // ====================
        initInfoCardAnimations();
    });
}


// --- 0. Mystic Intro Loader ---
function runIntroLoader(onDone) {
    // Build loader DOM
    const loader = document.createElement('div');
    loader.className = 'intro-loader';
    loader.setAttribute('aria-hidden', 'true');
    loader.innerHTML = `
        <div class="intro-symbol-wrap">
            <span class="intro-ring ring-1"></span>
            <span class="intro-ring ring-2"></span>
            <span class="intro-ring ring-3"></span>
            <div class="intro-symbol">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="introSymbolGrad" cx="50%" cy="40%" r="60%">
                            <stop offset="0%"  stop-color="#FFE9A8"/>
                            <stop offset="55%" stop-color="#D4AF37"/>
                            <stop offset="100%" stop-color="#8B7536"/>
                        </radialGradient>
                    </defs>
                    <!-- Outer 4-point sparkle -->
                    <path d="M50 2 L58 42 L98 50 L58 58 L50 98 L42 58 L2 50 L42 42 Z"
                          fill="url(#introSymbolGrad)"/>
                    <!-- Inner small sparkle -->
                    <path d="M50 28 L54 46 L72 50 L54 54 L50 72 L46 54 L28 50 L46 46 Z"
                          fill="rgba(255,255,255,0.55)"/>
                    <circle cx="50" cy="50" r="2" fill="rgba(10,6,18,0.6)"/>
                </svg>
            </div>
        </div>
        <div class="intro-text"></div>
        <div class="intro-tagline">
            <span class="intro-tagline-line"></span>
            <span class="intro-tagline-text">Astro\u015fu\u015fu Sistemi</span>
            <span class="intro-tagline-line"></span>
        </div>
    `;
    document.body.insertBefore(loader, document.body.firstChild);

    // Split title text into letter spans
    const textEl = loader.querySelector('.intro-text');
    const title = 'KARMIK MATRIS';
    title.split('').forEach(function (ch) {
        const s = document.createElement('span');
        s.className = 'intro-letter';
        s.textContent = ch === ' ' ? '\u00a0' : ch;
        textEl.appendChild(s);
    });

    const rings    = loader.querySelectorAll('.intro-ring');
    const symbol   = loader.querySelector('.intro-symbol');
    const letters  = loader.querySelectorAll('.intro-letter');
    const tagline  = loader.querySelector('.intro-tagline');

    let cleanedUp = false;
    function cleanup() {
        if (cleanedUp) return;
        cleanedUp = true;
        if (loader.parentNode) loader.parentNode.removeChild(loader);
        if (typeof onDone === 'function') onDone();
    }

    // Master timeline
    const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: cleanup
    });

    // Phase 1 — Rings expand from center (0.0 - 0.8)
    tl.to(rings, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out'
    }, 0);

    // Phase 2 — Symbol fades in, scales up, rotates into place (0.3 - 1.1)
    tl.to(symbol, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.9,
        ease: 'back.out(1.5)'
    }, 0.3);

    // Phase 3 — Solar plexus breath: rings pulse outward, repeat
    tl.to(rings, {
        scale: 1.12,
        duration: 1.4,
        repeat: 1,
        yoyo: true,
        stagger: { each: 0.08, from: 'center' },
        ease: 'sine.inOut'
    }, 1.0);

    // Symbol gentle pulse in sync
    tl.to(symbol, {
        scale: 1.08,
        duration: 1.4,
        repeat: 1,
        yoyo: true,
        ease: 'sine.inOut'
    }, 1.0);

    // Phase 4 — Title letters appear one by one (1.0 - 1.7)
    tl.to(letters, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.05,
        ease: 'power2.out'
    }, 1.0);

    // Phase 5 — Tagline rises in (1.6)
    tl.to(tagline, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out'
    }, 1.6);

    // Phase 6 — At t=2.5s, prepare hero state and reveal main page
    tl.add(function () {
        // Remove the body class so opacity:0 rule no longer applies
        document.body.classList.remove('is-loading');
    }, 2.5);

    // Slide loader up & fade out (2.5 - 3.3)
    tl.to(loader, {
        yPercent: -100,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.inOut'
    }, 2.5);

    // Fade in main page content during the slide
    tl.fromTo('body > *:not(.intro-loader)',
        { opacity: 0 },
        { opacity: 1, duration: 0.7, ease: 'power2.out' },
        2.55
    );
}


// --- 1. Page Load Ceremony: Letter-by-letter title reveal ---
function pageLoadCeremony() {
    const h1 = document.querySelector('.header h1');
    const subtitle = document.querySelector('.header .subtitle');
    const mandala = document.querySelector('.mandala');
    const symbols = document.querySelectorAll('.floating-symbols .sym');
    const eyebrow = document.querySelector('.hero-eyebrow');
    const ornaments = document.querySelectorAll('.hero-ornament');
    const divider = document.querySelector('.hero-divider');
    const sparkles = document.querySelectorAll('.hero-sparkles .sparkle');

    if (!h1) return;

    // Split title into individual characters wrapped in spans
    const text = h1.textContent;
    h1.innerHTML = '';
    h1.style.opacity = '1';

    // Create span for each character
    const chars = [];
    for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.textContent = text[i];
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(30px) rotateX(90deg)';
        if (text[i] === ' ') span.innerHTML = '&nbsp;';
        h1.appendChild(span);
        chars.push(span);
    }

    // GSAP Timeline
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Mandala fade in with rotation
    if (mandala) {
        tl.fromTo(mandala,
            { opacity: 0, scale: 0.6 },
            { opacity: 0.03, scale: 1, duration: 2 },
            0
        );
    }

    // Eyebrow badge drops in first
    if (eyebrow) {
        tl.to(eyebrow, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out'
        }, 0.15);
    }

    // Ornament lines stretch outward from center
    if (ornaments.length > 0) {
        tl.to(ornaments, {
            opacity: 1,
            scaleX: 1,
            duration: 1,
            ease: 'expo.out'
        }, 0.45);
    }

    // Letters appear one by one
    tl.to(chars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'back.out(1.2)'
    }, 0.6);

    // Subtitle rises in
    if (subtitle) {
        subtitle.style.opacity = '0';
        subtitle.style.animation = 'none';
        tl.to(subtitle, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out'
        }, 1.4);
    }

    // Decorative diamond divider
    if (divider) {
        tl.to(divider, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power2.out'
        }, 1.7);
    }

    // Sparkles fade in
    if (sparkles.length > 0) {
        tl.fromTo(sparkles,
            { opacity: 0, scale: 0 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                stagger: 0.08,
                ease: 'back.out(2)'
            },
            1.9
        );
    }

    // Floating symbols fade in with stagger
    if (symbols.length > 0) {
        tl.fromTo(symbols,
            { opacity: 0, scale: 0.5 },
            {
                opacity: 0.08,
                scale: 1,
                duration: 1.5,
                stagger: 0.2,
                ease: 'power2.out'
            },
            1.5
        );
    }
}


// --- 2. Info card scroll animations with GSAP ---
function initInfoCardAnimations() {
    if (typeof ScrollTrigger === 'undefined') return;

    const infoCards = document.querySelectorAll('.info-card[data-animate]');
    infoCards.forEach((card, i) => {
        gsap.fromTo(card,
            { opacity: 0, y: 40, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                delay: i * 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    once: true
                },
                onComplete: () => card.classList.add('visible')
            }
        );
    });
}


// --- 3. Form Submit Ritual Animation ---
// Wrap the existing calculateAll() with a ritual overlay
// We monkey-patch calculateAll to add the ritual before it runs
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof window.calculateAll !== 'function') return;

        const originalCalculateAll = window.calculateAll;

        window.calculateAll = function() {
            // Validate inputs first (minimal check)
            const dateInput = document.getElementById('birthDate');
            const dateVal = dateInput ? dateInput.value.trim() : '';
            const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
            if (!dateRegex.test(dateVal)) {
                if (dateInput) dateInput.classList.add('error');
                return;
            }

            // Start ritual animation, then run original
            startFormRitual(function() {
                originalCalculateAll();
            });
        };
    });
})();


function startFormRitual(callback) {
    // Safety: ensure callback fires exactly once
    let callbackFired = false;
    function safeCallback() {
        if (callbackFired) return;
        callbackFired = true;
        callback();
    }

    // Create ritual overlay
    const overlay = document.createElement('div');
    overlay.id = 'ritualOverlay';
    overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(5, 3, 8, 0);
        display: flex; align-items: center; justify-content: center;
        pointer-events: none;
    `;

    // Gold circle container
    const circleContainer = document.createElement('div');
    circleContainer.style.cssText = `
        width: 120px; height: 120px; position: relative;
        opacity: 0; transform: scale(0);
    `;

    // Gold ring SVG
    circleContainer.innerHTML = `
        <svg viewBox="0 0 120 120" width="120" height="120" style="position:absolute;inset:0;">
            <circle cx="60" cy="60" r="55" fill="none" stroke="#D4AF37" stroke-width="1.5" opacity="0.6"
                style="stroke-dasharray:345;stroke-dashoffset:345;" id="ritualRing"/>
            <circle cx="60" cy="60" r="45" fill="none" stroke="#8B7536" stroke-width="0.8" opacity="0.4"
                style="stroke-dasharray:283;stroke-dashoffset:283;" id="ritualRingInner"/>
        </svg>
        <div id="ritualSymbols" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 60 60" width="36" height="36" style="opacity:0;" id="ritualCenterSymbol">
                <polygon points="30,4 36,22 56,22 40,32 46,50 30,40 14,50 20,32 4,22 24,22"
                    fill="none" stroke="#D4AF37" stroke-width="1"/>
            </svg>
        </div>
    `;

    overlay.appendChild(circleContainer);
    document.body.appendChild(overlay);

    // Only run GSAP if available
    if (typeof gsap === 'undefined') {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        safeCallback();
        return;
    }

    // Safety timeout: if ritual takes too long, force callback
    const safetyTimer = setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        safeCallback();
    }, 4000);

    // Get element references directly (more reliable than string selectors for SVG)
    const ringEl = overlay.querySelector('#ritualRing');
    const ringInnerEl = overlay.querySelector('#ritualRingInner');
    const centerSymbolEl = overlay.querySelector('#ritualCenterSymbol');

    function cleanup() {
        clearTimeout(safetyTimer);
        gsap.to(overlay, {
            background: 'rgba(212, 175, 55, 0.08)',
            duration: 0.2,
            onComplete: () => {
                gsap.to(overlay, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                        safeCallback();
                    }
                });
            }
        });
    }

    const tl = gsap.timeline({ onComplete: cleanup });

    // Phase 1: Darken background
    tl.to(overlay, {
        background: 'rgba(5, 3, 8, 0.7)',
        duration: 0.4,
        ease: 'power2.in'
    }, 0);

    // Phase 2: Circle appears
    tl.to(circleContainer, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: 'back.out(1.5)'
    }, 0.3);

    // Phase 2b: Ring draws (use CSS strokeDashoffset via element refs)
    if (ringEl) {
        tl.to(ringEl, {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power2.inOut'
        }, 0.5);
    }

    if (ringInnerEl) {
        tl.to(ringInnerEl, {
            strokeDashoffset: 0,
            duration: 1,
            ease: 'power2.inOut'
        }, 0.7);
    }

    // Phase 3: Center symbol appears + rotates
    if (centerSymbolEl) {
        tl.to(centerSymbolEl, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out'
        }, 1.0);

        tl.to(centerSymbolEl, {
            rotation: 360,
            duration: 1.2,
            ease: 'power1.inOut'
        }, 1.0);
    }

    // Phase 4: Everything pulses and vanishes
    tl.to(circleContainer, {
        scale: 1.5,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in'
    }, 2.2);
}


// --- 4. Enhanced result card animations ---
// Override the default scroll animation for result cards to use GSAP
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Observe when results section becomes visible
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'style') {
                    const display = resultsSection.style.display;
                    if (display === 'block' || display === '') {
                        setTimeout(animateResultCards, 300);
                    }
                }
            });
        });
        observer.observe(resultsSection, { attributes: true });
    });
})();

function animateResultCards() {
    if (typeof gsap === 'undefined') return;

    const cards = document.querySelectorAll('.result-card[data-animate]');
    if (cards.length === 0) return;

    // Check if already animated
    const firstCard = cards[0];
    if (firstCard.classList.contains('visible')) return;

    gsap.fromTo(cards,
        { opacity: 0, y: 24, scale: 0.95 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: 'back.out(1.2)',
            onComplete: function() {
                cards.forEach(card => card.classList.add('visible'));
            }
        }
    );

    // Animate counter numbers
    cards.forEach((card, i) => {
        const numEl = card.querySelector('.card-num[data-count]');
        if (numEl) {
            setTimeout(() => {
                const target = parseInt(numEl.getAttribute('data-count'));
                gsap.to({ val: 0 }, {
                    val: target,
                    duration: 0.8,
                    delay: 0,
                    ease: 'power2.out',
                    onUpdate: function() {
                        numEl.textContent = Math.round(this.targets()[0].val);
                    }
                });
            }, i * 80 + 200);
        }
    });
}


// --- 5. Hover micro-interactions enhancement ---
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Add magnetic hover effect to CTA button
        const calcBtn = document.getElementById('calcBtn');
        if (calcBtn && typeof gsap !== 'undefined') {
            calcBtn.addEventListener('mouseenter', () => {
                gsap.to(calcBtn, {
                    scale: 1.03,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
            calcBtn.addEventListener('mouseleave', () => {
                gsap.to(calcBtn, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        }
    });
})();
