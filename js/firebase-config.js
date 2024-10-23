const firebaseConfig = {
  apiKey: "AIzaSyDEiPzvhPOvy7lsU2HGsySbtJ3ckzTzjyU",
  authDomain: "test-56bdc.firebaseapp.com",
  databaseURL:
    "https://test-56bdc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "test-56bdc",
  storageBucket: "test-56bdc.appspot.com",
  messagingSenderId: "1084679620605",
  appId: "1:1084679620605:web:a420c9e811ca27973ebb94",
};

const app = firebase.initializeApp(firebaseConfig);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((error) => {
      console.log("Service Worker registration failed:", error);
    });
}

// Initialize Firebase
const messaging = firebase.messaging();

// Optional: request permission for notifications
messaging
  .requestPermission()
  .then(() => messaging.getToken())
  .then((token) => {
    console.log("FCM Token:", token);
  })
  .catch((error) => {
    console.error("Error getting FCM token", error);
  });

// firebase-messaging-sw.js
messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
