// --- INISIALISASI SUPABASE ---
const SUPABASE_PROJECT_URL = 'https://tihixoswhxlihrsatfft.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vzlNczrbFT5sBTa-kNT3Bg_4vDvXbxG'; 
const supabaseClient = window.supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLISHABLE_KEY);

// --- RITUAL PENDAFTARAN SELAKU ---
document.getElementById('reg-form').addEventListener('submit', async function(event) {
    // Tahan form agar tidak langsung me-refresh halaman
    event.preventDefault(); 
    
    // Ambil tombol untuk kita ubah tulisannya saat loading
    const btnSubmit = this.querySelector('button[type="submit"]');
    const originalText = btnSubmit.innerText;
    btnSubmit.innerText = "Membuka Gerbang...";
    btnSubmit.disabled = true;

    try {
        // 1. Sedot semua data dari input HTML
        const nama = document.getElementById('reg-nama').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const gender = document.getElementById('reg-gender').value;
        const tglLahir = document.getElementById('reg-tgl-lahir').value;
        
        // Ambil data weton yang disembunyikan dari fungsi kalkulator
        const divWeton = document.getElementById('hasil-weton');
        const wetonHari = divWeton.getAttribute('data-hari');
        const wetonPasaran = divWeton.getAttribute('data-pasaran');
        const neptuTotal = divWeton.getAttribute('data-neptu');

        // Pastikan kalkulator weton sudah selesai
        if(!wetonHari) {
            alert("Harap tunggu sejenak, garis takdir belum selesai dibaca.");
            btnSubmit.innerText = originalText;
            btnSubmit.disabled = false;
            return;
        }

        // ========================================================
        // TAHAP 1: Daftarkan ke Brankas Rahasia (Supabase Auth)
        // ========================================================
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
        });

        if (authError) throw authError; // Jika gagal, langsung lompat ke blok catch
        
        // Ambil Kunci UUID dari brankas rahasia
        const newUserId = authData.user.id;
        
        // Bikin LAKU-CODE acak (Contoh: LKU-8X2F)
        const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
        const generatedUserCode = 'LKU-' + randomHex;

        // ========================================================
        // TAHAP 2: Catat di Buku Profil (public.users)
        // ========================================================
        const { error: profileError } = await supabaseClient    
            .from('users')
            .insert([
                {
                    user_id: newUserId,
                    user_code: generatedUserCode,
                    username: nama,
                    email: email, // Salinan praktis sesuai saran Lik sebelah
                    gender: gender,
                    tanggal_lahir: tglLahir,
                    weton_hari: wetonHari,
                    weton_pasaran: wetonPasaran,
                    neptu_total: parseInt(neptuTotal)
                }
            ]);

        if (profileError) throw profileError;

        // Jika sampai sini, artinya RITUAL SUKSES 100%!
        alert(`Ritual Berhasil!\nSelamat datang, ${nama}.\nLAKU-CODE Anda: ${generatedUserCode}\n\nSilakan cek email untuk konfirmasi (jika diaktifkan), atau langsung masuk ke Aplikasi Peta.`);
        
        // Opsional: Langsung lempar user ke PWA setelah sukses
        // window.location.href = "https://app.lakukota.id"; 
        
        // Bersihkan form
        this.reset();
        divWeton.innerText = "";

    } catch (error) {
        // Tangkap dan tampilkan error kalau ada yang bocor
        console.error("Terjadi Gangguan Mistis:", error);
        alert("Gagal melakukan ritual: " + error.message);
    } finally {
        // Kembalikan tombol ke kondisi semula
        btnSubmit.innerText = originalText;
        btnSubmit.disabled = false;
    }
});

function switchTab(tabId, btnElement) {
    // Sembunyikan semua kotak form
    document.getElementById('reg-form').classList.add('hidden');
    document.getElementById('topup-form').classList.add('hidden');
    
    // Matikan pendaran (class active) dari semua tombol tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Tampilkan form yang dipilih dan nyalakan tombolnya
    document.getElementById(tabId).classList.remove('hidden');
    btnElement.classList.add('active');
}

// --- ALGORITMA KALKULATOR WETON JAWA ASLI ---
function hitungWetonAsli(tanggal) {
    // Array Hari (Neptu)
    const hariMasehi = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const neptuHari = [5, 4, 3, 7, 8, 6, 9];

    // Array Pasaran (Neptu) - Siklus 5 harian
    const pasaranJawa = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
    const neptuPasaran = [5, 9, 7, 4, 8];

    // Patokan tanggal (Tanggal 1 Jan 1970 adalah Kamis Wage)
    const patokanPasaran = 3; // Index untuk "Wage"

    const dateObj = new Date(tanggal);
    
    // Hitung Hari Masehi
    const indexHari = dateObj.getDay();
    const namaHari = hariMasehi[indexHari];
    const nHari = neptuHari[indexHari];

    // Hitung Pasaran Jawa (Selisih hari dari 1 Jan 1970)
    const timeDiff = dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000); // Penyesuaian zona waktu
    const hariKe = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    // Hitung index pasaran
    let indexPasaran = (hariKe + patokanPasaran) % 5;
    if (indexPasaran < 0) indexPasaran += 5; // Handle tahun sebelum 1970

    const namaPasaran = pasaranJawa[indexPasaran];
    const nPasaran = neptuPasaran[indexPasaran];

    const totalNeptu = nHari + nPasaran;

    return {
        hari: namaHari,
        pasaran: namaPasaran,
        neptu: totalNeptu,
        teks: `${namaHari} ${namaPasaran} (Neptu: ${totalNeptu})`
    };
}

function hitungWetonDummy() {
    const tglInput = document.getElementById('reg-tgl-lahir').value;
    const tempatHasil = document.getElementById('hasil-weton');
    
    if(tglInput) {
        tempatHasil.style.color = '#d4af37';
        tempatHasil.innerText = "Membaca garis takdir...";
        
        setTimeout(() => {
            // Panggil kalkulator asli
            const weton = hitungWetonAsli(tglInput);
            
            tempatHasil.style.color = '#2ecc71'; 
            tempatHasil.innerText = `✨ Weton Terdeteksi: ${weton.teks}`;
            
            // Simpan data ke atribut HTML (untuk disedot saat Submit ke Supabase nanti)
            tempatHasil.setAttribute('data-hari', weton.hari);
            tempatHasil.setAttribute('data-pasaran', weton.pasaran);
            tempatHasil.setAttribute('data-neptu', weton.neptu);
            
        }, 1200);
    } else {
        tempatHasil.innerText = "";
    }
}