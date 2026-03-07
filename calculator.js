// ============================================================
// KARMA MATRIX CALCULATOR - Ana Hesaplama ve UI Mantigi
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

// Lines connecting nodes (same as the background image)
const NODE_LINES = [
    // Outer pentagon
    ["B", "D"], ["B", "Z"], ["D", "A"], ["Z", "V"], ["A", "E"], ["V", "E"],
    // Inner connections
    ["B", "J"], ["B", "G"], ["D", "J"], ["D", "I"], ["D", "G"],
    ["Z", "J"], ["Z", "L"], ["Z", "G"],
    ["A", "M"], ["A", "G"], ["A", "K"],
    ["V", "N"], ["V", "G"], ["V", "K"],
    ["E", "K"], ["E", "G"],
    // Inner cross
    ["I", "J"], ["I", "G"], ["I", "M"],
    ["L", "J"], ["L", "G"], ["L", "N"],
    ["M", "G"], ["M", "K"],
    ["N", "G"], ["N", "K"],
    ["J", "K"],
    // Diagonals
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
    for (let i = 0; i < str.length; i++) {
        sum += parseInt(str[i]);
    }
    return sum;
}

function digitRoot(n) {
    let val = n;
    while (val > 9) {
        val = digitSum(val);
    }
    return val;
}

function reduceForExtended(n) {
    // For extended "1" values: sum digits if > 22
    let val = n;
    if (val > 22) {
        val = digitSum(val);
    }
    if (val === 0) val = 22;
    return val;
}

function checkKarmicExtended(n) {
    let val = n;
    if (val > 22) {
        val = digitSum(val);
    }
    if (val === 0) return 22;
    return Math.abs(val);
}

