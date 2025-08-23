// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyAYeoBni8fAiVvhuJ5QUZtdhVfaVlssMZg",
  authDomain: "its411-menez-project1.firebaseapp.com",
  projectId: "its411-menez-project1",
  storageBucket: "its411-menez-project1.firebasestorage.app",
  messagingSenderId: "1057448262275",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
