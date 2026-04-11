/* ============================================================
   EĞİTMEN PANELİ — Gizem Hanım canlı eğitim asistanı
   Tamamen istemci tarafı: hiçbir veri kaydedilmez, DB yok.
   Her şey tıklanabilir → anında popup açılır.
   ============================================================ */

// -------- Config --------
const TEACHER_PASSWORD = 'gizem2026';
const GATE_KEY = 'eg_gate_ok';

// -------- Matrix node positions (aynı ana sitedeki gibi) --------
const NODES = {
    B: { x: 300, y: 50,  color: '#f0c040', grad: 'url(#egGradGold)', type: 'path',        label: 'B' },
    D: { x: 100, y: 190, color: '#4de8e0', grad: 'url(#egGradCyan)', type: 'achievement', label: 'D' },
    J: { x: 300, y: 190, color: '#4de8e0', grad: 'url(#egGradCyan)', type: 'achievement', label: 'J' },
    Z: { x: 500, y: 190, color: '#4de8e0', grad: 'url(#egGradCyan)', type: 'achievement', label: 'Z' },
    I: { x: 175, y: 290, color: '#ff6b9d', grad: 'url(#egGradRose)', type: 'karmic',      label: 'I' },
    L: { x: 425, y: 290, color: '#ff6b9d', grad: 'url(#egGradRose)', type: 'karmic',      label: 'L' },
    G: { x: 300, y: 340, color: '#f0c040', grad: 'url(#egGradGold)', type: 'path',        label: 'G' },
    M: { x: 175, y: 400, color: '#ff6b9d', grad: 'url(#egGradRose)', type: 'karmic',      label: 'M' },
    N: { x: 425, y: 400, color: '#ff6b9d', grad: 'url(#egGradRose)', type: 'karmic',      label: 'N' },
    A: { x: 100, y: 480, color: '#f0c040', grad: 'url(#egGradGold)', type: 'path',        label: 'A' },
    K: { x: 300, y: 480, color: '#ff6b9d', grad: 'url(#egGradRose)', type: 'karmic',      label: 'K' },
    V: { x: 500, y: 480, color: '#f0c040', grad: 'url(#egGradGold)', type: 'path',        label: 'V' },
    E: { x: 300, y: 590, color: '#4de8e0', grad: 'url(#egGradCyan)', type: 'achievement', label: 'E' },
};

const LINES = [
    ['B','D'],['B','Z'],['D','A'],['Z','V'],['A','E'],['V','E'],
    ['B','J'],['B','G'],['D','J'],['D','I'],['D','G'],
    ['Z','J'],['Z','L'],['Z','G'],
    ['A','M'],['A','G'],['A','K'],
    ['V','N'],['V','G'],['V','K'],
    ['E','K'],['E','G'],
    ['I','J'],['I','G'],['I','M'],
    ['L','J'],['L','G'],['L','N'],
    ['M','G'],['M','K'],
    ['N','G'],['N','K'],
    ['J','K'],['D','L'],['Z','I'],
    ['A','N'],['V','M'],
];

// -------- Calculation helpers --------
function check(n) {
    if (n > 22) { while (n > 22) n -= 22; return n; }
    if (n < 0) return Math.abs(n);
    if (n === 0) return 22;
    return n;
}
function digitSum(n) {
    let s = Math.abs(n), sum = 0, str = s.toString();
    for (let i = 0; i < str.length; i++) sum += parseInt(str[i]);
    return sum;
}
function digitRoot(n) { let v = n; while (v > 9) v = digitSum(v); return v; }
function reduceExt(n) { let v = n; if (v > 22) v = digitSum(v); if (v === 0) v = 22; return v; }
function checkKarmicExt(n) { let v = n; if (v > 22) v = digitSum(v); if (v === 0) return 22; return Math.abs(v); }

function computeMatrix(day, month, yearStr) {
    const A = check(day);
    const B = check(month);
    let yearSum = 0;
    for (let i = 0; i < yearStr.length; i++) yearSum += parseInt(yearStr[i]);
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

    const A1 = day > 22 ? digitSum(day) : day;
    const B1 = month;
    const V1 = yearSum > 22 ? digitSum(yearSum) : yearSum;

    const fullStr = dayStr + monthStr + yearStr;
    let fullSum = 0;
    for (let i = 0; i < fullStr.length; i++) fullSum += parseInt(fullStr[i]);
    const G1 = fullSum > 22 ? digitSum(fullSum) : fullSum;

    const D1 = reduceExt(A1 + B1);
    const E1 = reduceExt(A1 + V1);
    const J1 = reduceExt(D1 + E1);
    const Z1 = reduceExt(B1 + V1);
    const I1 = checkKarmicExt(A1 - B1);
    const K1 = checkKarmicExt(A1 - V1);
    const L1 = checkKarmicExt(I1 - K1);
    const M1 = checkKarmicExt(B1 - V1);
    const N1 = checkKarmicExt(I1 + K1 + L1 + M1);

    return {
        A, B, V, G, D, E, J, Z, I, K, L, M, N,
        A1, B1, V1, G1, D1, E1, J1, Z1, I1, K1, L1, M1, N1
    };
}

