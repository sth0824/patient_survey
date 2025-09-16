// Firebase SDK에서 필요한 함수 가져오기
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

// Firestore 초기화
const db = getFirestore(app);

export default app; // Firebase 앱을 다른 파일에서 사용할 수 있도록 내보냅니다. 
export { db }; // Firestore 인스턴스도 내보냅니다.