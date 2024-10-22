document.addEventListener("DOMContentLoaded", function () {
  // Initialize Firebase
  const auth = firebase.auth();
  const db = firebase.database();

  // Element UI
  const elements = {
    date: document.querySelector(".date"),
    name: document.querySelector(".profile span"),
    hadir: document.querySelector(".hadir"),
    alpha: document.querySelector(".alpha"),
    izin: document.querySelector(".izin"),
    sakit: document.querySelector(".sakit"),
  };

  // Inisialisasi Flatpickr
  const flatpickrConfig = {
    locale: "id",
    dateFormat: "F Y",
    defaultDate: new Date(),
    disableMobile: true,
    plugins: [
      new monthSelectPlugin({
        shorthand: false,
        dateFormat: "F Y",
        altFormat: "F Y",
        theme: "light",
      }),
    ],
    onChange: function (selectedDates) {
      const selectedDate = selectedDates[0];
      const user = auth.currentUser;
      if (user) {
        updateAttendanceData(user.uid, selectedDate);
      }
    },
    onOpen: function () {
      elements.date.classList.add("date-picker-open");
    },
    onClose: function () {
      elements.date.classList.remove("date-picker-open");
    },
    enableTime: false,
    static: true,
  };

  // Inisialisasi Flatpickr
  const datePicker = flatpickr(elements.date, flatpickrConfig);

  // Fungsi format attendance
  const formatAttendance = (count) =>
    count === undefined || count === 0 ? "- Kali" : `${count} Kali`;

  // Fungsi update UI
  function updateUI(userData, attendanceData) {
    if (!userData || !attendanceData) {
      console.error("Data tidak valid:", { userData, attendanceData });
      return;
    }

    elements.name.textContent = userData.username || "Nama";
    if (userData.kelompok) {
      elements.name.innerHTML += `<br><span class="kelompok">${userData.kelompok}</span>`;
    }

    elements.hadir.textContent = formatAttendance(attendanceData.hadir);
    elements.alpha.textContent = formatAttendance(attendanceData.alpa);
    elements.izin.textContent = formatAttendance(attendanceData.izin);
    elements.sakit.textContent = formatAttendance(attendanceData.sakit);
  }

  // Fungsi hitung attendance
  function calculateAttendance(attendanceData) {
    const counts = {
      hadir: 0,
      alpa: 0,
      izin: 0,
      sakit: 0,
    };

    if (!attendanceData) return counts;

    // Objek untuk menyimpan status terakhir untuk setiap tanggal
    const latestStatusByDate = {};

    // Iterasi semua entri attendance
    Object.entries(attendanceData).forEach(([key, entry]) => {
      if (entry && entry.date && entry.status && entry.timestamp) {
        const date = entry.date;

        // Jika belum ada entry untuk tanggal ini atau timestamp lebih baru
        if (
          !latestStatusByDate[date] ||
          entry.timestamp > latestStatusByDate[date].timestamp
        ) {
          latestStatusByDate[date] = {
            status: entry.status.toLowerCase(),
            timestamp: entry.timestamp,
          };
        }
      }
    });

    // Hitung jumlah status dari entry terakhir setiap tanggal
    Object.values(latestStatusByDate).forEach(({ status }) => {
      switch (status) {
        case "hadir":
          counts.hadir++;
          break;
        case "alpa":
          counts.alpa++;
          break;
        case "izin":
          counts.izin++;
          break;
        case "sakit":
          counts.sakit++;
          break;
      }
    });

    // Log untuk debugging
    console.log("Status terakhir per tanggal:", latestStatusByDate);
    console.log("Hasil perhitungan:", counts);

    return counts;
  }

  // Fungsi get attendance data
  async function getAttendanceData(userId, date) {
    if (!userId || !date) {
      console.error("UserId atau date tidak valid:", { userId, date });
      return null;
    }

    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");

      console.log(`Mengambil data attendance untuk: ${year}/${month}`);

      const snapshot = await db
        .ref(`attendance/${userId}/${year}/${month}`)
        .once("value");

      const data = snapshot.val();
      console.log("Data attendance mentah:", data);

      return calculateAttendance(data);
    } catch (error) {
      console.error("Error mengambil data attendance:", error);
      throw error;
    }
  }

  // Fungsi get user data
  async function getUserData(userId) {
    if (!userId) {
      console.error("UserId tidak valid");
      return null;
    }

    try {
      const snapshot = await db.ref(`users/${userId}`).once("value");
      const userData = snapshot.val();

      if (!userData) {
        console.warn("Data user tidak ditemukan untuk userId:", userId);
      }

      return userData || {};
    } catch (error) {
      console.error("Error mengambil data user:", error);
      throw error;
    }
  }

  // Fungsi update attendance data
  async function updateAttendanceData(userId, selectedDate) {
    if (!userId || !selectedDate) {
      console.error("Parameter tidak valid:", { userId, selectedDate });
      return;
    }

    try {
      const [userData, attendanceData] = await Promise.all([
        getUserData(userId),
        getAttendanceData(userId, selectedDate),
      ]);

      if (!userData || !attendanceData) {
        console.error("Gagal mendapatkan data:", { userData, attendanceData });
        return;
      }

      updateUI(userData, attendanceData);
    } catch (error) {
      console.error("Error mengupdate data attendance:", error, {
        userId,
        selectedDate,
      });
      alert("Terjadi kesalahan saat mengambil data. Silakan coba lagi.");
    }
  }

  // Auth state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("User terautentikasi:", user.uid);
      const currentDate = new Date();
      updateAttendanceData(user.uid, currentDate);
    } else {
      console.log("User tidak terautentikasi, mengalihkan ke login");
      window.location.href = "login.html";
    }
  });
});
