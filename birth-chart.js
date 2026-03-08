// ============================================================
// NATAL DOGUM HARITASI — Profesyonel SVG Zodyak Carki
// Mistik Luks tasarim, SVG path glyphler, derece olcegi
// CLAUDE.md tasarim kilavuzuna uygun
// ============================================================

// --- Element Colors (Mistik Luks palette) ---
const ELEMENT_COLORS = {
    Ates:   { bg: 'rgba(212,80,122,0.08)',  stroke: 'rgba(232,112,138,0.30)', text: '#E8708A' },
    Toprak: { bg: 'rgba(212,175,55,0.08)',  stroke: 'rgba(212,175,55,0.30)',  text: '#D4AF37' },
    Hava:   { bg: 'rgba(126,184,218,0.08)', stroke: 'rgba(140,203,232,0.30)', text: '#8CCBE8' },
    Su:     { bg: 'rgba(199,125,186,0.08)', stroke: 'rgba(208,154,232,0.30)', text: '#D09AE8' }
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

// ---- SVG Glyph Paths for Zodiac Signs ----
// Each glyph is an array of path-data strings, designed for a ±6 unit box
const ZODIAC_GLYPH_PATHS = [
    // 0: Aries - Two curved horns
    ['M-4,5 C-4,-1 -0.5,-6 0,0 C0.5,-6 4,-1 4,5'],
    // 1: Taurus - Horns + circle
    ['M-4.5,-5 C-2.5,-1 0,0.5 0,0.5 C0,0.5 2.5,-1 4.5,-5',
     'M-2.5,1.5 C-2.5,4.5 2.5,4.5 2.5,1.5 C2.5,-0.5 -2.5,-0.5 -2.5,1.5'],
    // 2: Gemini - Two pillars with curves
    ['M-4,-5.5 C-1,-3.5 1,-3.5 4,-5.5',
     'M-4,5.5 C-1,3.5 1,3.5 4,5.5',
     'M-2,-4.5 L-2,4.5', 'M2,-4.5 L2,4.5'],
    // 3: Cancer - Two interlocking spirals
    ['M4.5,-1 C4.5,-5 -0.5,-5 -0.5,-1 C-0.5,1 2,1 2,-1',
     'M-4.5,1 C-4.5,5 0.5,5 0.5,1 C0.5,-1 -2,-1 -2,1'],
    // 4: Leo - Circle with swoosh tail
    ['M-4,4 C-6.5,0 -3,-5.5 0,-2.5 C2.5,0 5,-2 3.5,1 C2,3 1,4 1.5,5.5'],
    // 5: Virgo - M with looped tail
    ['M-5,5 L-5,-2 C-5,-5 -3,-5 -3,-2 L-3,5',
     'M-3,-2 C-3,-5 -1,-5 -1,-2 L-1,5',
     'M-1,-2 C-1,-5 1,-5 1,-2 L1,3 C2,5.5 3.5,4 4,2'],
    // 6: Libra - Scales (arch + two lines)
    ['M-5,4 L5,4', 'M-5,1 L5,1',
     'M-3,-1 C-3,-5.5 3,-5.5 3,-1'],
    // 7: Scorpio - M with arrow tail
    ['M-5,5 L-5,-2 C-5,-5 -3,-5 -3,-2 L-3,5',
     'M-3,-2 C-3,-5 -1,-5 -1,-2 L-1,5',
     'M-1,-2 C-1,-5 1,-5 1,-2 L1,5 L3.5,2.5',
     'M2,5 L3.5,5 L3.5,2.5'],
    // 8: Sagittarius - Diagonal arrow with crossbar
    ['M-4,5 L5,-4', 'M5,-4 L1.5,-4', 'M5,-4 L5,-0.5',
     'M-0.5,1.5 L3,-2'],
    // 9: Capricorn - V with curling tail
    ['M-4.5,-3 L0,4 L2,-1 C3.5,-4 5.5,-2 5,1 C4.5,3.5 3.5,5 5,6'],
    // 10: Aquarius - Two zigzag lines
    ['M-5,-2 L-3,-4 L0,-2 L2,-4 L5,-2',
     'M-5,2 L-3,0 L0,2 L2,0 L5,2'],
    // 11: Pisces - Two arcs with connecting line
    ['M-3.5,-5.5 C1.5,-3.5 1.5,3.5 -3.5,5.5',
     'M3.5,-5.5 C-1.5,-3.5 -1.5,3.5 3.5,5.5',
     'M-5,0 L5,0']
];

// ---- SVG Glyph Data for Planets ----
// { circles: [{cx,cy,r,fill}], paths: ['d string'] }
const PLANET_GLYPH_DATA = {
    gunes: { // Sun - Circle with center dot
        circles: [{cx:0,cy:0,r:4,fill:false},{cx:0,cy:0,r:1.2,fill:true}],
        paths: []
    },
    ay: { // Moon - Crescent
        circles: [],
        paths: ['M2,-5 C-3.5,-4 -3.5,4 2,5 C-0.5,3 -0.5,-3 2,-5']
    },
    merkur: { // Mercury - Circle + cross + crescent
        circles: [{cx:0,cy:-0.5,r:2.5,fill:false}],
        paths: ['M0,2 L0,6','M-2,4 L2,4','M-2.2,-3 C-2.2,-5.8 2.2,-5.8 2.2,-3']
    },
    venus: { // Venus - Circle + cross
        circles: [{cx:0,cy:-1,r:2.5,fill:false}],
        paths: ['M0,1.5 L0,5.5','M-2,3.5 L2,3.5']
    },
    mars: { // Mars - Circle + arrow
        circles: [{cx:0,cy:1,r:2.5,fill:false}],
        paths: ['M1.8,-0.8 L4.5,-3.5','M4.5,-3.5 L2,-3.5','M4.5,-3.5 L4.5,-1']
    },
    jupiter: { // Jupiter - Hook + crossbar
        circles: [],
        paths: ['M1.5,-5 C-1.5,-2.5 -3.5,-0.5 -4,0','M-4,0 L3.5,0','M1.5,-5 L1.5,5']
    },
    saturn: { // Saturn - Cross + hook
        circles: [],
        paths: ['M-2,-4.5 L2,-4.5','M0,-4.5 L0,3','M0,3 C0,6 -3.5,6 -4,3.5']
    }
};


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


// ---- Glyph Drawing Functions ----
function drawZodiacGlyph(svg, signIndex, cx, cy, size, color, delay) {
    const pathsArr = ZODIAC_GLYPH_PATHS[signIndex];
    if (!pathsArr) return null;
    const scale = size / 13;
    const g = createSVG('g', {
        transform: `translate(${cx},${cy}) scale(${scale})`
    });
    g.style.opacity = '0';
    g.style.animation = `fadeIn 600ms ease ${delay}ms forwards`;
    const sw = Math.max(0.8, 1.0 / scale);
    pathsArr.forEach(d => {
        g.appendChild(createSVG('path', {
            d: d, fill: 'none', stroke: color,
            'stroke-width': sw,
            'stroke-linecap': 'round', 'stroke-linejoin': 'round'
        }));
    });
    svg.appendChild(g);
    return g;
}

function drawPlanetGlyph(svg, planetKey, cx, cy, size, color, delay) {
    const data = PLANET_GLYPH_DATA[planetKey];
    if (!data) return null;
    const scale = size / 13;
    const g = createSVG('g', {
        transform: `translate(${cx},${cy}) scale(${scale})`
    });
    g.style.opacity = '0';
    g.style.animation = `fadeIn 700ms ease ${delay}ms forwards`;
    const sw = Math.max(0.7, 0.9 / scale);
    if (data.circles) {
        data.circles.forEach(c => {
            g.appendChild(createSVG('circle', {
                cx: c.cx, cy: c.cy, r: c.r,
                fill: c.fill ? color : 'none',
                stroke: color, 'stroke-width': sw,
                opacity: c.fill ? '0.7' : '1'
            }));
        });
    }
    if (data.paths) {
        data.paths.forEach(d => {
            g.appendChild(createSVG('path', {
                d: d, fill: 'none', stroke: color,
                'stroke-width': sw,
                'stroke-linecap': 'round', 'stroke-linejoin': 'round'
            }));
        });
    }
    svg.appendChild(g);
    return g;
}


// ================================================================
// MAIN RENDER
// ================================================================
function renderBirthChart(chartData, svgId) {
    const svg = document.getElementById(svgId);
    svg.innerHTML = '';

    const cx = 350, cy = 350;
    const outerR = 305, signR = 270, midR = 240, innerR = 180, aspectR = 165;

    // --- Defs ---
    const defs = createSVG('defs', {});
    defs.innerHTML = `
        <filter id="pglow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="sglow"><feGaussianBlur stdDeviation="1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    `;
    svg.appendChild(defs);

    // --- Background circle ---
    svg.appendChild(createSVG('circle', { cx, cy, r: outerR + 3, fill: 'rgba(26,10,18,0.5)', stroke: 'none' }));

    // 1. Sign segments (subtle colored arcs)
    drawSignSegments(svg, cx, cy, outerR, signR, chartData.ascendant);

    // 2. Main structural circles (increased opacity for visibility)
    addCircle(svg, cx, cy, outerR, 'rgba(212,175,55,0.40)', 0.8, 0, 2000);
    addCircle(svg, cx, cy, signR, 'rgba(245,230,233,0.18)', 0.4, 200, 1800);
    addCircle(svg, cx, cy, midR, 'rgba(245,230,233,0.12)', 0.3, 400, 1500);
    addCircle(svg, cx, cy, innerR, 'rgba(245,230,233,0.10)', 0.3, 600, 1200);

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


// ---- Animated Circle (stroke-dasharray draw) ----
function addCircle(svg, cx, cy, r, stroke, width, delay, dur) {
    const c = createSVG('circle', {
        cx, cy, r, fill: 'none', stroke, 'stroke-width': width
    });
    const circumf = 2 * Math.PI * r;
    c.style.strokeDasharray = circumf;
    c.style.strokeDashoffset = circumf;
    c.style.animation = `ringDraw ${dur}ms ease ${delay}ms forwards`;
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
        seg.style.animation = `fadeIn 0.8s ease ${400 + i * 80}ms forwards`;
        svg.appendChild(seg);
    }
}


// ---- Tick Marks (5-degree intervals) ----
function drawTickMarks(svg, cx, cy, outerR, innerR, asc) {
    const g = createSVG('g', {});
    g.style.opacity = '0';
    g.style.animation = 'fadeIn 1.2s ease 2500ms forwards';
    for (let deg = 0; deg < 360; deg += 5) {
        const angle = zodiacToSVGAngle(deg, asc);
        const isMajor = deg % 30 === 0;
        const isMinor10 = deg % 10 === 0;
        if (isMajor) continue; // Sign divisions handle these
        const len = isMinor10 ? 6 : 3;
        const p1 = polarToXY(cx, cy, outerR, angle);
        const p2 = polarToXY(cx, cy, outerR - len, angle);
        g.appendChild(createSVG('line', {
            x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
            stroke: 'rgba(212,175,55,0.22)', 'stroke-width': '0.3'
        }));
    }
    svg.appendChild(g);
}


// ---- Sign Division Lines ----
function drawSignDivisions(svg, cx, cy, outerR, innerR, asc) {
    for (let i = 0; i < 12; i++) {
        const angle = zodiacToSVGAngle(i * 30, asc);
        const p1 = polarToXY(cx, cy, outerR, angle);
        const p2 = polarToXY(cx, cy, innerR, angle);
        const line = createSVG('line', {
            x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
            stroke: 'rgba(212,175,55,0.30)', 'stroke-width': '0.5'
        });
        const len = lineDist(p1.x, p1.y, p2.x, p2.y);
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
        line.style.animation = `ringDraw 600ms ease ${600 + i * 150}ms forwards`;
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
        const delay = 1500 + i * 100;
        drawZodiacGlyph(svg, i, pos.x, pos.y, 13, color.text, delay);
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


// ---- House Numbers ----
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
            fill: 'rgba(245,230,233,0.25)', 'font-size': '8',
            'font-family': "'IM Fell English', Georgia, serif",
            'font-style': 'italic'
        });
        label.textContent = (i + 1).toString();
        label.style.opacity = '0';
        label.style.animation = `fadeIn 0.4s ease ${2500 + i * 50}ms forwards`;
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

        // Subtle glow behind planet
        const glow = createSVG('circle', {
            cx: pos.x, cy: pos.y, r: 10,
            fill: color.stroke, opacity: '0', filter: 'url(#pglow)'
        });
        glow.style.animation = `fadeIn 0.8s ease ${delay}ms forwards`;
        glow.addEventListener('animationend', () => { glow.setAttribute('opacity', '0.15'); });
        svg.appendChild(glow);

        // Planet glyph (SVG path)
        drawPlanetGlyph(svg, planet.key, pos.x, pos.y, 12, color.text, delay + 100);

        // Degree annotation (small, elegant, outside planet ring)
        const deg = getSignDegree(planet.lon);
        const degAngle = zodiacToSVGAngle(planet.dLon, asc);
        const degPos = polarToXY(cx, cy, degR, degAngle);
        const degText = createSVG('text', {
            x: degPos.x, y: degPos.y + 2,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            fill: 'rgba(245,230,233,0.40)', 'font-size': '6.5',
            'font-family': "'IM Fell English', Georgia, serif",
            'font-style': 'italic'
        });
        degText.textContent = `${Math.floor(deg)}\u00b0${Math.floor((deg % 1) * 60)}'`;
        degText.style.opacity = '0';
        degText.style.animation = `fadeIn 0.4s ease ${delay + 200}ms forwards`;
        svg.appendChild(degText);
    });
}


