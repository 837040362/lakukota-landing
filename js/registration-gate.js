// ========================================================
// REGISTRATION GATE — GERBANG PENDAFTARAN SANGKAN
// ========================================================

(() => {

    console.log('[Registration Gate] SCRIPT LOADED');

    const SUPABASE_PROJECT_URL =
        'https://tihixoswhxlihrsatfft.supabase.co';

    const SUPABASE_PUBLISHABLE_KEY =
        'sb_publishable_vzlNczrbFT5sBTa-kNT3Bg_4vDvXbxG';

    const supabaseLib = window.supabase || supabase;

    const gateClient = supabaseLib.createClient(
        SUPABASE_PROJECT_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

    async function loadRegistrationGate() {

        console.log('[Registration Gate] Membaca status gerbang...');

        const messageBox =
            document.getElementById('registration-gate-message');

        const messageTitle =
            document.getElementById('registration-gate-title');

        const messageText =
            document.getElementById('registration-gate-text');

        const registerForm =
            document.getElementById('reg-form');

        const topupForm =
            document.getElementById('topup-form');

        console.log('[Registration Gate] Elements:', {
            messageBox,
            messageTitle,
            messageText,
            registerForm,
            topupForm
        });

        if (!messageBox) {
            console.error(
                '[Registration Gate] #registration-gate-message TIDAK DITEMUKAN'
            );
            return;
        }

        try {

            const { data, error } = await gateClient
                .from('registration_gate')
                .select('id,batch_name,is_open,updated_at')
                .eq('id', 1)
                .single();

            if (error) {
                console.error(
                    '[Registration Gate] DATABASE ERROR:',
                    error
                );
                throw error;
            }

            console.log(
                '[Registration Gate] DATABASE RESULT:',
                data
            );

            // ====================================================
            // OPEN
            // ====================================================

            if (data.is_open === true) {

                console.log(
                    '[Registration Gate] STATUS: OPEN'
                );

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
            // CLOSED
            // ====================================================

            console.log(
                '[Registration Gate] STATUS: CLOSED'
            );

            messageBox.style.display = 'block';

            if (messageTitle) {
                messageTitle.innerText =
                    'REGISTRASI SANGKAN DITUTUP';
            }

            if (messageText) {
                messageText.innerHTML =
                    `Gerbang pendaftaran <strong>${escapeHtml(data.batch_name)}</strong> ` +
                    `untuk sementara sedang ditutup.<br><br>` +
                    `Perjalanan berikutnya akan dibuka kembali pada waktu yang telah ditentukan.`;
            }

            // ----------------------------------------------------
            // MATIKAN FORM
            // ----------------------------------------------------

            if (registerForm) {
                registerForm.style.display = 'none';
            }

            if (topupForm) {
                topupForm.style.display = 'none';
            }

            // ----------------------------------------------------
            // MATIKAN TAB
            // ----------------------------------------------------

            const registerTabs =
                document.querySelector('.register-tabs');

            if (registerTabs) {
                registerTabs.style.display = 'none';
            }

            // ----------------------------------------------------
            // MATIKAN CTA YANG MENUJU REGISTRASI
            // ----------------------------------------------------

            document
                .querySelectorAll('a[href="#register"]')
                .forEach(button => {
                    button.style.display = 'none';
                });

        } catch (error) {

            console.error(
                '[Registration Gate] GAGAL:',
                error
            );

            /*
             * Untuk sementara JANGAN sembunyikan form.
             * Kita perlu melihat error sebenarnya dulu.
             */
        }
    }

    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    }

    if (document.readyState === 'loading') {

        document.addEventListener(
            'DOMContentLoaded',
            loadRegistrationGate
        );

    } else {

        loadRegistrationGate();

    }

})();
