import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDWV1fB2cE70hkxy-O0ws53e5tjmb9pcqg",
  authDomain: "chum-buddies.firebaseapp.com",
  projectId: "chum-buddies",
  storageBucket: "chum-buddies.firebasestorage.app",
  messagingSenderId: "483491733759",
  appId: "1:483491733759:web:8c0bc97e541a3b0415ecca",
  measurementId: "G-CV66S14X83"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);