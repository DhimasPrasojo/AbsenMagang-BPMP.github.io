// Mendapatkan referensi ke form dan elemen-elemennya
const form = document.querySelector("form");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Menambahkan event listener untuk form submission
form.addEventListener("submit", function (e) {
  e.preventDefault(); // Mencegah form dari submit default

  // Mengambil nilai dari input
  const username = usernameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;

  // Membuat user baru dengan Firebase Authentication
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;

      // Menyimpan data tambahan ke Realtime Database
      return firebase
        .database()
        .ref("users/" + user.uid)
        .set({
          username: username,
          email: email,
          password: password,
        });
    })
    .then(() => {
      console.log("User berhasil didaftarkan dan data disimpan");
      alert("Pendaftaran berhasil! Anda akan dialihkan ke halaman login.");
      form.reset(); // Mengosongkan form setelah berhasil

      // Mengalihkan pengguna ke halaman login.html
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat mendaftar: " + error.message);
    });
});
