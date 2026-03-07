// ============================================================
// NATAL DOGUM HARITASI - SVG ZODYAK CARKI RENDERER
// Animasyonlu zodyak carki cizimi, gezegen yerlestirme, PNG indirme
// ============================================================

// Element renkleri (kozmik tema ile uyumlu)
const ELEMENT_COLORS = {
    Ates:   { bg: 'rgba(255,107,157,0.10)', border: '#ff6b9d', text: '#ff9dbf' },
    Toprak: { bg: 'rgba(240,192,64,0.10)',  border: '#f0c040', text: '#ffe066' },
    Hava:   { bg: 'rgba(77,232,224,0.10)',  border: '#4de8e0', text: '#7af0e8' },
    Su:     { bg: 'rgba(176,106,255,0.10)', border: '#b06aff', text: '#c9a0ff' }
};

const PLANET_NAMES_TR = {
    gunes: 'Gunes', ay: 'Ay', merkur: 'Merkur',
    venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn'
};

// ---- SVG Helper ----
function createSVG(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, v);
    }
    return el;
}

// ---- Coordinate helpers ----
function zodiacToSVGAngle(longitude, ascendant) {
    // Ascendant at left (180° in SVG), zodiac counter-clockwise
    return 180 - (longitude - ascendant);
}

function polarToXY(cx, cy, radius, angleDeg) {
    const rad = angleDeg * Math.PI / 180;
    return {
        x: cx + radius * Math.cos(rad),
        y: cy - radius * Math.sin(rad)
    };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
    const s = polarToXY(cx, cy, r, startAngle);
    const e = polarToXY(cx, cy, r, endAngle);
    const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 0 ${e.x} ${e.y}`;
}

// ---- Main Render Function ----
function renderBirthChart(chartData, svgId) {
    const svg = document.getElementById(svgId);
    svg.innerHTML = '';

    const cx = 300, cy = 300;
    const outerR = 270, midR = 230, innerR = 175;

    // Add defs for glow filters
    const defs = createSVG('defs', {});
    defs.innerHTML = `
        <filter id="chart-glow-gold"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="chart-glow-cyan"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="chart-glow-rose"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="chart-glow-violet"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="planet-glow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    `;
    svg.appendChild(defs);

    // Background dark circle
    svg.appendChild(createSVG('circle', { cx, cy, r: outerR + 5, fill: 'rgba(10,1,24,0.4)', stroke: 'none' }));

    // 1. Draw zodiac sign segments (colored arcs)
    drawSignSegments(svg, cx, cy, outerR, midR, chartData.ascendant);

    // 2. Draw outer and inner rings
    const outerCircle = createSVG('circle', {
        cx, cy, r: outerR, fill: 'none',
        stroke: 'rgba(176,106,255,0.35)', 'stroke-width': '1.5',
        class: 'zodiac-ring-outer'
    });
    svg.appendChild(outerCircle);

    const midCircle = createSVG('circle', {
        cx, cy, r: midR, fill: 'none',
        stroke: 'rgba(176,106,255,0.2)', 'stroke-width': '1',
        class: 'zodiac-ring-inner'
    });
    svg.appendChild(midCircle);

    const innerCircle = createSVG('circle', {
        cx, cy, r: innerR, fill: 'none',
        stroke: 'rgba(176,106,255,0.12)', 'stroke-width': '0.5'
    });
    innerCircle.style.strokeDasharray = 2 * Math.PI * innerR;
    innerCircle.style.strokeDashoffset = 2 * Math.PI * innerR;
    innerCircle.style.animation = 'ringDraw 1.2s ease 300ms forwards';
    svg.appendChild(innerCircle);

    // 3. Draw sign division lines
    drawSignDivisions(svg, cx, cy, outerR, midR, chartData.ascendant);

    // 4. Draw sign symbols
    drawSignSymbols(svg, cx, cy, outerR, midR, chartData.ascendant);

    // 5. Draw house cusps
    drawHouseCusps(svg, cx, cy, midR, innerR, chartData.houses, chartData.ascendant);

    // 6. Draw aspect lines
    drawAspectLines(svg, cx, cy, innerR - 10, chartData.aspects, chartData.planets, chartData.ascendant);

    // 7. Draw planets
    drawPlanets(svg, cx, cy, (midR + innerR) / 2, chartData.planets, chartData.ascendant);

    // 8. Draw ASC/MC labels
    drawSpecialPoints(svg, cx, cy, outerR, chartData.ascendant, chartData.houses);

    // 9. Center decoration
    drawCenter(svg, cx, cy);
}

