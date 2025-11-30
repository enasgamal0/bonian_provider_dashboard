//firebase.js
import Vue from "vue";
import firebase from "firebase/app";
import "firebase/firebase-messaging";

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

export default firebase.messaging();
