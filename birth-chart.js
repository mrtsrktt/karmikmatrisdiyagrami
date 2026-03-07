// ============================================================
// NATAL DOĞUM HARİTASI - PREMIUM SVG ZODYAK ÇARKI
// Profesyonel çizim, SVG path glyphler, derece ölçeği
// ============================================================

const ELEMENT_COLORS = {
    Ateş:   { bg: 'rgba(255,107,157,0.05)', stroke: 'rgba(255,107,157,0.25)', text: '#ff9dbf' },
    Toprak: { bg: 'rgba(240,192,64,0.05)',  stroke: 'rgba(240,192,64,0.25)',  text: '#ffe066' },
    Hava:   { bg: 'rgba(77,232,224,0.05)',  stroke: 'rgba(77,232,224,0.25)',  text: '#7af0e8' },
    Su:     { bg: 'rgba(176,106,255,0.05)', stroke: 'rgba(176,106,255,0.25)', text: '#c9a0ff' }
};

const PLANET_NAMES_TR = {
    gunes: 'Güneş', ay: 'Ay', merkur: 'Merkür',
    venus: 'Venüs', mars: 'Mars', jupiter: 'Jüpiter', saturn: 'Satürn'
};

// Professional astrological glyphs as short text labels (cleaner than Unicode)
const SIGN_GLYPHS = ['Ar','Ta','Ge','Cn','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi'];
const PLANET_GLYPHS = {
    gunes: '\u2609', ay: '\u263D', merkur: '\u263F',
    venus: '\u2640', mars: '\u2642', jupiter: '\u2643', saturn: '\u2644'
};

// ---- SVG Helper ----
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

// ---- Main Render ----
function renderBirthChart(chartData, svgId) {
    const svg = document.getElementById(svgId);
    svg.innerHTML = '';

    const cx = 350, cy = 350;
    const outerR = 310, signR = 280, midR = 250, innerR = 190, aspectR = 175;

    // Defs
    const defs = createSVG('defs', {});
    defs.innerHTML = `
        <filter id="pglow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="sglow"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    `;
    svg.appendChild(defs);

    // Faint background
    svg.appendChild(createSVG('circle', { cx, cy, r: outerR + 2, fill: 'rgba(10,1,24,0.3)', stroke: 'none' }));

    // 1. Sign segments (subtle colored arcs)
    drawSignSegments(svg, cx, cy, outerR, signR, chartData.ascendant);

    // 2. Main circles (thin, elegant)
    addCircle(svg, cx, cy, outerR, 'rgba(200,180,255,0.3)', 1, 0, 2000);
    addCircle(svg, cx, cy, signR, 'rgba(200,180,255,0.15)', 0.5, 200, 1800);
    addCircle(svg, cx, cy, midR, 'rgba(200,180,255,0.12)', 0.5, 400, 1500);
    addCircle(svg, cx, cy, innerR, 'rgba(200,180,255,0.08)', 0.3, 600, 1200);

    // 3. Degree tick marks on outer ring
    drawTickMarks(svg, cx, cy, outerR, signR, chartData.ascendant);

    // 4. Sign division lines (outer to signR)
    drawSignDivisions(svg, cx, cy, outerR, signR, chartData.ascendant);

    // 5. Sign labels (abbreviations - clean & professional)
    drawSignLabels(svg, cx, cy, outerR, signR, chartData.ascendant);

    // 6. House cusps
    drawHouseCusps(svg, cx, cy, midR, innerR, chartData.houses, chartData.ascendant);

    // 7. House numbers
    drawHouseNumbers(svg, cx, cy, midR, innerR, chartData.houses, chartData.ascendant);

    // 8. Aspect lines (very subtle)
    drawAspectLines(svg, cx, cy, aspectR, chartData.aspects, chartData.planets, chartData.ascendant);

    // 9. Planets with degree annotations
    drawPlanets(svg, cx, cy, midR, innerR, chartData.planets, chartData.ascendant);

    // 10. Cardinal point labels (ASC, DSC, MC, IC) inside the chart
    drawCardinalLabels(svg, cx, cy, midR, outerR, chartData.ascendant, chartData.houses);

    // 11. Center dot
    svg.appendChild(createSVG('circle', { cx, cy, r: 3, fill: 'rgba(200,180,255,0.2)' }));
}

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

// ---- Sign Segments ----
function drawSignSegments(svg, cx, cy, outerR, innerR, asc) {
    for (let i = 0; i < 12; i++) {
        const sign = ZODIAC_SIGNS[i];
        const s1 = zodiacToSVGAngle(i * 30, asc);
        const s2 = zodiacToSVGAngle((i + 1) * 30, asc);
        const p1 = polarToXY(cx, cy, outerR, s1);
        const p2 = polarToXY(cx, cy, outerR, s2);
        const p3 = polarToXY(cx, cy, innerR, s2);
        const p4 = polarToXY(cx, cy, innerR, s1);
        const d = `M${p1.x},${p1.y} A${outerR},${outerR} 0 0 0 ${p2.x},${p2.y} L${p3.x},${p3.y} A${innerR},${innerR} 0 0 1 ${p4.x},${p4.y}Z`;
        const seg = createSVG('path', { d, fill: ELEMENT_COLORS[sign.element].bg, stroke: 'none' });
        seg.style.opacity = '0';
        seg.style.animation = `fadeIn 0.8s ease ${400 + i * 80}ms forwards`;
        svg.appendChild(seg);
    }
}