// ============================================================
// PASSWORD GATE
// ============================================================
(function initGate() {
    const ok = sessionStorage.getItem(GATE_KEY) === '1';
    const overlay = document.getElementById('gateOverlay');
    const page    = document.getElementById('egitmenPage');
    if (ok) {
        overlay.style.display = 'none';
        page.style.display = 'block';
        return;
    }
    document.getElementById('gateForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const val = document.getElementById('gatePass').value.trim();
        const err = document.getElementById('gateError');
        if (val === TEACHER_PASSWORD) {
            sessionStorage.setItem(GATE_KEY, '1');
            overlay.style.display = 'none';
            page.style.display = 'block';
        } else {
            err.textContent = 'Geçersiz kod. Tekrar dene.';
            document.getElementById('gatePass').value = '';
        }
    });
})();

document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem(GATE_KEY);
    location.reload();
});

// ============================================================
// MATRIX RENDERING
// ============================================================
const SVG_NS = 'http://www.w3.org/2000/svg';

function renderTeacherMatrix(results) {
    const svg = document.getElementById('teacherMatrixSvg');
    const defs = svg.querySelector('defs');
    svg.innerHTML = '';
    if (defs) svg.appendChild(defs);

    // Lines
    LINES.forEach(([from, to]) => {
        const p1 = NODES[from], p2 = NODES[to];
        const l = document.createElementNS(SVG_NS, 'line');
        l.setAttribute('x1', p1.x);
        l.setAttribute('y1', p1.y);
        l.setAttribute('x2', p2.x);
        l.setAttribute('y2', p2.y);
        l.setAttribute('class', 'eg-line');
        svg.appendChild(l);
    });

    // Nodes
    Object.keys(NODES).forEach(key => {
        const pos = NODES[key];
        const val = results[key];
        const g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('class', 'eg-node-group');
        g.setAttribute('data-key', key);

        // Background circle → opens COLOR popup on click
        const bg = document.createElementNS(SVG_NS, 'circle');
        bg.setAttribute('cx', pos.x);
        bg.setAttribute('cy', pos.y);
        bg.setAttribute('r', 30);
        bg.setAttribute('fill', pos.grad);
        bg.setAttribute('class', 'eg-node-bg');
        bg.addEventListener('click', (e) => {
            e.stopPropagation();
            openPopup('color:' + pos.type);
        });
        g.appendChild(bg);

        // Number text → opens ARCANA popup
        const num = document.createElementNS(SVG_NS, 'text');
        num.setAttribute('x', pos.x);
        num.setAttribute('y', pos.y);
        num.setAttribute('class', 'eg-node-num');
        num.setAttribute('dominant-baseline', 'central');
        num.textContent = val;
        num.addEventListener('click', (e) => {
            e.stopPropagation();
            openPopup('arcana:' + val, { pos: key });
        });
        g.appendChild(num);

        // Letter label → opens POSITION popup
        const lbl = document.createElementNS(SVG_NS, 'text');
        lbl.setAttribute('x', pos.x);
        lbl.setAttribute('y', pos.y + 50);
        lbl.setAttribute('class', 'eg-node-label');
        lbl.setAttribute('dominant-baseline', 'central');
        lbl.textContent = key;
        lbl.addEventListener('click', (e) => {
            e.stopPropagation();
            openPopup('pos:' + key);
        });
        g.appendChild(lbl);

        svg.appendChild(g);
    });
}

// ============================================================
// RESULTS TABLE
// ============================================================
function renderResultsTable(r) {
    // Layout: same 3-column structure as main site
    const rows = [
        [
            { label: 'A - Gün Arkanı',          val: r.A, posKey: 'A' },
            { label: 'D - 1. Başarı Sayısı',    val: r.D, posKey: 'D' },
            { label: 'I - 1. Karmik Düğüm',     val: r.I, posKey: 'I' },
        ],
        [
            { label: 'B - Ay Arkanı',           val: r.B, posKey: 'B' },
            { label: 'E - 2. Başarı Sayısı',    val: r.E, posKey: 'E' },
            { label: 'K - 2. Karmik Düğüm',     val: r.K, posKey: 'K' },
        ],
        [
            { label: 'V - Yıl Arkanı',          val: r.V, posKey: 'V' },
            { label: 'J - 3. Başarı Sayısı',    val: r.J, posKey: 'J' },
            { label: 'L - 3. Karmik Düğüm',     val: r.L, posKey: 'L' },
        ],
        [
            { label: 'G - Kendini Gerçekleştirme', val: r.G, posKey: 'G' },
            { label: 'Z - 4. Başarı Sayısı',       val: r.Z, posKey: 'Z' },
            { label: 'M - 4. Karmik Düğüm',        val: r.M, posKey: 'M' },
        ],
        [
            { label: '', val: null, empty: true },
            { label: '', val: null, empty: true },
            { label: 'N - Yaşam Boyu Karmik',      val: r.N, posKey: 'N' },
        ],
    ];

    const body = document.getElementById('resultsTableBody');
    body.innerHTML = rows.map(row => '<tr>' + row.map(cell => {
        if (cell.empty) return '<td style="opacity:0.35"></td>';
        return `
            <td data-popup="cell:${cell.posKey}">
                <span class="eg-cell-label">${cell.label}</span>
                <span class="eg-cell-num">${cell.val}</span>
            </td>
        `;
    }).join('') + '</tr>').join('');
}

