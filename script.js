// ======= DATA & INIT =======
const kategoriDonatur = {
  kategori1: [
    "Mas Ani",
    "Pak Kholis",
    "Pak Hasyim",
    "Amat",
    "Mbak Is",
    "Dani",
    "Pak Napi",
    "Pak Ipin",
    "Mas Agus BZ",
    "Pak Fat",
    "Pak Ropi",
    "Mas Umam",
    "Pak Kisman",
    "Pak Yanto",
    "Pak Pardi",
    "Pak Salam",
    "Pak Piyan",
    "Pak Slamet",
    "Pak Ibin",
    "Idek",
    "Pak Ngari",
    "Pak Tukhin",
    "Pak Rofiq",
    "Pak Syafak",
    "Pak Jubaidi",
    "Mbak Kholis",
    "Pak Kholiq",
    "Pak Rokhan",
    "Mas Agus",
    "Mas Izin",
    "Pak Abror",
    "Mas Gustaf",
  ],
  kategori2: ["Pak A", "Pak B", "Pak C"],
  kategori3: ["Pak A", "Pak B", "Pak C"],
};

const kategoriLabel = {
  kategori1: "RT Tengah",
  kategori2: "RT Kulon",
  kategori3: "RT Kidul",
};

let dataDonasi = [];

let sudahUploadHariIni = {
  kategori1: false,
  kategori2: false,
  kategori3: false,
};

const UPLOAD_URL = "https://input.pnakote.my.id/upload";

document.addEventListener("DOMContentLoaded", function () {
  const tanggalHariIni = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  document.getElementById(
    "tanggalHariIni"
  ).innerHTML = `<i class="fas fa-calendar-day mr-2 text-purple-500"></i>${tanggalHariIni}`;

  muatDropdown("kategori1");
  checkUploadStatus();

  document.getElementById("btnTambah").addEventListener("click", tambahData);
  document
    .getElementById("btnUpload")
    .addEventListener("click", uploadToGoogleSheets);

  document
    .getElementById("kategoriDonatur")
    .addEventListener("change", function () {
      muatDropdown(this.value);
      dataDonasi = [];
      const tbody = document.querySelector("#tabelDonasi tbody");
      tbody.innerHTML = "";
      checkUploadStatus();
    });
});

