import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOgM8zsC287jYVzm4he3OXyoVoRNsnPxY",
  authDomain: "protrack-7051b.firebaseapp.com",
  projectId: "protrack-7051b",
  storageBucket: "protrack-7051b.firebasestorage.app",
  messagingSenderId: "805877798179",
  appId: "1:805877798179:web:4e8485f451294f0e5f2896"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc };