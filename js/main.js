// --- INISIALISASI SUPABASE ---
const SUPABASE_PROJECT_URL = 'https://tihixoswhxlihrsatfft.supabase.co';

// Kunci Publishable Supabase
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vzlNczrbFT5sBTa-kNT3Bg_4vDvXbxG';

// Inisialisasi Supabase
const supabaseLib = window.supabase || supabase;
const supabaseClient = supabaseLib.createClient(
    SUPABASE_PROJECT_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ========================================================
// RITUAL PENDAFTARAN SELAKU
// ========================================================
document.getElementById('reg-form').addEventListener('submit', async function(event) {

    // Tahan form agar tidak refresh
    event.preventDefault();

    const btnSubmit = this.querySelector('button[type="submit"]');
    const originalText = btnSubmit.innerText;

    btnSubmit.innerText = "Membuka Gerbang...";
    btnSubmit.disabled = true;

    try {

        // ========================================================
        // 1. AMBIL DATA FORM
        // ========================================================
        const nama = document.getElementById('reg-nama').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const gender = document.getElementById('reg-gender').value;
        const tglLahir = document.getElementById('reg-tgl-lahir').value;

        // Ambil hasil kalkulator weton
        const divWeton = document.getElementById('hasil-weton');

        const wetonHari = divWeton.getAttribute('data-hari');
        const wetonPasaran = divWeton.getAttribute('data-pasaran');
        const neptuTotal = divWeton.getAttribute('data-neptu');


        // ========================================================
        // 2. PASTIKAN WETON SUDAH DIHITUNG
        // ========================================================
        if (!wetonHari) {

            alert(
                "Harap tunggu sejenak, garis takdir belum selesai dibaca."
            );

            btnSubmit.innerText = originalText;
            btnSubmit.disabled = false;

            return;
        }


        // ========================================================
        // 3. DAFTARKAN KE SUPABASE AUTH
        // ========================================================
        const {
            data: authData,
            error: authError
        } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });


        if (authError) {
            throw authError;
        }


        // Pastikan user berhasil dibuat
        if (!authData.user) {
            throw new Error("User Auth gagal dibuat.");
        }


        // UUID dibuat otomatis oleh Supabase Auth
        const newUserId = authData.user.id;

        console.log("[AUTH] User UUID:", newUserId);


        // ========================================================
        // 4. TRIGGER SUDAH MEMBUAT public.users
        //    Sekarang kita LENGKAPI PROFILNYA
        // ========================================================
        const {
            data: profileData,
            error: profileError
        } = await supabaseClient
            .from('users')
            .update({
                username: nama,
                email: email,
                gender: gender,
                tanggal_lahir: tglLahir,
                weton_hari: wetonHari,
                weton_pasaran: wetonPasaran,
                neptu_total: parseInt(neptuTotal)
            })
            .eq('user_id', newUserId)
            .select('user_code')
            .single();


        if (profileError) {
            throw profileError;
        }


        // ========================================================
        // 5. RITUAL BERHASIL
        // ========================================================
        const userCode = profileData.user_code;

        alert(
            `Ritual Berhasil!\n\n` +
            `Selamat datang, ${nama}.\n` +
            `LAKU-CODE Anda: ${userCode}\n\n` +
            `Silakan cek email untuk konfirmasi ` +
            `(jika diaktifkan), atau langsung masuk ke Aplikasi Peta.`
        );


        // Bersihkan form
        this.reset();

        divWeton.innerText = "";

        divWeton.removeAttribute('data-hari');
        divWeton.removeAttribute('data-pasaran');
        divWeton.removeAttribute('data-neptu');


    } catch (error) {

        // ========================================================
        // ERROR HANDLER
        // ========================================================
        console.error(
            "Terjadi Gangguan Mistis:",
            error
        );

        alert(
            "Gagal melakukan ritual: " +
            error.message
        );


    } finally {

        // Kembalikan tombol
        btnSubmit.innerText = originalText;
        btnSubmit.disabled = false;

    }

});


