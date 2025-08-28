// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// Configuração do Firebase do seu projeto
const firebaseConfig = {
  apiKey: "AIzaSyARYYgV2_ge6Q2TAIF_EXNs7gUh6-uPV9E",
  authDomain: "mines-games-429cf.firebaseapp.com",
  projectId: "mines-games-429cf",
  storageBucket: "mines-games-429cf.appspot.com",
  messagingSenderId: "964234859150",
  appId: "1:964234859150:web:18547f11df7220c3aeafdf"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Funções de usuários ---
export async function registerUser(username, password) {
  const q = query(collection(db, "users"), where("nome", "==", username));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) return null; // Usuário já existe

  const docRef = await addDoc(collection(db, "users"), {nome: username, senha: password, moedas: 100});
  return {id: docRef.id, nome: username, moedas: 100};
}

export async function loginUser(username, password) {
  const q = query(collection(db, "users"), where("nome", "==", username), where("senha", "==", password));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null; // Usuário ou senha incorretos

  let user = null;
  querySnapshot.forEach(docSnap => {
    user = {id: docSnap.id, ...docSnap.data()};
  });
  return user;
}

export async function updateBalance(userId, balance) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {moedas: balance});
}