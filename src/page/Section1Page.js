// src/pages/Section1Page.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  LinearProgress
} from '@mui/material';
import Section1Component from '../component/Section1Component';
import { saveUserAnswers } from '../utils/firebaseUtils';

const steps = [
  '암 이후 내 몸의 변화',
  '건강한 삶을 위한 관리',
  '회복하도록 도와주는 사람들',
  '심리적 부담',
  '사회적 삶의 부담',
  '암 이후 탄력성',
  '추가'
];

const Section1Page = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const userName = state?.userName || localStorage.getItem('userName') || '';
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(false);

  const total = 8;  // Q1~Q8
  const done = Object.keys(answers).filter(k => answers[k]).length;
  const progress = (done / total) * 100;
  const currentStep = 0;

  const handleNext = async () => {
    if (done < total) {
      setError(true);
      return;
    }

    const updatedAnswers = {
      ...answers,
    };

    // Firebase에 사용자 답변 저장
    await saveUserAnswers(userName, updatedAnswers);

    navigate('/section2', { state: { name: userName } });
  };

  useEffect(() => {
    if (done === total) setError(false);
  }, [done]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
        암 생존자 건강관리 설문
      </Typography>
      <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
        여러분의 건강 상태와 일상생활에 대한 것입니다. 아래 내용을 체크해 주세요.
      </Typography>
      <Box sx={{ mb: 3 }}>
        <LinearProgress variant="determinate" value={progress} />
        <Typography variant="body2" align="right" sx={{ mt: 1, color: 'text.secondary' }}>
          진행 상황: {done}/{total}
        </Typography>
      </Box>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Section1Component
          name={userName}
          answers={answers}
          setAnswers={setAnswers}
        />
        {error && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            모든 문항을 응답해야 다음으로 넘어갈 수 있습니다.
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate('/info')}>이전</Button>
          <Button variant="contained" onClick={handleNext}>다음</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Section1Page;
