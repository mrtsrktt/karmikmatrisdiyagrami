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

    const letterMap = {
        A: "A", B: "B", V: "V", G: "G", D: "D", E: "E",
        J: "J", Z: "Z", I: "I", K: "K", L: "L", M: "M", N: "N"
    };

    // Draw lines (initially paused - will animate on scroll)
    NODE_LINES.forEach(([from, to], idx) => {
        const p1 = NODE_POSITIONS[from];
        const p2 = NODE_POSITIONS[to];
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", p1.x);
        line.setAttribute("y1", p1.y);
        line.setAttribute("x2", p2.x);
        line.setAttribute("y2", p2.y);
        line.setAttribute("class", "matrix-line");

        const len = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
        line.style.animation = 'none';
        line.setAttribute("data-anim", `drawLine 1.2s ease ${idx * 60}ms forwards`);
        line.setAttribute("data-from", from);
        line.setAttribute("data-to", to);

        svg.appendChild(line);
    });

    // Draw nodes (initially paused - will animate on scroll)
    const nodeOrder = ["B", "D", "J", "Z", "I", "L", "G", "M", "N", "A", "K", "V", "E"];

    nodeOrder.forEach((key, idx) => {
        const pos = NODE_POSITIONS[key];
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("class", "node-circle");
        g.setAttribute("data-key", key);
        g.style.animation = 'none';
        g.style.opacity = '0';
        g.setAttribute("data-anim-delay", `${800 + idx * 150}ms`);

        // Outer pulse ring
        const pulseCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pulseCircle.setAttribute("cx", pos.x);
        pulseCircle.setAttribute("cy", pos.y);
        pulseCircle.setAttribute("r", 32);
        pulseCircle.setAttribute("fill", "none");
        pulseCircle.setAttribute("stroke", pos.color);
        pulseCircle.setAttribute("stroke-width", "1");
        pulseCircle.setAttribute("class", "node-pulse");
        pulseCircle.style.animationDelay = `${idx * 230}ms`;
        g.appendChild(pulseCircle);

        // Second pulse ring (offset)
        const pulse2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pulse2.setAttribute("cx", pos.x);
        pulse2.setAttribute("cy", pos.y);
        pulse2.setAttribute("r", 35);
        pulse2.setAttribute("fill", "none");
        pulse2.setAttribute("stroke", pos.color);
        pulse2.setAttribute("stroke-width", "0.5");
        pulse2.setAttribute("class", "node-pulse");
        pulse2.style.animationDelay = `${idx * 230 + 1500}ms`;
        g.appendChild(pulse2);

        // Hover glow
        const glowCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        glowCircle.setAttribute("cx", pos.x);
        glowCircle.setAttribute("cy", pos.y);
        glowCircle.setAttribute("r", 40);
        glowCircle.setAttribute("fill", pos.color);
        glowCircle.setAttribute("opacity", "0");
        glowCircle.setAttribute("class", "node-glow");
        g.appendChild(glowCircle);

        // Main circle with gradient
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", 28);
        circle.setAttribute("fill", pos.gradient);
        circle.setAttribute("stroke", "rgba(255,255,255,0.3)");
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute("class", "node-bg");
        g.appendChild(circle);

        // Orbiting particle
        const orbitG = document.createElementNS("http://www.w3.org/2000/svg", "g");
        orbitG.setAttribute("class", "node-orbit");
        orbitG.style.animationDuration = (3 + idx * 0.3) + 's';
        orbitG.style.animationDelay = (idx * 0.2) + 's';
        // We need transform-origin at the node center
        orbitG.setAttribute("transform-origin", `${pos.x} ${pos.y}`);
        orbitG.style.transformOrigin = `${pos.x}px ${pos.y}px`;
        const orbitDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        orbitDot.setAttribute("cx", pos.x + 36);
        orbitDot.setAttribute("cy", pos.y);
        orbitDot.setAttribute("r", 2);
        orbitDot.setAttribute("fill", pos.color);
        orbitDot.setAttribute("opacity", "0.6");
        orbitG.appendChild(orbitDot);
        g.appendChild(orbitG);

        // Number text
        const numText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        numText.setAttribute("x", pos.x);
        numText.setAttribute("y", pos.y + 1);
        numText.setAttribute("class", "node-label");
        numText.setAttribute("dominant-baseline", "middle");
        numText.textContent = posMap[key] || "";
        g.appendChild(numText);

        // Letter label
        const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        labelText.setAttribute("x", pos.x);
        labelText.setAttribute("y", pos.y + 48);
        labelText.setAttribute("class", "node-sublabel");
        labelText.setAttribute("dominant-baseline", "middle");
        labelText.textContent = letterMap[key];
        g.appendChild(labelText);

        g.addEventListener('click', () => openNodeDetail(key, posMap[key]));
        g.addEventListener('mouseenter', () => highlightConnections(key, true));
        g.addEventListener('mouseleave', () => highlightConnections(key, false));

        svg.appendChild(g);
    });
}

