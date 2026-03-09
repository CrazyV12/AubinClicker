import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDDck1SfvZ2MbNKL3TX1WpMpZ7xi0yD-Js",
  authDomain: "aubinclicker.firebaseapp.com",
  projectId: "aubinclicker",
  storageBucket: "aubinclicker.firebasestorage.app",
  messagingSenderId: "342540034306",
  appId: "1:342540034306:web:0365e4e4c242a33ac5221b",
  measurementId: "G-JDLDYC2YGE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export let currentUser = null;
export let isManualLogin = false; 

// NOUVEAU : Badge unique pour cet appareil/onglet
const localSessionId = Date.now().toString() + "_" + Math.random().toString(36).substring(2);
let unsubSnapshot = null;

export function setManualLogin(val) { isManualLogin = val; }

// Initialise l'écouteur de connexion
export function initAuth(onStateChange) {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        onStateChange(user);
    });
}

export async function register(email, password) {
    try {
        isManualLogin = true;
        await createUserWithEmailAndPassword(auth, email, password);
        return { success: true };
    } catch (error) {
        isManualLogin = false;
        return { success: false, message: translateFirebaseError(error.code) };
    }
}

export async function login(email, password) {
    try {
        isManualLogin = true;
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
    } catch (error) {
        isManualLogin = false;
        return { success: false, message: translateFirebaseError(error.code) };
    }
}

export async function loginWithGoogle() {
    try {
        isManualLogin = true;
        await signInWithPopup(auth, googleProvider);
        return { success: true };
    } catch (error) {
        isManualLogin = false;
        return { success: false, message: translateFirebaseError(error.code) };
    }
}

export async function logout() {
    stopSessionListener();
    await signOut(auth);
    currentUser = null;
}

// Sauvegarde dans la base de données
export async function saveGameData(saveData) {
    if (!currentUser) return false;
    try {
        await setDoc(doc(db, "saves", currentUser.uid), {
            data: JSON.stringify(saveData),
            timestamp: Date.now(),
            sessionId: localSessionId // <-- On dépose notre badge
        });
        return true;
    } catch (e) {
        console.error("Cloud Save Error", e);
        return false;
    }
}

// Récupère depuis la base de données
export async function loadGameData() {
    if (!currentUser) return null;
    try {
        const docSnap = await getDoc(doc(db, "saves", currentUser.uid));
        if (docSnap.exists()) {
            return JSON.parse(docSnap.data().data);
        }
        return null;
    } catch (e) {
        console.error("Cloud Load Error", e);
        return null;
    }
}

// Traduction des erreurs en Français
function translateFirebaseError(code) {
    switch (code) {
        case 'auth/email-already-in-use': return "Cet email est déjà utilisé.";
        case 'auth/invalid-email': return "Format d'email invalide.";
        case 'auth/weak-password': return "Le mot de passe doit faire au moins 6 caractères.";
        case 'auth/user-not-found': return "Aucun compte trouvé avec cet email.";
        case 'auth/wrong-password': return "Mot de passe incorrect.";
        case 'auth/invalid-credential': return "Email ou mot de passe incorrect.";
        case 'auth/popup-closed-by-user': return "Connexion Google annulée.";
        default: return "Une erreur est survenue (" + code + ").";
    }
}

// ============ ANTI-CLONAGE & MULTI-COMPTES ============
export function startSessionListener(onConflict) {
    if (!currentUser) return;
    if (unsubSnapshot) unsubSnapshot(); // Nettoie si déjà existant

    // onSnapshot écoute la BDD en temps réel (réactivité < 1 seconde)
    unsubSnapshot = onSnapshot(doc(db, "saves", currentUser.uid), (docSnap) => {
        if (docSnap.exists()) {
            const cloudSessionId = docSnap.data().sessionId;
            // Si l'ID sur le cloud est différent du nôtre, un autre appareil a pris le contrôle !
            if (cloudSessionId && cloudSessionId !== localSessionId) {
                onConflict();
            }
        }
    });
}

export function stopSessionListener() {
    if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
    }
}