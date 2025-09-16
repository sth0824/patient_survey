// src/pages/SurveyResultPage.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useLocation } from 'react-router-dom';
import SurveyResult from '../component/SurveyResult';
import * as SurveyUtils from '../utils/SurveyUtils';

const labelMap = {
  physicalChange: '암 이후 내 몸의 변화',
  healthManagement: '건강한 삶을 위한 관리',
  support: '회복을 도와주는 사람들',
  psychologicalBurden: '심리적 부담',
  socialBurden: '사회적 삶의 부담',
  resilience: '암 이후 탄력성'
};

const sectionIds = {
  physicalChange: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'],
  healthManagement: ['q9', 'q10', 'q11', 'q12', 'q13'],
  support: ['q14', 'q15', 'q16', 'q17'],
  psychologicalBurden: ['q18', 'q19', 'q20', 'q21', 'q22', 'q23', 'q24', 'q25'],
  socialBurden: ['q26', 'q27', 'q28'],
  resilience: ['q29', 'q30', 'q31']
};

const SurveyResultPage = () => {
  const location = useLocation();
  const answers = location.state?.answers || {};
  console.log('answers:', JSON.stringify(answers, null, 2));

  // 1. 역코딩 적용
  const reversed = SurveyUtils.applyReverseScore(answers);
  console.log('reversed:', JSON.stringify(reversed, null, 2));

  // 2. 영역별 합계(원점수) 및 3. 평균 산출 (미응답 제외)
  const rawScores = {};
  const meanScores = {};
  Object.entries(sectionIds).forEach(([key, ids]) => {
    // 실제 응답(숫자)만 추출
    const validAnswers = ids
      .map(id => reversed[id])
      .filter(v => typeof v === 'number' && !isNaN(v));
    rawScores[key] = validAnswers.reduce((sum, v) => sum + v, 0);
    meanScores[key] = validAnswers.length > 0 ? rawScores[key] / validAnswers.length : null;
  });
  console.log('rawScores:', JSON.stringify(rawScores, null, 2));
  console.log('meanScores:', JSON.stringify(meanScores, null, 2));

  // ★ 섹션별 원점수 평균으로 집단 분류 (한 번만 계산, 미응답은 '-')
  const riskGroups = {};
  Object.entries(meanScores).forEach(([key, mean]) => {
    riskGroups[key] = (typeof mean === 'number' && !isNaN(mean))
      ? SurveyUtils.getRiskGroup(labelMap[key], mean)
      : '-';
  });
  console.log('riskGroups:', JSON.stringify(riskGroups, null, 2));
  // 필요하다면 riskByMean 별칭으로 재활용
  const riskByMean = riskGroups;

  // 4. z-score(T-score) 변환 (미응답은 '-')
  const stdScores = {};
  Object.entries(meanScores).forEach(([key, mean]) => {
    const sectionName = labelMap[key];
    stdScores[key] = (typeof mean === 'number' && !isNaN(mean))
      ? SurveyUtils.newScore(sectionName, mean)
      : '-';
  });
  console.log('stdScores:', JSON.stringify(stdScores, null, 2));

  // 6. 전체 평균 **Mean-점수** → 집단 분류 → 템플릿 문구 (미응답 섹션 제외)
  const validMeans = Object.values(meanScores).filter(v => typeof v === 'number' && !isNaN(v));
  const overallMean = validMeans.length > 0
    ? validMeans.reduce((a, b) => a + b, 0) / validMeans.length
    : null;
  console.log('overallMean:', JSON.stringify(overallMean, null, 2));
  const overallRiskGroup = (typeof overallMean === 'number' && !isNaN(overallMean))
    ? SurveyUtils.getRiskGroup('전체 평균 (암 생존자 건강관리)', overallMean)
    : '-';
  console.log('overallRiskGroup:', JSON.stringify(overallRiskGroup, null, 2));
  const overallFeedback = (typeof overallMean === 'number' && !isNaN(overallMean))
    ? SurveyUtils.getPatientComment(overallRiskGroup)
    : '해당 영역(섹션)은 응답하지 않아 점수 산출이 불가합니다.';
  console.log('overallFeedback:', JSON.stringify(overallFeedback, null, 2));

  // ❶ 응답이 존재하는 섹션 key 목록
  const answeredKeys = Object.keys(meanScores)
    .filter(k => typeof meanScores[k] === 'number' && !isNaN(meanScores[k]));
  // ❷ 전달용 객체를 answeredKeys 기준으로 재구성
  const filtered = (src) =>
    Object.fromEntries(answeredKeys.map(k => [k, src[k]]));

  // 7. SurveyResult에 전달 (응답 섹션만)
  return (
    <Box p={4}>
      <SurveyResult
        rawScores={filtered(rawScores)}
        meanScores={filtered(meanScores)}
        stdScores={filtered(stdScores)}
        riskGroups={filtered(riskGroups)}
        overallFeedback={overallFeedback}
        overallRiskGroup={overallRiskGroup}
        answers={answers}
        riskByMean={filtered(riskGroups)}
      />
      <Box mt={4} display="flex" justifyContent="center">
        <Button
          variant="contained"
          href="/"
          sx={{ px: 6, py: 2, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 1 }}
        >
          홈으로 가기
        </Button>
      </Box>
    </Box>
  );
};

export default SurveyResultPage;
