// ============================================================
// KARMA MATRIX CALCULATOR - Kozmik Tasarım + Hesaplama Motoru
// ============================================================

// --- Generate Starfield ---
(function initStarfield() {
    const container = document.getElementById('starfield');
    if (!container) return;
    const count = 200;
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() < 0.85 ? (1 + Math.random() * 1.5) : (2 + Math.random() * 2);
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.setProperty('--dur', (2 + Math.random() * 4) + 's');
        star.style.setProperty('--o1', (0.2 + Math.random() * 0.3).toFixed(2));
        star.style.setProperty('--o2', (0.7 + Math.random() * 0.3).toFixed(2));
        star.style.setProperty('--s', (1 + Math.random() * 0.5).toFixed(2));
        star.style.animationDelay = (Math.random() * 5) + 's';
        // Some stars get a color tint
        const r = Math.random();
        if (r < 0.08) star.style.background = 'rgba(176,106,255,0.8)';
        else if (r < 0.15) star.style.background = 'rgba(255,107,157,0.7)';
        else if (r < 0.2) star.style.background = 'rgba(77,232,224,0.7)';
        else if (r < 0.25) star.style.background = 'rgba(240,192,64,0.7)';
        container.appendChild(star);
    }
})();

// --- Node positions for SVG diagram ---
const NODE_POSITIONS = {
    B: { x: 300, y: 50,  color: "#f0c040", gradient: "url(#nodeGradGold)", type: "path",        glow: "#f0c040" },
    D: { x: 100, y: 190, color: "#4de8e0", gradient: "url(#nodeGradCyan)", type: "achievement",  glow: "#4de8e0" },
    J: { x: 300, y: 190, color: "#4de8e0", gradient: "url(#nodeGradCyan)", type: "achievement",  glow: "#4de8e0" },
    Z: { x: 500, y: 190, color: "#4de8e0", gradient: "url(#nodeGradCyan)", type: "achievement",  glow: "#4de8e0" },
    I: { x: 175, y: 290, color: "#ff6b9d", gradient: "url(#nodeGradRose)", type: "karmic",       glow: "#ff6b9d" },
    L: { x: 425, y: 290, color: "#ff6b9d", gradient: "url(#nodeGradRose)", type: "karmic",       glow: "#ff6b9d" },
    G: { x: 300, y: 340, color: "#f0c040", gradient: "url(#nodeGradGold)", type: "path",         glow: "#f0c040" },
    M: { x: 175, y: 400, color: "#ff6b9d", gradient: "url(#nodeGradRose)", type: "karmic",       glow: "#ff6b9d" },
    N: { x: 425, y: 400, color: "#ff6b9d", gradient: "url(#nodeGradRose)", type: "karmic",       glow: "#ff6b9d" },
    A: { x: 100, y: 480, color: "#f0c040", gradient: "url(#nodeGradGold)", type: "path",         glow: "#f0c040" },
    K: { x: 300, y: 480, color: "#ff6b9d", gradient: "url(#nodeGradRose)", type: "karmic",       glow: "#ff6b9d" },
    V: { x: 500, y: 480, color: "#f0c040", gradient: "url(#nodeGradGold)", type: "path",         glow: "#f0c040" },
    E: { x: 300, y: 590, color: "#4de8e0", gradient: "url(#nodeGradCyan)", type: "achievement",  glow: "#4de8e0" }
};

const NODE_LINES = [
    ["B", "D"], ["B", "Z"], ["D", "A"], ["Z", "V"], ["A", "E"], ["V", "E"],
    ["B", "J"], ["B", "G"], ["D", "J"], ["D", "I"], ["D", "G"],
    ["Z", "J"], ["Z", "L"], ["Z", "G"],
    ["A", "M"], ["A", "G"], ["A", "K"],
    ["V", "N"], ["V", "G"], ["V", "K"],
    ["E", "K"], ["E", "G"],
    ["I", "J"], ["I", "G"], ["I", "M"],
    ["L", "J"], ["L", "G"], ["L", "N"],
    ["M", "G"], ["M", "K"],
    ["N", "G"], ["N", "K"],
    ["J", "K"],
    ["D", "L"], ["Z", "I"],
    ["A", "N"], ["V", "M"],
];

// --- Calculation logic ---
function check(num) {
    if (num > 22) {
        let n = num;
        while (n > 22) n -= 22;
        return n;
    } else if (num < 0) {
        return Math.abs(num);
    } else if (num === 0) {
        return 22;
    }
    return num;
}

function digitSum(n) {
    let s = Math.abs(n);
    let sum = 0;
    let str = s.toString();
    for (let i = 0; i < str.length; i++) sum += parseInt(str[i]);
    return sum;
}

function digitRoot(n) {
    let val = n;
    while (val > 9) val = digitSum(val);
    return val;
}

function reduceForExtended(n) {
    let val = n;
    if (val > 22) val = digitSum(val);
    if (val === 0) val = 22;
    return val;
}

function checkKarmicExtended(n) {
    let val = n;
    if (val > 22) val = digitSum(val);
    if (val === 0) return 22;
    return Math.abs(val);
}

// --- Pure matrix calculation (no DOM) ---
function calculateMatrixValues(day, month, yearStr) {
    const rawDay = day;
    const A = check(day);
    const rawMonth = month;
    const B = check(month);

    let yearSum = 0;
    for (let i = 0; i < yearStr.length; i++) yearSum += parseInt(yearStr[i]);
    const rawYear = yearSum;
    const V = check(yearSum);

    const G = check(A + B + V);
    const D = check(A + B);
    const E = check(A + V);
    const J = check(D + E);
    const Z = check(B + V);
    const I = check(A - B);
    const K = check(A - V);
    const L = check(I - K);
    const M = check(B - V);
    const N = check(I + K + L + M);

    const dayStr = day < 10 ? '0' + day : '' + day;
    const monthStr = month < 10 ? '0' + month : '' + month;

    const A1 = rawDay > 22 ? digitSum(rawDay) : rawDay;
    const B1 = rawMonth;
    const V1 = rawYear > 22 ? digitSum(rawYear) : rawYear;

    const fullDateStr = dayStr + monthStr + yearStr;
    let fullDateSum = 0;
    for (let i = 0; i < fullDateStr.length; i++) fullDateSum += parseInt(fullDateStr[i]);
    const G1 = fullDateSum > 22 ? digitSum(fullDateSum) : fullDateSum;

    const D1 = reduceForExtended(A1 + B1);
    const E1 = reduceForExtended(A1 + V1);
    const J1 = reduceForExtended(D1 + E1);
    const Z1 = reduceForExtended(B1 + V1);
    const I1 = checkKarmicExtended(A1 - B1);
    const K1 = checkKarmicExtended(A1 - V1);
    const L1 = checkKarmicExtended(I1 - K1);
    const M1 = checkKarmicExtended(B1 - V1);
    const N1 = checkKarmicExtended(I1 + K1 + L1 + M1);

    const lifeNum = digitRoot(fullDateSum);
    const period1End = 36 - lifeNum;
    const period2End = period1End + 9;
    const period3End = period2End + 9;

    return {
        A, B, V, G, D, E, J, Z, I, K, L, M, N,
        A1, B1, V1, G1, D1, E1, J1, Z1, I1, K1, L1, M1, N1,
        periods: { p1: period1End, p2: period2End, p3: period3End }
    };
}

// --- Main entry: handles both birth chart + karma matrix ---
function calculateAll() {
    const dateInput = document.getElementById('birthDate');
    const timeInput = document.getElementById('birthTime');
    const cityInput = document.getElementById('birthCity');

    // Validate date
    const dateVal = dateInput.value.trim();
    const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const dateMatch = dateVal.match(dateRegex);
    if (!dateMatch) { dateInput.classList.add('error'); return; }
    dateInput.classList.remove('error');

    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]);
    const year = dateMatch[3];
    if (month < 1 || month > 12 || day < 1 || day > 31) { dateInput.classList.add('error'); return; }

    // Calculate karma matrix (always)
    const matrixResults = calculateMatrixValues(day, month, year);
    window._matrixResults = matrixResults;

    renderMatrix(matrixResults);
    renderAgePeriods(matrixResults.periods);
    renderResultCards(matrixResults);

    // Check for birth chart (optional: time + city)
    const timeVal = timeInput ? timeInput.value.trim() : '';
    const cityVal = cityInput ? cityInput.value.trim() : '';
    const timeRegex = /^(\d{2}):(\d{2})$/;
    const timeMatch = timeVal.match(timeRegex);
    const city = cityVal ? getCityByName(cityVal) : null;

    let hasBirthChart = false;

    if (timeMatch && city) {
        const hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
            // Calculate birth chart
            const chartData = calculateBirthChart(
                parseInt(year), month, day, hour, minute,
                city.lat, city.lng
            );
            renderBirthChart(chartData, 'birthChartSvg');
            renderPlanetSummary(chartData, 'planetSummary');

            document.getElementById('birthChartSection').style.display = 'block';
            document.getElementById('chartMatrixDivider').style.display = 'block';

            // Show download button after animations
            setTimeout(() => {
                const btn = document.getElementById('downloadChartBtn');
                btn.style.display = 'inline-block';
                btn.style.animation = 'downloadBtnFade 0.5s ease forwards';
            }, 3800);

            hasBirthChart = true;
        }
    }

    if (!hasBirthChart) {
        document.getElementById('birthChartSection').style.display = 'none';
        document.getElementById('chartMatrixDivider').style.display = 'none';
        document.getElementById('downloadChartBtn').style.display = 'none';
    }

    // Show matrix sections
    document.getElementById('matrixSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsDivider').style.display = 'block';

    // Scroll to birth chart or matrix (instant to avoid fighting user scroll on mobile)
    const scrollTarget = hasBirthChart ? 'birthChartSection' : 'matrixSection';
    const targetEl = document.getElementById(scrollTarget);
    const y = targetEl.getBoundingClientRect().top + window.pageYOffset - 20;
    window.scrollTo({ top: y, behavior: 'instant' });

    // Init scroll-triggered matrix animation
    initMatrixScrollTrigger();

    requestAnimationFrame(() => initScrollAnimations());
}

// Keep old function name as alias for backward compatibility
function calculateMatrix() { calculateAll(); }

// --- Animated SVG Matrix Rendering ---
function renderMatrix(results) {
    const svg = document.getElementById('matrixSvg');
    const defs = svg.querySelector('defs');
    svg.innerHTML = '';
    if (defs) svg.appendChild(defs);

    const posMap = {
        A: results.A, B: results.B, V: results.V, G: results.G,
        D: results.D, E: results.E, J: results.J, Z: results.Z,
        I: results.I, K: results.K, L: results.L, M: results.M, N: results.N
    };

    const SVG_NS = "http://www.w3.org/2000/svg";

    // ============ LAYER 1 PREP: center burst (cinematic entrance) ============
    // This is the "primordial light point" that expands at the start of the ritual.
    const centerX = 300, centerY = 350;
    const centerBurst = document.createElementNS(SVG_NS, "circle");
    centerBurst.setAttribute("cx", centerX);
    centerBurst.setAttribute("cy", centerY);
    centerBurst.setAttribute("r", 8);
    centerBurst.setAttribute("fill", "url(#centerBurst)");
    centerBurst.setAttribute("class", "matrix-center-burst");
    centerBurst.style.opacity = '0';
    svg.appendChild(centerBurst);

    // Center expanding ring (energy wave)
    const centerWave = document.createElementNS(SVG_NS, "circle");
    centerWave.setAttribute("cx", centerX);
    centerWave.setAttribute("cy", centerY);
    centerWave.setAttribute("r", 10);
    centerWave.setAttribute("fill", "none");
    centerWave.setAttribute("stroke", "#FFE9A8");
    centerWave.setAttribute("stroke-width", "1.5");
    centerWave.setAttribute("class", "matrix-center-wave");
    centerWave.style.opacity = '0';
    svg.appendChild(centerWave);

    // ============ DRAW LINES ============
    // Initially invisible (opacity 0), entrance sequence will draw them
    NODE_LINES.forEach(([from, to], idx) => {
        const p1 = NODE_POSITIONS[from];
        const p2 = NODE_POSITIONS[to];
        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", p1.x);
        line.setAttribute("y1", p1.y);
        line.setAttribute("x2", p2.x);
        line.setAttribute("y2", p2.y);
        line.setAttribute("class", "matrix-line");

        const len = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
        line.dataset.length = len;
        line.dataset.from = from;
        line.dataset.to = to;
        line.dataset.idx = idx;

        svg.appendChild(line);
    });

    // Energy pulse layer container (Layer 2 will populate this)
    const pulseLayer = document.createElementNS(SVG_NS, "g");
    pulseLayer.setAttribute("id", "matrixPulseLayer");
    svg.appendChild(pulseLayer);

    // ============ DRAW NODES ============
    // Each node has 3 breathing halos + glow + main orb + number + label
    const nodeOrder = ["B", "D", "J", "Z", "I", "L", "G", "M", "N", "A", "K", "V", "E"];

    nodeOrder.forEach((key, idx) => {
        const pos = NODE_POSITIONS[key];
        const g = document.createElementNS(SVG_NS, "g");
        g.setAttribute("class", "node-circle");
        g.setAttribute("data-key", key);
        g.dataset.idx = idx;
        g.style.opacity = '0'; // hidden until cinematic entrance

        // ----- 3 breathing halo layers -----
        const halo1 = document.createElementNS(SVG_NS, "circle");
        halo1.setAttribute("cx", pos.x);
        halo1.setAttribute("cy", pos.y);
        halo1.setAttribute("r", 36);
        halo1.setAttribute("fill", "none");
        halo1.setAttribute("stroke", pos.color);
        halo1.setAttribute("stroke-width", "1.2");
        halo1.setAttribute("class", "node-halo node-halo-1");
        halo1.style.animationDelay = `${idx * 0.3}s`;
        g.appendChild(halo1);

        const halo2 = document.createElementNS(SVG_NS, "circle");
        halo2.setAttribute("cx", pos.x);
        halo2.setAttribute("cy", pos.y);
        halo2.setAttribute("r", 50);
        halo2.setAttribute("fill", "none");
        halo2.setAttribute("stroke", pos.color);
        halo2.setAttribute("stroke-width", "0.8");
        halo2.setAttribute("class", "node-halo node-halo-2");
        halo2.style.animationDelay = `${idx * 0.3 + 1}s`;
        g.appendChild(halo2);

        const halo3 = document.createElementNS(SVG_NS, "circle");
        halo3.setAttribute("cx", pos.x);
        halo3.setAttribute("cy", pos.y);
        halo3.setAttribute("r", 64);
        halo3.setAttribute("fill", "none");
        halo3.setAttribute("stroke", pos.color);
        halo3.setAttribute("stroke-width", "0.5");
        halo3.setAttribute("class", "node-halo node-halo-3");
        halo3.style.animationDelay = `${idx * 0.3 + 2}s`;
        g.appendChild(halo3);

        // Hover glow (large, soft, color-tinted)
        const glowCircle = document.createElementNS(SVG_NS, "circle");
        glowCircle.setAttribute("cx", pos.x);
        glowCircle.setAttribute("cy", pos.y);
        glowCircle.setAttribute("r", 50);
        glowCircle.setAttribute("fill", pos.color);
        glowCircle.setAttribute("opacity", "0");
        glowCircle.setAttribute("class", "node-glow");
        glowCircle.setAttribute("filter", `url(#glow-${pos.type === 'path' ? 'gold' : pos.type === 'achievement' ? 'cyan' : 'rose'})`);
        g.appendChild(glowCircle);

        // 360 swipe ring (hidden, fires on hover)
        const swipeRing = document.createElementNS(SVG_NS, "circle");
        swipeRing.setAttribute("cx", pos.x);
        swipeRing.setAttribute("cy", pos.y);
        swipeRing.setAttribute("r", 38);
        swipeRing.setAttribute("fill", "none");
        swipeRing.setAttribute("stroke", "#FFE9A8");
        swipeRing.setAttribute("stroke-width", "2");
        swipeRing.setAttribute("class", "node-swipe-ring");
        swipeRing.style.opacity = '0';
        g.appendChild(swipeRing);

        // Main orb with gradient
        const circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", 28);
        circle.setAttribute("fill", pos.gradient);
        circle.setAttribute("stroke", "rgba(255,255,255,0.4)");
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute("class", "node-bg");
        g.appendChild(circle);

        // Number text (initially blurred, will sharpen during entrance)
        const numText = document.createElementNS(SVG_NS, "text");
        numText.setAttribute("x", pos.x);
        numText.setAttribute("y", pos.y + 1);
        numText.setAttribute("class", "node-label");
        numText.setAttribute("dominant-baseline", "middle");
        numText.dataset.target = posMap[key] || 0;
        numText.textContent = '0'; // counter will animate from 0 to target
        g.appendChild(numText);

        // Letter label (whispered in)
        const labelText = document.createElementNS(SVG_NS, "text");
        labelText.setAttribute("x", pos.x);
        labelText.setAttribute("y", pos.y + 48);
        labelText.setAttribute("class", "node-sublabel");
        labelText.setAttribute("dominant-baseline", "middle");
        labelText.style.opacity = '0';
        labelText.textContent = key;
        g.appendChild(labelText);

        g.addEventListener('click', () => openNodeDetail(key, posMap[key]));
        g.addEventListener('mouseenter', () => onNodeHover(key, true));
        g.addEventListener('mouseleave', () => onNodeHover(key, false));

        svg.appendChild(g);
    });
}

