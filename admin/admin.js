// =============================================================================
// ADMIN PANEL — Ortak yardımcılar
// =============================================================================

import {
    requireAuth,
    getProfile,
    signOut,
    apiFetch
} from '/lib/supabase-client.js';

export { requireAuth, getProfile, signOut, apiFetch };

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

export function formatPriceTR(num) {
    if (num == null) return '—';
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2 }).format(num) + ' ₺';
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

// -----------------------------------------------------------------------------
export async function initAdminTopbar() {
    const profile = await getProfile();
    if (!profile?.is_admin) {
        window.location.href = '/';
        return null;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await signOut();
        });
    }

    // Bekleyen ödeme sayısını sidebar'da göster
    try {
        const { payments } = await apiFetch('/api/admin/payments?status=pending');
        const badge = document.getElementById('pendingBadge');
        if (badge) {
            const count = (payments || []).length;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    } catch (e) {
        // sessizce geç
    }

    return profile;
}

// -----------------------------------------------------------------------------
export function showToast(type, text, duration = 3500) {
    let toast = document.getElementById('adminToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'adminToast';
        toast.className = 'admin-toast';
        document.body.appendChild(toast);
    }
    toast.className = `admin-toast ${type}`;
    toast.textContent = text;
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.classList.remove('show'), duration);
}

// -----------------------------------------------------------------------------
// Reddetme modal'ı — promise döner, kullanıcı sebep girer veya iptal eder
export function promptRejectReason() {
    return new Promise((resolve) => {
        let overlay = document.getElementById('rejectModal');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'rejectModal';
            overlay.className = 'admin-modal-overlay';
            overlay.innerHTML = `
                <div class="admin-modal">
                    <h3 class="admin-modal-title">Ödemeyi Reddet</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">Reddetme sebebini yazın (kullanıcıya gösterilecek).</p>
                    <textarea id="rejectReason" class="admin-modal-textarea" placeholder="Örn: Havale tutarı eksik, IBAN bilgisi uyuşmuyor..."></textarea>
                    <div class="admin-modal-actions">
                        <button id="rejectCancel" class="admin-btn-reject">İptal</button>
                        <button id="rejectConfirm" class="admin-btn-approve" style="background: linear-gradient(135deg, #6e3a85, #9B59B6);">Reddet</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        overlay.classList.add('show');
        const reasonEl = document.getElementById('rejectReason');
        reasonEl.value = '';
        reasonEl.focus();

        const cleanup = () => {
            overlay.classList.remove('show');
            document.getElementById('rejectCancel').onclick = null;
            document.getElementById('rejectConfirm').onclick = null;
        };

        document.getElementById('rejectCancel').onclick = () => { cleanup(); resolve(null); };
        document.getElementById('rejectConfirm').onclick = () => {
            const reason = reasonEl.value.trim();
            cleanup();
            resolve(reason || '(sebep belirtilmedi)');
        };
    });
}