// ---- Cardinal Labels (ASC, DSC, MC, IC) ----
function drawCardinalLabels(svg, cx, cy, innerR, outerR, asc, houses) {
    const labels = [
        { text: 'ASC', lon: asc, color: '#D4AF37' },
        { text: 'DSC', lon: (asc + 180) % 360, color: 'rgba(245,230,233,0.45)' },
        { text: 'MC',  lon: houses[9], color: '#8CCBE8' },
        { text: 'IC',  lon: houses[3], color: 'rgba(245,230,233,0.45)' }
    ];
    labels.forEach((lbl, i) => {
        const angle = zodiacToSVGAngle(lbl.lon, asc);
        // Place labels inside the inner ring so they don't overflow
        const pos = polarToXY(cx, cy, innerR - 16, angle);
        const el = createSVG('text', {
            x: pos.x, y: pos.y + 3,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            fill: lbl.color, 'font-size': '10', 'font-weight': '600',
            'font-family': "'Cinzel Decorative', 'Cinzel', Georgia, serif",
            'letter-spacing': '1.5'
        });
        el.textContent = lbl.text;
        el.style.opacity = '0';
        el.style.animation = `fadeIn 0.6s ease ${3500 + i * 100}ms forwards`;
        svg.appendChild(el);
    });
}