// ============================================================
// LAYER 4: HOVER WOW + CHAIN REACTION
// ============================================================
// On hover: 360 swipe ring, chain reaction on connected nodes,
// dim disconnected nodes, energy pulse on connected lines.
function onNodeHover(nodeKey, active) {
    const svg = document.getElementById('matrixSvg');
    if (!svg) return;
    const allNodes = svg.querySelectorAll('.node-circle');
    const allLines = svg.querySelectorAll('.matrix-line');

    // Find connected nodes
    const connectedKeys = new Set([nodeKey]);
    NODE_LINES.forEach(([from, to]) => {
        if (from === nodeKey) connectedKeys.add(to);
        if (to === nodeKey) connectedKeys.add(from);
    });

    if (active) {
        // Highlight connected lines
        allLines.forEach(line => {
            const from = line.dataset.from;
            const to = line.dataset.to;
            if (from === nodeKey || to === nodeKey) {
                line.classList.add('highlight');
                // Fire an instant energy pulse along this line
                const start = (from === nodeKey) ? NODE_POSITIONS[from] : NODE_POSITIONS[to];
                const end   = (from === nodeKey) ? NODE_POSITIONS[to]   : NODE_POSITIONS[from];
                spawnEnergyPulse(svg, start, end, NODE_POSITIONS[nodeKey].color, 0.7);
            }
        });

        // Chain reaction: dim non-connected nodes, brighten connected
        allNodes.forEach(n => {
            const k = n.getAttribute('data-key');
            if (connectedKeys.has(k)) {
                n.classList.add('node-active-chain');
                n.classList.remove('node-dimmed');
            } else {
                n.classList.add('node-dimmed');
                n.classList.remove('node-active-chain');
            }
        });

        // 360 swipe ring on the hovered node
        const hoveredNode = svg.querySelector(`[data-key="${nodeKey}"]`);
        if (hoveredNode) {
            const swipe = hoveredNode.querySelector('.node-swipe-ring');
            if (swipe) {
                swipe.style.opacity = '0';
                swipe.classList.remove('node-swipe-active');
                // Force reflow then re-add to restart animation
                void swipe.getBoundingClientRect();
                swipe.classList.add('node-swipe-active');
            }
        }
    } else {
        allLines.forEach(line => line.classList.remove('highlight'));
        allNodes.forEach(n => {
            n.classList.remove('node-dimmed');
            n.classList.remove('node-active-chain');
        });
    }
}

