// ========================================================
// LAKUKOTA — FULFILLMENT DASHBOARD
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

const logoutButton =
    document.getElementById('logout-btn');

const manifestedList =
    document.getElementById('manifested-list');

const manifestedCount =
    document.getElementById('manifested-count');


// ========================================================
// LOGIN / DASHBOARD
// ========================================================

function tampilkanDashboard() {

    loginSection?.classList.add('hidden');

    dashboardSection?.classList.remove('hidden');

}


function tampilkanLogin() {

    dashboardSection?.classList.add('hidden');

    loginSection?.classList.remove('hidden');

}


function setLoginStatus(pesan = '') {

    if (loginStatus) {
        loginStatus.textContent = pesan;
    }

}


// ========================================================
// LOGIN ADMIN / FULFILLMENT
// ========================================================

if (loginForm) {

    loginForm.addEventListener(
        'submit',
        async function(event) {

            event.preventDefault();

            const email =
                document
                    .getElementById('admin-email')
                    ?.value
                    .trim();

            const password =
                document
                    .getElementById('admin-password')
                    ?.value;


            if (!email || !password) {

                setLoginStatus(
                    'Email dan password wajib diisi.'
                );

                return;
            }


            if (loginButton) {

                loginButton.disabled = true;

                loginButton.textContent =
                    'MEMBUKA GERBANG...';

            }

            setLoginStatus('');


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInWithPassword({
                            email,
                            password
                        });


                if (error) {
                    throw error;
                }


                const user =
                    data?.user;


                if (!user) {

                    throw new Error(
                        'Akun tidak ditemukan.'
                    );

                }


                const role =
                    user.app_metadata?.role;


                console.log(
                    'Fulfillment login:',
                    user.email
                );

                console.log(
                    'Role:',
                    role
                );


                // Untuk MVP fulfillment masih
                // menggunakan role admin yang sama.

                if (role !== 'admin') {

                    await supabaseClient.auth
                        .signOut();

                    throw new Error(
                        'Akun ini tidak memiliki akses fulfillment.'
                    );

                }


                tampilkanDashboard();

                await loadManifested();


                if (loginButton) {

                    loginButton.disabled = false;

                    loginButton.textContent =
                        'GERBANG TERBUKA';

                }

            }

            catch (error) {

                console.error(
                    'Login fulfillment gagal:',
                    error
                );

                setLoginStatus(
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
// CEK SESSION
// ========================================================

async function cekSession() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .getSession();


        if (error) {
            throw error;
        }


        const session =
            data?.session;


        if (!session) {

            tampilkanLogin();

            return;
        }


        const role =
            session.user?.app_metadata?.role;


        if (role !== 'admin') {

            await supabaseClient.auth.signOut();

            tampilkanLogin();

            return;
        }


        tampilkanDashboard();

        await loadManifested();

    }

    catch (error) {

        console.error(
            'Gagal membaca session:',
            error
        );

        tampilkanLogin();

    }

}


// ========================================================
// LOAD MANIFESTED
// ========================================================

async function loadManifested() {

    if (!manifestedList ||
        !manifestedCount) {

        console.error(
            'Element fulfillment tidak ditemukan.'
        );

        return;
    }


    manifestedList.innerHTML = `
        <div class="empty-state">

            <div class="empty-symbol">
                ◌
            </div>

            <div class="empty-title">
                MEMBACA MANIFESTASI
            </div>

            <div class="empty-description">
                Membaca antrean Atmaka yang
                siap dipenuhi...
            </div>

        </div>
    `;


    try {

        // =================================================
        // STEP 1
        // AMBIL USER_ATMAKAS YANG MANIFESTED
        // =================================================

        const {
            data: manifestedRows,
            error: manifestedError
        } =
            await supabaseClient
                .from('user_atmakas')
                .select(`
                    id,
                    user_id,
                    atmaka_id,
                    crafted_at,
                    claim_status
                `)
                .eq(
                    'claim_status',
                    'MANIFESTED'
                )
                .order(
                    'crafted_at',
                    {
                        ascending: true
                    }
                );


        if (manifestedError) {
            throw manifestedError;
        }


        if (
            !manifestedRows ||
            manifestedRows.length === 0
        ) {

            manifestedCount.textContent = '0';

            manifestedList.innerHTML = `
                <div class="empty-state">

                    <div class="empty-symbol">
                        ◇
                    </div>

                    <div class="empty-title">
                        ANTREAN KOSONG
                    </div>

                    <div class="empty-description">
                        Belum ada Atmaka yang menunggu
                        fulfillment.
                    </div>

                </div>
            `;

            return;
        }


        manifestedCount.textContent =
            manifestedRows.length;


        // =================================================
        // KUMPULKAN ID
        // =================================================

        const userIds =
            [
                ...new Set(
                    manifestedRows
                        .map(row => row.user_id)
                        .filter(Boolean)
                )
            ];


        const atmakaIds =
            [
                ...new Set(
                    manifestedRows
                        .map(row => row.atmaka_id)
                        .filter(Boolean)
                )
            ];


        // =================================================
        // STEP 2
        // AMBIL DATA USERS
        // =================================================

        const {
            data: users,
            error: usersError
        } =
            await supabaseClient
                .from('users')
                .select(`
                    user_id,
                    user_code,
                    username,
                    email
                `)
                .in(
                    'user_id',
                    userIds
                );


        if (usersError) {
            throw usersError;
        }


        // =================================================
        // STEP 3
        // AMBIL DATA ATMAKA
        // =================================================

        const {
            data: atmakaRows,
            error: atmakaError
        } =
            await supabaseClient
                .from('atmakas')
                .select(`
                    atmaka_id,
                    atmaka_code,
                    atmaka_name,
                    rarity
                `)
                .in(
                    'atmaka_id',
                    atmakaIds
                );


        if (atmakaError) {
            throw atmakaError;
        }


        // =================================================
        // BUAT INDEX
        // =================================================

        const usersMap =
            new Map(
                (users || [])
                    .map(
                        user => [
                            user.user_id,
                            user
                        ]
                    )
            );


        const atmakaMap =
            new Map(
                (atmakaRows || [])
                    .map(
                        atmaka => [
                            atmaka.atmaka_id,
                            atmaka
                        ]
                    )
            );


        // =================================================
        // GABUNGKAN DATA
        // =================================================

        const queue =
            manifestedRows.map(row => ({

                ...row,

                user:
                    usersMap.get(
                        row.user_id
                    ) || null,

                atmaka:
                    atmakaMap.get(
                        row.atmaka_id
                    ) || null

            }));


        // =================================================
        // RENDER
        // =================================================

        manifestedList.innerHTML =
            queue
                .map(
                    item =>
                        buatKartuManifested(item)
                )
                .join('');


        console.log(
            'Manifested:',
            queue
        );

    }

    catch (error) {

        console.error(
            'Gagal membaca fulfillment:',
            error
        );


        manifestedCount.textContent = '?';


        manifestedList.innerHTML = `
            <div class="empty-state">

                <div class="empty-symbol">
                    !
                </div>

                <div class="empty-title">
                    GAGAL MEMBACA DATA
                </div>

                <div class="empty-description">
                    ${escapeHTML(
                        error.message
                    )}
                </div>

            </div>
        `;

    }

}


// ========================================================
// CARD MANIFESTED
// ========================================================

function buatKartuManifested(item) {

    const user =
        item.user || {};

    const atmaka =
        item.atmaka || {};


    const tanggal =
        item.crafted_at
            ? new Date(
                item.crafted_at
              ).toLocaleString(
                'id-ID',
                {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }
              )
            : '-';


    return `
        <article class="manifested-card">

            <div class="manifested-card-header">

                <div>

                    <div class="selaku-name">
                        ${escapeHTML(
                            user.username || '-'
                        )}
                    </div>

                    <div class="selaku-code">
                        ${escapeHTML(
                            user.user_code || '-'
                        )}
                    </div>

                </div>


                <div class="manifested-status">
                    MANIFESTED
                </div>

            </div>


            <div class="manifested-info">

                <div class="info-item">

                    <div class="info-label">
                        ATMAKA
                    </div>

                    <div class="info-value atmaka-name">
                        ${escapeHTML(
                            atmaka.atmaka_name || '-'
                        )}
                    </div>

                </div>


                <div class="info-item">

                    <div class="info-label">
                        KODE ATMAKA
                    </div>

                    <div class="info-value">
                        ${escapeHTML(
                            atmaka.atmaka_code || '-'
                        )}
                    </div>

                </div>


                <div class="info-item">

                    <div class="info-label">
                        RARITY
                    </div>

                    <div class="info-value">
                        ${escapeHTML(
                            atmaka.rarity || '-'
                        )}
                    </div>

                </div>


                <div class="info-item">

                    <div class="info-label">
                        EMAIL
                    </div>

                    <div class="info-value">
                        ${escapeHTML(
                            user.email || '-'
                        )}
                    </div>

                </div>


                <div class="info-item">

                    <div class="info-label">
                        DIMANIFESTASIKAN
                    </div>

                    <div class="info-value">
                        ${escapeHTML(
                            tanggal
                        )}
                    </div>

                </div>

            </div>


            <div class="fulfillment-note">

                <strong>
                    SIAP DIPENUHI
                </strong>

                <span>
                    Siapkan Atmaka fisik untuk Selaku ini.
                    Setelah diserahkan, perubahan status
                    dilakukan melalui proses serah-terima.
                </span>

            </div>

        </article>
    `;
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


            await loadManifested();


            refreshButton.disabled = false;

            refreshButton.textContent =
                '↻  SEGARKAN';

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

            const yakin =
                confirm(
                    'Keluar dari fulfillment console?'
                );

            if (!yakin) {
                return;
            }

            const {
                error
            } =
                await supabaseClient.auth.signOut();

            if (error) {

                console.error(
                    'Gagal logout:',
                    error
                );

                alert(
                    'Gagal keluar: ' +
                    error.message
                );

                return;
            }

            tampilkanLogin();

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


        if (
            event === 'SIGNED_OUT' ||
            !session
        ) {

            tampilkanLogin();

            return;
        }


        const role =
            session.user?.app_metadata?.role;


        if (role !== 'admin') {

            await supabaseClient.auth
                .signOut();

            tampilkanLogin();

            return;
        }


        tampilkanDashboard();

        await loadManifested();

    }
);


// ========================================================
// MULAI
// ========================================================

cekSession();
