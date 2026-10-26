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

    // Hindari membuat client baru jika main.js sudah menyediakan
    // client global yang bisa digunakan kembali.
    const existingClient =
        window.supabaseClient ||
        window.supabaseClientPublic ||
        window.supabaseClientAnon;

    const gateClient = existingClient ||
        supabaseLib.createClient(
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

        const registerTabs =
            document.querySelector('.tabs');

        // Jangan membuka form sebelum status gerbang terverifikasi.
        if (registerForm) {
            registerForm.style.display = 'none';
        }

        if (topupForm) {
            topupForm.style.display = 'none';
        }

        if (registerTabs) {
            registerTabs.style.display = 'none';
        }

        if (messageBox) {
            messageBox.style.display = 'block';
        }

        if (messageTitle) {
            messageTitle.textContent = 'MEMERIKSA GERBANG REGISTRASI';
        }

        if (messageText) {
            messageText.textContent =
                'Mohon tunggu, status gerbang sedang diperiksa.';
        }

        if (!messageBox || !registerForm) {
            console.error(
                '[Registration Gate] Elemen wajib tidak ditemukan.',
                {
                    messageBox: !!messageBox,
                    registerForm: !!registerForm
                }
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
                throw error;
            }

            if (!data || typeof data.is_open !== 'boolean') {
                throw new Error(
                    'Status gerbang tidak valid.'
                );
            }

            console.log(
                '[Registration Gate] DATABASE RESULT:',
                data
            );

            if (data.is_open === true) {
                console.log('[Registration Gate] STATUS: OPEN');

                messageBox.style.display = 'none';
                registerForm.style.display = '';

                if (topupForm) {
                    topupForm.style.display = '';
                }

                if (registerTabs) {
                    registerTabs.style.display = '';
                }

                return;
            }

            console.log('[Registration Gate] STATUS: CLOSED');

            messageBox.style.display = 'block';

            if (messageTitle) {
                messageTitle.textContent =
                    'REGISTRASI SANGKAN DITUTUP';
            }

            if (messageText) {
                const batchName =
                    document.createElement('strong');

                batchName.textContent =
                    data.batch_name || 'SANGKAN';

                messageText.replaceChildren(
                    document.createTextNode(
                        'Gerbang pendaftaran '
                    ),
                    batchName,
                    document.createTextNode(
                        ' untuk sementara sedang ditutup. ' +
                        'Perjalanan berikutnya akan dibuka ' +
                        'kembali pada waktu yang telah ditentukan.'
                    )
                );
            }

            registerForm.style.display = 'none';

            if (topupForm) {
                topupForm.style.display = 'none';
            }

            if (registerTabs) {
                registerTabs.style.display = 'none';
            }

        } catch (error) {
            console.error(
                '[Registration Gate] GAGAL:',
                error
            );

            // Fail-closed: jika status tidak dapat diverifikasi,
            // form tetap tersembunyi.
            messageBox.style.display = 'block';

            if (messageTitle) {
                messageTitle.textContent =
                    'GERBANG BELUM DAPAT DIVERIFIKASI';
            }

            if (messageText) {
                messageText.textContent =
                    'Status registrasi belum dapat diperiksa. ' +
                    'Silakan coba kembali beberapa saat lagi.';
            }

            if (registerForm) {
                registerForm.style.display = 'none';
            }

            if (topupForm) {
                topupForm.style.display = 'none';
            }

            if (registerTabs) {
                registerTabs.style.display = 'none';
            }
        }
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

