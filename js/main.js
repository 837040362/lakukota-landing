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

function hitungWetonDummy() {
    const tgl = document.getElementById('reg-tgl-lahir').value;
    const tempatHasil = document.getElementById('hasil-weton');
    
    if(tgl) {
        // Efek loading mistis
        tempatHasil.style.color = '#d4af37';
        tempatHasil.innerText = "Membaca garis takdir...";
        
        // Jeda 1.2 detik seolah mesin sedang menghitung
        setTimeout(() => {
            tempatHasil.style.color = '#2ecc71'; 
            tempatHasil.innerText = "✨ Weton Terdeteksi: Jumat Kliwon"; 
        }, 1200);
    } else {
        tempatHasil.innerText = "";
    }
}