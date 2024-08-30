document.addEventListener("DOMContentLoaded", function () {
  // Mendapatkan referensi ke tombol-tombol
  const btnPresensiHadir = document.querySelector(
    ".btn-container .btn:nth-child(1)"
  );
  const btnPresensiAlpa = document.querySelector(
    ".btn-container .btn:nth-child(2)"
  );
  const btnIzin = document.querySelector(
    ".small-btn-container .btn1:nth-child(1)"
  );
  const btnSakit = document.querySelector(
    ".small-btn-container .btn1:nth-child(2)"
  );

  // Fungsi untuk mendapatkan tanggal dan waktu saat ini dalam format yang diinginkan
  function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const time = now.toTimeString().split(" ")[0];
    return {
      year,
      month,
      dateTime: `${year}/${month}/${date}/${time}`,
    };
  }

  // Fungsi untuk menyimpan presensi
  function savePresensi(status) {
    const user = firebase.auth().currentUser;
    if (!user) {
      alert("Anda harus login terlebih dahulu");
      return;
    }

    const userId = user.uid;
    const { year, month, dateTime } = getCurrentDateTime();

    const presensiRef = firebase
      .database()
      .ref(`attendance/${userId}/${year}/${month}`);

    const newPresensiData = {
      [status]: `${dateTime}/${status}`,
    };

    presensiRef
      .update(newPresensiData)
      .then(() => {
        alert(`Presensi ${status} berhasil disimpan!`);
      })
      .catch((error) => {
        console.error("Error menyimpan presensi:", error);
        alert("Terjadi kesalahan saat menyimpan presensi");
      });
  }

  // Event listener untuk tombol-tombol
  btnPresensiHadir.addEventListener("click", () => savePresensi("hadir"));
  btnPresensiAlpa.addEventListener("click", () => savePresensi("alpa"));
  btnIzin.addEventListener("click", () => savePresensi("izin"));
  btnSakit.addEventListener("click", () => savePresensi("sakit"));

  // Fungsi untuk menampilkan nama dan kelompok pengguna
  function displayUserInfo() {
    const user = firebase.auth().currentUser;
    if (user) {
      firebase
        .database()
        .ref(`users/${user.uid}`)
        .once("value")
        .then((snapshot) => {
          const userData = snapshot.val();
          if (userData) {
            const nameElement = document.querySelector(".profile span");
            if (nameElement) {
              nameElement.innerHTML = `${
                userData.username || "Nama"
              }<br><span class="kelompok">${
                userData.kelompok || "Kelompok"
              }</span>`;
            }
          }
        })
        .catch((error) => {
          console.error("Error mengambil data pengguna:", error);
        });
    }
  }

  // Cek status autentikasi pengguna
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log("User logged in:", user.uid);
      displayUserInfo();
    } else {
      console.log("No user logged in");
      window.location.href = "login.html"; // Redirect ke halaman login jika tidak ada user yang login
    }
  });
});