// ============================================================
// CALCULATE ENTRY POINT
// ============================================================
function teacherCalculate() {
    const input = document.getElementById('birthDate');
    const val = input.value.trim();
    const m = val.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!m) {
        input.classList.add('error');
        input.focus();
        return;
    }
    input.classList.remove('error');
    const day = parseInt(m[1]), month = parseInt(m[2]), yearStr = m[3];
    if (day < 1 || day > 31 || month < 1 || month > 12) {
        input.classList.add('error');
        return;
    }

    const results = computeMatrix(day, month, yearStr);
    window._egResults = results;

    renderTeacherMatrix(results);
    renderResultsTable(results);

    document.getElementById('emptySection').style.display = 'none';
    document.getElementById('stageSection').style.display = 'block';
}

document.getElementById('calcBtn').addEventListener('click', teacherCalculate);
document.getElementById('birthDate').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') teacherCalculate();
});

// Quick date buttons
document.querySelectorAll('.eg-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('birthDate').value = btn.dataset.date;
        teacherCalculate();
    });
});

// Auto-format date input
document.getElementById('birthDate').addEventListener('input', function() {
    let v = this.value.replace(/[^\d]/g, '');
    if (v.length >= 5) v = v.slice(0,2) + '.' + v.slice(2,4) + '.' + v.slice(4,8);
    else if (v.length >= 3) v = v.slice(0,2) + '.' + v.slice(2);
    this.value = v;
});

// ============================================================
// POPUP SYSTEM
// ============================================================
const popupEl      = document.getElementById('teacherPopup');
const popupTag     = document.getElementById('popupTag');
const popupTitle   = document.getElementById('popupTitle');
const popupSub     = document.getElementById('popupSubtitle');
const popupBody    = document.getElementById('popupBody');

function closePopup() { popupEl.style.display = 'none'; }
popupEl.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closePopup));
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popupEl.style.display !== 'none') closePopup();
});

// Global delegate for [data-popup] targets (table cells, legend, column headers)
document.addEventListener('click', (e) => {
    const tgt = e.target.closest('[data-popup]');
    if (tgt) {
        const token = tgt.getAttribute('data-popup');
        openPopup(token);
    }
});

/**
 * openPopup(token, opts)
 *   token formats:
 *     'arcana:<n>'    → 22 Arkana numarası için popup
 *     'pos:<KEY>'     → Pozisyon (A, B, G, ...) için popup
 *     'cell:<KEY>'    → Tablo hücresi (pozisyon + değer birleşimi)
 *     'color:<type>'  → path | achievement | karmic
 *     'col:<which>'   → yol | na | kn (tablo sütun başlıkları)
 */
function openPopup(token, opts = {}) {
    const [type, id] = token.split(':');
    const r = window._egResults || null;

    let html = '';
    let tag = '', title = '', subtitle = '';

    if (type === 'arcana') {
        const n = parseInt(id);
        const a = ARCANA_DETAILS[n];
        if (!a) return;
        tag = `${n}. Arkana`;
        title = a.name;
        subtitle = `${a.tarot} ${a.element ? '• ' + a.element : ''} ${a.planet ? '• ' + a.planet : ''}`;
        html = buildArcanaHTML(n, a, opts.pos);
    }
    else if (type === 'pos') {
        const key = id;
        const p = POSITION_INFO[key];
        if (!p) return;
        const val = r ? r[key] : null;
        tag = `Pozisyon: ${key}`;
        title = p.name;
        subtitle = val ? `Bu kartta: <strong style="color:var(--gold-bright)">${val} — ${ARCANA_NAMES[val]}</strong>` : p.description;
        html = buildPositionHTML(p, val);
    }
    else if (type === 'cell') {
        const key = id;
        const p = POSITION_INFO[key];
        if (!p || !r) return;
        const val = r[key];
        const a = ARCANA_DETAILS[val];
        tag = `${key} → ${val}. Arkana`;
        title = `${p.name}`;
        subtitle = `<strong style="color:var(--gold-bright)">${val} — ${ARCANA_NAMES[val]}</strong>`;
        html = buildCellHTML(key, p, val, a);
    }
    else if (type === 'color') {
        const colorInfo = COLOR_MEANINGS[id];
        if (!colorInfo) return;
        tag = 'Renk Anlamı';
        title = colorInfo.title;
        subtitle = colorInfo.subtitle;
        html = buildColorHTML(colorInfo);
    }
    else if (type === 'col') {
        const colInfo = COLUMN_MEANINGS[id];
        if (!colInfo) return;
        tag = 'Sütun Anlamı';
        title = colInfo.title;
        subtitle = colInfo.subtitle;
        html = buildColumnHTML(colInfo);
    }
    else {
        return;
    }

    popupTag.textContent = tag;
    popupTitle.textContent = title;
    popupSub.innerHTML = subtitle;
    popupBody.innerHTML = html;
    popupEl.style.display = 'flex';
    popupEl.querySelector('.eg-popup-dialog').scrollTop = 0;
}

