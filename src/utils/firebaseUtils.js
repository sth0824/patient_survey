// Firestore에서 필요한 함수 가져오기
import { collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Firestore 인스턴스 가져오기

// 사용자 데이터를 Firestore에 저장하는 함수
const saveUserData = async (data) => {
  try {
    const docRef = doc(db, 'users', data.name); // 사용자의 이름을 문서 ID로 사용
    await setDoc(docRef, data); // 데이터 저장
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export { saveUserData };

// 사용자별 answers를 저장하는 함수
export const saveUserAnswers = async (userName, answers) => {
  try {
    const userRef = doc(db, 'users', userName); // Firestore에서 사용자 문서 참조
    const snap = await getDoc(userRef);
    const existing = snap.exists() && snap.data().answers ? snap.data().answers : {};
    const merged = { ...existing, ...answers };
    await setDoc(userRef, { answers: merged }, { merge: true });
    console.log(`Answers saved for ${userName}`, merged);
  } catch (error) {
    console.error('Error saving answers:', error);
  }
};

// 사용자별 answers를 불러오는 함수
export const getUserAnswers = async (userName) => {
  try {
    const userRef = doc(db, 'users', userName);
    const snap = await getDoc(userRef);
    return snap.exists() ? snap.data().answers : {};
  } catch (e) {
    console.error("Error getting user answers: ", e);
    throw e;
  }
};