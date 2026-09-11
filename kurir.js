// =========================================================
// LAKUKOTA
// PANDE / KURIR APP
// V1 — VALIDASI + HANDOVER
// =========================================================


// =========================================================
// STATE
// =========================================================

let currentToken = null;

let currentOrder = null;

let qrScanner = null;

let scannerRunning = false;


// =========================================================
// DOM
// =========================================================

const inputToken =
  document.getElementById(
    "qr-token"
  );

const btnScan =
  document.getElementById(
    "btn-scan"
  );

const btnValidasi =
  document.getElementById(
    "btn-validasi"
  );

const btnTerima =
  document.getElementById(
    "btn-terima"
  );

const btnReset =
  document.getElementById(
    "btn-reset"
  );

const reader =
  document.getElementById(
    "reader"
  );

const statusBox =
  document.getElementById(
    "status"
  );

const orderCard =
  document.getElementById(
    "order-card"
  );


// =========================================================
// UTIL
// =========================================================

function setStatus(
  message,
  type = "info"
) {

  statusBox.className =
    `status ${type}`;

  statusBox.innerHTML =
    message;

}


function clearStatus() {

  statusBox.className =
    "status";

  statusBox.innerHTML =
    "";

}


function formatTanggal(value) {

  if (!value) {
    return "—";
  }

  try {

    return new Date(value)
      .toLocaleString(
        "id-ID",
        {
          dateStyle: "medium",
          timeStyle: "short"
        }
      );

  } catch {

    return value;

  }

}


function formatError(error) {

  if (!error) {
    return "Kesalahan tidak diketahui.";
  }

  return (
    error.message ||
    error.details ||
    error.hint ||
    "Terjadi kesalahan."
  );

}


// =========================================================
// RESET ORDER UI
// =========================================================

function resetOrderUI() {

  orderCard.style.display =
    "none";

  document.getElementById(
    "order-user"
  ).innerText = "—";

  document.getElementById(
    "order-atmaka"
  ).innerText = "—";

  document.getElementById(
    "order-status"
  ).innerHTML = "—";

  document.getElementById(
    "order-window"
  ).innerText = "—";

  document.getElementById(
    "order-token"
  ).innerText = "—";

  currentToken = null;

  currentOrder = null;

  btnTerima.disabled = false;

  btnTerima.innerText =
    "📦 TERIMA PAKET";

}


// =========================================================
// STOP SCANNER
// =========================================================

async function stopScanner() {

  if (!qrScanner) {
    return;
  }

  if (!scannerRunning) {
    return;
  }

  try {

    await qrScanner.stop();

    await qrScanner.clear();

  } catch (err) {

    console.warn(
      "Scanner stop:",
      err
    );

  }

  scannerRunning = false;

  reader.style.display =
    "none";

}


// =========================================================
// START SCANNER
// =========================================================

async function startScanner() {

  if (
    typeof Html5Qrcode ===
    "undefined"
  ) {

    setStatus(
      "❌ Mesin pemindai QR tidak tersedia.",
      "error"
    );

    return;

  }


  if (scannerRunning) {

    await stopScanner();

    return;

  }


  reader.style.display =
    "block";


  qrScanner =
    new Html5Qrcode(
      "reader"
    );


  try {

    await qrScanner.start(

      {
        facingMode: "environment"
      },

      {
        fps: 10,

        qrbox: {
          width: 250,
          height: 250
        }

      },

      async (
        decodedText
      ) => {

        console.log(
          "📷 QR TERBACA:",
          decodedText
        );


        inputToken.value =
          decodedText;


        await stopScanner();


        setStatus(
          "Rajah terbaca. Melakukan validasi...",
          "info"
        );


        await validasiRajah();

      },

      () => {

        // Abaikan frame yang belum menemukan QR.

      }

    );


    scannerRunning =
      true;


    btnScan.innerText =
      "✕ TUTUP PEMINDAI";


    setStatus(
      "Arahkan kamera ke Rajah Penukaran.",
      "info"
    );

  } catch (err) {

    console.error(
      "❌ SCANNER GAGAL:",
      err
    );


    reader.style.display =
      "none";


    setStatus(
      "❌ Kamera tidak dapat digunakan.<br><br>" +
      formatError(err),
      "error"
    );

  }

}