// ============================================================
// LAYER 2: ENERGY PULSES — traveling light along connection lines
// ============================================================
// Spawns a single energy pulse traveling from `start` to `end`.
// Uses GSAP if available, otherwise plain CSS animation.
function spawnEnergyPulse(svg, start, end, color, sizeScale) {
    const SVG_NS = "http://www.w3.org/2000/svg";
    const pulseLayer = svg.querySelector('#matrixPulseLayer');
    if (!pulseLayer) return;

    const pulse = document.createElementNS(SVG_NS, "circle");
    pulse.setAttribute("cx", start.x);
    pulse.setAttribute("cy", start.y);
    pulse.setAttribute("r", 3 * (sizeScale || 1));
    pulse.setAttribute("fill", color || "#FFE9A8");
    pulse.setAttribute("class", "matrix-pulse-particle");
    pulse.setAttribute("filter", "url(#glow-strong)");
    pulseLayer.appendChild(pulse);

    // Trail
    const trail = document.createElementNS(SVG_NS, "circle");
    trail.setAttribute("cx", start.x);
    trail.setAttribute("cy", start.y);
    trail.setAttribute("r", 6 * (sizeScale || 1));
    trail.setAttribute("fill", color || "#FFE9A8");
    trail.setAttribute("opacity", "0.3");
    trail.setAttribute("class", "matrix-pulse-trail");
    pulseLayer.appendChild(trail);

    if (window.gsap) {
        const dur = 0.9 + Math.random() * 0.4;
        gsap.to(pulse, {
            attr: { cx: end.x, cy: end.y },
            duration: dur,
            ease: 'power2.inOut',
            onComplete: () => {
                pulse.remove();
                // Brief flash on the destination
                flashNodeAtPosition(svg, end);
            }
        });
        gsap.to(trail, {
            attr: { cx: end.x, cy: end.y },
            duration: dur,
            ease: 'power2.inOut',
            opacity: 0,
            onComplete: () => trail.remove()
        });
    } else {
        // Fallback: just remove after delay
        setTimeout(() => { pulse.remove(); trail.remove(); }, 1000);
    }
}

function flashNodeAtPosition(svg, pos) {
    // Find any node at this position and flash it briefly
    const node = Array.from(svg.querySelectorAll('.node-circle')).find(n => {
        const k = n.getAttribute('data-key');
        const p = NODE_POSITIONS[k];
        return p && p.x === pos.x && p.y === pos.y;
    });
    if (!node) return;
    const bg = node.querySelector('.node-bg');
    if (!bg || !window.gsap) return;
    gsap.to(bg, { attr: { 'stroke-width': 4 }, duration: 0.2, yoyo: true, repeat: 1, ease: 'sine.out' });
}

