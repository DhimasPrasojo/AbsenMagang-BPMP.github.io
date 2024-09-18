document.addEventListener("DOMContentLoaded", function () {
  const dateInput = document.querySelector(".date");
  const hiddenDateInput = document.createElement("input");
  hiddenDateInput.type = "month";
  hiddenDateInput.style.display = "none";
  dateInput.parentNode.insertBefore(hiddenDateInput, dateInput.nextSibling);

  dateInput.addEventListener("click", function () {
    hiddenDateInput.showPicker();
  });

  hiddenDateInput.addEventListener("change", function () {
    const selectedDate = new Date(this.value);
    const options = { year: "numeric", month: "long" };
    dateInput.value = selectedDate.toLocaleDateString("id-ID", options);
    updateAttendanceData(auth.currentUser.uid, selectedDate);
  });

  // Initialize Firebase (pastikan ini sudah dilakukan di firebase-config.js)
  const auth = firebase.auth();
  const db = firebase.database();

  // Fungsi untuk mendapatkan elemen berdasarkan selector
  const getElement = (selector) => document.querySelector(selector);

  // Elemen-elemen yang akan diupdate
  const nameElement = getElement(".profile span");
  const hadirElement = getElement(".hadir");
  const alphaElement = getElement(".alpha");
  const izinElement = getElement(".izin");
  const sakitElement = getElement(".sakit");

  // Fungsi untuk memformat angka kehadiran
  const formatAttendance = (count) =>
    count === undefined || count === 0 ? "- Kali" : `${count} Kali`;

  // Fungsi untuk mengupdate UI dengan data user
  function updateUI(userData, attendanceData) {
    console.log("UserData: ", userData);
    console.log("AttendanceData: ", attendanceData);
    nameElement.textContent = userData.username || "Nama";
    hadirElement.textContent = formatAttendance(attendanceData.hadir);
    alphaElement.textContent = formatAttendance(attendanceData.alpa);
    izinElement.textContent = formatAttendance(attendanceData.izin);
    sakitElement.textContent = formatAttendance(attendanceData.sakit);
  }

  // Fungsi untuk menghitung kehadiran dari data yang didapatkan dari Firebase
  function calculateAttendance(attendanceData) {
    const counts = {
      hadir: 0,
      alpa: 0,
      izin: 0,
      sakit: 0,
    };

    // Mengiterasi setiap entri dari objek attendanceData (per timestamp)
    Object.values(attendanceData).forEach((entry) => {
      if (entry.status === "hadir") {
        counts.hadir++;
      } else if (entry.status === "alpa") {
        counts.alpa++;
      } else if (entry.status === "izin") {
        counts.izin++;
      } else if (entry.status === "sakit") {
        counts.sakit++;
      }
    });

    return counts;
  }

  // Fungsi untuk mendapatkan data kehadiran berdasarkan bulan dan tahun
  function getAttendanceData(userId, date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return db
      .ref(`attendance/${userId}/${year}/${month}`)
      .once("value")
      .then((snapshot) => {
        const data = snapshot.val() || {};
        return calculateAttendance(data); // Hitung kehadiran dari data
      });
  }

  // Fungsi untuk mendapatkan data user
  function getUserData(userId) {
    return db
      .ref("users/" + userId)
      .once("value")
      .then((snapshot) => snapshot.val() || {});
  }

  // Fungsi untuk mengupdate data kehadiran berdasarkan bulan yang dipilih
  function updateAttendanceData(userId, selectedDate) {
    Promise.all([getUserData(userId), getAttendanceData(userId, selectedDate)])
      .then(([userData, attendanceData]) => {
        updateUI(userData, attendanceData); // Update UI dengan data user dan presensi
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Terjadi kesalahan saat mengambil data.");
      });
  }

  // Event listener ketika DOM sudah siap
  document.addEventListener("DOMContentLoaded", () => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Authenticated User: ", user);
        const currentDate = new Date();
        updateAttendanceData(user.uid, currentDate); // Update presensi pada tanggal saat ini
      } else {
        // Redirect ke halaman login jika user belum login
        window.location.href = "login.html";
      }
    });
  });
});
