// ========================================================
// LAKUKOTA — DASHBOARD ADMIN SANGKAN
// ========================================================

const SUPABASE_PROJECT_URL = 'https://tihixoswhxlihrsatfft.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vzlNczrbFT5sBTa-kNT3Bg_4vDvXbxG';

const supabaseLib = window.supabase || supabase;

const supabaseClient = supabaseLib.createClient(
    SUPABASE_PROJECT_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ========================================================
// ELEMENT
// ========================================================

const daftarPending = document.getElementById('daftar-pending');
const jumlahPending = document.getElementById('jumlah-pending');


// ========================================================
// CEK ADMIN
// ========================================================

async function cekAdmin() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) {
        window.location.href = 'index.html';
        return null;
    }

    const role = user.app_metadata?.role;

    if (role !== 'admin') {
        alert('Akses ditolak. Halaman ini khusus admin.');
        window.location.href = 'index.html';
        return null;
    }

    return user;
}


// ========================================================
// LOAD PENDAFTAR PENDING
// ========================================================

async function loadPending() {

    daftarPending.innerHTML = `
        <p style="color:#aaa;">
            Membaca daftar Selaku...
        </p>
    `;

    const {
        data,
        error
    } = await supabaseClient
        .from('users')
        .select(`
            user_id,
            user_code,
            username,
            email,
            created_at,
            payment_status,
            payment_proof
        `)
        .eq('payment_status', 'pending')
        .order('created_at', {
            ascending: false
        });

    if (error) {

        console.error(error);

        daftarPending.innerHTML = `
            <p style="color:#e74c3c;">
                Gagal membaca data Selaku.
            </p>
        `;

        return;
    }

    jumlahPending.textContent = data.length;

    if (data.length === 0) {

        daftarPending.innerHTML = `
            <div class="empty-state">
                Tidak ada Selaku yang menunggu verifikasi.
            </div>
        `;

        return;
    }

    daftarPending.innerHTML = data
        .map(selaku => buatKartuSelaku(selaku))
        .join('');
}


// ========================================================
// CARD SELAKU
// ========================================================

function buatKartuSelaku(selaku) {

    const tanggal = new Date(selaku.created_at)
        .toLocaleString('id-ID');

    const bukti = selaku.payment_proof
        ? `<div class="payment-proof">
               Bukti pembayaran tersedia
           </div>`
        : `<div class="payment-proof warning">
               Bukti pembayaran belum tercatat
           </div>`;

    return `
        <div class="selaku-card">

            <div class="selaku-header">

                <div>
                    <h3>${escapeHTML(selaku.username)}</h3>

                    <span class="user-code">
                        ${escapeHTML(selaku.user_code)}
                    </span>
                </div>

                <span class="status pending">
                    PENDING
                </span>

            </div>

            <div class="selaku-info">

                <div>
                    <small>EMAIL</small>
                    <strong>
                        ${escapeHTML(selaku.email || '-')}
                    </strong>
                </div>

                <div>
                    <small>USER ID</small>
                    <strong class="user-id">
                        ${escapeHTML(selaku.user_id)}
                    </strong>
                </div>

                <div>
                    <small>TERDAFTAR</small>
                    <strong>
                        ${tanggal}
                    </strong>
                </div>

            </div>

            ${bukti}

            <button
                class="btn-activate"
                onclick="aktifkanSelaku('${selaku.user_id}')"
            >
                AKTIFKAN SELAKU
            </button>

        </div>
    `;
}


// ========================================================
// AKTIFKAN SELAKU
// ========================================================

async function aktifkanSelaku(userId) {

    const yakin = confirm(
        'Verifikasi pembayaran dan aktifkan Selaku ini?'
    );

    if (!yakin) return;

    const {
        error
    } = await supabaseClient
        .from('users')
        .update({
            payment_status: 'paid'
        })
        .eq('user_id', userId)
        .eq('payment_status', 'pending');

    if (error) {

        console.error(error);

        alert(
            'Gagal mengaktifkan Selaku: ' +
            error.message
        );

        return;
    }

    alert('Selaku berhasil diaktifkan.');

    await loadPending();
}


// ========================================================
// ESCAPE HTML
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
// MULAI
// ========================================================

(async function() {

    const admin = await cekAdmin();

    if (admin) {
        await loadPending();
    }

})();
