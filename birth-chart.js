// ============================================================
// NATAL DOGUM HARITASI — Profesyonel SVG Zodyak Carki
// Mistik Luks tasarim, SVG path glyphler, derece olcegi
// CLAUDE.md tasarim kilavuzuna uygun
// ============================================================

// --- Element Colors (Mistik Luks palette — boosted for visibility) ---
const ELEMENT_COLORS = {
    Ates:   { bg: 'rgba(232,112,138,0.18)', stroke: 'rgba(255,143,163,0.55)', text: '#FF8FA3' },
    Toprak: { bg: 'rgba(212,175,55,0.18)',  stroke: 'rgba(240,199,87,0.60)',  text: '#F0C757' },
    Hava:   { bg: 'rgba(140,203,232,0.18)', stroke: 'rgba(168,223,255,0.55)', text: '#A8DFFF' },
    Su:     { bg: 'rgba(208,154,232,0.18)', stroke: 'rgba(231,170,255,0.55)', text: '#E7AAFF' }
};

// Turkish element name normalization (handle both accented and unaccented)
function getElementColor(element) {
    if (ELEMENT_COLORS[element]) return ELEMENT_COLORS[element];
    // Handle Turkish characters
    const map = {
        'Ate\u015f': ELEMENT_COLORS['Ates'],
        'Ate\u015F': ELEMENT_COLORS['Ates'],
        'Ateş': ELEMENT_COLORS['Ates'],
        'Ates': ELEMENT_COLORS['Ates'],
        'Toprak': ELEMENT_COLORS['Toprak'],
        'Hava': ELEMENT_COLORS['Hava'],
        'Su': ELEMENT_COLORS['Su']
    };
    return map[element] || ELEMENT_COLORS['Toprak'];
}

const PLANET_NAMES_TR = {
    gunes: 'G\u00fcne\u015f', ay: 'Ay', merkur: 'Merk\u00fcr',
    venus: 'Ven\u00fcs', mars: 'Mars', jupiter: 'J\u00fcpiter', saturn: 'Sat\u00fcrn'
};

// ---- Astroloji Unicode sembol render desteği ----
// Profesyonel astroloji yazılımları Unicode glyph kullanır (♈♉♊… ☉☽☿…)
// Font fallback chain — sistemde en iyi astroloji glyph desteği olan font'u seç
const ASTRO_FONT_STACK = '"Segoe UI Symbol", "Noto Sans Symbols 2", "Symbola", "Apple Symbols", "DejaVu Sans", Georgia, serif';

// Roma rakamları (klasik astroloji konvansiyonu — 12 ev için)
const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];


// ---- SVG Helper Functions ----
function createSVG(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
}

