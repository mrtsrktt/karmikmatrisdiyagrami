// ============================================================
// PDF TEMPLATE — pdfmake document definition builder
// ============================================================
// Tarayıcı tarafında çalışır. window.pdfMake nesnesi global olmalı.
// PDF_POSITION_INFO ve PDF_ARCANA_NAMES de global olarak gelir.

(function () {
  'use strict';

  // ----- Renk paleti (CLAUDE.md mistik lüks tonu) -----
  const COLORS = {
    bgDeep:        '#050308',
    bgBase:        '#0A0612',
    bgSurface:     '#110D1A',
    bgElevated:    '#1A1428',
    goldBright:    '#D4AF37',
    goldMuted:     '#8B7536',
    amethyst:      '#9B59B6',
    crimson:       '#8B1A2E',
    celestial:     '#4A90D9',
    textPrimary:   '#F0E6D3',
    textSecondary: '#A89070',
    textMuted:     '#5C4A3A',
    cardBg:        '#1A1428',
    border:        '#8B7536',
  };

  // ----- Karmik matris düğüm konumları (calculator.js'ten birebir) -----
  const NODE_POSITIONS = {
    B: { x: 300, y: 50,  type: 'path' },
    D: { x: 100, y: 190, type: 'achievement' },
    J: { x: 300, y: 190, type: 'achievement' },
    Z: { x: 500, y: 190, type: 'achievement' },
    I: { x: 175, y: 290, type: 'karmic' },
    L: { x: 425, y: 290, type: 'karmic' },
    G: { x: 300, y: 340, type: 'path' },
    M: { x: 175, y: 400, type: 'karmic' },
    N: { x: 425, y: 400, type: 'karmic' },
    A: { x: 100, y: 480, type: 'path' },
    K: { x: 300, y: 480, type: 'karmic' },
    V: { x: 500, y: 480, type: 'path' },
    E: { x: 300, y: 590, type: 'achievement' },
  };

  const NODE_LINES = [
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
    ['J','K'],
    ['D','L'],['Z','I'],
    ['A','N'],['V','M'],
  ];

  function nodeColor(type) {
    if (type === 'path')        return '#D4AF37';  // gold
    if (type === 'achievement') return '#7EB8DA';  // cyan
    if (type === 'karmic')      return '#D4507A';  // rose
    return '#F0E6D3';
  }

  // Build the matrix diagram as an SVG string for pdfmake
  function buildMatrixSVG(matrixResults) {
    const m = matrixResults;
    const values = { A:m.A,B:m.B,V:m.V,G:m.G,D:m.D,E:m.E,J:m.J,Z:m.Z,I:m.I,K:m.K,L:m.L,M:m.M,N:m.N };
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" width="600" height="700">';

    // Background
    svg += '<rect width="600" height="700" fill="#0A0612"/>';

    // Lines
    for (const [from, to] of NODE_LINES) {
      const p1 = NODE_POSITIONS[from];
      const p2 = NODE_POSITIONS[to];
      svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="rgba(212,175,55,0.25)" stroke-width="0.8"/>`;
    }

    // Nodes
    for (const [key, pos] of Object.entries(NODE_POSITIONS)) {
      const color = nodeColor(pos.type);
      const value = values[key];
      svg += `<circle cx="${pos.x}" cy="${pos.y}" r="28" fill="${color}" stroke="#F0E6D3" stroke-width="2"/>`;
      // Use Helvetica (PDF standard font, no TTF needed) for SVG text
      svg += `<text x="${pos.x}" y="${pos.y + 7}" text-anchor="middle" font-family="Helvetica" font-size="22" font-weight="bold" fill="#0A0612">${value}</text>`;
      svg += `<text x="${pos.x}" y="${pos.y + 50}" text-anchor="middle" font-family="Helvetica" font-size="14" fill="#A89070">${key}</text>`;
    }

    svg += '</svg>';
    return svg;
  }

  // Convert long narrative text into pdfmake content blocks (paragraphs).
  function summaryToContent(summaryText) {
    if (!summaryText) return [];
    const paragraphs = summaryText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    return paragraphs.map(p => ({
      text: p,
      style: 'narrative',
      margin: [0, 0, 0, 14],
    }));
  }

  // Build position cards section (13 cards, A-N)
  function buildPositionCards(matrixResults) {
    const m = matrixResults;
    const POSITION_KEYS = ['A','B','V','G','D','E','J','Z','I','K','L','M','N'];
    const POSITION_INFO = window.PDF_POSITION_INFO;
    const ARCANA_NAMES = window.PDF_ARCANA_NAMES;

    const cards = [];
    for (const key of POSITION_KEYS) {
      const info = POSITION_INFO[key];
      const value = m[key];
      const arcanaName = ARCANA_NAMES[value] || '';

      cards.push({
        table: {
          widths: ['*'],
          body: [[
            {
              stack: [
                // Header row: position name on left, value on right
                {
                  columns: [
                    { text: info.name, style: 'cardTitle', width: '*' },
                    { text: String(value), style: 'cardNumber', width: 'auto', alignment: 'right' },
                  ],
                  margin: [0, 0, 0, 4],
                },
                // Arcana name
                { text: arcanaName, style: 'cardArcana', margin: [0, 0, 0, 8] },
                // Formula
                { text: 'Formül: ' + info.formula, style: 'cardFormula', margin: [0, 0, 0, 8] },
                // Meaning (2nd person)
                { text: info.meaning, style: 'cardBody' },
              ],
              fillColor: COLORS.bgSurface,
              margin: [12, 12, 12, 12],
            }
          ]],
        },
        layout: {
          hLineColor: () => COLORS.goldMuted,
          vLineColor: () => COLORS.goldMuted,
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          paddingTop: () => 0,
          paddingBottom: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
        },
        margin: [0, 0, 0, 10],
      });
    }
    return cards;
  }

  // Format current date as DD Month YYYY (Turkish)
  function formatDateTR(d) {
    const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    const dt = d || new Date();
    return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
  }

  // Main builder: returns a pdfmake docDefinition
  function buildPDFDocument(birthDate, matrixResults, summaryText) {
    const m = matrixResults;
    const p = m.periods;

    const matrixSvg = buildMatrixSVG(matrixResults);
    const positionCards = buildPositionCards(matrixResults);
    const narrativeBlocks = summaryToContent(summaryText);

    return {
      pageSize: 'A4',
      pageMargins: [55, 70, 55, 70],

      // Background color (full page)
      background: function() {
        return [{
          canvas: [{ type: 'rect', x: 0, y: 0, w: 595.28, h: 841.89, color: COLORS.bgBase }]
        }];
      },

      info: {
        title: 'Karmik Matris Analizi — Astroşuşu',
        author: 'Astroşuşu',
        subject: 'Karmik Matris Analizi',
      },

      defaultStyle: {
        font: 'Cormorant',
        fontSize: 11,
        color: COLORS.textPrimary,
        lineHeight: 1.45,
      },

      content: [
        // ============================ KAPAK ============================
        { text: '\n\n\n\n\n', fontSize: 1 },
        {
          text: 'KARMİK MATRİS',
          font: 'Cinzel',
          fontSize: 32,
          alignment: 'center',
          color: COLORS.goldBright,
          characterSpacing: 4,
          margin: [0, 40, 0, 0],
        },
        {
          text: 'A N A L İ Z İ',
          font: 'Cinzel',
          fontSize: 24,
          alignment: 'center',
          color: COLORS.goldBright,
          characterSpacing: 6,
          margin: [0, 8, 0, 30],
        },
        {
          canvas: [
            { type: 'line', x1: 200, y1: 0, x2: 285, y2: 0, lineWidth: 0.6, lineColor: COLORS.goldMuted },
          ],
        },
        {
          text: 'Astroşuşu Sistemi',
          font: 'Cormorant',
          italics: true,
          fontSize: 14,
          alignment: 'center',
          color: COLORS.textSecondary,
          margin: [0, 14, 0, 60],
        },
        {
          text: 'Doğum Tarihi',
          font: 'Cinzel',
          fontSize: 12,
          alignment: 'center',
          color: COLORS.textSecondary,
          characterSpacing: 2,
          margin: [0, 0, 0, 6],
        },
        {
          text: birthDate,
          font: 'IMFell',
          fontSize: 26,
          alignment: 'center',
          color: COLORS.goldBright,
          margin: [0, 0, 0, 80],
        },
        {
          text: `Hazırlanma: ${formatDateTR(new Date())}`,
          font: 'Cormorant',
          italics: true,
          fontSize: 10,
          alignment: 'center',
          color: COLORS.textMuted,
          margin: [0, 0, 0, 0],
        },
        {
          text: 'astrosusu',
          font: 'Cormorant',
          italics: true,
          fontSize: 9,
          alignment: 'center',
          color: COLORS.textMuted,
          margin: [0, 8, 0, 0],
        },

        // ============================ SAYFA 2: MATRİS DİYAGRAMI ============================
        {
          text: 'KARMİK MATRİS DİYAGRAMI',
          style: 'sectionTitle',
          pageBreak: 'before',
          margin: [0, 0, 0, 8],
        },
        {
          text: 'Doğum tarihinizden hesaplanan 13 karmik pozisyon ve aralarındaki bağlantılar',
          style: 'sectionDesc',
          margin: [0, 0, 0, 20],
        },
        {
          svg: matrixSvg,
          width: 360,
          alignment: 'center',
          margin: [0, 0, 0, 16],
        },

        // ============================ YAŞ DÖNEMLERİ ============================
        {
          text: 'YAŞAM DÖNGÜLERİNİZ',
          style: 'sectionTitle',
          margin: [0, 20, 0, 12],
        },
        {
          table: {
            widths: ['*', '*', '*', '*'],
            body: [[
              periodCell('1. Dönem', `0 — ${p.p1} yaş`),
              periodCell('2. Dönem', `${p.p1} — ${p.p2} yaş`),
              periodCell('3. Dönem', `${p.p2} — ${p.p3} yaş`),
              periodCell('4. Dönem', `${p.p3}+ yaş`),
            ]],
          },
          layout: {
            hLineColor: () => COLORS.goldMuted,
            vLineColor: () => COLORS.goldMuted,
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            paddingTop: () => 8,
            paddingBottom: () => 8,
            paddingLeft: () => 8,
            paddingRight: () => 8,
          },
        },

        // ============================ SAYFA 3+: POZİSYON KARTLARI ============================
        {
          text: 'POZİSYON ANALİZLERİNİZ',
          style: 'sectionTitle',
          margin: [0, 30, 0, 8],
        },
        {
          text: '13 karmik pozisyonun her biri için sayı, formül ve kısa anlam',
          style: 'sectionDesc',
          margin: [0, 0, 0, 18],
        },
        ...positionCards,

        // ============================ KİŞİSEL ÖZET ============================
        {
          text: 'KİŞİSEL KARMİK ÖZET',
          style: 'sectionTitle',
          alignment: 'center',
          pageBreak: 'before',
          margin: [0, 0, 0, 8],
        },
        {
          canvas: [
            { type: 'line', x1: 195, y1: 0, x2: 290, y2: 0, lineWidth: 0.5, lineColor: COLORS.goldMuted },
          ],
        },
        {
          text: 'Sayılarınızın size anlattıkları',
          style: 'sectionDesc',
          alignment: 'center',
          margin: [0, 12, 0, 28],
        },

        ...narrativeBlocks,

        // ============================ ARKA KAPAK / DİSCLAIMER ============================
        {
          text: 'BU ANALİZ HAKKINDA',
          style: 'sectionTitle',
          alignment: 'center',
          pageBreak: 'before',
          margin: [0, 80, 0, 16],
        },
        {
          text: 'Karmik Matris analizi, Astroşuşu sistemine dayanan numerolojik-ezoterik bir araçtır. ' +
                'Bu rapor doğum tarihinizden hesaplanan 13 Büyük Arkana sayısının yorumlanmasıyla hazırlanmıştır.',
          style: 'narrative',
          alignment: 'center',
          margin: [40, 0, 40, 16],
        },
        {
          text: 'Bu çalışma kişisel farkındalık, içsel keşif ve ruhsal gelişim için bir rehberdir. ' +
                'Profesyonel psikolojik, tıbbi veya finansal danışmanlık yerine geçmez. ' +
                'Bilimsel iddia taşımaz.',
          style: 'narrativeMuted',
          alignment: 'center',
          margin: [40, 0, 40, 30],
        },
        {
          canvas: [
            { type: 'line', x1: 200, y1: 0, x2: 285, y2: 0, lineWidth: 0.5, lineColor: COLORS.goldMuted },
          ],
        },
        {
          text: 'Astroşuşu',
          font: 'Cinzel',
          fontSize: 14,
          alignment: 'center',
          color: COLORS.goldBright,
          characterSpacing: 3,
          margin: [0, 16, 0, 4],
        },
        {
          text: '@astrosusu',
          font: 'Cormorant',
          italics: true,
          fontSize: 10,
          alignment: 'center',
          color: COLORS.textMuted,
        },
      ],

      styles: {
        sectionTitle: {
          font: 'Cinzel',
          fontSize: 16,
          color: COLORS.goldBright,
          characterSpacing: 2.5,
          alignment: 'center',
        },
        sectionDesc: {
          font: 'Cormorant',
          italics: true,
          fontSize: 11,
          color: COLORS.textSecondary,
          alignment: 'center',
        },
        cardTitle: {
          font: 'Cinzel',
          fontSize: 12,
          color: COLORS.goldBright,
          characterSpacing: 1,
        },
        cardNumber: {
          font: 'IMFell',
          fontSize: 22,
          color: COLORS.goldBright,
        },
        cardArcana: {
          font: 'Cormorant',
          italics: true,
          fontSize: 12,
          color: COLORS.textPrimary,
        },
        cardFormula: {
          font: 'IMFell',
          italics: true,
          fontSize: 9,
          color: COLORS.textMuted,
        },
        cardBody: {
          font: 'Cormorant',
          fontSize: 10.5,
          color: COLORS.textPrimary,
          lineHeight: 1.4,
        },
        narrative: {
          font: 'Cormorant',
          fontSize: 11.5,
          color: COLORS.textPrimary,
          lineHeight: 1.55,
          alignment: 'justify',
        },
        narrativeMuted: {
          font: 'Cormorant',
          italics: true,
          fontSize: 10,
          color: COLORS.textSecondary,
          lineHeight: 1.5,
        },
      },

      // Footer with page number
      footer: function (currentPage, pageCount) {
        // Cover page (1) gets no footer
        if (currentPage === 1) return null;
        return {
          columns: [
            { text: 'Karmik Matris Analizi', font: 'Cormorant', italics: true, fontSize: 9, color: COLORS.textMuted, alignment: 'left', margin: [55, 20, 0, 0] },
            { text: `${currentPage} / ${pageCount}`, font: 'IMFell', fontSize: 9, color: COLORS.textMuted, alignment: 'right', margin: [0, 20, 55, 0] },
          ],
        };
      },
    };

    function periodCell(label, range) {
      return {
        stack: [
          { text: label, font: 'Cinzel', fontSize: 10, color: COLORS.goldBright, alignment: 'center', characterSpacing: 1, margin: [0, 0, 0, 4] },
          { text: range, font: 'IMFell', fontSize: 11, color: COLORS.textPrimary, alignment: 'center' },
        ],
        fillColor: COLORS.bgSurface,
      };
    }
  }

  // Expose globally
  window.buildPDFDocument = buildPDFDocument;
})();
