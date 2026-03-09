import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, query, orderBy, limit, getDocs, where } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

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

const localSessionId = Date.now().toString() + "_" + Math.random().toString(36).substring(2);
let unsubSnapshot = null;

export function setManualLogin(val) { isManualLogin = val; }

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
    if (!currentUser || !currentUser.email) return false;
    try {
        // Petite astuce de pro : on utilise parse/stringify pour nettoyer l'objet
        // Ça supprime les valeurs "undefined" (que Firestore déteste) 
        // tout en gardant tes données parfaitement lisibles et structurées !
        const cleanData = JSON.parse(JSON.stringify(saveData));
        
        await setDoc(doc(db, "saves", currentUser.email), {
            ...cleanData, // On étale toutes les stats du joueur !
            timestamp: Date.now(),
            sessionId: localSessionId,
            
            // --- DONNÉES PUBLIQUES POUR LE CLASSEMENT ---
            username: cleanData.username || "",
            username_lower: (cleanData.username || "").toLowerCase(),
            score_ascension: cleanData.ascensionCount || 0,
            score_rebirth: cleanData.rebirthCount || 0,
            score_calories: cleanData.totalCalories || 0
        });
        return true;
    } catch (e) {
        console.error("Cloud Save Error", e);
        return false;
    }
}

// Vérification de l'unicité du pseudo
export async function checkUsernameAvailability(username) {
    if (!username || !currentUser || !currentUser.email) return false;
    try {
        const q = query(collection(db, "saves"), where("username_lower", "==", username.toLowerCase()));
        const querySnapshot = await getDocs(q);
        let isTaken = false;
        querySnapshot.forEach((d) => {
            // Si le document trouvé n'est PAS le nôtre (notre email), c'est que le pseudo est pris !
            if (d.id !== currentUser.email) isTaken = true;
        });
        return !isTaken;
    } catch (e) {
        console.error("Erreur vérification pseudo", e);
        return false; 
    }
}

export async function loadGameData() {
    if (!currentUser || !currentUser.email) return null;
    try {
        const docSnap = await getDoc(doc(db, "saves", currentUser.email));
        if (docSnap.exists()) {
            return docSnap.data(); // On retourne directement le bel objet !
        }
        return null;
    } catch (e) {
        console.error("Cloud Load Error", e);
        return null;
    }
}

export async function getLeaderboard() {
    try {
        const q = query(collection(db, "saves"), orderBy("score_ascension", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        let leaderboard = [];
        querySnapshot.forEach((doc) => {
            const d = doc.data();
            // On exclut les joueurs sans pseudo
            if (d.username && d.username.trim() !== "" && (d.score_calories > 0 || d.score_rebirth > 0 || d.score_ascension > 0)) {
                leaderboard.push({
                    username: d.username,
                    ascension: d.score_ascension || 0,
                    rebirth: d.score_rebirth || 0,
                    calories: d.score_calories || 0
                });
            }
        });
        leaderboard.sort((a, b) => {
            if (b.ascension !== a.ascension) return b.ascension - a.ascension;
            if (b.rebirth !== a.rebirth) return b.rebirth - a.rebirth;
            return b.calories - a.calories;
        });
        return leaderboard;
    } catch(e) {
        console.error("Erreur Classement", e);
        return [];
    }
}

export function startSessionListener(onConflict) {
    if (!currentUser || !currentUser.email) return;
    if (unsubSnapshot) unsubSnapshot(); 

    unsubSnapshot = onSnapshot(doc(db, "saves", currentUser.email), (docSnap) => {
        if (docSnap.exists()) {
            const cloudSessionId = docSnap.data().sessionId;
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