// ========================================================
// LAKUKOTA — DASHBOARD ADMIN SANGKAN
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

const loginSection =
    document.getElementById('login-section');

const dashboardSection =
    document.getElementById('dashboard-section');

const loginForm =
    document.getElementById('login-form');

const loginStatus =
    document.getElementById('login-status');

const loginButton =
    document.getElementById('login-btn');

const refreshButton =
    document.getElementById('refresh-btn');

const pendingList =
    document.getElementById('pending-list');

const pendingCount =
    document.getElementById('pending-count');


// ========================================================
// CEK ELEMENT
// ========================================================

console.log('LAKUKOTA ADMIN — sistem dimulai');

if (!loginSection) {
    console.error(
        'ERROR: #login-section tidak ditemukan.'
    );
}

if (!dashboardSection) {
    console.error(
        'ERROR: #dashboard-section tidak ditemukan.'
    );
}

if (!pendingList) {
    console.error(
        'ERROR: #pending-list tidak ditemukan.'
    );
}


// ========================================================
// TAMPILKAN DASHBOARD
// ========================================================

function tampilkanDashboard() {

    if (!loginSection || !dashboardSection) {
        console.error(
            'Tidak dapat menampilkan dashboard: element tidak lengkap.'
        );

        return;
    }

    loginSection.classList.add('hidden');

    dashboardSection.classList.remove('hidden');

}


// ========================================================
// TAMPILKAN LOGIN
// ========================================================

function tampilkanLogin() {

    if (!loginSection || !dashboardSection) {
        return;
    }

    dashboardSection.classList.add('hidden');

    loginSection.classList.remove('hidden');

}


// ========================================================
// STATUS LOGIN
// ========================================================

function setLoginStatus(pesan = '') {

    if (!loginStatus) {
        return;
    }

    loginStatus.textContent = pesan;

}


// ========================================================
// LOGIN ADMIN
// ========================================================

if (loginForm) {

    loginForm.addEventListener(
        'submit',
        async function(event) {

            event.preventDefault();


            // ---------------------------------------------
            // ELEMENT
            // ---------------------------------------------

            const emailInput =
                document.getElementById('admin-email');

            const passwordInput =
                document.getElementById('admin-password');


            if (!emailInput || !passwordInput) {

                console.error(
                    'Input login admin tidak ditemukan.'
                );

                return;
            }


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            // ---------------------------------------------
            // RESET STATUS
            // ---------------------------------------------

            setLoginStatus('');


            if (loginButton) {

                loginButton.disabled = true;

                loginButton.textContent =
                    'MEMBUKA GERBANG...';

            }


            try {

                // =========================================
                // SIGN IN
                // =========================================

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.signInWithPassword({
                        email: email,
                        password: password
                    });


                if (error) {

                    console.error(
                        'Login error:',
                        error
                    );

                    setLoginStatus(
                        'Login gagal: ' +
                        error.message
                    );

                    if (loginButton) {

                        loginButton.disabled = false;

                        loginButton.textContent =
                            'MASUK KE GERBANG';

                    }

                    return;
                }


                // =========================================
                // CEK USER
                // =========================================

                const user =
                    data?.user;


                if (!user) {

                    setLoginStatus(
                        'Akun tidak ditemukan.'
                    );

                    await supabaseClient.auth.signOut();

                    if (loginButton) {

                        loginButton.disabled = false;

                        loginButton.textContent =
                            'MASUK KE GERBANG';

                    }

                    return;
                }


                // =========================================
                // CEK ROLE ADMIN
                // =========================================

                const role =
                    user.app_metadata?.role;


                console.log(
                    'Role akun:',
                    role
                );


                if (role !== 'admin') {

                    await supabaseClient.auth.signOut();

                    setLoginStatus(
                        'Akun ini bukan akun admin.'
                    );

                    if (loginButton) {

                        loginButton.disabled = false;

                        loginButton.textContent =
                            'MASUK KE GERBANG';

                    }

                    return;
                }


                // =========================================
                // LOGIN BERHASIL
                // =========================================

                console.log(
                    'Login admin berhasil:',
                    user.email
                );


                if (loginButton) {

                    loginButton.textContent =
                        'GERBANG TERBUKA';

                }


                tampilkanDashboard();


                await loadPending();


                if (loginButton) {

                    loginButton.disabled = false;

                }

            }

            catch (error) {

                console.error(
                    'Gangguan sistem admin:',
                    error
                );

                setLoginStatus(
                    'Terjadi gangguan: ' +
                    error.message
                );


                if (loginButton) {

                    loginButton.disabled = false;

                    loginButton.textContent =
                        'MASUK KE GERBANG';

                }

            }

        }
    );

}


