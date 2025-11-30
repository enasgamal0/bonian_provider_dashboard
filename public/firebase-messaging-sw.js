// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

// Initialize the Firebase app in the service worker by passing the generated config

const firebaseConfig = {
  apiKey: "AIzaSyC7Hso4S6WneO0lk6SeozfzoQjUBPZQlI0",
  authDomain: "bunian-tech.firebaseapp.com",
  projectId: "bunian-tech",
  storageBucket: "bunian-tech.firebasestorage.app",
  messagingSenderId: "113785147585",
  appId: "1:113785147585:web:9f9812b6eab9448ac18440",
  measurementId: "G-JS78WLD1WR"
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
  console.log("Received background message", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);

  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage(payload);
    });
  });
});
// =================================== new ==========================