// ---- Planet Summary Cards ----
function renderPlanetSummary(chartData, containerId) {
    const container = document.getElementById(containerId);
    let html = '';
    const keys = Object.keys(chartData.planets);
    keys.forEach((key, idx) => {
        const lon = chartData.planets[key];
        const sign = getZodiacSign(lon);
        const deg = getSignDegree(lon);
        const color = getElementColor(sign.element);
        html += `<div class="planet-card" style="animation-delay:${5000 + idx * 120}ms">
            <span class="planet-symbol" style="color:${color.text}">${PLANET_NAMES_TR[key] ? PLANET_NAMES_TR[key].charAt(0) : key.charAt(0).toUpperCase()}</span>
            <span class="planet-name">${PLANET_NAMES_TR[key] || key}</span>
            <span class="planet-sign">${sign.symbol} ${sign.name}</span>
            <span class="planet-degree">${Math.floor(deg)}&deg; ${Math.floor((deg % 1) * 60)}'</span>
        </div>`;
    });
    const ascSign = getZodiacSign(chartData.ascendant);
    const ascDeg = getSignDegree(chartData.ascendant);
    html += `<div class="planet-card" style="animation-delay:${5000 + keys.length * 120}ms;border-color:rgba(212,175,55,0.15);">
        <span class="planet-symbol" style="color:#D4AF37">ASC</span>
        <span class="planet-name">Y\u00fckselen</span>
        <span class="planet-sign">${ascSign.symbol} ${ascSign.name}</span>
        <span class="planet-degree">${Math.floor(ascDeg)}&deg; ${Math.floor((ascDeg % 1) * 60)}'</span>
    </div>`;
    container.innerHTML = html;
}


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
    const svgStyled = svgData.replace('<svg', `<svg style="font-family:'IM Fell English',Georgia,serif;background:#1A0A12;"`);
    const blob = new Blob([svgStyled], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const scale = 2;
    canvas.width = 700 * scale;
    canvas.height = 700 * scale;
    img.onload = function () {
        ctx.fillStyle = '#1A0A12';
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