// Highlight connected lines
function highlightConnections(nodeKey, active) {
    const svg = document.getElementById('matrixSvg');
    const lines = svg.querySelectorAll('.matrix-line');
    lines.forEach(line => {
        const from = line.getAttribute('data-from');
        const to = line.getAttribute('data-to');
        if (from === nodeKey || to === nodeKey) {
            if (active) {
                line.classList.add('highlight');
            } else {
                line.classList.remove('highlight');
            }
        }
    });
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
        <div class="result-card" data-animate onclick="openNodeDetail('${item.key}', ${item.val})">
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
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;

                const parent = el.parentElement;
                const siblings = parent ? Array.from(parent.querySelectorAll('[data-animate]')) : [];
                const idx = siblings.indexOf(el);
                const delay = idx * 120;

                setTimeout(() => {
                    el.classList.add('visible');
                    el.style.transition = `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)`;

                    const numEl = el.querySelector('.card-num[data-count]');
                    if (numEl) animateCounter(numEl);
                }, delay);

                observer.unobserve(el);
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

    // Build consultant sections if available
    let consultantHTML = '';
    if (arcanaDetail.consultantNote) {
        consultantHTML += `
            <div class="consultant-divider">
                <span>Danışman Rehberi</span>
            </div>

            <div class="consultant-section">
                <h3>Danışmana Not</h3>
                <div class="consultant-note">${arcanaDetail.consultantNote}</div>
            </div>
        `;
    }
    if (arcanaDetail.practicalSolutions && arcanaDetail.practicalSolutions.length) {
        consultantHTML += `
            <div class="consultant-section">
                <h3>Pratik Çözümler ve Öneriler</h3>
                <ol class="practical-solutions">${arcanaDetail.practicalSolutions.map(s => `<li>${s}</li>`).join('')}</ol>
            </div>
        `;
    }
    if (arcanaDetail.detailedReading) {
        const paragraphs = arcanaDetail.detailedReading.split('\n\n').filter(p => p.trim());
        consultantHTML += `
            <div class="consultant-section">
                <h3>Detaylı Yorum (Sade Anlatım)</h3>
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

        <h3>Pozitif Yönler</h3>
        <ul>${arcanaDetail.positive.map(p => `<li>${p}</li>`).join('')}</ul>

        <h3>Dikkat Edilmesi Gerekenler (Gölge Yön)</h3>
        <ul>${arcanaDetail.negative.map(n => `<li>${n}</li>`).join('')}</ul>

        <h3>Farklı Pozisyonlardaki Anlamları</h3>
        <p><strong>Yol Pozisyonunda (A/B/V/G):</strong> ${arcanaDetail.inPath}</p>
        <p><strong>Başarı Pozisyonunda (D/E/J/Z):</strong> ${arcanaDetail.inAchievement}</p>
        <p><strong>Karmik Düğüm Pozisyonunda (I/K/L/M):</strong> ${arcanaDetail.inKarmic}</p>
        <p><strong>Merkez Pozisyonunda (N):</strong> ${arcanaDetail.inCenter}</p>

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

function triggerMatrixAnimations() {
    const svg = document.getElementById('matrixSvg');
    if (!svg) return;

    // Animate lines
    svg.querySelectorAll('.matrix-line[data-anim]').forEach(line => {
        line.style.animation = line.getAttribute('data-anim');
    });

    // Animate nodes
    svg.querySelectorAll('.node-circle[data-anim-delay]').forEach(g => {
        const delay = g.getAttribute('data-anim-delay');
        g.style.animation = `nodeAppear 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay} forwards`;
    });

    // Animate age periods
    document.querySelectorAll('.age-period').forEach((el, i) => {
        el.style.animation = `slideInUp 0.6s ease ${2500 + i * 150}ms forwards`;
    });
}

// Init scroll animations for info cards on page load
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
});
