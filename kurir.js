// ========================================================
// LAKUKOTA — PANDE / KURIR
// RAJAH HANDOVER
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

const btnStartCamera =
    document.getElementById('btn-start-camera');

const btnStopCamera =
    document.getElementById('btn-stop-camera');

const btnSubmit =
    document.getElementById('btn-submit');

const qrTokenInput =
    document.getElementById('qr-token');

const qrReader =
    document.getElementById('qr-reader');

const cameraStatus =
    document.getElementById('camera-status');

const resultBox =
    document.getElementById('result');


// ========================================================
// QR SCANNER
// ========================================================

let qrScanner = null;

let scannerAktif = false;

let sedangMemproses = false;


// ========================================================
// STATUS
// ========================================================

function setCameraStatus(text) {

    if (cameraStatus) {
        cameraStatus.textContent = text;
    }

}


// ========================================================
// RESULT
// ========================================================

function tampilkanHasil(
    tipe,
    judul,
    pesan
) {

    if (!resultBox) {
        return;
    }


    resultBox.className = '';

    resultBox.classList.add(tipe);

    resultBox.innerHTML = `
        <div class="result-title">
            ${escapeHTML(judul)}
        </div>

        <div>
            ${escapeHTML(pesan)}
        </div>
    `;

    resultBox.style.display = 'block';

}


// ========================================================
// ESCAPE
// ========================================================

function escapeHTML(value) {

    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}


// ========================================================
// MULAI KAMERA
// ========================================================

async function mulaiKamera() {

    if (scannerAktif) {
        return;
    }


    if (
        typeof Html5Qrcode ===
        'undefined'
    ) {

        tampilkanHasil(
            'error',
            'SCANNER TIDAK TERSEDIA',
            'Library scanner QR gagal dimuat.'
        );

        return;
    }


    try {

        qrReader.style.display = 'block';

        btnStartCamera.disabled = true;

        btnStopCamera.style.display =
            'block';


        setCameraStatus(
            'Meminta akses kamera...'
        );


        qrScanner =
            new Html5Qrcode(
                'qr-reader'
            );


        scannerAktif = true;


        await qrScanner.start(

            {
                facingMode: 'environment'
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
                    'QR TERBACA:',
                    decodedText
                );


                // Masukkan token
                // ke input manual
                qrTokenInput.value =
                    decodedText;


                setCameraStatus(
                    'Rajah terbaca. Memvalidasi...'
                );


                await hentikanKamera();


                await validasiRajah(
                    decodedText
                );


                sedangMemproses = false;

            },


            function(errorMessage) {

                // Jangan tampilkan error
                // scanning frame secara terus-menerus.

            }

        );


        setCameraStatus(
            'Arahkan kamera ke Rajah Selaku.'
        );


    }

    catch (error) {

        console.error(
            'Kamera gagal dibuka:',
            error
        );


        scannerAktif = false;

        qrReader.style.display =
            'none';

        btnStartCamera.disabled =
            false;

        btnStopCamera.style.display =
            'none';


        setCameraStatus(
            'Kamera tidak dapat dibuka.'
        );


        tampilkanHasil(
            'error',
            'KAMERA TIDAK TERSEDIA',
            error.message ||
            'Periksa izin kamera pada browser.'
        );

    }

}


// ========================================================
// HENTIKAN KAMERA
// ========================================================

async function hentikanKamera() {

    if (!qrScanner) {
        return;
    }


    try {

        if (scannerAktif) {

            await qrScanner.stop();

        }

    }

    catch (error) {

        console.warn(
            'Scanner stop:',
            error
        );

    }


    try {

        qrScanner.clear();

    }

    catch (error) {

        console.warn(
            'Scanner clear:',
            error
        );

    }


    qrScanner = null;

    scannerAktif = false;


    qrReader.style.display =
        'none';

    btnStartCamera.disabled =
        false;

    btnStopCamera.style.display =
        'none';


    setCameraStatus(
        'Kamera belum diaktifkan.'
    );

}


// ========================================================
// VALIDASI RAJAH
// ========================================================

async function validasiRajah(token) {

    if (!token) {

        tampilkanHasil(
            'error',
            'TOKEN KOSONG',
            'Rajah belum terbaca.'
        );

        return;
    }


    if (btnSubmit) {

        btnSubmit.disabled = true;

        btnSubmit.textContent =
            'MEMVALIDASI...';

    }


    try {

        console.log(
            'Mengirim token ke RPC:',
            token
        );


        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                'terima_fulfillment_order',
                {
                    p_qr_token: token.trim()
                }
            );


        if (error) {

            console.error(
                'RPC ERROR:',
                error
            );

            throw error;

        }


        console.log(
            'HASIL RPC:',
            data
        );


        if (
            !data ||
            data.success !== true
        ) {

            throw new Error(
                'Penerimaan paket gagal.'
            );

        }


        // ==============================================
        // BERHASIL
        // ==============================================

        tampilkanHasil(
            'success',
            '✓ PAKET DITERIMA',
            'Status Rajah: RECEIVED'
        );


        alert(
            '📦 PAKET DITERIMA!\n\n' +
            'Manifestasi Atmaka + Lanyard\n\n' +
            'Status: RECEIVED'
        );


        qrTokenInput.value = '';


        setCameraStatus(
            'Siap menerima Rajah berikutnya.'
        );


    }

    catch (error) {

        console.error(
            'Validasi gagal:',
            error
        );


        tampilkanHasil(
            'error',
            '✕ RAJAH DITOLAK',
            error.message ||
            'Rajah tidak dapat diproses.'
        );

    }

    finally {

        if (btnSubmit) {

            btnSubmit.disabled = false;

            btnSubmit.textContent =
                'VALIDASI RAJAH';

        }

    }

}


// ========================================================
// EVENT — START CAMERA
// ========================================================

if (btnStartCamera) {

    btnStartCamera.addEventListener(
        'click',
        mulaiKamera
    );

}


// ========================================================
// EVENT — STOP CAMERA
// ========================================================

if (btnStopCamera) {

    btnStopCamera.addEventListener(
        'click',
        hentikanKamera
    );

}


// ========================================================
// EVENT — MANUAL VALIDATION
// ========================================================

if (btnSubmit) {

    btnSubmit.addEventListener(
        'click',
        async function() {

            const token =
                qrTokenInput.value.trim();


            await validasiRajah(
                token
            );

        }
    );

}


// ========================================================
// ENTER = VALIDASI
// ========================================================

if (qrTokenInput) {

    qrTokenInput.addEventListener(
        'keydown',
        async function(event) {

            if (
                event.key === 'Enter'
            ) {

                event.preventDefault();

                await validasiRajah(
                    qrTokenInput.value.trim()
                );

            }

        }
    );

}


// ========================================================
// CLEANUP
// ========================================================

window.addEventListener(
    'beforeunload',
    async function() {

        await hentikanKamera();

    }
);


console.log(
    'LAKUKOTA PANDE — sistem siap.'
);
