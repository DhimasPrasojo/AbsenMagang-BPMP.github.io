document.addEventListener("DOMContentLoaded", function () {
  // Initialize Firebase
  const auth = firebase.auth();
  const db = firebase.database();

  // Elemen UI
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

      setTimeout(() => {
        const monthElement = document.querySelector(
          ".flatpickr-monthSelect-months"
        );
        if (monthElement) {
          monthElement.computedStyleMap.display = "grid";
        }
      }, 100);
    },
    onClose: function () {
      elements.date.classList.remove("date-picker-open");
    },
    enableTime: false,
    enableSeconds: false,
    enableMinutes: false,
    enableHours: false,
    time_24hr: false,
    inline: false,
    static: true,
    monthSelectorType: "static",
  };

  // Inisialisasi Flatpickr
  const datePicker = flatpickr(elements.date, flatpickrConfig);

  document.head.appendChild(style);

  // Fungsi format attendance
  const formatAttendance = (count) =>
    count === undefined || count === 0 ? "- Kali" : `${count} Kali`;

  // Fungsi update UI
  function updateUI(userData, attendanceData) {
    console.log("UserData:", userData);
    console.log("AttendanceData:", attendanceData);

    elements.name.textContent = userData.username || "Nama";
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

    const countedDates = new Set();

    Object.entries(attendanceData).forEach(([date, entry]) => {
      if (!countedDates.has(date)) {
        switch (entry.status) {
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
        countedDates.add(date);
      }
    });

    return counts;
  }

  // Fungsi get attendance data
  async function getAttendanceData(userId, date) {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const snapshot = await db
        .ref(`attendance/${userId}/${year}/${month}`)
        .once("value");

      const data = snapshot.val() || {};
      return calculateAttendance(data);
    } catch (error) {
      console.error("Error getting attendance data:", error);
      throw error;
    }
  }

  // Fungsi get user data
  async function getUserData(userId) {
    try {
      const snapshot = await db.ref("users/" + userId).once("value");
      return snapshot.val() || {};
    } catch (error) {
      console.error("Error getting user data:", error);
      throw error;
    }
  }

  // Fungsi update attendance data
  async function updateAttendanceData(userId, selectedDate) {
    try {
      const [userData, attendanceData] = await Promise.all([
        getUserData(userId),
        getAttendanceData(userId, selectedDate),
      ]);
      updateUI(userData, attendanceData);
    } catch (error) {
      console.error("Error updating attendance data:", error);
      alert("Terjadi kesalahan saat mengambil data. Silakan coba lagi.");
    }
  }

  // Auth state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("Authenticated User:", user);
      const currentDate = new Date();
      updateAttendanceData(user.uid, currentDate);
    } else {
      window.location.href = "login.html";
    }
  });
});
