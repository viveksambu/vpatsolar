import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "vpat-crm.firebaseapp.com",
  projectId: "vpat-crm",
  storageBucket: "vpat-crm.firebasestorage.app",
  messagingSenderId: "78193655911",
  appId: "1:78193655911:web:c1eedc55344e0a51f414c2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
