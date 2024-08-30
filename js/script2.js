document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector("form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Mencegah form dari submit default

    const email = emailInput.value;
    const password = passwordInput.value;

    // Menggunakan Firebase Authentication untuk login
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Login berhasil
        console.log("Login berhasil:", userCredential.user);
        // Redirect ke halaman home.html
        window.location.href = "home.html";
      })
      .catch((error) => {
        // Login gagal
        console.error("Login gagal:", error.message);
        alert("Login gagal: " + error.message);
      });
  });
});