// ========================================================
// SWITCH TAB
// ========================================================
function switchTab(tabId, btnElement) {

    document.getElementById('reg-form')
        .classList.add('hidden');

    document.getElementById('topup-form')
        .classList.add('hidden');

    document
        .querySelectorAll('.tab-btn')
        .forEach(btn => btn.classList.remove('active'));

    document
        .getElementById(tabId)
        .classList.remove('hidden');

    btnElement.classList.add('active');
}


// ========================================================
// ALGORITMA KALKULATOR WETON JAWA
// ========================================================
function hitungWetonAsli(tanggal) {

    const hariMasehi = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu"
    ];

    const neptuHari = [
        5,
        4,
        3,
        7,
        8,
        6,
        9
    ];

    const pasaranJawa = [
        "Legi",
        "Pahing",
        "Pon",
        "Wage",
        "Kliwon"
    ];

    const neptuPasaran = [
        5,
        9,
        7,
        4,
        8
    ];

    const patokanPasaran = 3;


    const dateObj = new Date(tanggal);

    const indexHari = dateObj.getDay();

    const namaHari = hariMasehi[indexHari];

    const nHari = neptuHari[indexHari];


    const timeDiff =
        dateObj.getTime() -
        (dateObj.getTimezoneOffset() * 60000);

    const hariKe =
        Math.floor(
            timeDiff /
            (1000 * 60 * 60 * 24)
        );


    let indexPasaran =
        (hariKe + patokanPasaran) % 5;


    if (indexPasaran < 0) {
        indexPasaran += 5;
    }


    const namaPasaran =
        pasaranJawa[indexPasaran];

    const nPasaran =
        neptuPasaran[indexPasaran];


    const totalNeptu =
        nHari + nPasaran;


    return {

        hari: namaHari,

        pasaran: namaPasaran,

        neptu: totalNeptu,

        teks:
            `${namaHari} ${namaPasaran} ` +
            `(Neptu: ${totalNeptu})`

    };
}


// ========================================================
// KALKULATOR WETON UNTUK FORM
// ========================================================
function hitungWetonDummy() {

    const tglInput =
        document.getElementById('reg-tgl-lahir').value;

    const tempatHasil =
        document.getElementById('hasil-weton');


    if (tglInput) {

        tempatHasil.style.color = '#d4af37';

        tempatHasil.innerText =
            "Membaca garis takdir...";


        setTimeout(() => {

            const weton =
                hitungWetonAsli(tglInput);


            tempatHasil.style.color =
                '#2ecc71';


            tempatHasil.innerText =
                `✨ Weton Terdeteksi: ${weton.teks}`;


            tempatHasil.setAttribute(
                'data-hari',
                weton.hari
            );

            tempatHasil.setAttribute(
                'data-pasaran',
                weton.pasaran
            );

            tempatHasil.setAttribute(
                'data-neptu',
                weton.neptu
            );

        }, 1200);


    } else {

        tempatHasil.innerText = "";

        tempatHasil.removeAttribute('data-hari');
        tempatHasil.removeAttribute('data-pasaran');
        tempatHasil.removeAttribute('data-neptu');

    }
}

// Fungsi untuk Slider Karakter & Pusaka
function geserSlider(trackId, arah) {
    const track = document.getElementById(trackId);
    // Geser sejauh 1 layar penuh dari lebar kontainer saat itu
    const jarakGeser = track.clientWidth; 
    track.scrollBy({
        left: arah * jarakGeser,
        behavior: 'smooth'
    });
}

/* =========================================
   SENSOR SCROLL UNTUK EFEK ZOOM BACKGROUND
   ========================================= */
window.addEventListener('scroll', function() {
    // Jika layar di-scroll lebih dari 50 pixel ke bawah
    if (window.scrollY > 50) {
        document.body.classList.add('is-scrolling');
    } else {
        // Jika kembali ke paling atas (Home/Prolog)
        document.body.classList.remove('is-scrolling');
    }
});