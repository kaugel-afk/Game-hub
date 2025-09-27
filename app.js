import { auth, provider } from "./firebase.js";
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const googleBtn = document.getElementById("googleLogin");

googleBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "infos.html";
  } catch (error) {
    alert("Erreur de connexion : " + error.message);
  }
});