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

  // 1. 역코딩 적용
  const reversed = SurveyUtils.applyReverseScore(answers);

  // 2. 영역별 합계(원점수)
  const rawScores = {};
  Object.entries(sectionIds).forEach(([key, ids]) => {
    rawScores[key] = ids.reduce((sum, id) => sum + (Number(reversed[id]) || 0), 0);
  });

  // 3. **합계 → 평균** 산출
  const meanScores = {};
  Object.entries(sectionIds).forEach(([key, ids]) => {
    meanScores[key] = rawScores[key] / ids.length;
  });

  /* ★ 섹션별 원점수 평균으로 집단 분류 */
  const riskByMean = {};
  Object.entries(meanScores).forEach(([key, mean]) => {
    riskByMean[key] = SurveyUtils.getRiskGroup(labelMap[key], mean);
  });

  // 4. z-score(T-score) 변환
  const stdScores = {};
  Object.entries(meanScores).forEach(([key, mean]) => {
    const sectionName = labelMap[key];
    stdScores[key] = SurveyUtils.newScore(sectionName, mean);
  });

  // 5. 집단 분류 (평균점수 기반!)
  const riskGroups = {};
  Object.entries(meanScores).forEach(([key, mean]) => {
    const sectionName = labelMap[key];
    riskGroups[key] = SurveyUtils.getRiskGroup(sectionName, mean);
  });

  // 6. 전체 평균 **Mean-점수** → 집단 분류 → 템플릿 문구
  const overallMean =
    Object.values(meanScores).reduce((a, b) => a + b, 0) /
    Object.values(meanScores).length;
  const overallRiskGroup =
    SurveyUtils.getRiskGroup('전체 평균 (암 생존자 건강관리)', overallMean);
  const overallFeedback =
    SurveyUtils.getPatientComment(overallRiskGroup);

  console.log('overallRiskGroup:', overallRiskGroup);
  console.log('overallFeedback:', overallFeedback);

  // 7. SurveyResult에 전달
  return (
    <Box p={4}>
      <SurveyResult
        rawScores={rawScores}
        meanScores={meanScores}
        stdScores={stdScores}
        riskGroups={riskGroups}
        overallFeedback={overallFeedback}
        overallRiskGroup={overallRiskGroup}
        answers={answers}
        riskByMean={riskByMean}          // 새로 전달
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
