import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

export const firebaseConfig = {
  apiKey: "AIzaSyBNLypR4a5iIFRFykbkVdHq43k9u6zgOYM",
  authDomain: "nihil-a5022.firebaseapp.com",
  databaseURL: "https://nihil-a5022-default-rtdb.firebaseio.com",
  projectId: "nihil-a5022",
  storageBucket: "nihil-a5022.firebasestorage.app",
  messagingSenderId: "8709408405",
  appId: "1:8709408405:web:ca1789bbdb4be2ccc03d9c"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
