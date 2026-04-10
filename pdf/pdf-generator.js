// ============================================================
// PDF GENERATOR — Tarayıcı tarafı
// ============================================================
// Akış:
//   1) "PDF İndir" butonuna basılır
//   2) Loading animasyonu açılır
//   3) Backend API'ye matrisResults POST edilir, kişisel özet alınır
//   4) Fontlar ve pdfmake yüklenir (ilk seferinde)
//   5) buildPDFDocument(birthDate, matrixResults, summaryText) çağrılır
//   6) pdfMake.createPdf(docDef).download(...) ile indirilir
// ============================================================

(function () {
  'use strict';

  // ----- API endpoint -----
  // Lokal geliştirmede vercel dev kullanıldığında /api/generate-summary çalışır
  // Production'da Vercel deploy üzerinden aynı URL döner.
  const API_ENDPOINT = '/api/generate-summary';

  // ----- Font yolları (proje köküne göre) -----
  const FONT_FILES = {
    'Cinzel-Variable.ttf':                   'fonts/Cinzel-Variable.ttf',
    'CormorantGaramond-Variable.ttf':        'fonts/CormorantGaramond-Variable.ttf',
    'CormorantGaramond-Italic-Variable.ttf': 'fonts/CormorantGaramond-Italic-Variable.ttf',
    'IMFellEnglish-Regular.ttf':             'fonts/IMFellEnglish-Regular.ttf',
    'IMFellEnglish-Italic.ttf':              'fonts/IMFellEnglish-Italic.ttf',
  };

  const FONT_FAMILIES = {
    Cinzel: {
      normal:      'Cinzel-Variable.ttf',
      bold:        'Cinzel-Variable.ttf',
      italics:     'Cinzel-Variable.ttf',
      bolditalics: 'Cinzel-Variable.ttf',
    },
    Cormorant: {
      normal:      'CormorantGaramond-Variable.ttf',
      bold:        'CormorantGaramond-Variable.ttf',
      italics:     'CormorantGaramond-Italic-Variable.ttf',
      bolditalics: 'CormorantGaramond-Italic-Variable.ttf',
    },
    IMFell: {
      normal:      'IMFellEnglish-Regular.ttf',
      bold:        'IMFellEnglish-Regular.ttf',
      italics:     'IMFellEnglish-Italic.ttf',
      bolditalics: 'IMFellEnglish-Italic.ttf',
    },
  };

  // pdfmake CDN — jsdelivr (cdnjs'de 0.3.x yok, sadece 0.2.x var)
  const PDFMAKE_URL = 'https://cdn.jsdelivr.net/npm/pdfmake@0.3.7/build/pdfmake.min.js';

  // ----- State -----
  let pdfMakeLoaded = false;
  let fontsLoaded = false;
  const cachedSummaries = new Map(); // birthDate -> summary text

  // ----- Helpers -----

  // Convert ArrayBuffer to base64 string (browser)
  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
  }

  // Lazy-load pdfmake from CDN
  function loadPdfMake() {
    return new Promise((resolve, reject) => {
      if (window.pdfMake) {
        pdfMakeLoaded = true;
        return resolve();
      }
      const script = document.createElement('script');
      script.src = PDFMAKE_URL;
      script.async = true;
      script.onload = () => {
        pdfMakeLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('pdfmake yüklenemedi'));
      document.head.appendChild(script);
    });
  }

  // Lazy-load fonts (fetch + base64) and inject into pdfMake VFS.
  // pdfmake v0.3.x'te API değişti: eski "pdfMake.vfs = {...}" artık
  // çalışmıyor. Yeni yöntem: pdfMake.virtualfs.writeFileSync(name, base64, 'base64')
  async function loadFonts() {
    if (fontsLoaded) return;
    if (!window.pdfMake) throw new Error('pdfMake henüz yüklenmedi');
    if (!window.pdfMake.virtualfs) throw new Error('pdfMake.virtualfs bulunamadı (v0.3.x bekleniyor)');

    const entries = Object.entries(FONT_FILES);

    await Promise.all(entries.map(async ([vfsName, url]) => {
      if (window.pdfMake.virtualfs.existsSync(vfsName)) return; // already loaded
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Font yüklenemedi: ${url} (${res.status})`);
      const buffer = await res.arrayBuffer();
      const base64 = arrayBufferToBase64(buffer);
      // v0.3.x API: writeFileSync ile base64 string + encoding parametresi
      window.pdfMake.virtualfs.writeFileSync(vfsName, base64, 'base64');
    }));

    window.pdfMake.fonts = FONT_FAMILIES;
    fontsLoaded = true;
  }

  // Fetch personalized karmic summary from backend
  // (kullanıcının auth token'ı gerekiyor — window.km_auth_token üzerinden okunur)
  async function fetchSummary(birthDate, matrixResults, extra) {
    if (cachedSummaries.has(birthDate)) {
      return cachedSummaries.get(birthDate);
    }

    const headers = { 'Content-Type': 'application/json' };
    if (window.km_auth_token) {
      headers['Authorization'] = `Bearer ${window.km_auth_token}`;
    }

    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ birthDate, matrixResults, ...(extra || {}) }),
    });

    if (!res.ok) {
      let errMsg = `API hatası: ${res.status}`;
      let errBody = null;
      try {
        errBody = await res.json();
        if (errBody.message) errMsg = errBody.message;
        else if (errBody.error) errMsg = errBody.error;
      } catch (e) { /* ignore */ }
      const err = new Error(errMsg);
      err.status = res.status;
      err.body = errBody;
      throw err;
    }

    const data = await res.json();
    if (!data.summary) throw new Error('API geçersiz yanıt verdi');

    cachedSummaries.set(birthDate, data.summary);

    // Yan etkiler: kredi sayısını UI'da güncelle
    if (typeof data.credits_remaining === 'number' && typeof window.updateCreditPill === 'function') {
      window.updateCreditPill(data.credits_remaining);
    }

    return data.summary;
  }

  // ----- Loading overlay -----
  function showLoadingOverlay(message) {
    let overlay = document.getElementById('pdfLoadingOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'pdfLoadingOverlay';
      overlay.innerHTML = `
        <div class="pdf-loading-card">
          <div class="pdf-loading-orb"></div>
          <div class="pdf-loading-title" id="pdfLoadingTitle">Karmik özetiniz hazırlanıyor</div>
          <div class="pdf-loading-msg" id="pdfLoadingMsg">${message || ''}</div>
          <div class="pdf-loading-hint">Bu işlem 1-3 dakika sürebilir. Lütfen bekleyin.</div>
        </div>
      `;
      document.body.appendChild(overlay);
    } else {
      overlay.style.display = 'flex';
      const msgEl = document.getElementById('pdfLoadingMsg');
      if (msgEl && message) msgEl.textContent = message;
    }
  }

  function updateLoadingMessage(message) {
    const msgEl = document.getElementById('pdfLoadingMsg');
    if (msgEl) msgEl.textContent = message;
  }

  function hideLoadingOverlay() {
    const overlay = document.getElementById('pdfLoadingOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  function showError(message, opts) {
    hideLoadingOverlay();
    if (opts && opts.actionLabel && opts.actionUrl) {
      const ok = confirm(message + '\n\n' + opts.actionLabel + '?');
      if (ok) window.location.href = opts.actionUrl;
      return;
    }
    alert('PDF üretilirken hata oluştu:\n\n' + message);
  }

  // ----- Main entry -----
  async function generateAndDownloadPDF() {
    const matrixResults = window._matrixResults;
    if (!matrixResults) {
      showError('Önce hesaplama yapmalısınız.');
      return;
    }

    const birthDateInput = document.getElementById('birthDate');
    const birthDate = birthDateInput ? birthDateInput.value.trim() : '';
    if (!birthDate) {
      showError('Doğum tarihi bulunamadı.');
      return;
    }

    // Auth kontrolü — kullanıcı giriş yapmamışsa giriş sayfasına yönlendir
    if (!window.km_auth_token) {
      const redirect = encodeURIComponent('/');
      const ok = confirm(
        'PDF raporu üretmek için hesabınıza giriş yapmalısınız.\n\nGiriş sayfasına yönlendirilmek ister misiniz?'
      );
      if (ok) {
        window.location.href = `/auth/giris.html?redirect=${redirect}`;
      }
      return;
    }

    try {
      showLoadingOverlay('Atasal yükler okunuyor...');

      // Stage 1: load pdfmake (background)
      const pdfmakePromise = loadPdfMake();

      // Stage 2: fetch summary from backend (the slow part)
      updateLoadingMessage('Sayılarınız Claude\'a iletiliyor...');
      const summaryPromise = fetchSummary(birthDate, matrixResults);

      // Wait for both
      await pdfmakePromise;

      updateLoadingMessage('Karmik metniniz yazılıyor...');
      const summaryText = await summaryPromise;

      // Stage 3: load fonts (parallel with above where possible)
      updateLoadingMessage('Fontlar hazırlanıyor...');
      await loadFonts();

      // Stage 4: build doc and download
      updateLoadingMessage('Sayfalar düzenleniyor (1-2 dakika sürebilir)...');
      const docDefinition = window.buildPDFDocument(birthDate, matrixResults, summaryText);
      const fileName = `karmik-matris-${birthDate.replace(/\./g, '-')}.pdf`;

      // Reassuring message updates while pdfmake renders
      // (browser pdfmake is single-threaded, 17+ sayfalı doküman 30-90s sürebilir)
      const messageRotation = [
        { at: 30000, msg: 'Pozisyon kartları yerleştiriliyor...' },
        { at: 60000, msg: 'Sağlık yatkınlıkları işleniyor...' },
        { at: 90000, msg: 'Son düzenlemeler yapılıyor, neredeyse bitti...' },
        { at: 150000, msg: 'Hâlâ çalışıyor, lütfen bekleyin...' },
      ];
      const rotationTimers = messageRotation.map(({ at, msg }) =>
        setTimeout(() => updateLoadingMessage(msg), at)
      );
      const clearRotation = () => rotationTimers.forEach(clearTimeout);

      // pdfmake v0.3.x'te download() callback'i guvenilir degil. Promise tabanli
      // getBuffer() kullanip manuel olarak blob download tetikliyoruz — boylece
      // overlay'i biz kontrol ediyoruz, callback'e bagimli degiliz.
      try {
        const pdf = window.pdfMake.createPdf(docDefinition);
        const buffer = await pdf.getBuffer();
        clearRotation();

        const blob = new Blob([buffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Cleanup URL after a short delay (some browsers need this)
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        hideLoadingOverlay();
      } catch (renderErr) {
        clearRotation();
        console.error('pdfmake render error:', renderErr);
        showError('PDF oluşturma hatası: ' + (renderErr.message || String(renderErr)));
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      // Auth ve kredi hatalarını özel olarak ele al
      if (err.status === 401) {
        showError('Oturumunuz sona ermiş olabilir. Lütfen yeniden giriş yapın.', {
          actionLabel: 'Giriş sayfasına git',
          actionUrl: '/auth/giris.html?redirect=/'
        });
        return;
      }
      if (err.status === 402) {
        showError('Kredi bakiyeniz yetersiz. Yeni paket alarak devam edebilirsiniz.', {
          actionLabel: 'Kredi yükle',
          actionUrl: '/hesap/odeme.html'
        });
        return;
      }
      showError(err.message || String(err));
    }
  }

  // ----- Replay: stored analysis verilerinden PDF yeniden üret -----
  // birthDate: "GG.AA.YYYY", matrixResults: object, summaryText: string
  async function generatePDFFromStored(birthDate, matrixResults, summaryText) {
    if (!matrixResults || !summaryText) {
      showError('Analiz verisi eksik.');
      return;
    }
    try {
      showLoadingOverlay('Atasal yükler okunuyor...');

      await loadPdfMake();
      updateLoadingMessage('Fontlar hazırlanıyor...');
      await loadFonts();

      updateLoadingMessage('Sayfalar düzenleniyor (1-2 dakika sürebilir)...');
      const docDefinition = window.buildPDFDocument(birthDate, matrixResults, summaryText);
      const fileName = `karmik-matris-${birthDate.replace(/\./g, '-')}.pdf`;

      const messageRotation = [
        { at: 30000, msg: 'Pozisyon kartları yerleştiriliyor...' },
        { at: 60000, msg: 'Sağlık yatkınlıkları işleniyor...' },
        { at: 90000, msg: 'Son düzenlemeler yapılıyor, neredeyse bitti...' },
        { at: 150000, msg: 'Hâlâ çalışıyor, lütfen bekleyin...' },
      ];
      const rotationTimers = messageRotation.map(({ at, msg }) =>
        setTimeout(() => updateLoadingMessage(msg), at)
      );
      const clearRotation = () => rotationTimers.forEach(clearTimeout);

      try {
        const pdf = window.pdfMake.createPdf(docDefinition);
        const buffer = await pdf.getBuffer();
        clearRotation();

        const blob = new Blob([buffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        hideLoadingOverlay();
      } catch (renderErr) {
        clearRotation();
        console.error('pdfmake render error:', renderErr);
        showError('PDF oluşturma hatası: ' + (renderErr.message || String(renderErr)));
      }
    } catch (err) {
      console.error('PDF replay error:', err);
      showError(err.message || String(err));
    }
  }

  // Expose globally
  window.generateAndDownloadPDF = generateAndDownloadPDF;
  window.generatePDFFromStored = generatePDFFromStored;
})();
