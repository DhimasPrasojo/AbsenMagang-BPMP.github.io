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

  // Koordinat lokasi yang diizinkan (4°00'54"S 122°30'02"E)
  const allowedLocation = {
    lat: -4.015, // Latitude
    lng: 122.500556, // Longitude
    radius: 100, // Radius dalam meter
  };

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

  // Fungsi untuk menghitung jarak antara dua titik koordinat
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius bumi dalam meter
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Jarak dalam meter
  }

  // Fungsi untuk memeriksa lokasi pengguna
  function checkLocation(callback) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const distance = calculateDistance(
            userLat,
            userLng,
            allowedLocation.lat,
            allowedLocation.lng
          );

          if (distance <= allowedLocation.radius) {
            callback(true);
          } else {
            callback(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Tidak dapat mendapatkan lokasi Anda. Pastikan GPS aktif dan izin lokasi diberikan."
          );
          callback(false);
        }
      );
    } else {
      alert("Browser Anda tidak mendukung geolokasi.");
      callback(false);
    }
  }

  // Fungsi untuk menyimpan presensi
  function savePresensi(status) {
    const user = firebase.auth().currentUser;
    if (!user) {
      alert("Anda harus login terlebih dahulu");
      return;
    }

    if (status === "hadir") {
      checkLocation((isInAllowedLocation) => {
        if (!isInAllowedLocation) {
          alert(
            "Anda tidak berada di area BPMP SULTRA, tidak bisa melakukan absensi hadir"
          );
          return;
        }
        proceedWithSavingPresensi(user.uid, status);
      });
    } else {
      proceedWithSavingPresensi(user.uid, status);
    }
  }

  function proceedWithSavingPresensi(userId, status) {
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
