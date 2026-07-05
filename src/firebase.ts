import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your custom Firebase configuration for "invitacion-de-la-boda"
const firebaseConfig = {
  apiKey: "AIzaSyBaCmSBll7JgvebKKFzpV7FkFCd1JIrB5s",
  authDomain: "invitacion-de-la-boda.firebaseapp.com",
  projectId: "invitacion-de-la-boda",
  storageBucket: "invitacion-de-la-boda.firebasestorage.app",
  messagingSenderId: "536665825274",
  appId: "1:536665825274:web:464fbeedc3ffd8854a4e43",
  measurementId: "G-G3K63S9GZN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Since this is your custom project, we use the default database without specifying a custom databaseId.
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
