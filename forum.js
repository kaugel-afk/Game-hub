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
        loadPosts();
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
            alert(`Vous êtes banni jusqu'au ${banData.bannedUntil.toDate()}. Vous ne pouvez pas publier.`);
            return true;
        } else {
            await deleteDoc(banRef); // Ban expiré
            return false;
        }
    }
    return false;
}

// Publier un post
window.sendPost = async function(){
    if(await checkBan()) return; // Bloquer si banni

    const text = document.getElementById("post-text").value;
    const file = document.getElementById("post-file").files[0];
    let imageUrl = null;

    if(file){
        const storageRef = ref(storage, 'posts/' + Date.now() + '_' + file.name);
        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
    }

    if(text.trim() === "" && !imageUrl) return;

    await addDoc(collection(db, "posts"), {
        userId: currentUser.uid,
        name: currentUser.displayName,
        photo: currentUser.photoURL,
        text,
        image: imageUrl || null,
        likes: [],
        comments: [],
        timestamp: new Date()
    });

    document.getElementById("post-text").value = "";
    document.getElementById("post-file").value = "";
};

// Charger les posts en temps réel
function loadPosts(){
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    onSnapshot(q, snapshot => {
        const box = document.getElementById("post-box");
        box.innerHTML = "";
        snapshot.forEach(docSnap => {
            const post = docSnap.data();
            const postDiv = document.createElement("div");
            postDiv.className = "post";

            postDiv.innerHTML = `
                <div class="post-header">
                    <img src="${post.photo || 'https://via.placeholder.com/40'}" alt="Photo">
                    <strong>${post.name}</strong>
                </div>
                <div class="post-content">
                    <p>${post.text || ""}</p>
                    ${post.image ? `<img src="${post.image}" alt="Image post">` : ""}
                    <div>
                        <button onclick="likePost('${docSnap.id}')">👍 ${post.likes.length}</button>
                        <button onclick="commentPost('${docSnap.id}')">💬 ${post.comments.length}</button>
                    </div>
                </div>
            `;
            box.appendChild(postDiv);
        });
    });
}

// Liker un post
window.likePost = async function(postId){
    if(await checkBan()) return; // Bloquer si banni
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
}

// Commenter un post (simple prompt)
window.commentPost = async function(postId){
    if(await checkBan()) return; // Bloquer si banni
    const text = prompt("Votre commentaire:");
    if(!text) return;
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, { comments: arrayUnion({user: currentUser.displayName, text, timestamp: new Date()}) });
}