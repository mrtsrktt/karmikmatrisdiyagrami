// =============================================================================
// HERO MOTION — Sadece scroll-driven parallax (entrance animasyonu CSS'te)
// JS-based motion library import'u TAMAMEN KALDIRILDI — entrance pure CSS keyframes
// Network fetch yok, parse overhead yok, main thread blocking yok = stutter yok.
// =============================================================================

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setupScrollParallax();
}

// -----------------------------------------------------------------------------
// 2) Scroll-driven cross-fade — PURE SCROLL, no idle motion, no jitter
// -----------------------------------------------------------------------------
function setupScrollParallax() {
    const wrap = document.getElementById('heroScrollWrap');
    if (!wrap) return;

    // Entrance artık SAF CSS keyframe (motion.dev kaldırıldı). Scroll handler'ı
    // HEMEN bağla — kullanıcı animasyon bitmeden scroll yaparsa takılma/snap olmasın.
    // update() progress=0'da hero'ya dokunmaz; CSS girişi serbest oynar.
    initParallax();

    function initParallax() {
        const items = [
            { sel: '.hero-kicker',      maxY: -90,   minOpacity: 0, minScale: 0.75, maxBlur: 6 },
            { sel: '.hero-word-pre',    maxY: -160,  minOpacity: 0, minScale: 0.70, maxBlur: 8,  startOpacity: 0.92 },
            { sel: '.hero-word-script', maxY: -240,  minOpacity: 0, minScale: 0.65, maxBlur: 14 },
            { sel: '.hero-word-post',   maxY: -290,  minOpacity: 0, minScale: 0.70, maxBlur: 8,  startOpacity: 0.92 },
            { sel: '.hero-tagline',     maxY: -330,  minOpacity: 0, minScale: 0.78, maxBlur: 5,  startOpacity: 0.92 },
            { sel: '.hero-cta',         maxY: -380,  minOpacity: 0, minScale: 0.80, maxBlur: 4 }
        ];

        const elements = items
            .map(item => ({ ...item, el: document.querySelector(item.sel) }))
            .filter(item => item.el);

        const videoEl    = document.querySelector('.iri-bg-video');
        const finale1Bg  = document.getElementById('finale1Bg');
        const finale2Bg  = document.getElementById('finale2Bg');
        const finale1    = document.getElementById('finale1');
        const finale2    = document.getElementById('finale2');

        function smootherstep(x) { return x * x * x * (x * (x * 6 - 15) + 10); }
        function clamp01(x) { return Math.max(0, Math.min(1, x)); }

        // Bir noktada keyframe interpolation (titreme yok — sadece scroll'a bağlı)
        function interpKeyframes(progress, keyframes, prop) {
            for (let i = 0; i < keyframes.length - 1; i++) {
                const a = keyframes[i], b = keyframes[i + 1];
                if (progress >= a.p && progress <= b.p) {
                    const t = smootherstep((progress - a.p) / (b.p - a.p));
                    return a[prop] + (b[prop] - a[prop]) * t;
                }
            }
            return keyframes[keyframes.length - 1][prop];
        }

        // Video — hero süresince TAM STATIC, sonra clean fade
        // (önce küçük opacity değişimleri Lenis micro-scroll'unda titreme yaratıyordu)
        const videoStages = [
            { p: 0.00, op: 1.00, blur: 0 },
            { p: 0.30, op: 1.00, blur: 0 },  // hero boyunca sabit — sıfır titreme
            { p: 0.50, op: 0.20, blur: 4 },  // finale1 kararırken hızlı fade
            { p: 1.00, op: 0.00, blur: 6 }
        ];

        // Finale 1 bg — section 2'de görünür
        const finale1BgStages = [
            { p: 0.00, op: 0 },
            { p: 0.25, op: 0 },
            { p: 0.40, op: 0.92 },
            { p: 0.55, op: 0.92 },
            { p: 0.65, op: 0 },
            { p: 1.00, op: 0 }
        ];

        // Finale 2 bg — section 3'te görünür
        const finale2BgStages = [
            { p: 0.00, op: 0 },
            { p: 0.62, op: 0 },
            { p: 0.82, op: 0.92 },
            { p: 0.94, op: 0.92 },
            { p: 1.00, op: 0.75 }
        ];

        // Finale text pozu (scroll-bazlı, NO float)
        function finalePose(progress, enterStart, enterEnd, exitStart, exitEnd) {
            let op = 0, scale = 0.92, blur = 10, y = 24;
            if (progress >= enterStart && progress < enterEnd) {
                const e = smootherstep((progress - enterStart) / (enterEnd - enterStart));
                op = e;
                scale = 0.92 + 0.08 * e;
                blur = 10 * (1 - e);
                y = 24 * (1 - e);
            } else if (progress >= enterEnd && progress < exitStart) {
                op = 1; scale = 1; blur = 0; y = 0;
            } else if (progress >= exitStart && progress < exitEnd) {
                const e = smootherstep((progress - exitStart) / (exitEnd - exitStart));
                op = 1 - e;
                scale = 1 - 0.06 * e;
                blur = 10 * e;
                y = -24 * e;
            } else if (progress >= exitEnd) {
                op = 0; scale = 0.94; blur = 10; y = -24;
            }
            return { op, scale, blur, y };
        }

        function applyFinale(el, pose) {
            if (!el) return;
            el.style.setProperty('transform',
                `translate3d(0, ${pose.y.toFixed(1)}px, 0) scale(${pose.scale.toFixed(3)})`, 'important');
            el.style.setProperty('opacity', pose.op.toFixed(3), 'important');
            el.style.setProperty('filter', pose.blur > 0.3 ? `blur(${pose.blur.toFixed(1)}px)` : 'none', 'important');
        }

        let scheduled = false;

        function update() {
            scheduled = false;

            const r = wrap.getBoundingClientRect();
            const vh = window.innerHeight;
            const scrollable = wrap.offsetHeight - vh;
            const scrolled = -r.top;
            const progress = scrollable > 0 ? clamp01(scrolled / scrollable) : 0;

            // -------- Hero text exit (0 → 0.22) --------
            // progress=0'da (tepe) hero'ya DOKUNMA → CSS giriş animasyonu serbest oynar.
            // Kullanıcı scroll'a başlar başlamaz parallax devralır (takılma/snap yok).
            if (progress > 0.004) {
                const heroEased = smootherstep(Math.min(1, progress / 0.22));
                elements.forEach(item => {
                    const y = item.maxY * heroEased;
                    const startOp = item.startOpacity != null ? item.startOpacity : 1;
                    const opacity = startOp - (startOp - item.minOpacity) * heroEased;
                    const scale = 1 - (1 - (item.minScale != null ? item.minScale : 1)) * heroEased;
                    const blur = (item.maxBlur || 0) * heroEased;
                    item.el.style.setProperty('transform', `translate3d(0, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`, 'important');
                    item.el.style.setProperty('opacity', opacity.toFixed(3), 'important');
                    item.el.style.setProperty('filter', blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : 'none', 'important');
                });
            } else {
                elements.forEach(item => {
                    item.el.style.removeProperty('transform');
                    item.el.style.removeProperty('opacity');
                    item.el.style.removeProperty('filter');
                });
            }

            // -------- Video — pure fade + blur (scale SABİT, transform sabit) --------
            if (videoEl) {
                const vOp   = interpKeyframes(progress, videoStages, 'op');
                const vBlur = interpKeyframes(progress, videoStages, 'blur');
                // transform: SADECE Veo watermark crop için 2% X offset + sabit scale 1.08
                videoEl.style.setProperty('transform', 'translate3d(2%, 0, 0) scale(1.08)', 'important');
                videoEl.style.setProperty('opacity', vOp.toFixed(3), 'important');
                videoEl.style.setProperty('filter', vBlur > 0.3 ? `blur(${vBlur.toFixed(1)}px)` : 'none', 'important');
            }

            // -------- Finale backgrounds — pure opacity cross-fade --------
            if (finale1Bg) {
                const op = interpKeyframes(progress, finale1BgStages, 'op');
                finale1Bg.style.setProperty('opacity', op.toFixed(3), 'important');
            }
            if (finale2Bg) {
                const op = interpKeyframes(progress, finale2BgStages, 'op');
                finale2Bg.style.setProperty('opacity', op.toFixed(3), 'important');
            }

            // -------- Finale text — scroll-bazlı (no float) --------
            applyFinale(finale1, finalePose(progress, 0.22, 0.40, 0.52, 0.63));
            applyFinale(finale2, finalePose(progress, 0.65, 0.82, 0.92, 1.00));
        }

        function onScroll() {
            if (!scheduled) {
                scheduled = true;
                requestAnimationFrame(update);
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        update(); // initial
    }
}
