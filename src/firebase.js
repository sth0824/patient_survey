// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyDfLPqbboIEX9GTFBv4Eqmzk0FedV3gXgs",
    authDomain: "patient-survey-7591f.firebaseapp.com",
    projectId: "patient-survey-7591f",
    storageBucket: "patient-survey-7591f.firebasestorage.app",
    messagingSenderId: "258029501503",
    appId: "1:258029501503:web:5dc80e6337fe1778034c8a"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 필요한 Firebase 서비스 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;