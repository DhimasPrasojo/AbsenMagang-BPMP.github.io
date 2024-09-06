// Initialize Firebase (assuming firebase-config.js has already done this)
console.log("Script started");

// Function to get the current user's UID
function getCurrentUserUID() {
  return new Promise((resolve, reject) => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log("Current user UID:", user.uid);
        resolve(user.uid);
      } else {
        console.log("No user is signed in");
        reject("No user is signed in");
      }
    });
  });
}

// Function to get the user's kelompok
function getUserKelompok(uid) {
  console.log("Fetching kelompok for UID:", user.uid);
  return firebase
    .firestore()
    .collection("users")
    .doc(uid)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        console.log("User document data:", userData);
        if (userData.kelompok) {
          console.log("Kelompok found:", userData.kelompok);
          return userData.kelompok;
        } else {
          console.error("Kelompok field not found in user document");
          throw new Error("Kelompok field not found in user document");
        }
      } else {
        console.error("No such document for UID:", user.uid);
        throw new Error("No such document");
      }
    })
    .catch((error) => {
      console.error("Error fetching document:", error);
      throw error;
    });
}

// Function to update the h1 element
function updateKelompokName(kelompok) {
  const h1Element = document.querySelector(".rtl.atas2 h1");
  if (h1Element) {
    console.log("Updating h1 element with:", kelompok);
    h1Element.textContent = kelompok;
  } else {
    console.error("H1 element not found");
  }
}

// Main function to orchestrate the process
async function updateUserKelompok() {
  try {
    console.log("Starting updateUserKelompok function");

    // Ensure Firebase is initialized
    if (!firebase.apps.length) {
      throw new Error("Firebase is not initialized");
    }

    const uid = await getCurrentUserUID();
    const kelompok = await getUserKelompok(uid);
    updateKelompokName(kelompok);
    console.log("Process completed successfully");
  } catch (error) {
    console.error("Error in updateUserKelompok:", error);
  }
}

// Call the main function when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");
  updateUserKelompok();
});