function polarToXY(cx, cy, r, deg) {
    const rad = deg * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function zodiacToSVGAngle(lon, asc) {
    return 180 - (lon - asc);
}

function lineDist(x1, y1, x2, y2) {
    return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
}


// ---- Glyph Drawing Functions — Unicode tabanlı (profesyonel astroloji konvansiyonu) ----
function drawZodiacGlyph(svg, signIndex, cx, cy, size, color, delay) {
    const sign = (typeof ZODIAC_SIGNS !== 'undefined') ? ZODIAC_SIGNS[signIndex] : null;
    if (!sign || !sign.symbol) return null;
    const t = createSVG('text', {
        x: cx, y: cy,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        'font-size': size * 1.7,
        'font-family': ASTRO_FONT_STACK,
        fill: color,
        stroke: color,
        'stroke-width': '0.3',
        'paint-order': 'stroke fill'
    });
    t.textContent = sign.symbol;
    t.style.opacity = '0';
    t.style.animation = `fadeIn 900ms cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms forwards`;
    svg.appendChild(t);
    return t;
}

function drawPlanetGlyph(svg, planetKey, cx, cy, size, color, delay) {
    const symbol = (typeof PLANET_SYMBOLS !== 'undefined') ? PLANET_SYMBOLS[planetKey] : null;
    if (!symbol) return null;
    const t = createSVG('text', {
        x: cx, y: cy,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        'font-size': size * 1.6,
        'font-family': ASTRO_FONT_STACK,
        fill: color,
        stroke: color,
        'stroke-width': '0.4',
        'paint-order': 'stroke fill',
        filter: 'url(#sglow)'
    });
    t.textContent = symbol;
    t.style.opacity = '0';
    t.style.animation = `fadeIn 900ms cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms forwards`;
    svg.appendChild(t);
    return t;
}


// ================================================================
// MAIN RENDER
// ================================================================
function renderBirthChart(chartData, svgId) {
    const svg = document.getElementById(svgId);
    svg.innerHTML = '';

    const cx = 350, cy = 350;
    const outerR = 305, signR = 270, midR = 240, innerR = 180, aspectR = 165;

    // --- Defs: filters + gradients ---
    const defs = createSVG('defs', {});
    defs.innerHTML = `
        <filter id="pglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="sglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <radialGradient id="chartBg" cx="50%" cy="50%" r="55%">
            <stop offset="0%"   stop-color="#2a0f3d" stop-opacity="0.95"/>
            <stop offset="55%"  stop-color="#1a0828" stop-opacity="0.97"/>
            <stop offset="100%" stop-color="#0a0414" stop-opacity="0.98"/>
        </radialGradient>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stop-color="rgba(212,175,55,0.20)"/>
            <stop offset="60%"  stop-color="rgba(212,175,55,0.05)"/>
            <stop offset="100%" stop-color="rgba(212,175,55,0)"/>
        </radialGradient>
    `;
    svg.appendChild(defs);

    // --- Deep mystical background (radial: derin merkez → çok derin kenar) ---
    svg.appendChild(createSVG('circle', { cx, cy, r: outerR + 8, fill: 'url(#chartBg)', stroke: 'none' }));
    // Hafif merkez altın halo — derinlik
    svg.appendChild(createSVG('circle', { cx, cy, r: innerR - 10, fill: 'url(#centerGlow)', stroke: 'none' }));

    // 1. Sign segments (element-renkli halkalar — daha belirgin)
    drawSignSegments(svg, cx, cy, outerR, signR, chartData.ascendant);

    // 2. Ana yapısal halkalar — KALIN ve PARLAK altın + glow filter
    addCircle(svg, cx, cy, outerR, 'rgba(240,199,87,0.85)', 1.6, 0, 3200, 'goldGlow');
    addCircle(svg, cx, cy, signR,  'rgba(240,199,87,0.45)', 0.9, 250, 2800);
    addCircle(svg, cx, cy, midR,   'rgba(245,230,233,0.32)', 0.7, 500, 2400);
    addCircle(svg, cx, cy, innerR, 'rgba(245,230,233,0.28)', 0.7, 750, 2000);

    // 3. Degree tick marks on outer ring
    drawTickMarks(svg, cx, cy, outerR, signR, chartData.ascendant);

    // 4. Sign division lines
    drawSignDivisions(svg, cx, cy, outerR, signR, chartData.ascendant);

    // 5. Zodiac sign glyphs (SVG paths)
    drawSignGlyphs(svg, cx, cy, outerR, signR, chartData.ascendant);

    // 6. House cusps
    drawHouseCusps(svg, cx, cy, midR, innerR, chartData.houses, chartData.ascendant);

    // 7. House numbers
    drawHouseNumbers(svg, cx, cy, midR, innerR, chartData.houses, chartData.ascendant);

    // 8. Aspect lines (very subtle)
    drawAspectLines(svg, cx, cy, aspectR, chartData.aspects, chartData.planets, chartData.ascendant);

    // 9. Planets with degree annotations
    drawPlanets(svg, cx, cy, midR, innerR, chartData.planets, chartData.ascendant);

    // 10. Cardinal labels (ASC, DSC, MC, IC) inside the chart
    drawCardinalLabels(svg, cx, cy, innerR, outerR, chartData.ascendant, chartData.houses);

    // 11. Center decorative dot
    const centerDot = createSVG('circle', { cx, cy, r: 2.5, fill: 'rgba(212,175,55,0.18)' });
    centerDot.style.opacity = '0';
    centerDot.style.animation = 'fadeIn 1s ease 3000ms forwards';
    svg.appendChild(centerDot);

    // Show download button after animation
    setTimeout(() => {
        const btn = document.getElementById('downloadChartBtn');
        if (btn) {
            btn.style.display = 'inline-block';
            btn.style.opacity = '0';
            btn.style.animation = 'fadeIn 0.8s ease forwards';
        }
    }, 5000);
}


// ---- Animated Circle (stroke-dasharray draw) — premium cubic-bezier ease ----
function addCircle(svg, cx, cy, r, stroke, width, delay, dur, filterId) {
    const attrs = { cx, cy, r, fill: 'none', stroke, 'stroke-width': width };
    if (filterId) attrs.filter = `url(#${filterId})`;
    const c = createSVG('circle', attrs);
    const circumf = 2 * Math.PI * r;
    c.style.strokeDasharray = circumf;
    c.style.strokeDashoffset = circumf;
    c.style.animation = `ringDraw ${dur}ms cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms forwards`;
    svg.appendChild(c);
}


// ---- Sign Segments (subtle element-colored arcs) ----
function drawSignSegments(svg, cx, cy, outerR, innerR, asc) {
    for (let i = 0; i < 12; i++) {
        const sign = ZODIAC_SIGNS[i];
        const color = getElementColor(sign.element);
        const s1 = zodiacToSVGAngle(i * 30, asc);
        const s2 = zodiacToSVGAngle((i + 1) * 30, asc);
        const p1 = polarToXY(cx, cy, outerR, s1);
        const p2 = polarToXY(cx, cy, outerR, s2);
        const p3 = polarToXY(cx, cy, innerR, s2);
        const p4 = polarToXY(cx, cy, innerR, s1);
        const d = `M${p1.x},${p1.y} A${outerR},${outerR} 0 0 0 ${p2.x},${p2.y} L${p3.x},${p3.y} A${innerR},${innerR} 0 0 1 ${p4.x},${p4.y}Z`;
        const seg = createSVG('path', { d, fill: color.bg, stroke: 'none' });
        seg.style.opacity = '0';
        seg.style.animation = `fadeIn 1.4s cubic-bezier(0.22, 0.61, 0.36, 1) ${500 + i * 130}ms forwards`;
        svg.appendChild(seg);
    }
}


// ---- Tick Marks (5-degree intervals) — parlak ve net ----
function drawTickMarks(svg, cx, cy, outerR, innerR, asc) {
    const g = createSVG('g', {});
    g.style.opacity = '0';
    g.style.animation = 'fadeIn 1.8s cubic-bezier(0.22, 0.61, 0.36, 1) 3400ms forwards';
    for (let deg = 0; deg < 360; deg += 5) {
        const angle = zodiacToSVGAngle(deg, asc);
        const isMajor = deg % 30 === 0;
        const isMinor10 = deg % 10 === 0;
        if (isMajor) continue;
        const len = isMinor10 ? 9 : 5;
        const w  = isMinor10 ? 0.9 : 0.55;
        const op = isMinor10 ? 0.65 : 0.40;
        const p1 = polarToXY(cx, cy, outerR, angle);
        const p2 = polarToXY(cx, cy, outerR - len, angle);
        g.appendChild(createSVG('line', {
            x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
            stroke: `rgba(240,199,87,${op})`, 'stroke-width': w
        }));
    }
    svg.appendChild(g);
}


// ---- Sign Division Lines — kalın altın ----
function drawSignDivisions(svg, cx, cy, outerR, innerR, asc) {
    for (let i = 0; i < 12; i++) {
        const angle = zodiacToSVGAngle(i * 30, asc);
        const p1 = polarToXY(cx, cy, outerR, angle);
        const p2 = polarToXY(cx, cy, innerR, angle);
        const line = createSVG('line', {
            x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
            stroke: 'rgba(240,199,87,0.60)', 'stroke-width': '1.1'
        });
        const len = lineDist(p1.x, p1.y, p2.x, p2.y);
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
        line.style.animation = `ringDraw 900ms cubic-bezier(0.22, 0.61, 0.36, 1) ${900 + i * 180}ms forwards`;
        svg.appendChild(line);
    }
}


// ---- Zodiac Sign Glyphs (SVG path-based) ----
function drawSignGlyphs(svg, cx, cy, outerR, innerR, asc) {
    const labelR = (outerR + innerR) / 2;
    for (let i = 0; i < 12; i++) {
        const sign = ZODIAC_SIGNS[i];
        const color = getElementColor(sign.element);
        const midAngle = zodiacToSVGAngle(i * 30 + 15, asc);
        const pos = polarToXY(cx, cy, labelR, midAngle);
        const delay = 1800 + i * 130;
        // size 18: daha büyük + Unicode sembol → çok daha okunur
        drawZodiacGlyph(svg, i, pos.x, pos.y, 18, color.text, delay);
    }
}


// ---- House Cusps ----
function drawHouseCusps(svg, cx, cy, outerR, innerR, houses, asc) {
    for (let i = 0; i < 12; i++) {
        const angle = zodiacToSVGAngle(houses[i], asc);
        const isCardinal = (i === 0 || i === 3 || i === 6 || i === 9);
        const p1 = polarToXY(cx, cy, isCardinal ? outerR + 6 : outerR, angle);
        const p2 = polarToXY(cx, cy, innerR, angle);
        const line = createSVG('line', {
            x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
            stroke: isCardinal ? 'rgba(212,175,55,0.40)' : 'rgba(245,230,233,0.12)',
            'stroke-width': isCardinal ? '1' : '0.4'
        });
        const len = lineDist(p1.x, p1.y, p2.x, p2.y);
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
        line.style.animation = `ringDraw 500ms ease ${2000 + i * 80}ms forwards`;
        svg.appendChild(line);
    }
}


// ---- House Numbers — Roma rakamları, klasik astroloji kitap görünümü ----
function drawHouseNumbers(svg, cx, cy, outerR, innerR, houses, asc) {
    for (let i = 0; i < 12; i++) {
        const next = houses[(i + 1) % 12];
        let mid = (houses[i] + next) / 2;
        if (Math.abs(houses[i] - next) > 180) mid += 180;
        const angle = zodiacToSVGAngle(mid, asc);
        const pos = polarToXY(cx, cy, (outerR + innerR) / 2, angle);
        const label = createSVG('text', {
            x: pos.x, y: pos.y + 3,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            fill: 'rgba(245,230,233,0.55)', 'font-size': '12',
            'font-family': "'IM Fell English', Georgia, serif",
            'font-style': 'italic',
            'font-weight': '400',
            'letter-spacing': '0.5'
        });
        label.textContent = ROMAN_NUMERALS[i];
        label.style.opacity = '0';
        label.style.animation = `fadeIn 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) ${3000 + i * 80}ms forwards`;
        svg.appendChild(label);
    }
}


// ---- Aspect Lines ----
function drawAspectLines(svg, cx, cy, r, aspects, planets, asc) {
    if (!aspects || aspects.length === 0) return;
    aspects.forEach((asp, idx) => {
        const a1 = zodiacToSVGAngle(planets[asp.planet1], asc);
        const a2 = zodiacToSVGAngle(planets[asp.planet2], asc);
        const p1 = polarToXY(cx, cy, r, a1);
        const p2 = polarToXY(cx, cy, r, a2);
        const isHard = (asp.angle === 90 || asp.angle === 180);
        const isSoft = (asp.angle === 60 || asp.angle === 120);
        // Color based on aspect type
        let strokeColor;
        if (isHard) strokeColor = 'rgba(232,112,138,0.25)';     // rose-pink for tension
        else if (isSoft) strokeColor = 'rgba(140,203,232,0.25)'; // celestial for harmony
        else strokeColor = 'rgba(208,154,232,0.20)';             // lavender for others
        const line = createSVG('line', {
            x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
            stroke: strokeColor,
            'stroke-width': '0.4',
            'stroke-dasharray': isHard ? '3,3' : (isSoft ? '6,2' : 'none')
        });
        line.style.opacity = '0';
        line.style.animation = `fadeIn 0.5s ease ${4000 + idx * 60}ms forwards`;
        svg.appendChild(line);
    });
}


// ---- Planet Placement (SVG path glyphs + degree annotations) ----
function drawPlanets(svg, cx, cy, outerR, innerR, planets, asc) {
    const planetR = (outerR + innerR) / 2;
    const degR = outerR + 10;

    // Sort and spread for collision avoidance
    const list = Object.entries(planets).map(([key, lon]) => ({ key, lon, dLon: lon }));
    list.sort((a, b) => a.lon - b.lon);
    const minGap = 14;
    for (let pass = 0; pass < 4; pass++) {
        for (let i = 1; i < list.length; i++) {
            let diff = list[i].dLon - list[i - 1].dLon;
            if (diff < 0) diff += 360;
            if (diff < minGap) {
                list[i].dLon = list[i - 1].dLon + minGap;
                if (list[i].dLon >= 360) list[i].dLon -= 360;
            }
        }
    }

    list.forEach((planet, idx) => {
        const angle = zodiacToSVGAngle(planet.dLon, asc);
        const pos = polarToXY(cx, cy, planetR, angle);
        const sign = getZodiacSign(planet.lon);
        const color = getElementColor(sign.element);
        const delay = 3000 + idx * 180;

        // Connecting line from true to displayed position if spread
        const innerAngle = zodiacToSVGAngle(planet.lon, asc);
        if (Math.abs(planet.dLon - planet.lon) > 1) {
            const truePos = polarToXY(cx, cy, planetR - 14, innerAngle);
            const cl = createSVG('line', {
                x1: truePos.x, y1: truePos.y, x2: pos.x, y2: pos.y,
                stroke: 'rgba(245,230,233,0.14)', 'stroke-width': '0.3'
            });
            cl.style.opacity = '0';
            cl.style.animation = `fadeIn 0.4s ease ${delay}ms forwards`;
            svg.appendChild(cl);
        }

        // Subtle glow behind planet \u2014 daha b\u00fcy\u00fck, daha parlak
        const glow = createSVG('circle', {
            cx: pos.x, cy: pos.y, r: 14,
            fill: color.stroke, opacity: '0', filter: 'url(#pglow)'
        });
        glow.style.animation = `fadeIn 1.1s cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms forwards`;
        glow.addEventListener('animationend', () => { glow.setAttribute('opacity', '0.32'); });
        svg.appendChild(glow);

        // Planet glyph \u2014 Unicode sembol (\u2609\u263d\u263f\u2640\u2642\u2643\u2644), b\u00fcy\u00fck ve net
        drawPlanetGlyph(svg, planet.key, pos.x, pos.y, 16, color.text, delay + 120);

        // Degree annotation \u2014 okunabilir boyut
        const deg = getSignDegree(planet.lon);
        const degAngle = zodiacToSVGAngle(planet.dLon, asc);
        const degPos = polarToXY(cx, cy, degR, degAngle);
        const degText = createSVG('text', {
            x: degPos.x, y: degPos.y + 2,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            fill: 'rgba(245,230,233,0.72)', 'font-size': '9.5',
            'font-family': "'IM Fell English', Georgia, serif",
            'font-style': 'italic',
            'letter-spacing': '0.3'
        });
        degText.textContent = `${Math.floor(deg)}\u00b0${Math.floor((deg % 1) * 60)}'`;
        degText.style.opacity = '0';
        degText.style.animation = `fadeIn 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) ${delay + 250}ms forwards`;
        svg.appendChild(degText);
    });
}


// ---- Cardinal Labels — Türkçe anlamlı, 2 satırlı (başlık + açıklama) ----
function drawCardinalLabels(svg, cx, cy, innerR, outerR, asc, houses) {
    const labels = [
        { title: 'YÜKSELEN',  sub: 'Doğum anındaki ufuk',  lon: asc,                color: '#F0C757' },
        { title: 'ALÇALAN',   sub: 'İlişki aynası',         lon: (asc + 180) % 360,  color: 'rgba(245,230,233,0.55)' },
        { title: 'TEPE',      sub: 'Kariyer ve amaç',       lon: houses[9],           color: '#A8DFFF' },
        { title: 'KÖKEN',     sub: 'Aile ve içsel dünya',   lon: houses[3],           color: 'rgba(245,230,233,0.55)' }
    ];
    labels.forEach((lbl, i) => {
        const angle = zodiacToSVGAngle(lbl.lon, asc);
        const pos = polarToXY(cx, cy, innerR - 22, angle);
        const delay = 4200 + i * 140;

        // Başlık satırı (büyük, Cinzel)
        const title = createSVG('text', {
            x: pos.x, y: pos.y - 2,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            fill: lbl.color, 'font-size': '12', 'font-weight': '700',
            'font-family': "'Cinzel Decorative', 'Cinzel', Georgia, serif",
            'letter-spacing': '2.2',
            filter: 'url(#sglow)'
        });
        title.textContent = lbl.title;
        title.style.opacity = '0';
        title.style.animation = `fadeIn 0.9s cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms forwards`;
        svg.appendChild(title);

        // Açıklama satırı (küçük italic Cormorant)
        const sub = createSVG('text', {
            x: pos.x, y: pos.y + 12,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            fill: 'rgba(245,230,233,0.55)', 'font-size': '8.5',
            'font-family': "'Cormorant Garamond', Georgia, serif",
            'font-style': 'italic',
            'letter-spacing': '0.3'
        });
        sub.textContent = lbl.sub;
        sub.style.opacity = '0';
        sub.style.animation = `fadeIn 0.9s cubic-bezier(0.22, 0.61, 0.36, 1) ${delay + 100}ms forwards`;
        svg.appendChild(sub);
    });
}


// ---- Planet Summary Cards \u2014 Premium 3D tilt + mouse-follow glow ----
// Unicode planet glyphs \u2014 kart\u0131n arkas\u0131nda b\u00fcy\u00fck ornament olarak g\u00f6r\u00fcn\u00fcr
const PLANET_GLYPHS_UNICODE = {
    gunes: '\u2609', ay: '\u263d', merkur: '\u263f', venus: '\u2640',
    mars: '\u2642', jupiter: '\u2643', saturn: '\u2644'
};

function renderPlanetSummary(chartData, containerId) {
    const container = document.getElementById(containerId);
    let html = '';
    const keys = Object.keys(chartData.planets);
    keys.forEach((key, idx) => {
        const lon = chartData.planets[key];
        const sign = getZodiacSign(lon);
        const deg = getSignDegree(lon);
        const color = getElementColor(sign.element);
        const initial = PLANET_NAMES_TR[key] ? PLANET_NAMES_TR[key].charAt(0) : key.charAt(0).toUpperCase();
        const ornament = PLANET_GLYPHS_UNICODE[key] || '\u2734';
        html += `
        <div class="planet-card" style="animation-delay:${5000 + idx * 120}ms; --accent:${color.text}; --accent-soft:${color.stroke};">
            <div class="planet-card-inner">
                <div class="planet-card-glow" aria-hidden="true"></div>
                <div class="planet-card-ornament" aria-hidden="true">${ornament}</div>
                <div class="planet-card-content">
                    <span class="planet-symbol" style="color:${color.text}">${initial}</span>
                    <span class="planet-name">${PLANET_NAMES_TR[key] || key}</span>
                    <span class="planet-sign">${sign.symbol} ${sign.name}</span>
                    <span class="planet-degree">${Math.floor(deg)}\u00b0 ${Math.floor((deg % 1) * 60)}'</span>
                </div>
                <div class="planet-card-shine" aria-hidden="true"></div>
            </div>
        </div>`;
    });
    const ascSign = getZodiacSign(chartData.ascendant);
    const ascDeg = getSignDegree(chartData.ascendant);
    html += `
    <div class="planet-card planet-card--asc" style="animation-delay:${5000 + keys.length * 120}ms; --accent:#F0C757; --accent-soft:rgba(240,199,87,0.55);">
        <div class="planet-card-inner">
            <div class="planet-card-glow" aria-hidden="true"></div>
            <div class="planet-card-ornament" aria-hidden="true">\u2191</div>
            <div class="planet-card-content">
                <span class="planet-symbol" style="color:#F0C757">ASC</span>
                <span class="planet-name">Y\u00fckselen</span>
                <span class="planet-sign">${ascSign.symbol} ${ascSign.name}</span>
                <span class="planet-degree">${Math.floor(ascDeg)}\u00b0 ${Math.floor((ascDeg % 1) * 60)}'</span>
            </div>
            <div class="planet-card-shine" aria-hidden="true"></div>
        </div>
    </div>`;
    container.innerHTML = html;

    // 3D tilt + mouse-follow glow (vanilla port of Framer Motion concept)
    initPlanetCardTilt(container);
}

function initPlanetCardTilt(container) {
    if (window.init3DTilt) window.init3DTilt('.planet-card', { maxTilt: 10, scope: container });
}

// Generic 3D tilt — mouse-follow rotateX/rotateY + --mx/--my for glow gradients
// Touch/coarse pointer'larda otomatik devre dışı
function init3DTilt(selector, options) {
    const opts = Object.assign({ maxTilt: 8, scope: document }, options || {});
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    const cards = (opts.scope || document).querySelectorAll(selector);
    cards.forEach(card => {
        if (card.__tilt3DBound) return;
        card.__tilt3DBound = true;
        let raf = null;
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const xPct = (e.clientX - r.left) / r.width - 0.5;
            const yPct = (e.clientY - r.top) / r.height - 0.5;
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                card.style.setProperty('--rx', (xPct * opts.maxTilt).toFixed(2) + 'deg');
                card.style.setProperty('--ry', (-yPct * opts.maxTilt).toFixed(2) + 'deg');
                card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
                card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
            });
        });
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
            card.style.setProperty('--mx', '50%');
            card.style.setProperty('--my', '50%');
        });
    });
}
window.init3DTilt = init3DTilt;


// ---- PNG Download ----
function downloadChartAsPNG() {
    const svgEl = document.getElementById('birthChartSvg');
    const clone = svgEl.cloneNode(true);
    // Remove animations for clean export
    clone.querySelectorAll('*').forEach(el => {
        el.style.animation = 'none';
        el.style.opacity = el.style.opacity === '0' ? '1' : el.style.opacity;
        if (el.getAttribute('opacity') === '0') el.setAttribute('opacity', '1');
    });
    const svgData = new XMLSerializer().serializeToString(clone);
    const svgStyled = svgData.replace('<svg', `<svg style="font-family:'IM Fell English',Georgia,serif;background:#3D1028;"`);
    const blob = new Blob([svgStyled], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const scale = 2;
    canvas.width = 700 * scale;
    canvas.height = 700 * scale;
    img.onload = function () {
        ctx.fillStyle = '#3D1028';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(function (pngBlob) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(pngBlob);
            a.download = 'dogum-haritasi.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    };
    img.src = url;
}