// ---- Tick Marks ----
function drawTickMarks(svg, cx, cy, outerR, innerR, asc) {
    const g = createSVG('g', {});
    g.style.opacity = '0';
    g.style.animation = 'fadeIn 1s ease 2500ms forwards';
    for (let deg = 0; deg < 360; deg += 5) {
        const angle = zodiacToSVGAngle(deg, asc);
        const isMajor = deg % 30 === 0;
        const isMinor10 = deg % 10 === 0;
        const len = isMajor ? 0 : (isMinor10 ? 6 : 3);
        if (isMajor) continue; // Sign divisions handle these
        const p1 = polarToXY(cx, cy, outerR, angle);
        const p2 = polarToXY(cx, cy, outerR - len, angle);
        g.appendChild(createSVG('line', {
            x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
            stroke: 'rgba(200,180,255,0.15)', 'stroke-width': '0.3'
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
            stroke: 'rgba(200,180,255,0.2)', 'stroke-width': '0.6'
        });
        const len = lineDist(p1.x, p1.y, p2.x, p2.y);
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
        line.style.animation = `ringDraw 600ms ease ${600 + i * 150}ms forwards`;
        svg.appendChild(line);
    }
}

// ---- Sign Labels (professional abbreviations) ----
function drawSignLabels(svg, cx, cy, outerR, innerR, asc) {
    const labelR = (outerR + innerR) / 2;
    for (let i = 0; i < 12; i++) {
        const sign = ZODIAC_SIGNS[i];
        const midAngle = zodiacToSVGAngle(i * 30 + 15, asc);
        const pos = polarToXY(cx, cy, labelR, midAngle);
        const color = ELEMENT_COLORS[sign.element];

        // Zodiac Unicode symbol - slightly larger, elegant
        const sym = createSVG('text', {
            x: pos.x, y: pos.y + 1,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            fill: color.text, 'font-size': '14', 'font-weight': '400',
            'font-family': 'serif', opacity: '0.8'
        });
        sym.textContent = sign.symbol;
        sym.style.opacity = '0';
        sym.style.animation = `fadeIn 0.5s ease ${1500 + i * 100}ms forwards`;
        svg.appendChild(sym);
    }
}

// ---- House Cusps ----
function drawHouseCusps(svg, cx, cy, outerR, innerR, houses, asc) {
    for (let i = 0; i < 12; i++) {
        const angle = zodiacToSVGAngle(houses[i], asc);
        const isCardinal = (i === 0 || i === 3 || i === 6 || i === 9);
        const p1 = polarToXY(cx, cy, isCardinal ? outerR + 8 : outerR, angle);
        const p2 = polarToXY(cx, cy, innerR, angle);
        const line = createSVG('line', {
            x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
            stroke: isCardinal ? 'rgba(240,192,64,0.25)' : 'rgba(200,180,255,0.07)',
            'stroke-width': isCardinal ? '1' : '0.3'
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
            fill: 'rgba(200,180,255,0.18)', 'font-size': '8',
            'font-family': 'Inter, sans-serif', 'font-weight': '400'
        });
        label.textContent = (i + 1).toString();
        label.style.opacity = '0';
        label.style.animation = `fadeIn 0.4s ease ${2500 + i * 50}ms forwards`;
        svg.appendChild(label);
    }
}

// ---- Aspect Lines ----
function drawAspectLines(svg, cx, cy, r, aspects, planets, asc) {
    aspects.forEach((asp, idx) => {
        const a1 = zodiacToSVGAngle(planets[asp.planet1], asc);
        const a2 = zodiacToSVGAngle(planets[asp.planet2], asc);
        const p1 = polarToXY(cx, cy, r, a1);
        const p2 = polarToXY(cx, cy, r, a2);
        const isHard = (asp.angle === 90 || asp.angle === 180);
        const isSoft = (asp.angle === 60 || asp.angle === 120);
        const line = createSVG('line', {
            x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
            stroke: asp.color,
            'stroke-width': '0.5',
            'stroke-opacity': '0.25',
            'stroke-dasharray': isHard ? '3,3' : (isSoft ? '6,2' : 'none')
        });
        line.style.opacity = '0';
        line.style.animation = `fadeIn 0.5s ease ${4000 + idx * 60}ms forwards`;
        svg.appendChild(line);
    });
}

// ---- Planet Placement ----
function drawPlanets(svg, cx, cy, outerR, innerR, planets, asc) {
    const planetR = (outerR + innerR) / 2;
    const degR = outerR + 6; // Degree annotation outside the planet ring

    // Sort and spread for collision avoidance
    const list = Object.entries(planets).map(([key, lon]) => ({ key, lon, dLon: lon }));
    list.sort((a, b) => a.lon - b.lon);
    const minGap = 12;
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
        const color = ELEMENT_COLORS[sign.element];
        const delay = 3000 + idx * 150;

        // Small indicator dot on inner ring (connecting line start)
        const innerAngle = zodiacToSVGAngle(planet.lon, asc);
        const innerPos = polarToXY(cx, cy, innerR + 2, innerAngle);

        // Thin connecting line from true position to displayed position (if spread)
        if (Math.abs(planet.dLon - planet.lon) > 1) {
            const truePos = polarToXY(cx, cy, planetR - 12, innerAngle);
            const cl = createSVG('line', {
                x1: truePos.x, y1: truePos.y, x2: pos.x, y2: pos.y,
                stroke: 'rgba(200,180,255,0.1)', 'stroke-width': '0.3'
            });
            cl.style.opacity = '0';
            cl.style.animation = `fadeIn 0.4s ease ${delay}ms forwards`;
            svg.appendChild(cl);
        }

        // Subtle glow
        const glow = createSVG('circle', {
            cx: pos.x, cy: pos.y, r: 10,
            fill: color.stroke, opacity: '0', filter: 'url(#pglow)'
        });
        glow.style.animation = `fadeIn 0.8s ease ${delay}ms forwards`;
        glow.addEventListener('animationend', () => { glow.setAttribute('opacity', '0.12'); });
        svg.appendChild(glow);

        // Planet glyph
        const glyph = createSVG('text', {
            x: pos.x, y: pos.y + 1,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            fill: color.text, 'font-size': '13', 'font-weight': '400',
            'font-family': 'serif', filter: 'url(#sglow)'
        });
        glyph.textContent = PLANET_GLYPHS[planet.key];
        glyph.style.opacity = '0';
        glyph.style.animation = `fadeIn 0.6s ease ${delay + 100}ms forwards`;
        svg.appendChild(glyph);

        // Degree annotation (small, outside planet ring)
        const deg = getSignDegree(planet.lon);
        const degAngle = zodiacToSVGAngle(planet.dLon, asc);
        const degPos = polarToXY(cx, cy, degR, degAngle);
        const degText = createSVG('text', {
            x: degPos.x, y: degPos.y + 2,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            fill: 'rgba(200,180,255,0.35)', 'font-size': '7',
            'font-family': 'Inter, sans-serif'
        });
        degText.textContent = `${Math.floor(deg)}°`;
        degText.style.opacity = '0';
        degText.style.animation = `fadeIn 0.4s ease ${delay + 200}ms forwards`;
        svg.appendChild(degText);
    });
}

