// src/pages/PatientDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { 
  doc, getDoc, collection, query, 
  where, getDocs, orderBy, addDoc, 
  serverTimestamp, updateDoc, deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// 컨테이너
const Container = styled.div`
  margin-bottom: 2rem;
`;

// 뒤로가기 링크
const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  font-size: 0.9rem;
  color: #6c757d;
  text-decoration: none;
  margin-bottom: 1rem;
  
  &:hover {
    color: #495057;
  }
`;

// 환자 정보 헤더
const PatientHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

// 환자 기본 정보
const PatientBasicInfo = styled.div`
  display: flex;
  align-items: center;
`;

// 환자 이니셜 아바타
const PatientAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #2a5e8c;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 1rem;
`;

// 환자 이름 및 ID
const PatientNameContainer = styled.div``;

// 환자 이름
const PatientName = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
`;

// 환자 ID
const PatientId = styled.p`
  color: #6c757d;
  margin: 0;
  font-size: 0.9rem;
`;

// 버튼
const Button = styled.button`
  background-color: ${props => props.secondary ? '#6c757d' : '#2a5e8c'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.secondary ? '#5a6268' : '#1d4269'};
  }
`;

// 탭 네비게이션
const TabNav = styled.div`
  display: flex;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 2rem;
`;

// 탭 버튼
const TabButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#2a5e8c' : 'transparent'};
  color: ${props => props.active ? '#2a5e8c' : '#6c757d'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    color: #2a5e8c;
  }
`;

// 카드
const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

// 카드 제목
const CardTitle = styled.h3`
  font-size: 1.1rem;
  margin: 0 0 1.5rem;
  color: #343a40;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.75rem;
`;

// 정보 그리드
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

// 정보 그룹
const InfoGroup = styled.div`
  margin-bottom: 1rem;
`;

// 정보 라벨
const InfoLabel = styled.p`
  font-size: 0.8rem;
  color: #6c757d;
  margin: 0 0 0.25rem;
`;

// 정보 값
const InfoValue = styled.p`
  margin: 0;
  font-weight: 500;
`;

// 차트 컨테이너
const ChartContainer = styled.div`
  height: 300px;
  margin-bottom: 2rem;
`;

// 2열 그리드
const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

// 상담 요청 목록
const CounselingRequestsList = styled.div`
  margin-top: 1.5rem;
`;

// 상담 요청 아이템
const CounselingRequestItem = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid #dee2e6;
  
  &:last-child {
    border-bottom: none;
  }
`;

// 상담 요청 헤더
const CounselingRequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

// 상담 요청 제목
const CounselingRequestTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
`;

// 배지
const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  background-color: ${props => {
    if (props.status === 'pending') return '#ffc107';
    if (props.status === 'accepted') return '#28a745';
    if (props.status === 'completed') return '#6c757d';
    if (props.type === 'high') return '#dc3545';
    if (props.type === 'medium') return '#ffc107';
    return '#28a745';
  }};
  color: white;
`;

// 상담 요청 메타 정보
const CounselingRequestMeta = styled.div`
  display: flex;
  justify-content: space-between;
  color: #6c757d;
  font-size: 0.8rem;
`;

// 상담 노트 입력 폼
const NoteForm = styled.form`
  margin-top: 2rem;
`;

// 입력 필드
const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  resize: vertical;
  min-height: 100px;
  margin-bottom: 1rem;
`;

// 상담 노트 목록
const NotesList = styled.div`
  margin-top: 1.5rem;
`;

// 상담 노트 아이템
const NoteItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  
  &:last-child {
    border-bottom: none;
  }
`;

// 노트 헤더
const NoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

// 노트 정보 영역
const NoteInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

// 노트 날짜
const NoteDate = styled.span`
  color: #6c757d;
  font-size: 0.8rem;
`;

// 노트 액션 버튼 영역
const NoteActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

// 노트 액션 버튼
const NoteActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.delete ? '#dc3545' : '#2a5e8c'};
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background-color: ${props => props.delete ? '#f8d7da' : '#e6f2fa'};
  }
  
  svg {
    margin-right: 0.25rem;
  }
`;

// 노트 내용
const NoteContent = styled.p`
  margin: 0;
  white-space: pre-line;
`;

