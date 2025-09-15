// src/pages/Section1Page.js
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
import Section1Component from '../component/Section1Component';

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
  const location = useLocation();
  const [answers, setAnswers] = useState(location.state?.answers || {});
  const [error, setError] = useState(false);

  const total = 8;  // Q1~Q8
  const done = Object.keys(answers).filter((k) => answers[k]).length;
  const progress = (done / total) * 100;
  const currentStep = 0;

  const handleNext = () => {
    if (done < total) return setError(true);
    navigate('/section2', { state: { answers } });
  };
  useEffect(() => {
    if (done === total) setError(false);
  }, [done]);

  return (
    <Container maxWidth="md" sx={{ py: 4, background: 'none', bgcolor: 'background.default' }}>
      {/* 설문 헤더 */}
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
        암 생존자 건강관리 설문
      </Typography>
      <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
        여러분의 건강 상태와 일상생활에 대한 것입니다. 아래 내용을 체크해 주세요.
      </Typography>

      {/* 커스텀 스텝바 */}
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

      {/* 질문 카드 */}
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* 섹션 제목 */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: "center" }} >
          {steps[currentStep]}
        </Typography>

        {/* 진행바 */}
        <Box sx={{ mb: 3 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" align="right" sx={{ mt: 1, color: 'text.secondary' }}>
            진행 상황: {done}/{total}
          </Typography>
        </Box>

        {/* 질문 컴포넌트 */}
        <Section1Component answers={answers} setAnswers={setAnswers} />

         {/* error가 true일 때만 Alert 보이기 */}
         {error && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <AlertTitle>경고</AlertTitle>
            모든 문항을 응답해야 다음으로 넘어갈 수 있습니다.
          </Alert>
        )}

        {/* 이전/다음 버튼 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate('/info')}>
            이전
          </Button>
          <Button variant="contained" onClick={handleNext}>
            다음
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Section1Page;
