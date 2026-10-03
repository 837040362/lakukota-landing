// ========================================================
// REGISTRATION GATE — GERBANG PENDAFTARAN SANGKAN
// ========================================================

(() => {
    const SUPABASE_PROJECT_URL = 'https://tihixoswhxlihrsatfft.supabase.co';
    const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vzlNczrbFT5sBTa-kNT3Bg_4vDvXbxG';

    const supabaseLib = window.supabase || supabase;
    const gateClient = supabaseLib.createClient(
        SUPABASE_PROJECT_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

    async function loadRegistrationGate() {
        const messageBox = document.getElementById('registration-gate-message');
        const messageTitle = document.getElementById('registration-gate-title');
        const messageText = document.getElementById('registration-gate-text');

        const registerSection = document.getElementById('register');
        const registerForm = document.getElementById('reg-form');
        const topupForm = document.getElementById('topup-form');

        if (!messageBox) {
            console.warn('[Registration Gate] Message box tidak ditemukan.');
            return;
        }

        try {
            const { data, error } = await gateClient
                .from('registration_gate')
                .select('id,batch_name,is_open,updated_at')
                .eq('id', 1)
                .single();

            if (error) throw error;

            console.log('[Registration Gate]', data);

            // ====================================================
            // REGISTRASI DIBUKA
            // ====================================================
            if (data.is_open) {
                messageBox.style.display = 'none';

                if (registerForm) {
                    registerForm.style.display = '';
                }

                if (topupForm) {
                    topupForm.style.display = '';
                }

                return;
            }

            // ====================================================
            // REGISTRASI DITUTUP
            // ====================================================

            messageBox.style.display = 'block';

            if (messageTitle) {
                messageTitle.innerText = 'REGISTRASI SANGKAN DITUTUP';
            }

            if (messageText) {
                messageText.innerHTML =
                    `Gerbang pendaftaran <strong>${escapeHtml(data.batch_name)}</strong> ` +
                    `untuk sementara sedang ditutup.<br><br>` +
                    `Perjalanan berikutnya akan dibuka kembali pada waktu yang telah ditentukan.`;
            }

            // Sembunyikan seluruh form registrasi
            if (registerForm) {
                registerForm.style.display = 'none';
            }

            if (topupForm) {
                topupForm.style.display = 'none';
            }

            // Sembunyikan tab / pilihan registrasi jika ada
            const registerTabs = document.querySelector('.register-tabs');

            if (registerTabs) {
                registerTabs.style.display = 'none';
            }

            // Sembunyikan CTA mobile registrasi
            const mobileRegisterButtons = document.querySelectorAll(
                'a[href="#register"], button[data-target="#register"]'
            );

            mobileRegisterButtons.forEach(button => {
                button.style.display = 'none';
            });

            // Pastikan section registrasi tetap terlihat agar pesan penutupan terbaca
            if (registerSection) {
                registerSection.style.display = '';
            }

        } catch (error) {
            console.error('[Registration Gate] Gagal membaca status gerbang:', error);

            // Fail-safe:
            // Jika status gerbang gagal dibaca, jangan mengubah
            // form yang sudah ada.
            messageBox.style.display = 'none';
        }
    }

    // ========================================================
    // ESCAPE HTML — untuk batch_name dari database
    // ========================================================

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ========================================================
    // JALANKAN SETELAH DOM SIAP
    // ========================================================

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            loadRegistrationGate
        );
    } else {
        loadRegistrationGate();
    }
})();
