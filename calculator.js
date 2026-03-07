// ============================================================
// KARMA MATRIX CALCULATOR - Ana Hesaplama ve Animasyonlu UI
// ============================================================

// --- Node positions for SVG diagram ---
const NODE_POSITIONS = {
    B: { x: 300, y: 50,  color: "#e8a838", type: "path" },
    D: { x: 100, y: 190, color: "#4ade80", type: "achievement" },
    J: { x: 300, y: 190, color: "#4ade80", type: "achievement" },
    Z: { x: 500, y: 190, color: "#4ade80", type: "achievement" },
    I: { x: 175, y: 290, color: "#fb923c", type: "karmic" },
    L: { x: 425, y: 290, color: "#fb923c", type: "karmic" },
    G: { x: 300, y: 340, color: "#e8a838", type: "path" },
    M: { x: 175, y: 400, color: "#fb923c", type: "karmic" },
    N: { x: 425, y: 400, color: "#fb923c", type: "karmic" },
    A: { x: 100, y: 480, color: "#e8a838", type: "path" },
    K: { x: 300, y: 480, color: "#fb923c", type: "karmic" },
    V: { x: 500, y: 480, color: "#e8a838", type: "path" },
    E: { x: 300, y: 590, color: "#4ade80", type: "achievement" }
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

// --- Calculation logic (unchanged) ---
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

function calculateMatrix() {
    const input = document.getElementById('birthDate');
    const val = input.value.trim();

    const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const match = val.match(regex);
    if (!match) { input.classList.add('error'); return; }
    input.classList.remove('error');

    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    const year = match[3];

    if (month < 1 || month > 12 || day < 1 || day > 31) { input.classList.add('error'); return; }

    const rawDay = day;
    const A = check(day);
    const rawMonth = month;
    const B = check(month);

    let yearSum = 0;
    for (let i = 0; i < year.length; i++) yearSum += parseInt(year[i]);
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

    const A1 = rawDay > 22 ? digitSum(rawDay) : rawDay;
    const B1 = rawMonth;
    const V1 = rawYear > 22 ? digitSum(rawYear) : rawYear;

    const fullDateStr = match[1] + match[2] + year;
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

    const results = {
        A, B, V, G, D, E, J, Z, I, K, L, M, N,
        A1, B1, V1, G1, D1, E1, J1, Z1, I1, K1, L1, M1, N1,
        periods: { p1: period1End, p2: period2End, p3: period3End }
    };

    window._matrixResults = results;

    renderMatrix(results);
    renderAgePeriods(results.periods);
    renderResultCards(results);

    document.getElementById('matrixSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsDivider').style.display = 'block';

    document.getElementById('matrixSection').scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Trigger scroll animations after render
    requestAnimationFrame(() => initScrollAnimations());
}

// --- Animated SVG Matrix Rendering ---
function renderMatrix(results) {
    const svg = document.getElementById('matrixSvg');
    // Keep defs
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

    // Draw lines with staggered animation
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
        line.style.animation = `drawLine 0.8s ease ${idx * 30}ms forwards`;
        line.setAttribute("data-from", from);
        line.setAttribute("data-to", to);

        svg.appendChild(line);
    });

    // Draw nodes with staggered entrance
    const nodeOrder = ["B", "D", "J", "Z", "I", "L", "G", "M", "N", "A", "K", "V", "E"];

    nodeOrder.forEach((key, idx) => {
        const pos = NODE_POSITIONS[key];
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("class", "node-circle");
        g.setAttribute("data-key", key);
        g.style.animationDelay = `${600 + idx * 80}ms`;

        // Glow pulse circle (behind)
        const pulseCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pulseCircle.setAttribute("cx", pos.x);
        pulseCircle.setAttribute("cy", pos.y);
        pulseCircle.setAttribute("r", 32);
        pulseCircle.setAttribute("fill", "none");
        pulseCircle.setAttribute("stroke", pos.color);
        pulseCircle.setAttribute("stroke-width", "1");
        pulseCircle.setAttribute("class", "node-pulse");
        pulseCircle.style.animationDelay = `${idx * 200}ms`;
        g.appendChild(pulseCircle);

        // Hover glow
        const glowCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        glowCircle.setAttribute("cx", pos.x);
        glowCircle.setAttribute("cy", pos.y);
        glowCircle.setAttribute("r", 38);
        glowCircle.setAttribute("fill", pos.color);
        glowCircle.setAttribute("opacity", "0");
        glowCircle.setAttribute("class", "node-glow");
        g.appendChild(glowCircle);

        // Main circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", 28);
        circle.setAttribute("fill", pos.color);
        circle.setAttribute("stroke", "rgba(255,255,255,0.25)");
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute("class", "node-bg");
        g.appendChild(circle);

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
        labelText.setAttribute("y", pos.y + 46);
        labelText.setAttribute("class", "node-sublabel");
        labelText.setAttribute("dominant-baseline", "middle");
        labelText.textContent = letterMap[key];
        g.appendChild(labelText);

        // Click handler
        g.addEventListener('click', () => openNodeDetail(key, posMap[key]));

        // Hover: highlight connected lines
        g.addEventListener('mouseenter', () => highlightConnections(key, true));
        g.addEventListener('mouseleave', () => highlightConnections(key, false));

        svg.appendChild(g);
    });
}

