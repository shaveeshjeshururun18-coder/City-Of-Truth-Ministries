// Give the service worker access to Firebase Messaging.
// Note: compat syntax is used here because importScripts executes sequentially in the service worker context.
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyAu7f6BZ9ma-e16PlxBHoX6iy6kPe0Xl6M",
  authDomain: "cot-ministries-da557.firebaseapp.com",
  projectId: "cot-ministries-da557",
  storageBucket: "cot-ministries-da557.firebasestorage.app",
  messagingSenderId: "894149474214",
  appId: "1:894149474214:web:049c826b825ecf18108167"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification?.title || "City of Truth Ministries";
  const notificationOptions = {
    body: payload.notification?.body || "New update received",
    icon: '/logo.png', // Fallback to main website logo
    badge: '/favicon.ico',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