// ---- Cardinal Labels (ASC, DSC, MC, IC) ----
function drawCardinalLabels(svg, cx, cy, innerR, outerR, asc, houses) {
    const labels = [
        { text: 'ASC', lon: asc, color: '#f0c040' },
        { text: 'DSC', lon: (asc + 180) % 360, color: 'rgba(200,180,255,0.4)' },
        { text: 'MC', lon: houses[9], color: '#4de8e0' },
        { text: 'IC', lon: houses[3], color: 'rgba(200,180,255,0.4)' }
    ];
    labels.forEach((lbl, i) => {
        const angle = zodiacToSVGAngle(lbl.lon, asc);
        const pos = polarToXY(cx, cy, innerR - 14, angle);
        const el = createSVG('text', {
            x: pos.x, y: pos.y + 3,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            fill: lbl.color, 'font-size': '9', 'font-weight': '600',
            'font-family': 'Inter, sans-serif', 'letter-spacing': '1.5'
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
        const color = ELEMENT_COLORS[sign.element];
        html += `<div class="planet-card" style="animation-delay:${5000 + idx * 120}ms">
            <span class="planet-symbol" style="color:${color.text}">${PLANET_GLYPHS[key]}</span>
            <span class="planet-name">${PLANET_NAMES_TR[key]}</span>
            <span class="planet-sign">${sign.symbol} ${sign.name}</span>
            <span class="planet-degree">${Math.floor(deg)}&deg; ${Math.floor((deg % 1) * 60)}'</span>
        </div>`;
    });
    const ascSign = getZodiacSign(chartData.ascendant);
    const ascDeg = getSignDegree(chartData.ascendant);
    html += `<div class="planet-card" style="animation-delay:${5000 + keys.length * 120}ms;border-color:rgba(240,192,64,0.15);">
        <span class="planet-symbol" style="color:#f0c040">ASC</span>
        <span class="planet-name">Yükselen</span>
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
    const svgStyled = svgData.replace('<svg', `<svg style="font-family:serif;background:#0a0118;"`);
    const blob = new Blob([svgStyled], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const scale = 2;
    canvas.width = 700 * scale;
    canvas.height = 700 * scale;
    img.onload = function () {
        ctx.fillStyle = '#0a0118';
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
