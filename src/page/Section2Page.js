// src/pages/Section2Page.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert, AlertTitle,
  LinearProgress
} from '@mui/material';
import Section2Component from '../component/Section2Component';

const steps = [
  '암 이후 내 몸의 변화',
  '건강한 삶을 위한 관리',
  '회복하도록 도와주는 사람들',
  '심리적 부담',
  '사회적 삶의 부담',
  '암 이후 탄력성',
  '추가'
];

const Section2Page = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // answers 초기값 보정: q12_reasons 항상 배열로
  const defaultAnswers = {
    q9: '',
    q10: '',
    q11: '',
    q12: '',       // main 선택지
    q12_reasons: [], // 12-1 하위 체크박스
    q13: '',       // main 선택지
    q13_1_1: false,
    q13_1_2: false,
    q13_1_3: false,
    q13_1_4: false,
    q13_1_5: false,
    q13_1_6: false
  };
  const [answers, setAnswers] = useState(() => {
    const incoming = location.state?.answers || {};
    return {
      ...defaultAnswers,
      ...incoming,
      q12_reasons: Array.isArray(incoming.q12_reasons) ? incoming.q12_reasons : [],
    };
  });
  const [error, setError] = useState(false);

  // Q12 및 Q13 하위 필수 여부 플래그
  const requiredSub12 = ['1', '2'].includes(answers.q12);
  const requiredSub13 = ['4', '5'].includes(answers.q13);

  // 에러 체크용 동적 완료 개수
  const mainDone = ['q9','q10','q11'].filter(id => answers[id]).length;
  const sub12Done = requiredSub12 && answers.q12_reasons.length > 0 ? 1 : 0;
  const sub13Ids = ['q13_1_1','q13_1_2','q13_1_3','q13_1_4','q13_1_5','q13_1_6'];
  const sub13Done = requiredSub13 ? sub13Ids.filter(id => answers[id]).length : 0;
  const doneCount = mainDone + sub12Done + sub13Done;
  const totalCount = 3 + (requiredSub12 ? 1 : 0) + (requiredSub13 ? sub13Ids.length : 0);

  // 메인 문항 진행상황 (5개 고정: Q9~Q13)
  const mainProgressCount =
    ['q9','q10','q11'].filter(id => answers[id]).length +
    (answers.q12 ? 1 : 0) +
    (answers.q13 ? 1 : 0);
  const progressPercentage = (mainProgressCount / 5) * 100;

  const currentStep = 1;

  const handleNext = () => {
    if (doneCount < totalCount) {
      setError(true);
      return;
    }
    navigate('/section3', { state: { answers } });
  };

  useEffect(() => {
    if (doneCount === totalCount) {
      setError(false);
    }
  }, [doneCount, totalCount]);

  return (
    <Container maxWidth="md" sx={{ py: 4, background: 'none', bgcolor: 'background.default' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
        암 생존자 건강관리 설문
      </Typography>
      <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
        여러분의 건강 상태와 일상생활에 대한 것입니다. 아래 내용을 체크해 주세요.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        {steps.map((label, idx) => {
          const bg = idx < currentStep
            ? 'success.main'
            : idx === currentStep
            ? 'primary.main'
            : 'grey.300';
          const color = idx <= currentStep ? 'text.primary' : 'text.disabled';
          return (
            <Box key={label} sx={{ flex: 1, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 32, height: 32, mx: 'auto',
                  borderRadius: '50%', bgcolor: bg, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {idx + 1}
              </Box>
              <Typography variant="caption" sx={{ mt: 1, color }}>
                {label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: "center" }}>
          {steps[currentStep]}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <LinearProgress variant="determinate" value={progressPercentage} />
          <Typography variant="body2" align="right" sx={{ mt: 1, color: 'text.secondary' }}>
            진행 상황: {mainProgressCount}/5
          </Typography>
        </Box>

        <Section2Component answers={answers} setAnswers={setAnswers} />

        {error && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <AlertTitle>경고</AlertTitle>
            모든 문항을 응답해야 다음으로 넘어갈 수 있습니다.
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate('/section1')}>이전</Button>
          <Button variant="contained" onClick={handleNext}>다음</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Section2Page;
