// Importation des SDK Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { 
  getFirestore 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { 
  getStorage 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAlNL7mff2FJ5E0ODtl-EyO3dk0wLdq5Dk",
  authDomain: "gamer-hub-bd62e.firebaseapp.com",
  projectId: "gamer-hub-bd62e",
  storageBucket: "gamer-hub-bd62e.firebasestorage.app",
  messagingSenderId: "892321587019",
  appId: "1:892321587019:web:26373171797453498ed2ce",
  measurementId: "G-7D1TBYHJKL"
};

// Initialisation de Firebase
export const app = initializeApp(firebaseConfig);

// Modules Firebase utilisés
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);