// ---- Sign Segments ----
function drawSignSegments(svg, cx, cy, outerR, innerR, asc) {
    for (let i = 0; i < 12; i++) {
        const sign = ZODIAC_SIGNS[i];
        const startLon = i * 30;
        const endLon = (i + 1) * 30;
        const startAngle = zodiacToSVGAngle(startLon, asc);
        const endAngle = zodiacToSVGAngle(endLon, asc);

        const color = ELEMENT_COLORS[sign.element];

        // Arc segment path
        const outerStart = polarToXY(cx, cy, outerR, startAngle);
        const outerEnd = polarToXY(cx, cy, outerR, endAngle);
        const innerEnd = polarToXY(cx, cy, innerR, endAngle);
        const innerStart = polarToXY(cx, cy, innerR, startAngle);

        const d = `M ${outerStart.x} ${outerStart.y} A ${outerR} ${outerR} 0 0 0 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A ${innerR} ${innerR} 0 0 1 ${innerStart.x} ${innerStart.y} Z`;

        const segment = createSVG('path', {
            d, fill: color.bg, stroke: 'none', opacity: '0'
        });
        segment.style.animation = `symbolFadeIn 0.5s ease ${200 + i * 60}ms forwards`;
        svg.appendChild(segment);
    }
}

// ---- Sign Division Lines ----
function drawSignDivisions(svg, cx, cy, outerR, innerR, asc) {
    for (let i = 0; i < 12; i++) {
        const angle = zodiacToSVGAngle(i * 30, asc);
        const p1 = polarToXY(cx, cy, outerR, angle);
        const p2 = polarToXY(cx, cy, innerR, angle);

        const line = createSVG('line', {
            x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
            stroke: 'rgba(176,106,255,0.25)', 'stroke-width': '0.8',
            class: 'sign-divider'
        });
        const len = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
        line.style.animation = `ringDraw 0.5s ease ${300 + i * 80}ms forwards`;
        svg.appendChild(line);
    }
}

// ---- Sign Symbols ----
function drawSignSymbols(svg, cx, cy, outerR, innerR, asc) {
    const symbolR = (outerR + innerR) / 2;
    for (let i = 0; i < 12; i++) {
        const sign = ZODIAC_SIGNS[i];
        const midLon = i * 30 + 15; // midpoint of sign
        const angle = zodiacToSVGAngle(midLon, asc);
        const pos = polarToXY(cx, cy, symbolR, angle);

        const color = ELEMENT_COLORS[sign.element];

        const text = createSVG('text', {
            x: pos.x, y: pos.y + 5,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            fill: color.text, 'font-size': '18', 'font-weight': '600',
            class: 'sign-symbol',
            style: `animation-delay: ${800 + i * 80}ms`
        });
        text.textContent = sign.symbol;
        svg.appendChild(text);
    }
}

// ---- House Cusps ----
function drawHouseCusps(svg, cx, cy, outerR, innerR, houses, asc) {
    for (let i = 0; i < 12; i++) {
        const angle = zodiacToSVGAngle(houses[i], asc);
        const p1 = polarToXY(cx, cy, outerR, angle);
        const p2 = polarToXY(cx, cy, innerR, angle);

        const isCardinal = (i === 0 || i === 3 || i === 6 || i === 9);
        const line = createSVG('line', {
            x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
            stroke: isCardinal ? 'rgba(240,192,64,0.35)' : 'rgba(176,106,255,0.12)',
            'stroke-width': isCardinal ? '1.5' : '0.5',
            class: 'house-line'
        });
        const len = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
        line.style.animation = `ringDraw 0.5s ease ${1200 + i * 60}ms forwards`;
        svg.appendChild(line);

        // House number label
        const nextHouse = houses[(i + 1) % 12];
        let midHouseLon = (houses[i] + nextHouse) / 2;
        if (Math.abs(houses[i] - nextHouse) > 180) midHouseLon += 180;
        const labelAngle = zodiacToSVGAngle(midHouseLon, asc);
        const labelPos = polarToXY(cx, cy, innerR + 15, labelAngle);

        const label = createSVG('text', {
            x: labelPos.x, y: labelPos.y + 3,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            fill: 'rgba(176,106,255,0.3)', 'font-size': '9',
            'font-family': 'Inter, sans-serif'
        });
        label.textContent = (i + 1).toString();
        label.style.opacity = '0';
        label.style.animation = `symbolFadeIn 0.3s ease ${1500 + i * 40}ms forwards`;
        svg.appendChild(label);
    }
}