// ========================================================
// CEK SESSION SAAT HALAMAN DIBUKA
// ========================================================

async function cekSession() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                'Gagal membaca session:',
                error
            );

            tampilkanLogin();

            return;
        }


        const session =
            data?.session;


        // ---------------------------------------------
        // BELUM LOGIN
        // ---------------------------------------------

        if (!session) {

            console.log(
                'Tidak ada session admin.'
            );

            tampilkanLogin();

            return;
        }


        // ---------------------------------------------
        // SUDAH LOGIN
        // ---------------------------------------------

        const user =
            session.user;


        const role =
            user?.app_metadata?.role;


        console.log(
            'Session ditemukan:',
            user?.email
        );

        console.log(
            'Role session:',
            role
        );


        // ---------------------------------------------
        // BUKAN ADMIN
        // ---------------------------------------------

        if (role !== 'admin') {

            console.warn(
                'Session bukan admin.'
            );

            await supabaseClient.auth.signOut();

            tampilkanLogin();

            return;
        }


        // ---------------------------------------------
        // ADMIN VALID
        // ---------------------------------------------

        tampilkanDashboard();

        await loadPending();

    }

    catch (error) {

        console.error(
            'Gagal memeriksa session:',
            error
        );

        tampilkanLogin();

    }

}


// ========================================================
// LOAD PENDAFTAR PENDING
// ========================================================

async function loadPending() {

    if (!pendingList || !pendingCount) {

        console.error(
            'Element daftar pending tidak ditemukan.'
        );

        return;
    }


    // ---------------------------------------------
    // LOADING
    // ---------------------------------------------

    pendingList.innerHTML = `
        <div class="empty-state">

            <div class="empty-symbol">
                ◌
            </div>

            <div class="empty-title">
                MEMBACA DATA
            </div>

            <div class="empty-description">
                Membaca daftar Selaku yang menunggu
                verifikasi...
            </div>

        </div>
    `;


    // ---------------------------------------------
    // QUERY SUPABASE
    // ---------------------------------------------

    try {

        const {
            data,
            error
        } =
            await supabaseClient
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
                .eq(
                    'payment_status',
                    'pending'
                )
                .order(
                    'created_at',
                    {
                        ascending: false
                    }
                );


        // ---------------------------------------------
        // ERROR
        // ---------------------------------------------

        if (error) {

            console.error(
                'Gagal membaca users:',
                error
            );


            pendingCount.textContent = '?';


            pendingList.innerHTML = `
                <div class="empty-state">

                    <div class="empty-symbol">
                        !
                    </div>

                    <div class="empty-title">
                        GAGAL MEMBACA DATA
                    </div>

                    <div class="empty-description">
                        ${escapeHTML(error.message)}
                    </div>

                </div>
            `;

            return;
        }


        // ---------------------------------------------
        // JUMLAH PENDING
        // ---------------------------------------------

        pendingCount.textContent =
            data?.length || 0;


        // ---------------------------------------------
        // TIDAK ADA PENDING
        // ---------------------------------------------

        if (!data || data.length === 0) {

            pendingList.innerHTML = `
                <div class="empty-state">

                    <div class="empty-symbol">
                        ◇
                    </div>

                    <div class="empty-title">
                        GERBANG TENANG
                    </div>

                    <div class="empty-description">
                        Tidak ada Selaku yang menunggu
                        verifikasi saat ini.
                    </div>

                </div>
            `;

            return;
        }


        // ---------------------------------------------
        // RENDER CARD
        // ---------------------------------------------

        pendingList.innerHTML =
            data
                .map(
                    selaku =>
                        buatKartuSelaku(selaku)
                )
                .join('');


        console.log(
            `${data.length} Selaku pending ditemukan.`
        );

    }

    catch (error) {

        console.error(
            'Gangguan loadPending:',
            error
        );


        pendingCount.textContent =
            '?';


        pendingList.innerHTML = `
            <div class="empty-state">

                <div class="empty-symbol">
                    !
                </div>

                <div class="empty-title">
                    GANGGUAN SISTEM
                </div>

                <div class="empty-description">
                    ${escapeHTML(error.message)}
                </div>

            </div>
        `;

    }

}


// ========================================================
// CARD SELAKU
// ========================================================

