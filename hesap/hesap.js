// =============================================================================
// HESAP / KULLANICI PANELİ — Ortak yardımcılar
// =============================================================================

import {
    sb,
    requireAuth,
    getProfile,
    signOut,
    apiFetch
} from '/lib/supabase-client.js';

export { sb, requireAuth, getProfile, signOut, apiFetch };

// -----------------------------------------------------------------------------
// Tarih formatlama
// -----------------------------------------------------------------------------
export function formatDateTR(isoString) {
    if (!isoString) return '—';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const day   = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year  = d.getFullYear();
    return `${day}.${month}.${year}`;
}

export function formatDateTimeTR(isoString) {
    if (!isoString) return '—';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const day   = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year  = d.getFullYear();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${h}:${m}`;
}

// "YYYY-MM-DD" -> "GG.AA.YYYY"
export function isoDateToTR(iso) {
    if (!iso) return '—';
    const [year, month, day] = iso.split('-');
    return `${day}.${month}.${year}`;
}

export function formatPriceTR(num) {
    if (num == null) return '—';
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2 }).format(num);
}

// -----------------------------------------------------------------------------
// Üst bar — kredi pill ve logout
// -----------------------------------------------------------------------------
export async function initTopbar() {
    const profile = await getProfile();
    const pill = document.getElementById('creditPill');
    if (pill && profile) {
        pill.innerHTML = `
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1 L9.6 6.4 L15 8 L9.6 9.6 L8 15 L6.4 9.6 L1 8 L6.4 6.4 Z"/></svg>
            <span>${profile.credits ?? 0} Kredi</span>
        `;
    }

    // Admin link göster
    const adminLink = document.getElementById('adminLink');
    if (adminLink && profile?.is_admin) {
        adminLink.style.display = 'inline-flex';
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await signOut();
        });
    }
}

// -----------------------------------------------------------------------------
// Mesaj kutusu
// -----------------------------------------------------------------------------
export function showMessage(boxId, type, text) {
    const box = document.getElementById(boxId);
    if (!box) return;
    box.className = `hesap-message ${type} show`;
    box.textContent = text;
}

export function clearMessage(boxId) {
    const box = document.getElementById(boxId);
    if (!box) return;
    box.className = 'hesap-message';
    box.textContent = '';
}

export function escHtml(s) {
    if (s == null) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
