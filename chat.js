// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAlNL7mff2FJ5E0ODtl-EyO3dk0wLdq5Dk",
  authDomain: "gamer-hub-bd62e.firebaseapp.com",
  databaseURL: "https://gamer-hub-bd62e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gamer-hub-bd62e",
  storageBucket: "gamer-hub-bd62e.firebasestorage.app",
  messagingSenderId: "892321587019",
  appId: "1:892321587019:web:26373171797453498ed2ce",
  measurementId: "G-7D1TBYHJKL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

let currentUser;

// Vérifier l'authentification
onAuthStateChanged(auth, user => {
    if(user){
        currentUser = user;
        loadMessages();
    } else {
        window.location.href = "index.html";
    }
});

// Vérifier si l'utilisateur est banni
async function checkBan() {
    const banRef = doc(db, "bans", currentUser.uid);
    const banSnap = await getDoc(banRef);
    if (banSnap.exists()) {
        const banData = banSnap.data();
        const now = new Date();
        if (banData.bannedUntil.toDate() > now) {
            alert(`Vous êtes banni jusqu'au ${banData.bannedUntil.toDate()}. Vous ne pouvez pas envoyer de message.`);
            return true;
        } else {
            await deleteDoc(banRef); // Ban expiré
            return false;
        }
    }
    return false;
}

// Envoyer un message
window.sendMessage = async function(){
    if(await checkBan()) return; // Bloquer si banni

    const text = document.getElementById("chat-text").value;
    const file = document.getElementById("chat-file").files[0];
    let imageUrl = null;

    if(file){
        const storageRef = ref(storage, 'chat/' + Date.now() + '_' + file.name);
        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
    }

    if(text.trim() === "" && !imageUrl) return;

    await addDoc(collection(db, "chat"), {
        userId: currentUser.uid,
        name: currentUser.displayName,
        photo: currentUser.photoURL,
        text,
        image: imageUrl || null,
        timestamp: new Date()
    });

    document.getElementById("chat-text").value = "";
    document.getElementById("chat-file").value = "";
}

// Charger les messages en temps réel
function loadMessages(){
    const q = query(collection(db, "chat"), orderBy("timestamp", "asc"));
    onSnapshot(q, snapshot => {
        const box = document.getElementById("chat-box");
        box.innerHTML = "";
        snapshot.forEach(docSnap => {
            const msg = docSnap.data();
            const msgDiv = document.createElement("div");
            msgDiv.className = "message";

            msgDiv.innerHTML = `
                <img src="${msg.photo || 'https://via.placeholder.com/35'}" alt="Photo">
                <div>
                    <strong>${msg.name}</strong>
                    <p>${msg.text || ""}</p>
                    ${msg.image ? `<img src="${msg.image}" style="max-width:200px; border-radius:10px;" />` : ""}
                </div>
            `;
            box.appendChild(msgDiv);
            box.scrollTop = box.scrollHeight; // Scroll vers le bas automatiquement
        });
    });
}