function getLastUploadDate() {
  const raw = localStorage.getItem("lastUploadDate");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function checkUploadStatus() {
  const lastUploadDate = getLastUploadDate();
  const today = new Date().toDateString();
  const kategori = document.getElementById("kategoriDonatur").value;

  if (lastUploadDate[kategori] === today) {
    sudahUploadHariIni[kategori] = true;
    document.getElementById("btnUpload").disabled = true;
    document.getElementById("btnUpload").classList.add("upload-disabled");
    document.getElementById("uploadInfo").textContent =
      "Anda sudah melakukan upload hari ini untuk " +
      kategoriLabel[kategori] +
      ". Upload hanya dapat dilakukan sekali per hari.";
    showUploadStatus(
      "Anda sudah melakukan upload hari ini untuk " + kategoriLabel[kategori],
      false
    );
  } else {
    sudahUploadHariIni[kategori] = false;
    document.getElementById("btnUpload").disabled = false;
    document.getElementById("btnUpload").classList.remove("upload-disabled");
    document.getElementById("uploadInfo").textContent =
      "Upload data untuk " + kategoriLabel[kategori];
    showUploadStatus(
      "Siap untuk upload data kategori " + kategoriLabel[kategori],
      null
    );
  }
}

function showNotification(message, isSuccess = true) {
  const notif = document.getElementById("notifikasi");
  notif.textContent = message;
  notif.className =
    "mb-4 md:mb-6 text-center p-3 md:p-4 rounded-xl transition-all duration-300 opacity-100 show";
  if (isSuccess) {
    notif.classList.add("bg-green-50", "border-green-200", "text-green-700");
  } else {
    notif.classList.add("bg-red-50", "border-red-200", "text-red-700");
  }
  setTimeout(() => notif.classList.remove("show"), 3000);
}

function showUploadStatus(message, isSuccess = null) {
  const status = document.getElementById("uploadStatus");
  status.textContent = message;
  status.className =
    "text-center p-4 rounded-xl transition-all duration-300 opacity-100 show";
  if (isSuccess === true)
    status.classList.add("bg-green-50", "border-green-200", "text-green-700");
  else if (isSuccess === false)
    status.classList.add("bg-red-50", "border-red-200", "text-red-700");
  else status.classList.add("bg-blue-50", "border-blue-200", "text-blue-700");
}

function muatDropdown(kategori = "kategori1") {
  const select = document.getElementById("donatur");
  select.innerHTML = "";
  kategoriDonatur[kategori].forEach((nama) =>
    select.add(new Option(nama, nama))
  );
  document.getElementById("btnTambah").disabled = false;
  document.getElementById("btnText").textContent = "Tambah";
  document.getElementById("pemasukan").disabled = false;
}

function tambahData() {
  const donatur = document.getElementById("donatur").value;
  const nominal = document.getElementById("pemasukan").value;
  if (nominal === "") {
    showNotification("Nominal tidak boleh kosong", false);
    return;
  }
  const tanggal = new Date().toLocaleDateString("id-ID");
  dataDonasi.push({ donatur, nominal, tanggal });

  const tbody = document.querySelector("#tabelDonasi tbody");
  const row = tbody.insertRow();
  row.className = "table-row";

  const donaturCell = row.insertCell(0);
  donaturCell.className = "py-3 md:py-4 px-4 md:px-6";
  donaturCell.textContent = donatur;

  const nominalCell = row.insertCell(1);
  nominalCell.className = "py-3 md:py-4 px-4 md:px-6 text-right font-mono";
  nominalCell.textContent = "Rp " + Number(nominal).toLocaleString("id-ID");

  const aksiCell = row.insertCell(2);
  aksiCell.className = "py-3 md:py-4 px-4 md:px-6 text-center";
  const editBtn = document.createElement("button");
  editBtn.innerHTML = `<i class="fas fa-edit"></i>`;
  editBtn.className =
    "bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-lg transition duration-200 mx-1";
  editBtn.title = "Edit donasi";
  editBtn.addEventListener("click", () => editRow(row));
  aksiCell.appendChild(editBtn);

  const select = document.getElementById("donatur");
  select.remove(select.selectedIndex);

  if (select.options.length === 0) {
    document.getElementById("btnTambah").disabled = true;
    document.getElementById("btnText").textContent = "Selesai";
    showNotification("✅ Semua donatur sudah diinput");
    document.getElementById("pemasukan").disabled = true;
  } else showNotification(`✅ Nominal ${donatur} berhasil ditambahkan`);

  document.getElementById("pemasukan").value = "";
  hitungTotal();
}

function hitungTotal() {
  let total = 0;
  document.querySelectorAll("#tabelDonasi tbody tr").forEach((row) => {
    const text = row.cells[1].textContent.replace(/[Rp\s.]/g, "");
    total += Number(text);
  });
  const formatted = "Rp " + total.toLocaleString("id-ID");
  document.getElementById("totalDonasi").textContent = formatted;
  document.getElementById("totalDonasiMobile").textContent = formatted;
}

function editRow(row) {
  const nominalCell = row.cells[1];
  const aksiCell = row.cells[2];
  const currentNominal = nominalCell.textContent.replace(/[Rp\s.]/g, "");
  nominalCell.innerHTML = `<input type="number" id="editInput" value="${currentNominal}" min="0" class="w-24 md:w-32 px-3 py-2 border border-gray-300 rounded text-right font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500">`;
  aksiCell.innerHTML = "";
  const saveBtn = document.createElement("button");
  saveBtn.innerHTML = `<i class="fas fa-check"></i>`;
  saveBtn.className =
    "bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg mx-1 transition duration-200";
  saveBtn.addEventListener("click", () => saveRow(row));
  aksiCell.appendChild(saveBtn);
}

function saveRow(row) {
  const newValue = document.getElementById("editInput").value;
  if (newValue === "") {
    showNotification("Nominal tidak boleh kosong", false);
    return;
  }
  row.cells[1].textContent = "Rp " + Number(newValue).toLocaleString("id-ID");
  hitungTotal();
  showNotification(`✅ Donasi ${row.cells[0].textContent} berhasil diperbarui`);
}

function uploadToGoogleSheets() {
  const kategori = document.getElementById("kategoriDonatur").value;

  if (sudahUploadHariIni[kategori]) {
    showUploadStatus(
      "Anda sudah melakukan upload hari ini untuk kategori ini. Upload hanya dapat dilakukan sekali per hari.",
      false
    );
    return;
  }

  if (!UPLOAD_URL || UPLOAD_URL === "") {
    showUploadStatus("URL backend belum diset", false);
    return;
  }

  if (dataDonasi.length === 0) {
    showUploadStatus("Tidak ada data untuk diupload", false);
    return;
  }

  showUploadStatus("Mengupload data...", null);

  fetch(UPLOAD_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kategori: kategori, data: dataDonasi }),
  })
    .then((response) => response.text())
    .then((text) => {
      try {
        const data = JSON.parse(text);
        if (data.result === "success") {
          const today = new Date().toDateString();
          let lastUploadDate = JSON.parse(
            localStorage.getItem("lastUploadDate") || "{}"
          );
          lastUploadDate[kategori] = today;
          localStorage.setItem(
            "lastUploadDate",
            JSON.stringify(lastUploadDate)
          );

          sudahUploadHariIni[kategori] = true;

          checkUploadStatus();

          showUploadStatus(
            "✅ Data berhasil diupload untuk kategori " +
              kategoriLabel[kategori],
            true
          );
          dataDonasi = [];
          hitungTotal();

          muatDropdown(kategori);
        } else {
          showUploadStatus(
            "❌ Server menolak data: " + (data.message || ""),
            false
          );
        }
      } catch (e) {
        console.error("Response bukan JSON valid atau terjadi error:", e);
        showUploadStatus("✅ Data berhasil diupload", true);
      }
    })
    .catch((err) => {
      console.error("Fetch Error:", err);
      showUploadStatus("❌ Gagal mengirim data: " + err.message, false);
    });
}
