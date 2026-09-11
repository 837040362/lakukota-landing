// ========================================================
// LAKUKOTA — KURIR HANDOVER
// ========================================================


// ========================================================
// SUPABASE
// ========================================================

const SUPABASE_PROJECT_URL =
    'https://tihixoswhxlihrsatfft.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
    'sb_publishable_vzlNczrbFT5sBTa-kNT3Bg_4vDvXbxG';


const supabaseLib =
    window.supabase || supabase;


const supabaseClient =
    supabaseLib.createClient(
        SUPABASE_PROJECT_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ========================================================
// ELEMENT
// ========================================================

const scannerStatus =
    document.getElementById(
        'scanner-status'
    );

const manualInput =
    document.getElementById(
        'kurir-qr-token'
    );

const receiveButton =
    document.getElementById(
        'btn-kurir-terima'
    );

const logoutButton =
    document.getElementById(
        'logout-btn'
    );

const hasilPenerimaan =
    document.getElementById(
        'hasil-penerimaan'
    );


// ========================================================
// QR SCANNER
// ========================================================

let qrScanner = null;

let sedangMemproses = false;


// ========================================================
// STATUS
// ========================================================

function setStatus(
    message,
    type = ''
) {

    if (!scannerStatus) {
        return;
    }

    scannerStatus.textContent =
        message;

    scannerStatus.className =
        'status ' + type;

}


// ========================================================
// STOP SCANNER
// ========================================================

async function stopScanner() {

    if (!qrScanner) {
        return;
    }

    try {

        await qrScanner.stop();

        console.log(
            'QR scanner dihentikan.'
        );

    }
    catch (error) {

        console.warn(
            'Scanner tidak dapat dihentikan:',
            error
        );

    }

}


// ========================================================
// START SCANNER
// ========================================================

async function startScanner() {

    if (
        typeof Html5Qrcode ===
        'undefined'
    ) {

        setStatus(
            'Scanner QR tidak tersedia. Gunakan input manual.',
            'error'
        );

        return;
    }


    try {

        qrScanner =
            new Html5Qrcode(
                'qr-reader'
            );


        await qrScanner.start(

            {
                facingMode:
                    'environment'
            },

            {
                fps: 10,

                qrbox: {
                    width: 250,
                    height: 250
                }
            },

            async function(decodedText) {

                if (sedangMemproses) {
                    return;
                }


                sedangMemproses = true;


                console.log(
                    'QR terbaca:',
                    decodedText
                );


                await prosesPenerimaan(
                    decodedText
                );

            },

            function(errorMessage) {

                // Tidak perlu menampilkan
                // error scan frame demi frame.

            }

        );


        setStatus(
            'Arahkan kamera ke Rajah / QR Selaku.'
        );

    }

    catch (error) {

        console.error(
            'Kamera gagal:',
            error
        );


        setStatus(
            'Kamera tidak dapat digunakan. Gunakan input token manual.',
            'error'
        );

    }

}


// ========================================================
// PROSES PENERIMAAN
// ========================================================

async function prosesPenerimaan(
    qrToken
) {

    if (!qrToken) {

        sedangMemproses = false;

        return;
    }


    const token =
        qrToken.trim();


    if (!token) {

        sedangMemproses = false;

        return;
    }


    // ---------------------------------------------
    // STOP CAMERA
    // ---------------------------------------------

    await stopScanner();


    setStatus(
        'Memverifikasi Rajah...',
    );


    if (receiveButton) {

        receiveButton.disabled =
            true;

        receiveButton.textContent =
            'MEMPROSES...';

    }


    try {

        // =========================================
        // RPC
        // =========================================

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                'terima_fulfillment_order',
                {
                    p_qr_token: token
                }
            );


        // =========================================
        // ERROR SUPABASE
        // =========================================

        if (error) {

            throw error;

        }


        // =========================================
        // CEK HASIL RPC
        // =========================================

        if (
            !data ||
            !data.success
        ) {

            throw new Error(
                'Penerimaan paket gagal.'
            );

        }


        console.log(
            'Paket berhasil diterima:',
            data
        );


        // =========================================
        // TAMPILKAN HASIL
        // =========================================

        tampilkanHasil(
            data
        );


        setStatus(
            'Paket berhasil diterima.',
            'success'
        );


        if (manualInput) {

            manualInput.value = '';

        }


    }

    catch (error) {

        console.error(
            'Gagal menerima paket:',
            error
        );


        setStatus(
            'Gagal: ' +
            error.message,
            'error'
        );


        alert(
            '❌ PAKET TIDAK DAPAT DITERIMA\n\n' +
            error.message
        );


        // -----------------------------------------
        // SCANNER DIHIDUPKAN LAGI
        // -----------------------------------------

        sedangMemproses =
            false;


        await startScanner();

    }

    finally {

        if (receiveButton) {

            receiveButton.disabled =
                false;

            receiveButton.textContent =
                'TERIMA PAKET';

        }

    }

}


