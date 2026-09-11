// ========================================================
// LAKUKOTA — DASHBOARD ADMIN SANGKAN
// ========================================================

const SUPABASE_PROJECT_URL = 'https://tihixoswhxlihrsatfft.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
    'sb_publishable_vzlNczrbFT5sBTa-kNT3Bg_4vDvXbxG';

const supabaseLib = window.supabase || supabase;

const supabaseClient = supabaseLib.createClient(
    SUPABASE_PROJECT_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ========================================================
// ELEMENT
// ========================================================

const loginPanel =
    document.getElementById('admin-login');

const dashboardPanel =
    document.getElementById('admin-dashboard');

const loginForm =
    document.getElementById('admin-login-form');

const loginError =
    document.getElementById('login-error');

const btnLogin =
    document.getElementById('btn-login-admin');

const btnRefresh =
    document.getElementById('btn-refresh');

const daftarPending =
    document.getElementById('daftar-pending');

const jumlahPending =
    document.getElementById('jumlah-pending');


// ========================================================
// TAMPILKAN DASHBOARD
// ========================================================

function tampilkanDashboard() {

    loginPanel.classList.add('hidden');

    dashboardPanel.classList.remove('hidden');

}


// ========================================================
// TAMPILKAN LOGIN
// ========================================================

function tampilkanLogin() {

    dashboardPanel.classList.add('hidden');

    loginPanel.classList.remove('hidden');

}


// ========================================================
// LOGIN ADMIN
// ========================================================

if (loginForm) {

    loginForm.addEventListener('submit', async function(event) {

        event.preventDefault();

        loginError.textContent = '';

        btnLogin.disabled = true;
        btnLogin.textContent = 'MEMBUKA GERBANG...';

        const email =
            document.getElementById('admin-email')
                .value
                .trim();

        const password =
            document.getElementById('admin-password')
                .value;


        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });


        if (error) {

            console.error(error);

            loginError.textContent =
                'Login gagal: ' + error.message;

            btnLogin.disabled = false;
            btnLogin.textContent = 'MASUK';

            return;
        }


        // =================================================
        // CEK ROLE ADMIN
        // =================================================

        const role =
            data.user?.app_metadata?.role;


        if (role !== 'admin') {

            await supabaseClient.auth.signOut();

            loginError.textContent =
                'Akun ini bukan akun admin.';

            btnLogin.disabled = false;
            btnLogin.textContent = 'MASUK';

            return;
        }


        // =================================================
        // BERHASIL
        // =================================================

        btnLogin.textContent = 'BERHASIL';

        tampilkanDashboard();

        await loadPending();

        btnLogin.disabled = false;

    });

}


// ========================================================
// CEK SESSION SAAT HALAMAN DIBUKA
// ========================================================

async function cekSession() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();


    // Belum login
    if (!session) {

        tampilkanLogin();

        return;

    }


    // Sudah login → cek admin
    const role =
        session.user?.app_metadata?.role;


    if (role !== 'admin') {

        await supabaseClient.auth.signOut();

        tampilkanLogin();

        return;

    }


    tampilkanDashboard();

    await loadPending();

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
                <br><br>
                ${escapeHTML(error.message)}
            </p>
        `;

        jumlahPending.textContent = '?';

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


    daftarPending.innerHTML =
        data.map(selaku => buatKartuSelaku(selaku))
            .join('');

}


// ========================================================
// CARD SELAKU
// ========================================================

function buatKartuSelaku(selaku) {

    const tanggal =
        new Date(selaku.created_at)
            .toLocaleString('id-ID');


    return `
        <div class="selaku-card">

            <div class="selaku-header">

                <div>

                    <h3>
                        ${escapeHTML(selaku.username)}
                    </h3>

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
    } = await supabaseClient.rpc(
        'admin_activate_selaku',
        {
            p_user_id: userId
        }
    );


    if (error) {

        console.error(error);

        alert(
            'Gagal mengaktifkan Selaku:\n\n' +
            error.message
        );

        return;
    }


    alert(
        'Selaku berhasil diaktifkan.'
    );


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
// REFRESH
// ========================================================

if (btnRefresh) {

    btnRefresh.addEventListener(
        'click',
        loadPending
    );

}


// ========================================================
// MULAI
// ========================================================

cekSession();
