// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = { 
   apiKey: "AIzaSyAYpXWtNm1-y0kUrP52gqt63aE7wj_JWmM", 
   authDomain: "snookerlivehk-scoreboard-app.firebaseapp.com", 
   projectId: "snookerlivehk-scoreboard-app", 
   storageBucket: "snookerlivehk-scoreboard-app.appspot.com", 
   messagingSenderId: "510635162315", 
   appId: "1:510635162315:web:0296afb70ef9206315f94e" 
 };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);