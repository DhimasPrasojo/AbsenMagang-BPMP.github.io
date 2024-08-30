// Pastikan Firebase sudah diinisialisasi di file firebase-config.js

// Referensi ke database
const db = firebase.database();

// Ambil elemen-elemen yang diperlukan
const form = document.querySelector(".editor");
const kelompokInput = document.getElementById("kelompok");
const phoneInput = document.getElementById("phone");
const nameElement = document.querySelector(".name h1");

// Fungsi untuk menyimpan data ke Firebase
function saveData(event) {
  event.preventDefault();

  const kelompok = kelompokInput.value;
  const phone = phoneInput.value;

  // Dapatkan ID pengguna yang sedang login
  const user = firebase.auth().currentUser;
  if (user) {
    // Update data ke Firebase tanpa menimpa data yang sudah ada
    db.ref("users/" + user.uid)
      .update({
        kelompok: kelompok,
        phone: phone,
      })
      .then(() => {
        alert("Data berhasil disimpan!");
        // Perbarui nama yang ditampilkan
        updateDisplayName();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Terjadi kesalahan saat menyimpan data.");
      });
  } else {
    alert("Anda harus login terlebih dahulu.");
  }
}

// Fungsi untuk memperbarui nama yang ditampilkan
function updateDisplayName() {
  const user = firebase.auth().currentUser;
  if (user) {
    db.ref("users/" + user.uid)
      .once("value")
      .then((snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.username) {
          nameElement.textContent = userData.username;
        } else {
          nameElement.textContent = "Nama Pengguna";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

// Tambahkan event listener untuk form submission
form.addEventListener("submit", saveData);

// Panggil fungsi updateDisplayName saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      updateDisplayName();
      // Isi form dengan data yang sudah ada (jika ada)
      db.ref("users/" + user.uid)
        .once("value")
        .then((snapshot) => {
          const userData = snapshot.val();
          if (userData) {
            if (userData.kelompok) kelompokInput.value = userData.kelompok;
            if (userData.phone) phoneInput.value = userData.phone;
          }
        });
    } else {
      // Redirect ke halaman login jika pengguna belum login
      window.location.href = "login.html";
    }
  });
});
