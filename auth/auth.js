// =============================================================================
// AUTH SAYFALARI — Form Yönetimi
// =============================================================================

import { sb, redirectIfAuthenticated } from '/lib/supabase-client.js';

// -----------------------------------------------------------------------------
// Yardımcılar
// -----------------------------------------------------------------------------

function $(sel) { return document.querySelector(sel); }

function showMessage(type, text) {
    const box = $('#authMessage');
    if (!box) return;
    box.className = `auth-message ${type} show`;
    box.textContent = text;
}

function clearMessage() {
    const box = $('#authMessage');
    if (!box) return;
    box.className = 'auth-message';
    box.textContent = '';
}

function setButtonLoading(btn, loading, defaultText) {
    if (loading) {
        btn.disabled = true;
        btn.dataset.original = btn.innerHTML;
        btn.innerHTML = `<span class="auth-spinner"></span> İşleniyor...`;
    } else {
        btn.disabled = false;
        btn.innerHTML = btn.dataset.original || defaultText || 'Gönder';
    }
}

function translateAuthError(err) {
    const msg = (err?.message || err || '').toString().toLowerCase();
    if (msg.includes('invalid login') || msg.includes('invalid_credentials')) {
        return 'E-posta veya şifre hatalı.';
    }
    if (msg.includes('user already registered') || msg.includes('user already exists')) {
        return 'Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin veya şifrenizi sıfırlayın.';
    }
    if (msg.includes('email not confirmed')) {
        return 'E-posta adresiniz henüz doğrulanmadı. E-postanızı kontrol edin.';
    }
    if (msg.includes('password should be at least')) {
        return 'Şifreniz en az 8 karakter olmalıdır.';
    }
    if (msg.includes('rate limit') || msg.includes('too many')) {
        return 'Çok fazla deneme. Lütfen birkaç dakika sonra tekrar deneyin.';
    }
    if (msg.includes('network') || msg.includes('failed to fetch')) {
        return 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
    }
    return err?.message || 'Beklenmeyen bir hata oluştu. Tekrar deneyin.';
}

function passwordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
}

// -----------------------------------------------------------------------------
// GİRİŞ FORMU
// -----------------------------------------------------------------------------

export function initLoginForm() {
    redirectIfAuthenticated();

    const form = $('#loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessage();

        const email    = $('#email').value.trim();
        const password = $('#password').value;
        const btn      = $('#loginBtn');

        if (!email || !password) {
            showMessage('error', 'Lütfen tüm alanları doldurun.');
            return;
        }

        setButtonLoading(btn, true);

        try {
            const { data, error } = await sb.auth.signInWithPassword({ email, password });
            if (error) throw error;

            showMessage('success', 'Giriş başarılı. Yönlendiriliyorsunuz...');

            // redirect parametresi varsa oraya, yoksa /hesap/'a
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect') || '/hesap/';
            setTimeout(() => { window.location.href = redirect; }, 600);
        } catch (err) {
            console.error('[login]', err);
            showMessage('error', translateAuthError(err));
            setButtonLoading(btn, false, 'Giriş Yap');
        }
    });
}

// -----------------------------------------------------------------------------
// KAYIT FORMU
// -----------------------------------------------------------------------------

export function initSignupForm() {
    redirectIfAuthenticated();

    const form = $('#signupForm');
    if (!form) return;

    // Şifre güç göstergesi
    const pwInput = $('#password');
    const strBox  = $('#pwStrength');
    pwInput?.addEventListener('input', () => {
        const lvl = passwordStrength(pwInput.value);
        strBox.className = `auth-password-strength ${lvl}`;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessage();

        const fullName  = $('#fullName').value.trim();
        const email     = $('#email').value.trim();
        const phone     = $('#phone').value.trim();
        const password  = $('#password').value;
        const password2 = $('#password2').value;
        const okKvkk    = $('#okKvkk').checked;
        const okTerms   = $('#okTerms').checked;
        const btn       = $('#signupBtn');

        if (!fullName || !email || !password) {
            showMessage('error', 'Ad Soyad, e-posta ve şifre alanları zorunludur.');
            return;
        }
        if (password.length < 8) {
            showMessage('error', 'Şifreniz en az 8 karakter olmalıdır.');
            return;
        }
        if (password !== password2) {
            showMessage('error', 'Şifreler eşleşmiyor.');
            return;
        }
        if (!okKvkk || !okTerms) {
            showMessage('error', 'Kayıt için KVKK Aydınlatma Metnini ve Kullanım Koşullarını onaylamanız gerekir.');
            return;
        }

        setButtonLoading(btn, true);

        try {
            const { data, error } = await sb.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName, phone },
                    emailRedirectTo: `${window.location.origin}/auth/giris.html`
                }
            });
            if (error) throw error;

            // Eğer e-posta doğrulama açıksa session olmaz, mesaj göster
            if (!data.session) {
                showMessage('success', 'Kaydınız oluşturuldu! E-posta adresinize gelen doğrulama bağlantısına tıklayın, sonra giriş yapın.');
                form.reset();
            } else {
                showMessage('success', 'Hoş geldiniz! Yönlendiriliyorsunuz...');
                setTimeout(() => { window.location.href = '/hesap/'; }, 800);
            }
        } catch (err) {
            console.error('[signup]', err);
            showMessage('error', translateAuthError(err));
            setButtonLoading(btn, false, 'Hesap Oluştur');
        }
    });
}

// -----------------------------------------------------------------------------
// ŞİFREMİ UNUTTUM
// -----------------------------------------------------------------------------

export function initForgotForm() {
    const form = $('#forgotForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessage();

        const email = $('#email').value.trim();
        const btn   = $('#forgotBtn');

        if (!email) {
            showMessage('error', 'E-posta adresinizi girin.');
            return;
        }

        setButtonLoading(btn, true);

        try {
            const { error } = await sb.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/sifre-sifirla.html`
            });
            if (error) throw error;

            showMessage('success', 'Şifre sıfırlama bağlantısı e-postanıza gönderildi. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.');
            form.reset();
        } catch (err) {
            console.error('[forgot]', err);
            showMessage('error', translateAuthError(err));
        } finally {
            setButtonLoading(btn, false, 'Sıfırlama Bağlantısı Gönder');
        }
    });
}

// -----------------------------------------------------------------------------
// ŞİFRE SIFIRLA (kullanıcı e-postadaki linke tıkladığında bu sayfa açılır)
// -----------------------------------------------------------------------------

export function initResetForm() {
    const form = $('#resetForm');
    if (!form) return;

    // Kullanıcı henüz oturumda olmayabilir; recovery token URL'de
    // Supabase otomatik olarak detectSessionInUrl ile kullanır.

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessage();

        const password  = $('#password').value;
        const password2 = $('#password2').value;
        const btn       = $('#resetBtn');

        if (password.length < 8) {
            showMessage('error', 'Şifreniz en az 8 karakter olmalıdır.');
            return;
        }
        if (password !== password2) {
            showMessage('error', 'Şifreler eşleşmiyor.');
            return;
        }

        setButtonLoading(btn, true);

        try {
            const { error } = await sb.auth.updateUser({ password });
            if (error) throw error;

            showMessage('success', 'Şifreniz güncellendi. Giriş sayfasına yönlendiriliyorsunuz...');
            setTimeout(() => { window.location.href = '/auth/giris.html'; }, 1500);
        } catch (err) {
            console.error('[reset]', err);
            showMessage('error', translateAuthError(err));
            setButtonLoading(btn, false, 'Şifremi Güncelle');
        }
    });
}