// ---- Aspect Lines ----
function drawAspectLines(svg, cx, cy, radius, aspects, planets, asc) {
    aspects.forEach((aspect, idx) => {
        const angle1 = zodiacToSVGAngle(planets[aspect.planet1], asc);
        const angle2 = zodiacToSVGAngle(planets[aspect.planet2], asc);
        const p1 = polarToXY(cx, cy, radius, angle1);
        const p2 = polarToXY(cx, cy, radius, angle2);

        const isDashed = (aspect.angle === 60 || aspect.angle === 90);
        const line = createSVG('line', {
            x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
            stroke: aspect.color, 'stroke-width': '0.8',
            'stroke-opacity': '0.4',
            'stroke-dasharray': isDashed ? '4,4' : 'none',
            class: 'aspect-line'
        });
        const len = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        line.style.strokeDasharray = isDashed ? `4,4` : `${len}`;
        line.style.strokeDashoffset = isDashed ? '0' : `${len}`;
        if (!isDashed) {
            line.style.animation = `ringDraw 0.6s ease ${2500 + idx * 80}ms forwards`;
        } else {
            line.style.opacity = '0';
            line.style.animation = `symbolFadeIn 0.4s ease ${2500 + idx * 80}ms forwards`;
        }
        svg.appendChild(line);
    });
}

// ---- Planet Placement ----
function drawPlanets(svg, cx, cy, radius, planets, asc) {
    // Spread planets to avoid overlap
    const planetList = Object.entries(planets).map(([key, lon]) => ({
        key, lon, displayLon: lon
    }));
    planetList.sort((a, b) => a.lon - b.lon);

    // Collision avoidance (minimum 10° apart on display)
    const minSpacing = 10;
    for (let pass = 0; pass < 3; pass++) {
        for (let i = 1; i < planetList.length; i++) {
            let diff = planetList[i].displayLon - planetList[i - 1].displayLon;
            if (diff < 0) diff += 360;
            if (diff < minSpacing) {
                planetList[i].displayLon = planetList[i - 1].displayLon + minSpacing;
                if (planetList[i].displayLon >= 360) planetList[i].displayLon -= 360;
            }
        }
    }

    planetList.forEach((planet, idx) => {
        const angle = zodiacToSVGAngle(planet.displayLon, asc);
        const pos = polarToXY(cx, cy, radius, angle);

        const sign = getZodiacSign(planet.lon);
        const elemColor = ELEMENT_COLORS[sign.element];

        // Glow circle behind planet
        const glow = createSVG('circle', {
            cx: pos.x, cy: pos.y, r: '14',
            fill: elemColor.border, opacity: '0',
            filter: 'url(#planet-glow)'
        });
        glow.style.animation = `symbolFadeIn 0.6s ease ${1800 + idx * 100}ms forwards`;
        glow.style.opacity = '0';
        // Override animation end opacity
        glow.addEventListener('animationend', () => { glow.style.opacity = '0.15'; });
        svg.appendChild(glow);

        // Planet symbol
        const text = createSVG('text', {
            x: pos.x, y: pos.y + 5,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            fill: elemColor.text, 'font-size': '16', 'font-weight': '700',
            class: 'planet-glyph',
            style: `animation-delay: ${1800 + idx * 100}ms`
        });
        text.textContent = PLANET_SYMBOLS[planet.key];
        svg.appendChild(text);
    });
}