// Continuously spawn random energy pulses on random lines (after entrance)
let _energyPulseInterval = null;
function startEnergyPulses(svg) {
    if (_energyPulseInterval) clearInterval(_energyPulseInterval);
    const fire = () => {
        const lines = NODE_LINES;
        if (!lines.length) return;
        const [from, to] = lines[Math.floor(Math.random() * lines.length)];
        const startPos = NODE_POSITIONS[from];
        const endPos = NODE_POSITIONS[to];
        if (!startPos || !endPos) return;
        const colors = ["#FFE9A8", "#A8DBF0", "#F0A0B5"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        spawnEnergyPulse(svg, startPos, endPos, color, 0.8);
    };
    // Initial burst
    setTimeout(fire, 800);
    setTimeout(fire, 1600);
    // Continuous random pulses
    _energyPulseInterval = setInterval(() => {
        if (Math.random() < 0.7) fire();
    }, 1500);
}

// ============================================================
// LAYER 5: AMBIENT COSMIC DUST PARTICLES
// ============================================================
function startMatrixAmbientParticles(container) {
    if (!container) return;
    container.innerHTML = '';

    function createParticle() {
        const p = document.createElement('div');
        p.className = 'matrix-dust-particle';
        const size = 1 + Math.random() * 2.5;
        const startX = Math.random() * 100;
        const drift = (Math.random() - 0.5) * 30;
        const duration = 12 + Math.random() * 18;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = startX + '%';
        p.style.bottom = '-5%';
        p.style.setProperty('--drift', drift + 'px');
        p.style.setProperty('--dur', duration + 's');
        p.style.animationDuration = duration + 's';
        // Random tint
        const r = Math.random();
        if (r < 0.7)      p.style.background = 'rgba(255,233,168,0.85)'; // gold
        else if (r < 0.85) p.style.background = 'rgba(208,154,232,0.75)'; // amethyst
        else               p.style.background = 'rgba(232,112,138,0.70)'; // rose
        p.style.boxShadow = `0 0 ${size * 3}px ${p.style.background}`;
        container.appendChild(p);
        // Auto-cleanup after animation completes
        setTimeout(() => p.remove(), duration * 1000);
    }

    // Spawn initial batch
    for (let i = 0; i < 20; i++) {
        setTimeout(createParticle, i * 600);
    }
    // Continuously spawn
    if (container._dustInterval) clearInterval(container._dustInterval);
    container._dustInterval = setInterval(createParticle, 1200);
}

// --- Age Periods ---
function renderAgePeriods(periods) {
    const container = document.getElementById('agePeriods');
    const data = [
        { label: "1. Dönem", range: `0 - ${periods.p1} yaş` },
        { label: "2. Dönem", range: `${periods.p1} - ${periods.p2} yaş` },
        { label: "3. Dönem", range: `${periods.p2} - ${periods.p3} yaş` },
        { label: "4. Dönem", range: `${periods.p3}+ yaş` },
    ];
    container.innerHTML = data.map((d, i) =>
        `<div class="age-period" style="opacity:0; animation: none;">
            <div class="period-label">${d.label}</div>
            <div class="period-range">${d.range}</div>
        </div>`
    ).join('');
}

// --- Result Cards ---
function renderResultCards(results) {
    const pathKeys = [
        { key: 'A', label: 'A', name: 'Gün Arkanı', val: results.A, ext: results.A1 },
        { key: 'B', label: 'B', name: 'Ay Arkanı', val: results.B, ext: results.B1 },
        { key: 'V', label: 'V', name: 'Yıl Arkanı', val: results.V, ext: results.V1 },
        { key: 'G', label: 'G', name: 'Kendini Gerçekleştirme', val: results.G, ext: results.G1 }
    ];
    const achieveKeys = [
        { key: 'D', label: 'D', name: '1. Başarı Sayısı', val: results.D, ext: results.D1 },
        { key: 'E', label: 'E', name: '2. Başarı Sayısı', val: results.E, ext: results.E1 },
        { key: 'J', label: 'J', name: '3. Başarı Sayısı', val: results.J, ext: results.J1 },
        { key: 'Z', label: 'Z', name: '4. Başarı Sayısı', val: results.Z, ext: results.Z1 }
    ];
    const karmicKeys = [
        { key: 'I', label: 'I', name: '1. Karmik Düğüm', val: results.I, ext: results.I1 },
        { key: 'K', label: 'K', name: '2. Karmik Düğüm', val: results.K, ext: results.K1 },
        { key: 'L', label: 'L', name: '3. Karmik Düğüm', val: results.L, ext: results.L1 },
        { key: 'M', label: 'M', name: '4. Karmik Düğüm', val: results.M, ext: results.M1 },
        { key: 'N', label: 'N', name: 'Yaşam Boyu Karmik Ders', val: results.N, ext: results.N1 }
    ];

    document.getElementById('pathCards').innerHTML = pathKeys.map(p => cardHTML(p, 'path')).join('');
    document.getElementById('achievementCards').innerHTML = achieveKeys.map(p => cardHTML(p, 'achievement')).join('');
    document.getElementById('karmicCards').innerHTML = karmicKeys.map(p => cardHTML(p, 'karmic')).join('');
}

function cardHTML(item, type) {
    const arcana = ARCANA_NAMES[item.val] || '';
    return `
        <div class="result-card" data-animate data-num="${item.val}" onclick="openNodeDetail('${item.key}', ${item.val})">
            <div class="card-num ${type}" data-count="${item.val}">0</div>
            <div class="card-info">
                <div class="card-label">${item.label} - ${item.name}</div>
                <div class="card-name">${arcana}</div>
                <div class="card-arcana">${ARCANA_TAROT_NAMES[item.val] || ''} ${item.ext !== item.val ? '(Ham: ' + item.ext + ')' : ''}</div>
            </div>
            <div class="card-arrow">&#8250;</div>
        </div>
    `;
}

// --- Scroll-triggered Animations ---
// Counter-only IntersectionObserver. The visual entrance animations
// (fade/slide/scale) for these elements are handled by GSAP ScrollTrigger
// in animation.js (initSectionScrollAnimations / initDynamicSectionAnimations).
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const numEl = entry.target.querySelector('.card-num[data-count]');
                if (numEl) animateCounter(numEl);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

// Number counting animation
function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'));
    const duration = 800;
    const start = performance.now();

    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// --- Modal ---
function openNodeDetail(posKey, arcanaNum) {
    const posInfo = POSITION_INFO[posKey];
    const arcanaDetail = ARCANA_DETAILS[arcanaNum];
    if (!posInfo || !arcanaDetail) return;

    document.getElementById('modalArcanaNum').textContent = arcanaNum;
    document.getElementById('modalTitle').textContent = `${arcanaNum}. Arkana: ${arcanaDetail.name}`;
    document.getElementById('modalPosition').textContent = `${posInfo.name} | ${arcanaDetail.tarot}`;

    let posInterpretation = '';
    if (posKey === 'A' || posKey === 'B' || posKey === 'V' || posKey === 'G') {
        posInterpretation = arcanaDetail.inPath;
    } else if (posKey === 'D' || posKey === 'E' || posKey === 'J' || posKey === 'Z') {
        posInterpretation = arcanaDetail.inAchievement;
    } else if (posKey === 'N') {
        posInterpretation = arcanaDetail.inCenter;
    } else {
        posInterpretation = arcanaDetail.inKarmic;
    }

    // Build deeper-reading sections if available (rewritten in 2nd person tone)
    let consultantHTML = '';
    if (arcanaDetail.consultantNote) {
        consultantHTML += `
            <div class="consultant-divider">
                <span>Size Özel Yorum</span>
            </div>

            <div class="consultant-section">
                <h3>Bu Sayının İçten Yorumu</h3>
                <div class="consultant-note">${arcanaDetail.consultantNote}</div>
            </div>
        `;
    }
    if (arcanaDetail.practicalSolutions && arcanaDetail.practicalSolutions.length) {
        consultantHTML += `
            <div class="consultant-section">
                <h3>Pratik Öneriler</h3>
                <ol class="practical-solutions">${arcanaDetail.practicalSolutions.map(s => `<li>${s}</li>`).join('')}</ol>
            </div>
        `;
    }
    if (arcanaDetail.detailedReading) {
        const paragraphs = arcanaDetail.detailedReading.split('\n\n').filter(p => p.trim());
        consultantHTML += `
            <div class="consultant-section">
                <h3>Detaylı Yorum</h3>
                <div class="detailed-reading">${paragraphs.map(p => `<p>${p.trim()}</p>`).join('')}</div>
            </div>
        `;
    }

    const body = document.getElementById('modalBody');
    body.innerHTML = `
        <div class="formula-box">
            <strong>Pozisyon:</strong> ${posInfo.fullName}<br>
            <strong>Formül:</strong> ${posInfo.formula}
        </div>

        <h3>Bu Pozisyonun Anlamı</h3>
        <p>${posInfo.meaning}</p>

        <h3>Bu Pozisyondaki Yorum (${arcanaNum}. Arkana)</h3>
        <p>${posInterpretation}</p>

        <h3>Genel Arkana Anlamı</h3>
        <p>${arcanaDetail.general}</p>

        <h3>Anahtar Kelimeler</h3>
        <p>${arcanaDetail.keywords.map(k => `<span class="tag-positive">${k}</span>`).join(' ')}</p>

        <h3>Element & Gezegen</h3>
        <p>Element: <strong>${arcanaDetail.element}</strong> | Gezegen: <strong>${arcanaDetail.planet}</strong></p>

        <h3>Güçlü Yönleriniz</h3>
        <ul>${arcanaDetail.positive.map(p => `<li>${p}</li>`).join('')}</ul>

        <h3>Dikkat Etmeniz Gerekenler</h3>
        <ul>${arcanaDetail.negative.map(n => `<li>${n}</li>`).join('')}</ul>

        ${consultantHTML}
    `;

    // Reset scroll
    body.scrollTop = 0;

    document.getElementById('modalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// Auto-format date input
document.getElementById('birthDate').addEventListener('input', function() {
    let val = this.value.replace(/[^0-9.]/g, '');
    if (val.length === 2 && !val.includes('.')) val += '.';
    else if (val.length === 5 && val.charAt(2) === '.' && val.split('.').length === 2) val += '.';
    this.value = val;
    this.classList.remove('error');
});

document.getElementById('birthDate').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') calculateAll();
});

// Auto-format time input (SS:DD)
(function() {
    const timeEl = document.getElementById('birthTime');
    if (!timeEl) return;
    timeEl.addEventListener('input', function() {
        let raw = this.value.replace(/[^0-9]/g, '');
        if (raw.length > 4) raw = raw.slice(0, 4);
        if (raw.length >= 3) {
            this.value = raw.slice(0, 2) + ':' + raw.slice(2);
        } else if (raw.length === 2) {
            this.value = raw + ':';
        } else {
            this.value = raw;
        }
    });
    timeEl.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateAll();
    });
})();