// ========================================================
// HASIL
// ========================================================

function tampilkanHasil(
    data
) {

    if (!hasilPenerimaan) {
        return;
    }


    hasilPenerimaan.style.display =
        'block';


    const atmaka =
        document.getElementById(
            'result-atmaka'
        );


    const status =
        document.getElementById(
            'result-status'
        );


    const waktu =
        document.getElementById(
            'result-time'
        );


    if (status) {

        status.textContent =
            data.status ||
            'RECEIVED';

    }


    if (atmaka) {

        atmaka.textContent =
            data.atmaka_id ||
            '-';

    }


    if (waktu) {

        const waktuDiterima =
            data.received_at
                ? new Date(
                    data.received_at
                ).toLocaleString(
                    'id-ID'
                )
                : '-';


        waktu.textContent =
            waktuDiterima;

    }

}


// ========================================================
// MANUAL BUTTON
// ========================================================

if (receiveButton) {

    receiveButton.addEventListener(
        'click',
        async function() {

            const token =
                manualInput
                    ? manualInput.value.trim()
                    : '';


            if (!token) {

                alert(
                    'QR Token belum diisi.'
                );

                return;
            }


            if (sedangMemproses) {
                return;
            }


            sedangMemproses = true;


            await prosesPenerimaan(
                token
            );

        }
    );

}


// ========================================================
// ENTER PADA INPUT
// ========================================================

if (manualInput) {

    manualInput.addEventListener(
        'keydown',
        function(event) {

            if (
                event.key ===
                'Enter'
            ) {

                event.preventDefault();


                if (receiveButton) {

                    receiveButton.click();

                }

            }

        }
    );

}


// ========================================================
// LOGOUT
// ========================================================

if (logoutButton) {

    logoutButton.addEventListener(
        'click',
        async function() {

            await stopScanner();


            await supabaseClient.auth.signOut();


            window.location.href =
                'index.html';

        }
    );

}


// ========================================================
// CEK SESSION
// ========================================================

async function cekSession() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getSession();


        if (error) {

            throw error;

        }


        const session =
            data?.session;


        if (!session) {

            alert(
                'Silakan login terlebih dahulu.'
            );


            window.location.href =
                'index.html';


            return;

        }


        console.log(
            'Kurir session:',
            session.user?.email
        );


        // =============================================
        // MVP
        // =============================================
        // Untuk sekarang kurir menggunakan
        // akun internal yang sama dengan admin.
        //
        // Nanti bisa dipisah menjadi:
        //
        // role = courier
        //
        // =============================================


        const role =
            session.user?.app_metadata?.role;


        if (
            role !== 'admin' &&
            role !== 'courier'
        ) {

            await supabaseClient
                .auth
                .signOut();


            alert(
                'Akun ini tidak memiliki akses kurir.'
            );


            window.location.href =
                'index.html';


            return;

        }


        // =============================================
        // START CAMERA
        // =============================================

        await startScanner();

    }

    catch (error) {

        console.error(
            'Gagal memeriksa session:',
            error
        );


        alert(
            'Gagal membuka halaman kurir:\n\n' +
            error.message
        );


        window.location.href =
            'index.html';

    }

}


// ========================================================
// MULAI
// ========================================================

cekSession();