function calculateMatrix() {
    const input = document.getElementById('birthDate');
    const val = input.value.trim();

    // Validate format
    const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const match = val.match(regex);
    if (!match) {
        input.classList.add('error');
        return;
    }
    input.classList.remove('error');

    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    const year = match[3];

    // Validate ranges
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        input.classList.add('error');
        return;
    }

    // === MAIN CALCULATIONS (reduced to 1-22) ===

    // A: Day Arcana
    const rawDay = day;
    const A = check(day);

    // B: Month Arcana
    const rawMonth = month;
    const B = check(month);

    // V: Year Arcana (sum digits of year)
    let yearSum = 0;
    for (let i = 0; i < year.length; i++) {
        yearSum += parseInt(year[i]);
    }
    const rawYear = yearSum;
    const V = check(yearSum);

    // G: Self-realization = A + B + V
    const G = check(A + B + V);

    // D: Achievement 1 = A + B
    const D = check(A + B);

    // E: Achievement 2 = A + V
    const E = check(A + V);

    // J: Achievement 3 = D + E
    const J = check(D + E);

    // Z: Achievement 4 = B + V
    const Z = check(B + V);

    // I: Karmic Knot 1 = |A - B|
    const I = check(A - B);

    // K: Karmic Knot 2 = |A - V|
    const K = check(A - V);

    // L: Karmic Knot 3 = |I - K|
    const L = check(I - K);

    // M: Karmic Knot 4 = |B - V|
    const M = check(B - V);

    // N: Karmic Knot 5 (center) = I + K + L + M
    const N = check(I + K + L + M);

    // === EXTENDED VALUES (unreduced, for second column) ===
    const A1 = rawDay > 22 ? digitSum(rawDay) : rawDay;
    const B1 = rawMonth;
    const V1 = rawYear > 22 ? digitSum(rawYear) : rawYear;

    // G1: sum all digits of full date
    const fullDateStr = match[1] + match[2] + year;
    let fullDateSum = 0;
    for (let i = 0; i < fullDateStr.length; i++) {
        fullDateSum += parseInt(fullDateStr[i]);
    }
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

    // Age periods
    const lifeNum = digitRoot(fullDateSum);
    const period1End = 36 - lifeNum;
    const period2End = period1End + 9;
    const period3End = period2End + 9;

    // Store results
    const results = {
        A, B, V, G, D, E, J, Z, I, K, L, M, N,
        A1, B1, V1, G1, D1, E1, J1, Z1, I1, K1, L1, M1, N1,
        periods: { p1: period1End, p2: period2End, p3: period3End }
    };

    window._matrixResults = results;

    // Render everything
    renderMatrix(results);
    renderAgePeriods(results.periods);
    renderResultCards(results);

    // Show sections
    document.getElementById('matrixSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'block';

    // Scroll to matrix
    document.getElementById('matrixSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- SVG Matrix Rendering ---
function renderMatrix(results) {
    const svg = document.getElementById('matrixSvg');
    svg.innerHTML = '';

    const posMap = {
        A: results.A, B: results.B, V: results.V, G: results.G,
        D: results.D, E: results.E, J: results.J, Z: results.Z,
        I: results.I, K: results.K, L: results.L, M: results.M, N: results.N
    };

    const letterMap = {
        A: "A", B: "B", V: "V", G: "G", D: "D", E: "E",
        J: "J", Z: "Z", I: "I", K: "K", L: "L", M: "M", N: "N"
    };

    // Draw lines
    NODE_LINES.forEach(([from, to]) => {
        const p1 = NODE_POSITIONS[from];
        const p2 = NODE_POSITIONS[to];
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", p1.x);
        line.setAttribute("y1", p1.y);
        line.setAttribute("x2", p2.x);
        line.setAttribute("y2", p2.y);
        line.setAttribute("class", "matrix-line");
        svg.appendChild(line);
    });

    // Draw nodes
    Object.entries(NODE_POSITIONS).forEach(([key, pos]) => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("class", "node-circle");
        g.setAttribute("data-key", key);
        g.style.cursor = "pointer";

        // Determine color
        let fillColor = pos.color;
        const nodeType = pos.type;

        // Circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", 28);
        circle.setAttribute("fill", fillColor);
        circle.setAttribute("stroke", "rgba(255,255,255,0.3)");
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute("class", "node-bg");
        g.appendChild(circle);

        // Number
        const numText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        numText.setAttribute("x", pos.x);
        numText.setAttribute("y", pos.y + 1);
        numText.setAttribute("class", "node-label");
        numText.setAttribute("dominant-baseline", "middle");
        numText.textContent = posMap[key] || "";
        g.appendChild(numText);

        // Letter label below
        const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        labelText.setAttribute("x", pos.x);
        labelText.setAttribute("y", pos.y + 44);
        labelText.setAttribute("class", "node-sublabel");
        labelText.setAttribute("dominant-baseline", "middle");
        labelText.textContent = letterMap[key];
        g.appendChild(labelText);

        // Click handler
        g.addEventListener('click', () => openNodeDetail(key, posMap[key]));

        svg.appendChild(g);
    });
}

// --- Age Periods ---
function renderAgePeriods(periods) {
    const container = document.getElementById('agePeriods');
    container.innerHTML = `
        <div class="age-period">
            <div class="period-label">1. Donem</div>
            <div class="period-range">0 - ${periods.p1} yas</div>
        </div>
        <div class="age-period">
            <div class="period-label">2. Donem</div>
            <div class="period-range">${periods.p1} - ${periods.p2} yas</div>
        </div>
        <div class="age-period">
            <div class="period-label">3. Donem</div>
            <div class="period-range">${periods.p2} - ${periods.p3} yas</div>
        </div>
        <div class="age-period">
            <div class="period-label">4. Donem</div>
            <div class="period-range">${periods.p3}+ yas</div>
        </div>
    `;
}

// --- Result Cards ---
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
        <div class="result-card" onclick="openNodeDetail('${item.key}', ${item.val})">
            <div class="card-num ${type}">${item.val}</div>
            <div class="card-info">
                <div class="card-label">${item.label} - ${item.name}</div>
                <div class="card-name">${arcana}</div>
                <div class="card-arcana">${ARCANA_TAROT_NAMES[item.val] || ''} ${item.ext !== item.val ? '(Ham: ' + item.ext + ')' : ''}</div>
            </div>
            <div class="card-arrow">&#8250;</div>
        </div>
    `;
}

// --- Modal ---
function openNodeDetail(posKey, arcanaNum) {
    const posInfo = POSITION_INFO[posKey];
    const arcanaDetail = ARCANA_DETAILS[arcanaNum];

    if (!posInfo || !arcanaDetail) return;

    document.getElementById('modalArcanaNum').textContent = arcanaNum;
    document.getElementById('modalTitle').textContent = `${arcanaNum}. Arkana: ${arcanaDetail.name}`;
    document.getElementById('modalPosition').textContent = `${posInfo.name} | ${arcanaDetail.tarot}`;

    // Determine which interpretation to use
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
        <ul>
            ${arcanaDetail.positive.map(p => `<li>${p}</li>`).join('')}
        </ul>

        <h3>Dikkat Edilmesi Gerekenler (Golge Yon)</h3>
        <ul>
            ${arcanaDetail.negative.map(n => `<li>${n}</li>`).join('')}
        </ul>

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

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Auto-format date input
document.getElementById('birthDate').addEventListener('input', function(e) {
    let val = this.value.replace(/[^0-9.]/g, '');

    // Auto-add dots
    if (val.length === 2 && !val.includes('.')) {
        val += '.';
    } else if (val.length === 5 && val.charAt(2) === '.' && val.split('.').length === 2) {
        val += '.';
    }

    this.value = val;
    this.classList.remove('error');
});

// Enter key triggers calculation
document.getElementById('birthDate').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') calculateMatrix();
});