function buatKartuSelaku(selaku) {

    const tanggal =
        new Date(
            selaku.created_at
        ).toLocaleString(
            'id-ID',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }
        );


    return `
        <article class="pending-card">

            <div class="pending-card-header">

                <div>

                    <div class="pending-name">
                        ${escapeHTML(
                            selaku.username
                        )}
                    </div>

                    <div class="pending-code">
                        ${escapeHTML(
                            selaku.user_code
                        )}
                    </div>

                </div>


                <div class="pending-status">
                    PENDING
                </div>

            </div>


            <div class="pending-info">

                <div class="info-item">

                    <div class="info-label">
                        EMAIL
                    </div>

                    <div class="info-value">
                        ${escapeHTML(
                            selaku.email || '-'
                        )}
                    </div>

                </div>


                <div class="info-item">

                    <div class="info-label">
                        USER ID
                    </div>

                    <div class="info-value">
                        ${escapeHTML(
                            selaku.user_id
                        )}
                    </div>

                </div>


                <div class="info-item">

                    <div class="info-label">
                        TERDAFTAR
                    </div>

                    <div class="info-value">
                        ${escapeHTML(
                            tanggal
                        )}
                    </div>

                </div>

            </div>


            <div class="pending-action">

                <button
                    type="button"
                    class="btn-activate"
                    onclick="aktifkanSelaku('${escapeHTML(selaku.user_id)}')"
                >
                    BUKA AKSES SANGKAN
                </button>

            </div>

        </article>
    `;
}


// ========================================================
// AKTIFKAN SELAKU
// ========================================================

async function aktifkanSelaku(userId) {

    if (!userId) {

        alert(
            'User ID tidak ditemukan.'
        );

        return;
    }


    // ---------------------------------------------
    // KONFIRMASI
    // ---------------------------------------------

    const yakin =
        confirm(
            'Verifikasi pembayaran dan buka akses SANGKAN untuk Selaku ini?'
        );


    if (!yakin) {
        return;
    }


    // ---------------------------------------------
    // CARI BUTTON
    // ---------------------------------------------

    const buttons =
        document.querySelectorAll(
            '.btn-activate'
        );


    buttons.forEach(
        button => {

            if (
                button
                    .getAttribute('onclick')
                    ?.includes(userId)
            ) {

                button.disabled = true;

                button.textContent =
                    'MEMBUKA AKSES...';

            }

        }
    );


    try {

        // =========================================
        // RPC ADMIN
        // =========================================

        const {
            error
        } =
            await supabaseClient.rpc(
                'admin_activate_selaku',
                {
                    p_user_id: userId
                }
            );


        // =========================================
        // ERROR
        // =========================================

        if (error) {

            console.error(
                'RPC activation error:',
                error
            );


            alert(
                'Gagal membuka akses SANGKAN:\n\n' +
                error.message
            );


            await loadPending();

            return;
        }


        // =========================================
        // BERHASIL
        // =========================================

        alert(
            'Selaku berhasil diaktifkan.\n\n' +
            'Akses SANGKAN telah dibuka.'
        );


        // =========================================
        // REFRESH DATA
        // =========================================

        await loadPending();

    }

    catch (error) {

        console.error(
            'Gangguan aktivasi:',
            error
        );


        alert(
            'Terjadi gangguan:\n\n' +
            error.message
        );


        await loadPending();

    }

}


// ========================================================
// ESCAPE HTML
// ========================================================

function escapeHTML(value) {

    return String(
        value ?? ''
    )
        .replace(
            /&/g,
            '&amp;'
        )
        .replace(
            /</g,
            '&lt;'
        )
        .replace(
            />/g,
            '&gt;'
        )
        .replace(
            /"/g,
            '&quot;'
        )
        .replace(
            /'/g,
            '&#039;'
        );

}


// ========================================================
// REFRESH
// ========================================================

if (refreshButton) {

    refreshButton.addEventListener(
        'click',
        async function() {

            refreshButton.disabled = true;

            refreshButton.textContent =
                '↻  MEMBACA...';


            await loadPending();


            refreshButton.disabled = false;

            refreshButton.textContent =
                '↻  SEGARKAN';

        }
    );

}


// ========================================================
// AUTH STATE
// ========================================================

supabaseClient.auth.onAuthStateChange(
    async function(event, session) {

        console.log(
            'Auth event:',
            event
        );


        // ---------------------------------------------
        // SIGN OUT
        // ---------------------------------------------

        if (
            event === 'SIGNED_OUT' ||
            !session
        ) {

            tampilkanLogin();

            return;
        }


        // ---------------------------------------------
        // CEK ROLE
        // ---------------------------------------------

        const role =
            session.user?.app_metadata?.role;


        if (role !== 'admin') {

            await supabaseClient.auth.signOut();

            tampilkanLogin();

            return;
        }


        // ---------------------------------------------
        // ADMIN
        // ---------------------------------------------

        tampilkanDashboard();

        await loadPending();

    }
);


// ========================================================
// MULAI SISTEM
// ========================================================

cekSession();
