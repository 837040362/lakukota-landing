// --- INISIALISASI SUPABASE ---
const SUPABASE_PROJECT_URL = 'https://tihixoswhxlihrsatfft.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vzlNczrbFT5sBTa-kNT3Bg_4vDvXbxG';

const supabaseLib = window.supabase || supabase;
const supabaseClient = supabaseLib.createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLISHABLE_KEY);

// ========================================================
// RITUAL PENDAFTARAN SELAKU
// ========================================================
const formDaftar = document.getElementById('reg-form');

// Pengaman: Pastikan form ada di halaman sebelum dipasangi rem
if (formDaftar) {
    formDaftar.addEventListener('submit', async function(event) {
        
        // Tahan form agar tidak refresh (REM CAKRAM AKTIF)
        event.preventDefault();

        const btnSubmit = this.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerText;

        btnSubmit.innerText = "Membuka Gerbang...";
        btnSubmit.disabled = true;

        try {
            // 1. AMBIL DATA FORM
            const nama = document.getElementById('reg-nama').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const gender = document.getElementById('reg-gender').value;
            const tglLahir = document.getElementById('reg-tgl-lahir').value;

            const divWeton = document.getElementById('hasil-weton');
            const wetonHari = divWeton.getAttribute('data-hari');
            const wetonPasaran = divWeton.getAttribute('data-pasaran');
            const neptuTotal = divWeton.getAttribute('data-neptu');

            if (!wetonHari) {
                alert("Harap tunggu sejenak, garis takdir belum selesai dibaca.");
                btnSubmit.innerText = originalText;
                btnSubmit.disabled = false;
                return;
            }

            // 3. DAFTARKAN KE SUPABASE AUTH
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email: email,
                password: password
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("User Auth gagal dibuat.");

            const newUserId = authData.user.id;

            // 4. LENGKAPI PROFIL + STATUS PEMBAYARAN PENDING
            const { data: profileData, error: profileError } = await supabaseClient
                .from('users')
                .update({
                    username: nama,
                    email: email,
                    gender: gender,
                    tanggal_lahir: tglLahir,
                    weton_hari: wetonHari,
                    weton_pasaran: wetonPasaran,
                    neptu_total: parseInt(neptuTotal),
                    payment_status: 'pending' 
                })
                .eq('user_id', newUserId)
                .select('user_code')
                .single();

            if (profileError) throw profileError;

            // 5. RITUAL BERHASIL (MUNCULKAN QRIS & KONFIRMASI WA)
            const userCode = profileData.user_code;
            const pesanSukses = 
                `Selamat datang, <strong style="color:#d4af37;">${nama}</strong>.<br>` +
                `LAKU-CODE Anda: <span style="color:#d4af37;">${userCode}</span><br><br>` +
                `Silakan selesaikan mahar pendaratan senilai <strong style="color:#d4af37;">Rp 299.000</strong> melalui QRIS di bawah ini, lalu konfirmasikan ke WhatsApp Admin.`;

            tampilkanPesanQRIS(
                "RITUAL BERHASIL", 
                pesanSukses, 
                `Kirim Bukti ke WhatsApp`, 
                function() {
                    const noAdmin = "628562942151"; 
                    const textWA = encodeURIComponent(`Halo Min, saya ${nama} (${userCode}) sudah mendaftar Sangkan dan melakukan transfer mahar Rp 299.000. Berikut bukti transfernya.`);
                    window.location.href = `https://wa.me/${noAdmin}?text=${textWA}`;
                }
            );  

            // Bersihkan form
            formDaftar.reset();
            divWeton.innerText = "";
            divWeton.removeAttribute('data-hari');
            divWeton.removeAttribute('data-pasaran');
            divWeton.removeAttribute('data-neptu');

        } catch (error) {
            console.error("Terjadi Gangguan Mistis:", error);
            alert("Gagal melakukan ritual: " + error.message);
        } finally {
            btnSubmit.innerText = originalText;
            btnSubmit.disabled = false;
        }
    });
}

// ========================================================
// ALGORITMA KALKULATOR WETON JAWA
// ========================================================
function hitungWetonAsli(tanggal) {
    const hariMasehi = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const neptuHari = [5, 4, 3, 7, 8, 6, 9];
    const pasaranJawa = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
    const neptuPasaran = [5, 9, 7, 4, 8];
    const patokanPasaran = 3;

    const dateObj = new Date(tanggal);
    const indexHari = dateObj.getDay();
    const namaHari = hariMasehi[indexHari];
    const nHari = neptuHari[indexHari];

    const timeDiff = dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000);
    const hariKe = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    let indexPasaran = (hariKe + patokanPasaran) % 5;
    if (indexPasaran < 0) indexPasaran += 5;
    
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

// ========================================================
// KALKULATOR WETON UNTUK FORM
// ========================================================
function hitungWetonDummy() {
    const tglInput = document.getElementById('reg-tgl-lahir').value;
    const tempatHasil = document.getElementById('hasil-weton');

    if (tglInput) {
        tempatHasil.style.color = '#d4af37';
        tempatHasil.innerText = "Membaca garis takdir...";
        
        setTimeout(() => {
            const weton = hitungWetonAsli(tglInput);
            tempatHasil.style.color = '#2ecc71';
            tempatHasil.innerText = `✨ Weton Terdeteksi: ${weton.teks}`;
            
            tempatHasil.setAttribute('data-hari', weton.hari);
            tempatHasil.setAttribute('data-pasaran', weton.pasaran);
            tempatHasil.setAttribute('data-neptu', weton.neptu);
        }, 1200);
    } else {
        tempatHasil.innerText = "";
        tempatHasil.removeAttribute('data-hari');
        tempatHasil.removeAttribute('data-pasaran');
        tempatHasil.removeAttribute('data-neptu');
    }
}

// ========================================================
// SISTEM MODAL KHUSUS DENGAN QRIS
// ========================================================
let aksiModalBerikutnya = null;

function tampilkanPesanQRIS(judul, pesan, teksTombol, fungsiAksi) {
    document.getElementById('modal-title').innerHTML = judul;
    document.getElementById('modal-message').innerHTML = pesan;
    document.getElementById('modal-btn').innerHTML = teksTombol ? teksTombol : "Mengerti";
    
    // Munculkan kotak QRIS
    const qrisBox = document.getElementById('qris-container');
    if (qrisBox) qrisBox.classList.remove('hidden');
    
    aksiModalBerikutnya = fungsiAksi;
    document.getElementById('custom-modal').classList.remove('hidden');
}

function tutupModal() {
    document.getElementById('custom-modal').classList.add('hidden');
    
    // Sembunyikan lagi QRIS
    const qrisBox = document.getElementById('qris-container');
    if (qrisBox) qrisBox.classList.add('hidden'); 
    
    if (typeof aksiModalBerikutnya === 'function') {
        aksiModalBerikutnya();
        aksiModalBerikutnya = null;
    }
}