// =========================================================
// VALIDASI RAJAH
// =========================================================
//
// Penting:
// Kita TIDAK melakukan handover di sini.
// Validasi hanya membaca fulfillment_orders.
//
// Status yang sah untuk diterima:
// MANIFESTED
//
// RECEIVED:
// sudah pernah diterima → ditolak.
// =========================================================

async function validasiRajah() {

  const token =
    inputToken.value.trim();


  if (!token) {

    setStatus(
      "Masukkan atau pindai Rajah Penukaran terlebih dahulu.",
      "error"
    );

    return;

  }


  btnValidasi.disabled =
    true;

  btnValidasi.innerText =
    "MEMERIKSA...";


  resetOrderUI();


  try {

    console.log(
      "🔎 PANDE VALIDASI RAJAH:",
      token
    );


    const {
      data,
      error
    } =
      await supabaseClient

        .from(
          "fulfillment_orders"
        )

        .select(
          `
          id,
          user_id,
          atmaka_id,
          status,
          fulfillment_window,
          qr_token,
          transaction_id,
          created_at,
          received_at,
          atmakas (
            atmaka_name
          )
          `
        )

        .eq(
          "qr_token",
          token
        )

        .maybeSingle();


    if (error) {
      throw error;
    }


    if (!data) {

      throw new Error(
        "Rajah Penukaran tidak ditemukan."
      );

    }


    console.log(
      "📦 ORDER DITEMUKAN:",
      data
    );


    currentToken =
      token;

    currentOrder =
      data;


    // -----------------------------------------------------
    // STATUS RECEIVED
    // -----------------------------------------------------

    if (
      data.status ===
      "RECEIVED"
    ) {

      tampilkanOrder(
        data
      );


      btnTerima.disabled =
        true;

      btnTerima.innerText =
        "✓ SUDAH DITERIMA";


      setStatus(
        "Rajah ini sudah pernah ditukar. Paket tidak dapat diterima kembali.",
        "error"
      );


      return;

    }


    // -----------------------------------------------------
    // STATUS HARUS MANIFESTED
    // -----------------------------------------------------

    if (
      data.status !==
      "MANIFESTED"
    ) {

      tampilkanOrder(
        data
      );


      btnTerima.disabled =
        true;


      setStatus(
        `Rajah tidak dapat ditukar.<br>Status saat ini: <strong>${data.status}</strong>`,
        "error"
      );


      return;

    }


    // -----------------------------------------------------
    // VALID
    // -----------------------------------------------------

    tampilkanOrder(
      data
    );


    btnTerima.disabled =
      false;


    setStatus(
      "✓ Rajah valid.<br>Paket dapat diserahkan kepada Selaku.",
      "success"
    );


  } catch (err) {

    console.error(
      "❌ VALIDASI GAGAL:",
      err
    );


    resetOrderUI();


    setStatus(
      "❌ Rajah tidak valid.<br><br>" +
      formatError(err),
      "error"
    );

  } finally {

    btnValidasi.disabled =
      false;

    btnValidasi.innerText =
      "VALIDASI RAJAH";

  }

}


// =========================================================
// TAMPILKAN ORDER
// =========================================================

function tampilkanOrder(
  order
) {

  orderCard.style.display =
    "block";


  document.getElementById(
    "order-user"
  ).innerText =
    order.user_id ||
    "—";


  document.getElementById(
    "order-atmaka"
  ).innerText =
    order.atmakas?.atmaka_name ||
    order.atmaka_id ||
    "—";


  document.getElementById(
    "order-window"
  ).innerText =
    formatTanggal(
      order.fulfillment_window
    );


  document.getElementById(
    "order-token"
  ).innerText =
    order.qr_token ||
    "—";


  const statusElement =
    document.getElementById(
      "order-status"
    );


  if (
    order.status ===
    "MANIFESTED"
  ) {

    statusElement.innerHTML =
      `<span class="badge badge-manifested">
        MANIFESTED
      </span>`;

  } else if (
    order.status ===
    "RECEIVED"
  ) {

    statusElement.innerHTML =
      `<span class="badge badge-received">
        RECEIVED
      </span>`;

  } else {

    statusElement.innerText =
      order.status ||
      "—";

  }

}