// ============================================================
// POPUP CONTENT BUILDERS
// ============================================================
function esc(s) {
    if (!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function paragraphs(str) {
    if (!str) return '';
    return str.split('\n').filter(x => x.trim()).map(p => `<p>${esc(p)}</p>`).join('');
}

function buildArcanaHTML(n, a, contextPosKey) {
    // Hangi pozisyonda çıktı? → ilgili "nasıl anlat"ı öne çıkar
    let posContext = '';
    if (contextPosKey) {
        const p = POSITION_INFO[contextPosKey];
        let ctx = '';
        if (['A','B','V','G'].includes(contextPosKey)) ctx = a.inPath;
        else if (['D','E','J','Z'].includes(contextPosKey)) ctx = a.inAchievement;
        else if (['I','K','L','M'].includes(contextPosKey)) ctx = a.inKarmic;
        else if (contextPosKey === 'N') ctx = a.inCenter;

        if (ctx && p) {
            posContext = `
                <div class="eg-popup-section">
                    <div class="eg-popup-section-title">
                        <span class="eg-icon">◉</span>
                        Bu Pozisyonda (${p.name})
                    </div>
                    <div class="eg-popup-callout">${esc(ctx)}</div>
                </div>
            `;
        }
    }

    const meta = `
        <div class="eg-popup-meta">
            ${a.element ? `<span><strong>Element:</strong> ${esc(a.element)}</span>` : ''}
            ${a.planet  ? `<span><strong>Gezegen:</strong> ${esc(a.planet)}</span>`  : ''}
        </div>
        ${a.keywords ? `<div class="eg-popup-keywords">${a.keywords.map(k => `<span class="eg-popup-keyword">${esc(k)}</span>`).join('')}</div>` : ''}
    `;

    return `
        ${meta}

        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">☾</span>Anlamı</div>
            <p>${esc(a.general)}</p>
        </div>

        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">+</span>Pozitif Yön</div>
            <ul class="eg-popup-list">
                ${(a.positive || []).map(x => `<li>${esc(x)}</li>`).join('')}
            </ul>
        </div>

        <div class="eg-popup-section">
            <div class="eg-popup-section-title" style="color:var(--crimson)"><span class="eg-icon" style="border-color:var(--crimson); color:var(--crimson)">−</span>Gölge Yön</div>
            <ul class="eg-popup-list shadow">
                ${(a.negative || []).map(x => `<li>${esc(x)}</li>`).join('')}
            </ul>
        </div>

        ${posContext}

        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">✎</span>Nasıl Anlat (Eğitmen Notu)</div>
            <p>${esc(a.consultantNote || '—')}</p>
        </div>

        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">✦</span>Örnek Cümle / Derinlemesine Anlatım</div>
            ${paragraphs(a.detailedReading)}
        </div>

        ${a.practicalSolutions && a.practicalSolutions.length ? `
        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">♦</span>Pratik Öneriler (öğrenciye ver)</div>
            <ul class="eg-popup-list">
                ${a.practicalSolutions.map(x => `<li>${esc(x)}</li>`).join('')}
            </ul>
        </div>` : ''}
    `;
}

function buildPositionHTML(p, val) {
    const a = val ? ARCANA_DETAILS[val] : null;
    let posInterp = '';
    if (a) {
        const k = p.name.split(' ')[0];
        if (['A','B','V','G'].includes(k)) posInterp = a.inPath;
        else if (['D','E','J','Z'].includes(k)) posInterp = a.inAchievement;
        else if (['I','K','L','M'].includes(k)) posInterp = a.inKarmic;
        else if (k === 'N') posInterp = a.inCenter;
    }

    return `
        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">☾</span>Bu Pozisyon Neyi Anlatır</div>
            <p>${esc(p.meaning)}</p>
            <div><strong style="font-family:'Cinzel Decorative',serif; font-size:0.7rem; letter-spacing:0.14em; color:var(--gold-muted); text-transform:uppercase;">Formül:</strong></div>
            <div class="eg-popup-formula">${esc(p.formula)}</div>
        </div>

        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">◎</span>Açıklama</div>
            <p>${esc(p.description)}</p>
        </div>

        ${val && a ? `
        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">✦</span>Bu Kartta ${val} — ${esc(a.name)}</div>
            <div class="eg-popup-callout">${esc(posInterp || a.general)}</div>
            <p style="margin-top:1rem;"><strong style="font-family:'Cinzel Decorative',serif; font-size:0.7rem; letter-spacing:0.14em; color:var(--gold-muted); text-transform:uppercase;">Eğitmen Notu:</strong></p>
            <p>${esc(a.consultantNote || '')}</p>
        </div>` : ''}

        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">✎</span>Öğrenciye Nasıl Anlat</div>
            <p>${esc(POSITION_TEACHING[Object.keys(POSITION_INFO).find(k => POSITION_INFO[k] === p)] || 'Bu pozisyonu öğrencinin yaşamına bağlarken formülü ve anlamını önce sade bir dille açıkla. Sonra çıkan arkananın bu alanla nasıl çalıştığını örnek hayatı üzerinden göster.')}</p>
        </div>
    `;
}

function buildCellHTML(key, p, val, a) {
    return `
        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">☾</span>Pozisyon</div>
            <p>${esc(p.meaning)}</p>
            <div class="eg-popup-formula">${esc(p.formula)}</div>
        </div>

        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">✦</span>${val}. Arkana — ${esc(a ? a.name : '')}</div>
            <p>${esc(a ? a.general : '')}</p>
        </div>

        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">✎</span>Bu Kombinasyonu Nasıl Anlat</div>
            <div class="eg-popup-callout">${esc(
                (['A','B','V','G'].includes(key) ? a.inPath :
                 ['D','E','J','Z'].includes(key) ? a.inAchievement :
                 ['I','K','L','M'].includes(key) ? a.inKarmic :
                 key === 'N' ? a.inCenter : '') || ''
            )}</div>
            <p style="margin-top:1rem;">${esc(a ? a.consultantNote : '')}</p>
        </div>

        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">+</span>Pozitif Yön</div>
            <ul class="eg-popup-list">${(a.positive || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>

        <div class="eg-popup-section">
            <div class="eg-popup-section-title" style="color:var(--crimson)"><span class="eg-icon" style="border-color:var(--crimson); color:var(--crimson)">−</span>Gölge Yön</div>
            <ul class="eg-popup-list shadow">${(a.negative || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
    `;
}

function buildColorHTML(c) {
    return `
        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">☾</span>Ne Anlama Gelir</div>
            <p>${esc(c.meaning)}</p>
        </div>
        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">◎</span>Bu Renkteki Düğümler</div>
            <p>${esc(c.nodes)}</p>
        </div>
        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">✎</span>Nasıl Anlat</div>
            <div class="eg-popup-callout">${esc(c.howToTeach)}</div>
        </div>
        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">✦</span>Örnek Cümle</div>
            <p><em>"${esc(c.sampleLine)}"</em></p>
        </div>
    `;
}

function buildColumnHTML(c) {
    return `
        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">☾</span>Anlamı</div>
            <p>${esc(c.meaning)}</p>
        </div>
        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">◎</span>İçindeki Pozisyonlar</div>
            <p>${esc(c.contains)}</p>
        </div>
        <div class="eg-popup-section">
            <div class="eg-popup-section-title"><span class="eg-icon">✎</span>Öğrenciye Nasıl Anlat</div>
            <div class="eg-popup-callout">${esc(c.howToTeach)}</div>
        </div>
    `;
}

// ============================================================
// TEACHER-ONLY CONTENT (renk, sütun, pozisyon öğretim notları)
// Ses tonu: karmikmatrisdiyagrami.vercel.app'teki eğitmen sesi
// ============================================================
const COLOR_MEANINGS = {
    path: {
        title: 'Altın Düğümler — Yol / Temel Enerjiler',
        subtitle: 'Kişinin karakterinin dört ana sütunu',
        meaning: 'Altın renkteki düğümler, kişinin hayatının temel yolunu oluşturan dört kilit enerjiyi temsil eder: Gün (A), Ay (B), Yıl (V) ve Kendini Gerçekleştirme (G). Bunlar kişinin karakterinin özüdür; dış dünyaya nasıl göründüğünü, duygusal doğasını, geçmiş yaşamlardan taşıdığı kalıpları ve bu yaşamdaki misyonunu gösterir. Altın renk, bu enerjilerin "yaşam iskeleti" olduğunu simgeler — onlar olmadan matrisin geri kalanı anlamlı olmaz.',
        nodes: 'A (Gün Arkanı), B (Ay Arkanı), V (Yıl Arkanı), G (Kendini Gerçekleştirme). Matristeki üstte, ortada ve altta yer alan sarı-altın düğümler.',
        howToTeach: 'Öğrenciye şunu söyle: "Bu dört altın düğüm kişinin DNA\'sı gibi. A karakterinin nasıl göründüğünü, B duygularını, V geçmiş yaşam yüklerini, G ise neden bu dünyaya geldiğini gösterir. Bir haritayı okumaya her zaman bu dördünden başlarız çünkü diğer her şey bunların üzerine inşa edilir."',
        sampleLine: 'Bu kişinin altın yolunu önce oku: Kim olduğu, nasıl hissettiği, geçmişten ne taşıdığı ve hayattaki görevi — hepsi burada yazılı.',
    },
    achievement: {
        title: 'Mavi Düğümler — Başarı Sayıları / Potansiyel',
        subtitle: 'Hayatın dört döneminde gelişecek yetenekler',
        meaning: 'Mavi düğümler, kişinin yaşam boyunca dört dönemde geliştirmesi gereken yeteneklerini ve başarı alanlarını temsil eder: D (1. dönem / gençlik), E (2. dönem / yetişkinlik), J (3. dönem / olgunluk), Z (4. dönem / bilgelik). Bunlar kişinin "doğal potansiyelidir" — ulaşmak zorunda değildir, ama çalışırsa hayatı muazzam bir dönüşüme uğrar. Mavi renk, gökyüzü ve suyun akışını simgeler; yani potansiyelin sürekli akan doğasını.',
        nodes: 'D, E, J, Z. Matriste üçgeni oluşturan cyan-turkuaz renkli düğümler.',
        howToTeach: 'Öğrenciye şunu anlat: "Mavi düğümler sana \'ne yapmak zorunda olduğunu\' değil, \'ne yapabileceğini\' söyler. Her biri bir yaşam dönemine denk gelir. İlk dönemin D, son dönemin Z. Bu düğümlerdeki sayılar, o dönemde keşfetmen gereken yetenekleri ve odağı gösterir. Altın sana kim olduğunu söylerse, mavi sana ne kadar büyüyebileceğini söyler."',
        sampleLine: 'Bu kişinin mavi düğümlerindeki sayılar onun doğal yetenek hazinesi — bu kapıları açmak, bu yaşamdaki büyüme yolculuğu.',
    },
    karmic: {
        title: 'Gül Düğümler — Karmik Düğümler / Dersler',
        subtitle: 'Geçmiş yaşamlardan gelen, çözülmesi gereken kalıplar',
        meaning: 'Gül (rose) renkteki düğümler kişinin en hassas ve en önemli alanlarıdır: I, K, L, M karmik düğümleri ve merkezdeki N yaşam boyu karmik ders. Bu düğümler, kişinin geçmiş yaşamlardan taşıdığı çözülmemiş kalıpları, karşılaşacağı iç çatışmaları ve büyümek için çözmesi gereken dersleri temsil eder. Gül rengi, hem bir yaranın hem de o yaranın şifasının rengidir — dolayısıyla bu düğümler sadece "zorluk" değil, "en büyük dönüşüm fırsatı" olarak okunmalıdır.',
        nodes: 'I, K, L, M (dönem karmik düğümleri) ve N (merkez — tüm yaşam boyu süren ana karmik ders). Matristeki pembe-gül renkli düğümler.',
        howToTeach: 'Öğrenciye şunu net anlat: "Gül düğümler \'kötü\' değildir — en büyük hediye oradadır. Geçmiş yaşamlardan getirdiğin, çözülmemiş kalıplar burada yazılıdır. Bunlarla çalışmak acı verebilir ama en derin dönüşüm de buradan gelir. Merkezdeki N özellikle önemlidir; tüm yaşamını kapsayan ana dersindir. Diğer karmik düğümler \'dönem dersleri\' iken N ömür boyu çalışılır."',
        sampleLine: 'Bu kişinin gül düğümleri ona ne engel çıkaracağını değil, hangi alanda en çok büyüyeceğini söylüyor. En ağır ders aynı zamanda en büyük armağandır.',
    },
};

const COLUMN_MEANINGS = {
    yol: {
        title: 'Yol — Temel Arkanlar',
        subtitle: 'Karakterin dört sütunu',
        meaning: 'Yol sütunu, kişinin doğuşsal karakterini ve hayat görevini oluşturan dört temel enerjiyi içerir. Bunlar altın düğümlere karşılık gelir ve matris okumasının başlangıç noktasıdır.',
        contains: 'A (Gün Arkanı) + B (Ay Arkanı) + V (Yıl Arkanı) + G (Kendini Gerçekleştirme). Her biri bir karakter boyutu: dış yansıma, duygusal doğa, geçmiş yaşam kalıbı ve yaşam misyonu.',
        howToTeach: 'Her okumaya buradan başla. "Kimsin, neyi hissediyorsun, geçmişten ne taşıyorsun, ne için buradasın?" Yolu anlattıktan sonra öğrenci kendini "tanınmış" hisseder — ancak o zaman diğer sütunlara geçebilirsin.',
    },
    na: {
        title: 'Başarı Sayıları (NA)',
        subtitle: 'Dört yaşam dönemindeki potansiyel',
        meaning: 'NA sütunu kişinin hayatı boyunca dört döneme yayılmış yetenek ve başarı alanlarını gösterir. Yol sana kim olduğunu söylerse, NA sana ne kadar büyüyebileceğini söyler. Bunlar "doğal armağanlardır" — geliştirilirse muazzam sonuç verirler.',
        contains: 'D (1. dönem — gençlik, A+B), E (2. dönem — yetişkinlik, A+V), J (3. dönem — olgunluk, D+E), Z (4. dönem — bilgelik, B+V).',
        howToTeach: 'Öğrenciye "bu dönemde hangi yeteneği çalışman gerek?" sorusunun cevabını ver. NA, karmik düğümlerin aksine "yapmak zorunda değilsin ama yaparsan çiçek açarsın" enerjisidir. Tonun burada daha umutlu ve yüreklendirici olsun.',
    },
    kn: {
        title: 'Karmik Düğümler (KN)',
        subtitle: 'Çözülmesi gereken kalıplar ve en büyük armağan',
        meaning: 'KN sütunu kişinin geçmiş yaşamlardan getirdiği çözülmemiş enerjileri, iç çatışmaları ve yüzleşmesi gereken dersleri içerir. En merkezdeki N düğümü ömür boyu süren ana karmik dersi temsil eder; diğerleri dönem derslerdir.',
        contains: 'I (|A-B|, 1. dönem dersi), K (|A-V|, 2. dönem), L (|I-K|, 3. dönem), M (|B-V|, 4. dönem), N (I+K+L+M, merkez — yaşam boyu).',
        howToTeach: 'Bu sütunu okurken öğrenciyi asla "kötü haber veriyormuş" gibi hissetme. Her karmik düğüm bir açılım noktasıdır. "Bu senin en çok büyüyeceğin alan" de. N özellikle derin bir duyguyla anlatılmalı — tüm yaşam boyu çalışılacak kısım burasıdır.',
    },
};

// Her pozisyon için kısa öğretim notu (egitmen-only, ana sitede yok)
const POSITION_TEACHING = {
    A: 'A pozisyonunu anlatırken öğrenciye "dünyaya nasıl görünüyorsun, ilk izlenimin ne?" sorusunu sor. Bu düğüm değişmez — kişinin doğuşsal maskesidir. Çıkan arkananın özelliklerini doğrudan karakter tanımı olarak ver.',
    B: 'B sosyal ve duygusal kimliği anlatır. "İlişkilerinde nasılsın, duygularını nasıl yönetiyorsun?" sorusuyla aç. A\'dan farkını vurgula: A dışarıya ne gösterdiğimiz, B ise içimizde neyi hissettiğimizdir.',
    V: 'V çok dikkatli anlatılmalı. Geçmiş yaşamlardan gelen kalıpları temsil eder. "Hiç hiçbir sebep yokken içinde hissettiğin bir ağırlık var mı?" sorusuyla öğrencide rezonans yarat. Yargılayıcı olma — V sadece bir yüktür, çözülmesi gereken bir kalıptır.',
    G: 'G matrisin taç düğümüdür. Bu yaşamdaki asıl görevi gösterir. "Neden buradasın?" sorusunun cevabıdır. A+B+V\'nin toplamıdır çünkü tüm karakter boyutların bu hedefe hizmet eder. Öğrenciye G\'yi anlatırken sesini yumuşat — bu bir "açığa çıkma" anıdır.',
    D: 'D ilk yaşam döneminin (genellikle 0-28 yaş civarı) potansiyelidir. A+B formülünden türer: günlük karakter + duygusal doğanın birleşimi. Öğrenciye "gençken neyi keşfetmen gerekiyordu?" sorusunu sor. Geçmişe bakma egzersizi olarak kullan.',
    E: 'E ikinci dönemin potansiyelidir. A+V formülünden türer: karakter + geçmiş yaşam karmalarının birleşimi. Bu dönem genellikle en karmaşık olanıdır çünkü kişi hem kendi kimliğiyle hem de geçmiş yaşam yüküyle uğraşır.',
    J: 'J üçüncü dönemin olgunluğudur (D+E). İlk iki dönemin sentezidir — kişi burada kim olduğunu artık biliyordur, ama hâlâ ustalaşması gereken boyutlar vardır. "Olgunluk dönemin ne gerektiriyor?" sorusuyla aç.',
    Z: 'Z son dönemin bilgeliğidir (B+V). Sosyal doğa + karmik yükün birleşimi; yani kişinin hayatın sonunda topluma bırakacağı miras. Yaşlılık bilgeliği olarak okunur.',
    I: 'I ilk karmik düğümdür. |A-B| formülü önemli: karakter ile duygusal doğa arasındaki gerilim. Bu düğüm gençlikte çözülmesi gereken iç çatışmayı gösterir. "Gençken hangi iç savaşı yaşadın?" sorusuyla aç.',
    K: 'K ikinci karmik düğümdür. |A-V| formülü: karakter ile geçmiş yaşam arasındaki gerilim. Bu düğüm yetişkinlikte en çok baskı yapan karmik temadır. Öğrenciyi bu alana yavaşça yönlendir — K genellikle kişinin en savunmacı olduğu alandır.',
    L: 'L üçüncü karmik düğümdür ve |I-K| formülünden türer. Yani önceki iki karmik düğümün çatışmasıdır — daha derin, daha ince bir temadır. Burada öğrenciye "önceki iki sorunun kesişim noktası" olarak anlat.',
    M: 'M dördüncü karmik düğümdür. |B-V| formülü: duygusal doğa + geçmiş yaşam yükü. Genellikle yaşlılıkta çözülür; bu dönemde kişi duygusal ve karmik bagajı bütünleştirir.',
    N: 'N merkez düğümdür — matrisin kalbidir. Tüm karmik düğümlerin toplamıdır ve yaşam boyu süren ana karmik dersi gösterir. Bunu anlatırken sesini yavaşlatıyorsun, çünkü bu kişinin "neden buraya geldiğinin" en derin katmanıdır. G ile birlikte okunmalı: G misyon, N ders.',
};

// ============================================================
// SEARCH
// ============================================================
const searchBox = document.getElementById('searchBox');
const searchResults = document.getElementById('searchResults');

function runSearch(q) {
    q = q.trim().toLowerCase();
    if (!q) { searchResults.classList.remove('open'); return; }

    const items = [];

    // Arkana numaraları
    for (let n = 1; n <= 22; n++) {
        const a = ARCANA_DETAILS[n];
        if (!a) continue;
        const hay = (n + ' ' + a.name + ' ' + a.tarot + ' ' + (a.keywords || []).join(' ')).toLowerCase();
        if (hay.includes(q)) {
            items.push({
                token: 'arcana:' + n,
                tag: n + '. Arkana',
                text: a.name + ' — ' + a.tarot,
            });
        }
    }

    // Pozisyonlar
    Object.keys(POSITION_INFO).forEach(k => {
        const p = POSITION_INFO[k];
        const hay = (k + ' ' + p.name + ' ' + p.description + ' ' + p.fullName).toLowerCase();
        if (hay.includes(q)) {
            items.push({ token: 'pos:' + k, tag: 'Pozisyon', text: p.name });
        }
    });

    // Renkler
    Object.keys(COLOR_MEANINGS).forEach(k => {
        const c = COLOR_MEANINGS[k];
        if ((c.title + ' ' + c.meaning).toLowerCase().includes(q)) {
            items.push({ token: 'color:' + k, tag: 'Renk', text: c.title });
        }
    });

    // Sütunlar
    Object.keys(COLUMN_MEANINGS).forEach(k => {
        const c = COLUMN_MEANINGS[k];
        if ((c.title + ' ' + c.meaning).toLowerCase().includes(q)) {
            items.push({ token: 'col:' + k, tag: 'Sütun', text: c.title });
        }
    });

    if (!items.length) {
        searchResults.innerHTML = '<div class="eg-search-empty">Sonuç bulunamadı.</div>';
    } else {
        searchResults.innerHTML = items.slice(0, 40).map(it =>
            `<button class="eg-search-result" data-token="${it.token}">
                <span class="eg-search-result-tag">${it.tag}</span>${esc(it.text)}
            </button>`
        ).join('');
    }
    searchResults.classList.add('open');
}

searchBox.addEventListener('input', (e) => runSearch(e.target.value));
searchBox.addEventListener('focus', (e) => {
    if (e.target.value) runSearch(e.target.value);
});
document.addEventListener('click', (e) => {
    if (!e.target.closest('.eg-search-wrap')) {
        searchResults.classList.remove('open');
    }
});
searchResults.addEventListener('click', (e) => {
    const btn = e.target.closest('.eg-search-result');
    if (!btn) return;
    const token = btn.dataset.token;
    searchResults.classList.remove('open');
    searchBox.value = '';
    openPopup(token);
});