// City autocomplete
(function() {
    const cityEl = document.getElementById('birthCity');
    const dropdown = document.getElementById('cityDropdown');
    if (!cityEl || !dropdown) return;

    cityEl.addEventListener('input', function() {
        const results = searchCities(this.value);
        if (results.length === 0) {
            dropdown.style.display = 'none';
            return;
        }
        dropdown.innerHTML = results.map(c =>
            `<div class="city-option" data-city="${c.name}">${c.name}${c.country !== 'TR' ? ' (' + c.country + ')' : ''}</div>`
        ).join('');
        dropdown.style.display = 'block';
    });

    dropdown.addEventListener('click', function(e) {
        const opt = e.target.closest('.city-option');
        if (opt) {
            cityEl.value = opt.getAttribute('data-city');
            dropdown.style.display = 'none';
        }
    });

    cityEl.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            dropdown.style.display = 'none';
            calculateAll();
        }
    });

    // Close dropdown on outside click
    document.addEventListener('click', function(e) {
        if (!cityEl.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
})();

// Scroll-triggered matrix animation
function initMatrixScrollTrigger() {
    const matrixSection = document.getElementById('matrixSection');
    if (!matrixSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                triggerMatrixAnimations();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    observer.observe(matrixSection);
}

// ============================================================
// LAYER 1: CINEMATIC ENTRANCE SEQUENCE (6-phase ritual)
// ============================================================
// Phase 1: Center light point appears and pulses
// Phase 2: Energy wave expands outward from center
// Phase 3: Connection lines draw with golden ink (stroke offset)
// Phase 4: Node orbs materialize with stagger
// Phase 5: Numbers count from 0 to target with blur-to-clarity
// Phase 6: Letter labels whisper in
// Final:   All nodes briefly flash, then ambient mode begins
function triggerMatrixAnimations() {
    const svg = document.getElementById('matrixSvg');
    if (!svg) return;

    // Mark ambient particles started so we don't double-start
    if (svg.dataset.entranceStarted) return;
    svg.dataset.entranceStarted = '1';

    const lines = Array.from(svg.querySelectorAll('.matrix-line'));
    const nodes = Array.from(svg.querySelectorAll('.node-circle'));
    const centerBurst = svg.querySelector('.matrix-center-burst');
    const centerWave = svg.querySelector('.matrix-center-wave');

    // Start ambient particles immediately (background atmosphere)
    const dustContainer = document.getElementById('matrixDust');
    if (dustContainer) startMatrixAmbientParticles(dustContainer);

    // Animate age periods (entrance from below)
    document.querySelectorAll('.age-period').forEach((el, i) => {
        el.style.animation = `slideInUp 0.6s ease ${3500 + i * 150}ms forwards`;
    });

    // If GSAP not available, use a simpler fallback
    if (!window.gsap) {
        // Reveal everything immediately + start basic animations
        nodes.forEach(n => { n.style.opacity = '1'; });
        lines.forEach(l => {
            l.style.transition = 'stroke-dashoffset 1.5s ease';
            l.style.strokeDashoffset = '0';
        });
        nodes.forEach(n => {
            const numText = n.querySelector('.node-label');
            if (numText) numText.textContent = numText.dataset.target;
            const sublabel = n.querySelector('.node-sublabel');
            if (sublabel) sublabel.style.opacity = '1';
        });
        startEnergyPulses(svg);
        return;
    }

    const tl = gsap.timeline();

    // ----- Phase 1: Center light appears -----
    tl.to(centerBurst, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
        transformOrigin: '300px 350px'
    }, 0);
    tl.to(centerBurst, {
        attr: { r: 60 },
        duration: 0.6,
        ease: 'power2.out'
    }, 0.2);

    // ----- Phase 2: Energy wave expands outward -----
    tl.to(centerWave, {
        opacity: 0.9,
        duration: 0.2
    }, 0.3);
    tl.to(centerWave, {
        attr: { r: 320 },
        opacity: 0,
        duration: 1.4,
        ease: 'power2.out'
    }, 0.3);

    // Fade out the center burst as wave expands
    tl.to(centerBurst, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in'
    }, 1.0);

    // ----- Phase 3: Lines draw with golden ink (sequential, follows wave outward) -----
    lines.forEach((line, idx) => {
        const len = parseFloat(line.dataset.length || 100);
        // Order lines by distance from center (rough proxy: idx)
        const delay = 0.9 + (idx * 0.04);
        tl.to(line, {
            strokeDashoffset: 0,
            duration: 0.8,
            ease: 'power2.out'
        }, delay);
    });

    // ----- Phase 4: Node orbs materialize -----
    // Order from center outward — use distance from (300, 350)
    const sortedNodes = nodes.slice().sort((a, b) => {
        const ka = a.getAttribute('data-key'), kb = b.getAttribute('data-key');
        const pa = NODE_POSITIONS[ka], pb = NODE_POSITIONS[kb];
        const da = Math.hypot(pa.x - 300, pa.y - 350);
        const db = Math.hypot(pb.x - 300, pb.y - 350);
        return da - db;
    });
    sortedNodes.forEach((node, idx) => {
        const delay = 1.6 + (idx * 0.09);
        // Set transform-origin to node center for proper scale
        const k = node.getAttribute('data-key');
        const p = NODE_POSITIONS[k];
        node.style.transformOrigin = `${p.x}px ${p.y}px`;
        tl.fromTo(node,
            { opacity: 0, scale: 0 },
            { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(2)' },
            delay
        );
    });

    // ----- Phase 5: Number counters animate from 0 to target -----
    nodes.forEach((node, idx) => {
        const numText = node.querySelector('.node-label');
        if (!numText) return;
        const target = parseInt(numText.dataset.target || '0');
        const delay = 2.4 + (idx * 0.05);
        const obj = { val: 0 };
        tl.to(obj, {
            val: target,
            duration: 0.6,
            ease: 'power2.out',
            onUpdate: function() { numText.textContent = Math.round(obj.val); }
        }, delay);
    });

    // ----- Phase 6: Letter labels whisper in -----
    const sublabels = nodes.map(n => n.querySelector('.node-sublabel')).filter(Boolean);
    tl.to(sublabels, {
        opacity: 1,
        duration: 0.5,
        stagger: 0.04,
        ease: 'power2.out'
    }, 3.0);

    // ----- Final: All nodes flash simultaneously -----
    const allBgs = nodes.map(n => n.querySelector('.node-bg')).filter(Boolean);
    tl.to(allBgs, {
        attr: { 'stroke-width': 5 },
        duration: 0.25,
        ease: 'sine.out'
    }, 3.6);
    tl.to(allBgs, {
        attr: { 'stroke-width': 2 },
        duration: 0.5,
        ease: 'sine.in',
        onComplete: () => {
            // Start continuous energy pulses on lines
            startEnergyPulses(svg);
        }
    }, 3.85);
}

// Init scroll animations for info cards on page load
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
});