// =========================================================
// TERIMA PAKET
// =========================================================
//
// Ini adalah satu-satunya titik yang mengubah status.
//
// RPC:
// terima_fulfillment_order(p_qr_token)
//
// MANIFESTED → RECEIVED
// =========================================================

async function terimaPaket() {

  if (!currentToken) {

    setStatus(
      "Validasi Rajah terlebih dahulu.",
      "error"
    );

    return;

  }


  if (
    !currentOrder ||
    currentOrder.status !==
      "MANIFESTED"
  ) {

    setStatus(
      "Order ini tidak berada dalam status MANIFESTED.",
      "error"
    );

    return;

  }


  const yakin =
    confirm(
      "Tukar Rajah ini sekarang?\n\n" +
      "Setelah diterima, Rajah tidak dapat digunakan kembali."
    );


  if (!yakin) {
    return;
  }


  btnTerima.disabled =
    true;

  btnTerima.innerText =
    "MEMPROSES...";


  try {

    console.log(
      "📦 PANDE HANDOVER:",
      currentToken
    );


    const {
      data,
      error
    } =
      await supabaseClient.rpc(
        "terima_fulfillment_order",
        {
          p_qr_token:
            currentToken
        }
      );


    if (error) {
      throw error;
    }


    console.log(
      "📦 HASIL HANDOVER:",
      data
    );


    if (
      !data ||
      !data.success
    ) {

      throw new Error(
        "Penerimaan paket gagal."
      );

    }


    // -----------------------------------------------------
    // UPDATE STATE LOKAL
    // -----------------------------------------------------

    currentOrder.status =
      "RECEIVED";


    currentOrder.received_at =
      data.received_at;


    tampilkanOrder(
      currentOrder
    );


    // -----------------------------------------------------
    // KUNCI TOMBOL
    // -----------------------------------------------------

    btnTerima.disabled =
      true;

    btnTerima.innerText =
      "✓ PAKET TELAH DITERIMA";


    setStatus(
      "📦 <strong>PAKET BERHASIL DITERIMA.</strong><br><br>" +
      "Status fulfillment: RECEIVED<br>" +
      "Rajah tidak dapat digunakan kembali.",
      "success"
    );


    // -----------------------------------------------------
    // LOG
    // -----------------------------------------------------

    console.log(
      "✅ HANDOVER SELESAI",
      {
        fulfillment_order_id:
          data.fulfillment_order_id,

        transaction_id:
          data.transaction_id,

        user_id:
          data.user_id,

        atmaka_id:
          data.atmaka_id,

        received_at:
          data.received_at
      }
    );


  } catch (err) {

    console.error(
      "❌ HANDOVER GAGAL:",
      err
    );


    btnTerima.disabled =
      false;

    btnTerima.innerText =
      "📦 TERIMA PAKET";


    setStatus(
      "❌ Paket tidak dapat diterima.<br><br>" +
      formatError(err),
      "error"
    );

  }

}


// =========================================================
// RESET
// =========================================================

async function resetAplikasi() {

  await stopScanner();


  inputToken.value =
    "";


  resetOrderUI();


  clearStatus();


  window.scrollTo(
    {
      top: 0,
      behavior: "smooth"
    }
  );

}


// =========================================================
// EVENT LISTENERS
// =========================================================

btnScan.addEventListener(
  "click",
  async () => {

    await startScanner();

  }
);


btnValidasi.addEventListener(
  "click",
  async () => {

    await validasiRajah();

  }
);


btnTerima.addEventListener(
  "click",
  async () => {

    await terimaPaket();

  }
);


btnReset.addEventListener(
  "click",
  async () => {

    await resetAplikasi();

  }
);


// =========================================================
// ENTER = VALIDASI
// =========================================================

inputToken.addEventListener(
  "keydown",
  async (event) => {

    if (
      event.key ===
      "Enter"
    ) {

      event.preventDefault();

      await validasiRajah();

    }

  }
);


// =========================================================
// BOOT
// =========================================================

console.log(
  "🔨 LAKUKOTA PANDE APP V1"
);

console.log(
  "📦 Menunggu Rajah Penukaran..."
);