// 노트 수정 입력 필드
const NoteEditTextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  resize: vertical;
  min-height: 100px;
  margin-bottom: 1rem;
`;

// 노트 편집 버튼 그룹
const EditButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

// 스코어카드 컨테이너
const ScoreCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

// 스코어카드
const ScoreCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// 스코어카드 값
const ScoreValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${props => {
    if (props.score >= 75) return '#dc3545';
    if (props.score >= 50) return '#ffc107';
    return '#28a745';
  }};
`;

// 스코어카드 라벨
const ScoreLabel = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
  text-align: center;
  margin-bottom: 0.5rem;
`;

// 빈 상태 메시지
const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6c757d;
`;

// 치료 태그 컨테이너
const TreatmentTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

// 치료 태그
const TreatmentTag = styled.span`
  background-color: #e9ecef;
  color: #495057;
  border-radius: 16px;
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
`;

// 상담 요청 상태를 한글로 변환
const getRequestStatusText = (status) => {
  const statuses = {
    'pending': '대기 중',
    'accepted': '예약 확정',
    'completed': '완료',
    'cancelled': '취소됨'
  };
  return statuses[status] || '알 수 없음';
};

function PatientDetailPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [patient, setPatient] = useState(null);
  const [counselingRequests, setCounselingRequests] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editNoteId, setEditNoteId] = useState(null); // 현재 수정 중인 노트 ID
  const [editNoteContent, setEditNoteContent] = useState(''); // 수정 중인 노트 내용
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [surveyData, setSurveyData] = useState(null);
  const [categoryScores, setCategoryScores] = useState({
    physical: { title: '신체적 상태', score: 0, maxScore: 40, percent: 0, questions: [1, 2, 3, 4, 5, 6, 7, 8] },
    selfcare: { title: '건강 관리', score: 0, maxScore: 25, percent: 0, questions: [9, 10, 11, 12, 13] },
    support: { title: '사회적 지지', score: 0, maxScore: 20, percent: 0, questions: [14, 15, 16, 17] },
    psychological: { title: '심리적 부담', score: 0, maxScore: 40, percent: 0, questions: [18, 19, 20, 21, 22, 23, 24, 25] },
    social: { title: '사회적 부담', score: 0, maxScore: 15, percent: 0, questions: [26, 27, 28] },
    resilience: { title: '회복 탄력성', score: 0, maxScore: 15, percent: 0, questions: [29, 30, 31] }
  });
  
  // URL에서 탭 파라미터를 읽어와서 초기 탭 설정
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    // URL 쿼리 파라미터에서 tab 값을 읽어옴
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    
    // tab 파라미터가 있으면 해당 탭을 활성화
    if (tabParam && ['overview', 'survey', 'counseling'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);
  
  // 환자 데이터 및 관련 정보 불러오기
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        console.log("Fetching patient data for ID:", patientId);
        // 환자 기본 정보 불러오기 - users 컬렉션에서 가져오기
        const patientDocRef = doc(db, "users", patientId);
        const patientDocSnap = await getDoc(patientDocRef);
        
        if (!patientDocSnap.exists()) {
          console.error("Patient document does not exist");
          setError('환자 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }
        
        const userData = patientDocSnap.data();
        console.log("Retrieved user data:", userData);
        
        // 위험도 결정 - 정신 건강 이력 기반
        let riskLevel = 'low';
        if (userData.mentalHealthHistory && userData.mentalHealthHistory !== "아니오") {
          riskLevel = 'high';
        } else if (userData.physicalLimitations) {
          riskLevel = 'medium';
        }
        
        // 설문 데이터 가져오기 - answers 필드에서 가져오기
        const answers = userData.answers || {};
        
        // q32(절주), q33(금연) 데이터 확인
        let alcoholAbstinence = '정보 없음';
        let smokingCessation = '정보 없음';
        
        if (answers.q32) {
          const q32Score = parseInt(answers.q32);
          // 점수가 3점 이상이면 "예", 그렇지 않으면 "아니오"
          alcoholAbstinence = q32Score >= 3 ? '예' : '아니오';
        }
        
        if (answers.q33) {
          const q33Score = parseInt(answers.q33);
          // 점수가 3점 이상이면 "예", 그렇지 않으면 "아니오"
          smokingCessation = q33Score >= 3 ? '예' : '아니오';
        }
        
        const patientData = {
          id: patientDocSnap.id,
          name: userData.name || '익명',
          age: userData.age || '',
          gender: userData.gender || '',
          cancerType: userData.cancerType || '',
          currentTreatment: userData.currentTreatment || '',
          diagnosisDate: userData.diagnosisDate || '',
          birthDate: userData.birthDate || '',
          mentalHealthHistory: userData.mentalHealthHistory || '',
          physicalLimitations: userData.physicalLimitations || '',
          treatmentTypes: userData.treatmentTypes || [],
          otherCancerType: userData.otherCancerType || '',
          otherTreatmentType: userData.otherTreatmentType || '',
          alcoholAbstinence: alcoholAbstinence,  // 절주 여부 추가
          smokingCessation: smokingCessation,    // 금연 여부 추가
          riskLevel
        };
        
        console.log("Transformed patient data:", patientData);
        setPatient(patientData);
        
        if (userData.answers) {
          console.log("Survey answers:", userData.answers);
          setSurveyData(userData.answers);
          
          // 카테고리별 점수 계산
          const updatedCategoryScores = {...categoryScores};
          
          // 각 카테고리별 점수 계산
          Object.keys(updatedCategoryScores).forEach(category => {
            const categoryData = updatedCategoryScores[category];
            let totalScore = 0;
            let answeredQuestions = 0;
            
            categoryData.questions.forEach(questionNum => {
              const answerKey = `q${questionNum}`;
              if (userData.answers[answerKey]) {
                // 역코딩이 필요한 문항 처리 (일부 질문은 점수가 높을수록 부정적)
                const needsReverseScoring = [1, 2, 3, 4, 5, 6, 7, 8, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
                const score = parseInt(userData.answers[answerKey]);
                
                if (needsReverseScoring.includes(questionNum)) {
                  // 역코딩 (1->5, 2->4, 3->3, 4->2, 5->1)
                  totalScore += (6 - score); 
                } else {
                  totalScore += score;
                }
                answeredQuestions++;
              }
            });
            
            // 백분율 계산 (역코딩 처리 후)
            const maxPossibleScore = answeredQuestions * 5; // 모든 질문에 5점을 받았을 경우
            const percent = answeredQuestions > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
            
            updatedCategoryScores[category].score = totalScore;
            updatedCategoryScores[category].maxScore = maxPossibleScore;
            updatedCategoryScores[category].percent = percent;
          });
          
          setCategoryScores(updatedCategoryScores);
        }

        
        // 상담 요청 불러오기
        const counselingRequestsRef = collection(db, "counselingRequests");
        const q = query(
          counselingRequestsRef,
          where("userId", "==", patientId)
        );
        
        const counselingSnap = await getDocs(q);
        const requestsData = [];
        
        counselingSnap.forEach(doc => {
          requestsData.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          });
        });
        
        console.log("Retrieved counseling requests:", requestsData);
        setCounselingRequests(requestsData);
        
        // 상담 노트 불러오기
        const notesRef = collection(db, "patients", patientId, "notes");
        let notesQuery = notesRef;
        try {
          notesQuery = query(notesRef, orderBy("createdAt", "desc"));
        } catch (e) {
          console.error("Error creating notes query with orderBy:", e);
        }
        
        const notesSnap = await getDocs(notesQuery);
        const notesData = [];
        
        notesSnap.forEach(doc => {
          notesData.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          });
        });
        
        console.log("Retrieved notes:", notesData);
        setNotes(notesData);
        
        setLoading(false);
      } catch (error) {
        console.error("환자 데이터 로딩 오류:", error);
        setError('환자 데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };
    
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  // 상담 노트 추가
  const handleAddNote = async (e) => {
    e.preventDefault();
    
    if (!newNote.trim()) return;
    
    try {
      const noteData = {
        content: newNote,
        authorId: '관리자', // 간소화된 기본 저자 ID
        createdAt: serverTimestamp()
      };
      
      const noteDocRef = await addDoc(collection(db, "patients", patientId, "notes"), noteData);
      
      const newNoteWithId = {
        id: noteDocRef.id,
        ...noteData,
        createdAt: new Date()
      };
      
      setNotes([newNoteWithId, ...notes]);
      setNewNote('');
    } catch (error) {
      console.error("노트 추가 오류:", error);
      alert('상담 노트 추가 중 오류가 발생했습니다.');
    }
  };
  
  // 수정 모드 진입
  const handleEditMode = (note) => {
    setEditNoteId(note.id);
    setEditNoteContent(note.content);
  };
  
  // 수정 취소
  const handleCancelEdit = () => {
    setEditNoteId(null);
    setEditNoteContent('');
  };
  
  // 노트 수정 저장
  const handleUpdateNote = async (noteId) => {
    if (!editNoteContent.trim()) return;
    
    try {
      // Firestore 문서 업데이트
      const noteRef = doc(db, "patients", patientId, "notes", noteId);
      await updateDoc(noteRef, {
        content: editNoteContent,
        updatedAt: serverTimestamp()
      });
      
      // 로컬 상태 업데이트
      const updatedNotes = notes.map(note => {
        if (note.id === noteId) {
          return {
            ...note,
            content: editNoteContent,
            updatedAt: new Date()
          };
        }
        return note;
      });
      
      setNotes(updatedNotes);
      setEditNoteId(null);
      setEditNoteContent('');
    } catch (error) {
      console.error("노트 수정 오류:", error);
      alert('상담 노트 수정 중 오류가 발생했습니다.');
    }
  };
  
  // 노트 삭제
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('이 상담 노트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    try {
      // Firestore 문서 삭제
      const noteRef = doc(db, "patients", patientId, "notes", noteId);
      await deleteDoc(noteRef);
      
      // 로컬 상태 업데이트
      const filteredNotes = notes.filter(note => note.id !== noteId);
      setNotes(filteredNotes);
    } catch (error) {
      console.error("노트 삭제 오류:", error);
      alert('상담 노트 삭제 중 오류가 발생했습니다.');
    }
  };
  
  // 상담 요청 처리 페이지로 이동
  const handleProcessRequest = (requestId) => {
    navigate(`/counseling-record/${requestId}`);
  };
  
  // 환자 이니셜 가져오기
  const getPatientInitials = () => {
    if (!patient || !patient.name) return '?';
    
    const nameParts = patient.name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    
    return patient.name[0].toUpperCase();
  };
  
  // 레이더 차트 데이터
  const radarChartData = {
    labels: Object.values(categoryScores).map(cat => cat.title),
    datasets: [
      {
        label: '점수 (백분율)',
        data: Object.values(categoryScores).map(cat => cat.percent),
        backgroundColor: 'rgba(42, 94, 140, 0.2)',
        borderColor: 'rgba(42, 94, 140, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(42, 94, 140, 1)',
      }
    ]
  };
  
  // 레이더 차트 옵션
  const radarChartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    },
    maintainAspectRatio: false
  };
  
  // 바 차트 데이터
  const barChartData = {
    labels: Object.values(categoryScores).map(cat => cat.title),
    datasets: [
      {
        label: '취득 점수',
        data: Object.values(categoryScores).map(cat => cat.score),
        backgroundColor: 'rgba(42, 94, 140, 0.7)',
      },
      {
        label: '평균 점수',
        data: Object.values(categoryScores).map(cat => cat.maxScore),
        backgroundColor: 'rgba(220, 220, 220, 0.7)',
      }
    ]
  };
  
  // 바 차트 옵션
  const barChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    maintainAspectRatio: false
  };
  
  // 13-1 설문 질문 목록
  const surveyQuestions = {
    // 식이조절 세부 항목
    q13_1_1: "조미료 섭취를 줄인다.",
    q13_1_2: "식품의 신선도를 중요시한다.",
    q13_1_3: "채식 및 과일 위주의 식습관을 한다.",
    q13_1_4: "육류 섭취를 조절한다.",
    q13_1_5: "탄수화물 섭취를 조절한다.",
    q13_1_6: "항암식품(예: 버섯, 도라지, 두유, 현미식 등)을 먹는다.",
  };
  
  // 설문 응답에 대한 설명
  const getScoreDescription = (score) => {
    const scoreInt = parseInt(score);
    switch(scoreInt) {
      case 1: return "전혀 그렇지 않다";
      case 2: return "그렇지 않다";
      case 3: return "보통이다";
      case 4: return "그렇다";
      case 5: return "매우 그렇다";
      default: return "응답 없음";
    }
  };

  console.log("Current patient data:", patient);

  if (loading) {
    return (
      <Layout title="환자 상세 정보">
        <Container>
          <p>환자 데이터를 불러오는 중...</p>
        </Container>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="환자 상세 정보">
        <Container>
          <BackLink to="/">← 대시보드로 돌아가기</BackLink>
          <Card>
            <CardTitle>오류</CardTitle>
            <p>{error}</p>
          </Card>
        </Container>
      </Layout>
    );
  }
  
  if (!patient) {
    return (
      <Layout title="환자 상세 정보">
        <Container>
          <BackLink to="/">← 대시보드로 돌아가기</BackLink>
          <Card>
            <CardTitle>환자를 찾을 수 없음</CardTitle>
            <p>해당 ID의 환자를 찾을 수 없습니다.</p>
          </Card>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="환자 상세 정보">
      <Container>
        <BackLink to="/">← 대시보드로 돌아가기</BackLink>
        
        <PatientHeader>
          <PatientBasicInfo>
            <PatientAvatar>{getPatientInitials()}</PatientAvatar>
            <PatientNameContainer>
              <PatientName>{patient.name || '익명 환자'}</PatientName>
              <PatientId>ID: {patient.id}</PatientId>
            </PatientNameContainer>
          </PatientBasicInfo>
        </PatientHeader>
        
        <TabNav>
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          >
            기본 정보
          </TabButton>
          <TabButton 
            active={activeTab === 'survey'} 
            onClick={() => setActiveTab('survey')}
          >
            건강 상태
          </TabButton>
          <TabButton 
            active={activeTab === 'counseling'} 
            onClick={() => setActiveTab('counseling')}
          >
            상담 기록
          </TabButton>
        </TabNav>
        
        {activeTab === 'overview' && (
          <>
            <Card>
              <CardTitle>환자 기본 정보</CardTitle>
              <InfoGrid>
                <InfoGroup>
                  <InfoLabel>나이</InfoLabel>
                  <InfoValue>{patient.age || '정보 없음'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>성별</InfoLabel>
                  <InfoValue>{patient.gender || '정보 없음'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>생년월일</InfoLabel>
                  <InfoValue>{patient.birthDate || '정보 없음'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>암 종류</InfoLabel>
                  <InfoValue>
                    {patient.cancerType}
                    {patient.otherCancerType && ` (${patient.otherCancerType})`}
                  </InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>진단 시기</InfoLabel>
                  <InfoValue>{patient.diagnosisDate || '정보 없음'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>현재 치료 상태</InfoLabel>
                  <InfoValue>{patient.currentTreatment || '정보 없음'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>치료 방법</InfoLabel>
                  {patient.treatmentTypes && patient.treatmentTypes.length > 0 ? (
                    <TreatmentTagsContainer>
                      {patient.treatmentTypes.map((treatment, index) => (
                        <TreatmentTag key={index}>{treatment}</TreatmentTag>
                      ))}
                      {patient.otherTreatmentType && (
                        <TreatmentTag>{patient.otherTreatmentType}</TreatmentTag>
                      )}
                    </TreatmentTagsContainer>
                  ) : (
                    <InfoValue>정보 없음</InfoValue>
                  )}
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>신체적 제한</InfoLabel>
                  <InfoValue>{patient.physicalLimitations || '없음'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>정신 건강력</InfoLabel>
                  <InfoValue>{patient.mentalHealthHistory || '없음'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>절주 여부</InfoLabel>
                  <InfoValue>{patient.alcoholAbstinence || '정보 없음'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>금연 여부</InfoLabel>
                  <InfoValue>{patient.smokingCessation || '정보 없음'}</InfoValue>
                </InfoGroup>
                <InfoGroup>
                  <InfoLabel>위험도</InfoLabel>
                  <Badge type={patient.riskLevel}>
                    {patient.riskLevel === 'high' ? '고위험' : 
                     patient.riskLevel === 'medium' ? '중위험' : '저위험'}
                  </Badge>
                </InfoGroup>
              </InfoGrid>
            </Card>
            
            <Card>
              <CardTitle>최근 상담 요청</CardTitle>
              {counselingRequests.length === 0 ? (
                <EmptyState>아직 상담 요청이 없습니다.</EmptyState>
              ) : (
                <CounselingRequestsList>
                  {counselingRequests.slice(0, 3).map(request => (
                    <CounselingRequestItem key={request.id}>
                      <CounselingRequestHeader>
                        <CounselingRequestTitle>
                          상담 요청 #{request.id.substring(0, 8)}
                        </CounselingRequestTitle>
                        <Badge status={request.status}>
                          {getRequestStatusText(request.status)}
                        </Badge>
                      </CounselingRequestHeader>
                      <p>{request.concerns}</p>
                      <CounselingRequestMeta>
                        <span>요청일: {request.createdAt.toLocaleDateString()}</span>
                        <Button onClick={() => handleProcessRequest(request.id)}>
                          상세보기
                        </Button>
                      </CounselingRequestMeta>
                    </CounselingRequestItem>
                  ))}
                </CounselingRequestsList>
              )}
            </Card>
          </>
        )}
        
        {activeTab === 'survey' && (
          <>
            <Card>
              <CardTitle>건강 상태 평가</CardTitle>
              
              <ScoreCardsContainer>
                {Object.entries(categoryScores).map(([key, data]) => (
                  <ScoreCard key={key}>
                    <ScoreLabel>{data.title}</ScoreLabel>
                    <ScoreValue score={data.percent}>
                      {Math.round(data.percent)}%
                    </ScoreValue>
                    <InfoLabel>{data.score}/{data.maxScore} 점</InfoLabel>
                  </ScoreCard>
                ))}
              </ScoreCardsContainer>
              
              <TwoColumnGrid>
                <Card>
                  <CardTitle>영역별 비교</CardTitle>
                  <ChartContainer>
                    <Radar data={radarChartData} options={radarChartOptions} />
                  </ChartContainer>
                </Card>
                
                <Card>
                  <CardTitle>카테고리별 점수</CardTitle>
                  <ChartContainer>
                    <Bar data={barChartData} options={barChartOptions} />
                  </ChartContainer>
                </Card>
              </TwoColumnGrid>
            </Card>
            
            <Card>
              <CardTitle>환자 특이사항</CardTitle>
              
              {/* 특이사항 내용이 없을 경우 */}
              {(!surveyData || 
                ((!surveyData.q12_reasons || Object.keys(surveyData.q12_reasons).length === 0) && 
                 (!surveyData.q13 || parseInt(surveyData.q13) < 3) && 
                 (!surveyData.q15_reasons || Object.keys(surveyData.q15_reasons).length === 0))
              ) && (
                <EmptyState>특이사항 정보가 없습니다.</EmptyState>
              )}
              
              {/* 특이사항 내용이 있을 경우 */}
              {surveyData && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  
                  {/* 건강관리 장애요인 */}
                  {surveyData.q12_reasons && Object.keys(surveyData.q12_reasons).length > 0 && (
                    <div style={{ 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '10px', 
                      padding: '1.25rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      borderLeft: '4px solid #2a5e8c'
                    }}>
                      <h4 style={{ 
                        fontSize: '1rem', 
                        color: '#2a5e8c', 
                        marginTop: 0, 
                        marginBottom: '1rem',
                        fontWeight: '600'
                      }}>
                        건강관리에 어려움이 있는 이유
                      </h4>
                      <ul style={{ 
                        margin: 0, 
                        paddingLeft: '1.25rem',
                        color: '#495057'
                      }}>
                        {Object.entries(surveyData.q12_reasons).map(([index, reason]) => (
                          <li key={index} style={{ marginBottom: '0.5rem' }}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* 식이조절 방식 */}
                  {surveyData.q13 && parseInt(surveyData.q13) >= 3 && (
                    <div style={{ 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '10px', 
                      padding: '1.25rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      borderLeft: '4px solid #2a5e8c'
                    }}>
                      <h4 style={{ 
                        fontSize: '1rem', 
                        color: '#2a5e8c', 
                        marginTop: 0, 
                        marginBottom: '1rem',
                        fontWeight: '600'
                      }}>
                        식이조절 방식
                      </h4>
                      <ul style={{ 
                        margin: 0, 
                        paddingLeft: '1.25rem',
                        color: '#495057'
                      }}>
                        {[1, 2, 3, 4, 5, 6].map(subNum => {
                          const subQuestionKey = `q13_1_${subNum}`;
                          if (surveyData[subQuestionKey] && parseInt(surveyData[subQuestionKey]) >= 3) {
                            return (
                              <li key={subNum} style={{ marginBottom: '0.5rem' }}>
                                <div>{surveyQuestions[subQuestionKey]}</div>
                                <div style={{ 
                                  display: 'inline-block',
                                  marginTop: '0.25rem',
                                  fontSize: '0.85rem',
                                  padding: '0.15rem 0.5rem',
                                  backgroundColor: '#e9ecef',
                                  borderRadius: '12px',
                                  color: '#2a5e8c'
                                }}>
                                  {getScoreDescription(surveyData[subQuestionKey])}
                                </div>
                              </li>
                            );
                          }
                          return null;
                        }).filter(Boolean)}
                      </ul>
                    </div>
                  )}
                  
                  {/* 가족 지지 부족 이유 */}
                  {surveyData.q15_reasons && Object.keys(surveyData.q15_reasons).length > 0 && (
                    <div style={{ 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '10px', 
                      padding: '1.25rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      borderLeft: '4px solid #2a5e8c'
                    }}>
                      <h4 style={{ 
                        fontSize: '1rem', 
                        color: '#2a5e8c', 
                        marginTop: 0, 
                        marginBottom: '1rem',
                        fontWeight: '600'
                      }}>
                        가족 지지가 부족한 이유
                      </h4>
                      <ul style={{ 
                        margin: 0, 
                        paddingLeft: '1.25rem',
                        color: '#495057'
                      }}>
                        {Object.entries(surveyData.q15_reasons).map(([index, reason]) => (
                          <li key={index} style={{ marginBottom: '0.5rem' }}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </>
        )}
        
        {activeTab === 'counseling' && (
          <>
            <Card>
              <CardTitle>상담 노트 작성</CardTitle>
              <NoteForm onSubmit={handleAddNote}>
                <TextArea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="환자와의 상담 내용, 관찰 사항, 후속 조치 등을 기록하세요..."
                />
                <Button type="submit">노트 저장</Button>
              </NoteForm>
            </Card>
            
            <Card>
              <CardTitle>상담 노트 기록</CardTitle>
              {notes.length === 0 ? (
                <EmptyState>아직 상담 노트가 없습니다.</EmptyState>
              ) : (
                <NotesList>
                  {notes.map(note => (
                    <NoteItem key={note.id}>
                      <NoteHeader>
                        <NoteInfo>
                          <NoteDate>{note.createdAt.toLocaleString()}</NoteDate>
                        </NoteInfo>
                        
                        {editNoteId !== note.id && (
                          <NoteActions>
                            <NoteActionButton onClick={() => handleEditMode(note)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                              </svg>
                              수정
                            </NoteActionButton>
                            <NoteActionButton delete onClick={() => handleDeleteNote(note.id)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                              삭제
                            </NoteActionButton>
                          </NoteActions>
                        )}
                      </NoteHeader>
                      
                      {editNoteId === note.id ? (
                        <div>
                          <NoteEditTextArea 
                            value={editNoteContent}
                            onChange={(e) => setEditNoteContent(e.target.value)}
                          />
                          <EditButtonGroup>
                            <Button secondary onClick={handleCancelEdit}>취소</Button>
                            <Button onClick={() => handleUpdateNote(note.id)}>저장</Button>
                          </EditButtonGroup>
                        </div>
                      ) : (
                        <NoteContent>{note.content}</NoteContent>
                      )}
                    </NoteItem>
                  ))}
                </NotesList>
              )}
            </Card>
          </>
        )}
      </Container>
    </Layout>
  );
}

export default PatientDetailPage;
