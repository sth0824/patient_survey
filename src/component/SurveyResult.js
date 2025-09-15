import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Container, Paper, CircularProgress } from '@mui/material';
import { Radar, Bar } from 'react-chartjs-2';
import {
  Chart,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Legend,
  Tooltip,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';

import * as SurveyUtils from '../utils/SurveyUtils';
import { generateAndFetchAIComments } from '../utils/Comment.js'; // Comment.js에서 함수 임포트

// 차트 요소 등록
Chart.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Legend,
  Tooltip,
  CategoryScale,
  LinearScale,
  BarElement
);

// 레이블 및 매핑
const labelMap = {
  physicalChange: '암 이후 내 몸의 변화',
  healthManagement: '건강한 삶을 위한 관리',
  support: '회복을 도와주는 사람들',
  psychologicalBurden: '심리적 부담',
  socialBurden: '사회적 삶의 부담',
  resilience: '암 이후 탄력성',
  lifestyle: '생활 습관'
};
const maxScores = {
  physicalChange: 40,
  healthManagement: 25,
  support: 20,
  psychologicalBurden: 40,
  socialBurden: 15,
  resilience: 25,
  lifestyle: 10
};

const SurveyResult = ({
  rawScores = {},
  meanScores = {},
  stdScores = {},
  riskGroups = {},
  overallFeedback = "",
  overallRiskGroup = "",
  answers = {},
  riskByMean = {}
}) => {
  const [aiComments, setAiComments] = useState([]);
  const [isAiCommentsLoading, setIsAiCommentsLoading] = useState(false);
  const [aiCommentsError, setAiCommentsError] = useState(null);

  // 1) 데이터 전처리
  const processed = Object.keys(rawScores).map((key) => {
    const value = rawScores[key] ?? 0;
    const mean  = meanScores[key] ?? 0;
    const included = key !== 'lifestyle';
    const sectionName = labelMap[key];
    return {
      key,
      label: sectionName,
      value,
      mean,
      max: maxScores[key],
      stdScore: included ? SurveyUtils.newScore(sectionName, mean) : 0,
      level: included ? SurveyUtils.getRiskGroup(sectionName, mean) : '저위험집단',
      included
    };
  });

  // 디버깅: mean, stdScore 값 콘솔 출력
  console.table(processed.map(({ key, mean, stdScore }) => ({ key, mean, stdScore })));

  // 2) 레이더 차트 데이터
  const radarData = {
    labels: processed.filter(p => p.included).map(p => p.label),
    datasets: [{
      label: '표준화 점수',
      data: processed.filter(p => p.included).map(p => p.stdScore),
      backgroundColor: 'rgba(25, 118, 210, 0.2)',
      borderColor: 'rgba(25, 118, 210, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(25, 118, 210, 1)'
    }]
  };

  // 3) 막대 차트 데이터
  const cats = processed.filter(p => p.included);
  const labels = cats.map(p => p.label);
  // ① 파란 막대: **T-score**(0~100)
  const myScores = cats.map(p => p.stdScore ?? 0);
  // ② 회색 막대: **기준선 50**(T-score 평균)
  const avgScores = cats.map(() => 50);
  const barData = {
    labels,
    datasets: [
      {
        label: '나의 T-점수',
        data: myScores,
        backgroundColor: 'rgba(54,162,235,0.6)'
      },
      {
        label: '집단 평균(T=50)',
        data: avgScores,
        backgroundColor: 'rgba(200,200,200,0.5)'
      }
    ]
  };
  const barOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { stepSize: 10 } }
    }
  };

  // 4) 추가 피드백: answers 전체를 통째로 함수에 전달
  const additionalComments = SurveyUtils.getAdditionalFeedback(
    answers,
    meanScores,
    riskByMean
  );

  useEffect(() => {
    const fetchAIComments = async () => {
      if (Object.keys(answers).length === 0) return; // 답변이 없으면 호출하지 않음

      setIsAiCommentsLoading(true);
      setAiCommentsError(null);
      try {
        // Comment.js의 함수를 사용하여 AI 코멘트
        const comments = await generateAndFetchAIComments({
          answers,
          rawScores,
          meanScores,
          stdScores,
          riskGroups,
          overallFeedback,
          overallRiskGroup
        });
        setAiComments(comments);
      } catch (error) {
        console.error("Failed to fetch AI comments:", error);
        setAiCommentsError("AI 기반 추가 조언을 가져오는 데 실패했습니다.");
        setAiComments([{ text: "AI 기반 추가 조언을 가져오는 데 실패했습니다.", style: "error" }]);
      } finally {
        setIsAiCommentsLoading(false);
      }
    };

    fetchAIComments();
  }, [answers, rawScores, meanScores, stdScores, riskGroups, overallFeedback, overallRiskGroup]);

  return (
    <Box sx={{ backgroundColor: 'background.default', py: 6 }}>
      <Container maxWidth="lg">

        {/* 전체를 감싸는 하얀 배경 */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>

          {/* 타이틀 & 설명 */}
          <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
            건강 관리 결과
          </Typography>
          <Typography variant="body2" align="center" sx={{ mb: 4 }} color="text.secondary">
            현재 상태를 시각적으로 확인하고, 집중 관리가 필요한 영역과 추천 사항을 확인하세요.
          </Typography>

          {/* Answers Display Section */}
          {Object.keys(answers).length > 0 && (
            <Paper elevation={2} sx={{ p: 3, mt: 4, mb: 4 }}>
              <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.dark' }}>
                제출된 답변 확인 (Raw Data)
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto', p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                <pre>{JSON.stringify(answers, null, 2)}</pre>
              </Box>
            </Paper>
          )}

          {/* 1. 영역별 점수 비교 */}
          <Paper elevation={2} sx={{ p: 5, mb: 4 }}>
            <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.dark' }}>
              영역별 점수 비교
            </Typography>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              mx:'auto',
              height: 400,
              maxWidth: 800,
            }}>
              <Radar data={radarData} options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { r: { suggestedMin: 0, suggestedMax: 100 } }
              }} />
            </Box>
          </Paper>

          {/* 2. 카테고리별 점수 */}
          <Paper elevation={2} sx={{ p: 5, mb: 4 }}>
            <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', mb: 3 , color: 'primary.dark'}}>
              카테고리별 점수
            </Typography>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: 500,
              maxWidth: 800,
              mx:'auto'
            }}>
              <Bar data={barData} options={barOptions} />
            </Box>
          </Paper>

          {/* 3. 피드백 카드 그리드 */}
          <Grid container spacing={2} direction="column">
            {/* 전체 피드백 카드 (연두색 영역) */}
            <Grid item xs={12} >
              <Paper elevation={1} sx={{
                p: 3,
                borderLeft: `4px solid #ffffff`,
                height: '100%'
              }}>
                <Typography variant="subtitle1" align="center" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.dark' }}>
                  전체 피드백
                </Typography>
                <Typography variant="subtitle2" align="center" sx={{ mb: .5 }}>
                  {overallRiskGroup}
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary">
                  {overallFeedback}
                </Typography>
              </Paper>
            </Grid>

            {/* ★ 추가 피드백 – 하나의 영역으로 통합 */}
            {additionalComments.length > 0 && (
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 3, borderLeft:'4px solid #ffffff' }}>
                  <Typography
                    variant="subtitle1"
                    align="center"
                    sx={{ fontWeight:'bold', mb:1, color:'primary.dark' }}
                  >
                    추가 피드백
                  </Typography>
                  {additionalComments.map(({ text, style }, idx) => (
                    <Typography
                      key={idx}
                      variant="body2"
                      align="center"
                      sx={{ mb: .5,
                        color:
                          style === "error"   ? "error.main"   :
                          style === "info"    ? "primary.main" :
                          style === "success" ? "success.main" : "text.primary",
                        fontWeight:'bold'
                      }}
                    >
                      {text}
                    </Typography>
                  ))}
                </Paper>
              </Grid>
            )}

            {/* AI Generated Comments Section */}
            {(isAiCommentsLoading || aiCommentsError || (aiComments && aiComments.length > 0)) && (
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 3, borderLeft: '4px solid #ffffff', mt: 2 }}>
                  <Typography
                    variant="subtitle1"
                    align="center"
                    sx={{ fontWeight: 'bold', mb: 1, color: 'primary.dark' }}
                  >
                    AI 기반 추가 조언
                  </Typography>
                  {isAiCommentsLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                      <CircularProgress />
                    </Box>
                  )}
                  {aiCommentsError && (
                    <Typography variant="body2" align="center" color="error.main" sx={{ mb: 0.5 }}>
                      {aiCommentsError} {/* 에러 메시지 직접 표시 */}
                    </Typography>
                  )}
                  {!isAiCommentsLoading && !aiCommentsError && aiComments.map(({ text }, idx) => (
                    <Typography
                      key={idx}
                      variant="body2"
                      align="center"
                      sx={{
                        mb: 0.5,
                        color: 'text.primary',
                        fontWeight: 'normal'
                      }}
                    >
                      {text}
                    </Typography>
                  ))}
                </Paper>
              </Grid>
            )}
          </Grid>

        </Paper>
      </Container>
    </Box>
  );
};

export default SurveyResult;
