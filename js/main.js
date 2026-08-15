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