// Highlight connected lines on node hover
function highlightConnections(nodeKey, active) {
    const svg = document.getElementById('matrixSvg');
    const lines = svg.querySelectorAll('.matrix-line');
    lines.forEach(line => {
        const from = line.getAttribute('data-from');
        const to = line.getAttribute('data-to');
        if (from === nodeKey || to === nodeKey) {
            line.style.stroke = active ? 'rgba(167, 139, 250, 0.5)' : '';
            line.style.strokeWidth = active ? '2.5' : '';
            line.style.filter = active ? 'drop-shadow(0 0 4px rgba(127,90,240,0.4))' : '';
        }
    });
}

// --- Age Periods with staggered animation ---
function renderAgePeriods(periods) {
    const container = document.getElementById('agePeriods');
    const data = [
        { label: "1. Donem", range: `0 - ${periods.p1} yas` },
        { label: "2. Donem", range: `${periods.p1} - ${periods.p2} yas` },
        { label: "3. Donem", range: `${periods.p2} - ${periods.p3} yas` },
        { label: "4. Donem", range: `${periods.p3}+ yas` },
    ];
    container.innerHTML = data.map((d, i) =>
        `<div class="age-period" style="animation-delay: ${1200 + i * 150}ms">
            <div class="period-label">${d.label}</div>
            <div class="period-range">${d.range}</div>
        </div>`
    ).join('');
}

// --- Result Cards with staggered entrance ---
function renderResultCards(results) {
    const pathKeys = [
        { key: 'A', label: 'A', name: 'Gun Arkani', val: results.A, ext: results.A1 },
        { key: 'B', label: 'B', name: 'Ay Arkani', val: results.B, ext: results.B1 },
        { key: 'V', label: 'V', name: 'Yil Arkani', val: results.V, ext: results.V1 },
        { key: 'G', label: 'G', name: 'Kendini Gerceklestirme', val: results.G, ext: results.G1 }
    ];
    const achieveKeys = [
        { key: 'D', label: 'D', name: '1. Basari Sayisi', val: results.D, ext: results.D1 },
        { key: 'E', label: 'E', name: '2. Basari Sayisi', val: results.E, ext: results.E1 },
        { key: 'J', label: 'J', name: '3. Basari Sayisi', val: results.J, ext: results.J1 },
        { key: 'Z', label: 'Z', name: '4. Basari Sayisi', val: results.Z, ext: results.Z1 }
    ];
    const karmicKeys = [
        { key: 'I', label: 'I', name: '1. Karmik Dugum', val: results.I, ext: results.I1 },
        { key: 'K', label: 'K', name: '2. Karmik Dugum', val: results.K, ext: results.K1 },
        { key: 'L', label: 'L', name: '3. Karmik Dugum', val: results.L, ext: results.L1 },
        { key: 'M', label: 'M', name: '4. Karmik Dugum', val: results.M, ext: results.M1 },
        { key: 'N', label: 'N', name: 'Yasam Boyu Karmik Ders', val: results.N, ext: results.N1 }
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

                // Stagger delay based on sibling index
                const parent = el.parentElement;
                const siblings = parent ? Array.from(parent.querySelectorAll('[data-animate]')) : [];
                const idx = siblings.indexOf(el);
                const delay = idx * 100;

                setTimeout(() => {
                    el.classList.add('visible');
                    el.style.transition = `opacity 0.6s ease, transform 0.6s ease`;

                    // Number counter animation for card-num
                    const numEl = el.querySelector('.card-num[data-count]');
                    if (numEl) animateCounter(numEl);
                }, delay);

                observer.unobserve(el);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

// Number counting animation
function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'));
    const duration = 600;
    const start = performance.now();

    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
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

    const body = document.getElementById('modalBody');
    body.innerHTML = `
        <div class="formula-box">
            <strong>Pozisyon:</strong> ${posInfo.fullName}<br>
            <strong>Formul:</strong> ${posInfo.formula}
        </div>

        <h3>Bu Pozisyonun Anlami</h3>
        <p>${posInfo.meaning}</p>

        <h3>Bu Pozisyondaki Yorum (${arcanaNum}. Arkana)</h3>
        <p>${posInterpretation}</p>

        <h3>Genel Arkana Anlami</h3>
        <p>${arcanaDetail.general}</p>

        <h3>Anahtar Kelimeler</h3>
        <p>${arcanaDetail.keywords.map(k => `<span class="tag-positive">${k}</span>`).join(' ')}</p>

        <h3>Element & Gezegen</h3>
        <p>Element: <strong>${arcanaDetail.element}</strong> | Gezegen: <strong>${arcanaDetail.planet}</strong></p>

        <h3>Pozitif Yonler</h3>
        <ul>${arcanaDetail.positive.map(p => `<li>${p}</li>`).join('')}</ul>

        <h3>Dikkat Edilmesi Gerekenler (Golge Yon)</h3>
        <ul>${arcanaDetail.negative.map(n => `<li>${n}</li>`).join('')}</ul>

        <h3>Farkli Pozisyonlardaki Anlamlari</h3>
        <p><strong>Yol Pozisyonunda (A/B/V/G):</strong> ${arcanaDetail.inPath}</p>
        <p><strong>Basari Pozisyonunda (D/E/J/Z):</strong> ${arcanaDetail.inAchievement}</p>
        <p><strong>Karmik Dugum Pozisyonunda (I/K/L/M):</strong> ${arcanaDetail.inKarmic}</p>
        <p><strong>Merkez Pozisyonunda (N):</strong> ${arcanaDetail.inCenter}</p>
    `;

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
    if (e.key === 'Enter') calculateMatrix();
});

// Init scroll animations for info cards on page load
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
});