// ---- ASC / MC labels ----
function drawSpecialPoints(svg, cx, cy, outerR, asc, houses) {
    // ASC label (always at left, angle = 180)
    const ascPos = polarToXY(cx, cy, outerR + 18, 180);
    const ascLabel = createSVG('text', {
        x: ascPos.x, y: ascPos.y + 4,
        'text-anchor': 'middle', 'dominant-baseline': 'middle',
        fill: '#f0c040', 'font-size': '11', 'font-weight': '700',
        'font-family': 'Inter, sans-serif', 'letter-spacing': '1'
    });
    ascLabel.textContent = 'ASC';
    ascLabel.style.opacity = '0';
    ascLabel.style.animation = 'symbolFadeIn 0.5s ease 2000ms forwards';
    svg.appendChild(ascLabel);

    // MC label (10th house cusp)
    const mcAngle = zodiacToSVGAngle(houses[9], asc);
    const mcPos = polarToXY(cx, cy, outerR + 18, mcAngle);
    const mcLabel = createSVG('text', {
        x: mcPos.x, y: mcPos.y + 4,
        'text-anchor': 'middle', 'dominant-baseline': 'middle',
        fill: '#4de8e0', 'font-size': '11', 'font-weight': '700',
        'font-family': 'Inter, sans-serif', 'letter-spacing': '1'
    });
    mcLabel.textContent = 'MC';
    mcLabel.style.opacity = '0';
    mcLabel.style.animation = 'symbolFadeIn 0.5s ease 2100ms forwards';
    svg.appendChild(mcLabel);
}

// ---- Center Decoration ----
function drawCenter(svg, cx, cy) {
    // Small decorative mandala at center
    const centerR = 25;
    svg.appendChild(createSVG('circle', {
        cx, cy, r: centerR,
        fill: 'rgba(10,1,24,0.6)', stroke: 'rgba(176,106,255,0.2)', 'stroke-width': '0.5'
    }));
    // Inner cross
    for (let i = 0; i < 4; i++) {
        const angle = i * 90;
        const p1 = polarToXY(cx, cy, 8, angle);
        const p2 = polarToXY(cx, cy, 20, angle);
        svg.appendChild(createSVG('line', {
            x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
            stroke: 'rgba(176,106,255,0.15)', 'stroke-width': '0.5'
        }));
    }
    // Small center dot
    svg.appendChild(createSVG('circle', {
        cx, cy, r: '3', fill: 'rgba(240,192,64,0.3)'
    }));
}

// ---- Planet Summary Cards ----
function renderPlanetSummary(chartData, containerId) {
    const container = document.getElementById(containerId);

    let html = '';
    const planetKeys = Object.keys(chartData.planets);
    planetKeys.forEach((key, idx) => {
        const lon = chartData.planets[key];
        const sign = getZodiacSign(lon);
        const deg = getSignDegree(lon);
        const elemColor = ELEMENT_COLORS[sign.element];

        html += `
            <div class="planet-card" style="animation-delay: ${3500 + idx * 100}ms">
                <span class="planet-symbol" style="color: ${elemColor.text}">${PLANET_SYMBOLS[key]}</span>
                <span class="planet-name">${PLANET_NAMES_TR[key]}</span>
                <span class="planet-sign">${sign.symbol} ${sign.name}</span>
                <span class="planet-degree">${Math.floor(deg)}&deg; ${Math.floor((deg % 1) * 60)}'</span>
            </div>
        `;
    });

    // Ascendant card
    const ascSign = getZodiacSign(chartData.ascendant);
    const ascDeg = getSignDegree(chartData.ascendant);
    html += `
        <div class="planet-card" style="animation-delay: ${3500 + planetKeys.length * 100}ms; border-color: rgba(240,192,64,0.2);">
            <span class="planet-symbol" style="color: #f0c040">ASC</span>
            <span class="planet-name">Yukselen</span>
            <span class="planet-sign">${ascSign.symbol} ${ascSign.name}</span>
            <span class="planet-degree">${Math.floor(ascDeg)}&deg; ${Math.floor((ascDeg % 1) * 60)}'</span>
        </div>
    `;

    container.innerHTML = html;
}

// ---- PNG Download ----
function downloadChartAsPNG() {
    const svgEl = document.getElementById('birthChartSvg');
    const svgData = new XMLSerializer().serializeToString(svgEl);

    // Embed fonts inline for the export
    const svgWithStyles = svgData.replace('<svg', `<svg style="font-family: 'Inter', Arial, sans-serif; background: #0a0118;"`);

    const blob = new Blob([svgWithStyles], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const scale = 2; // Retina

    canvas.width = 600 * scale;
    canvas.height = 600 * scale;

    img.onload = function () {
        // Dark background
        ctx.fillStyle = '#0a0118';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(function (pngBlob) {
            const downloadUrl = URL.createObjectURL(pngBlob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = 'dogum-haritasi.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
            URL.revokeObjectURL(url);
        }, 'image/png');
    };
    img.src = url;
}
