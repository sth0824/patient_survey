import React from 'react';
import { Box, Grid, Typography, Container, Paper, Button, Chip, Divider } from '@mui/material';
import { Phone, Download, LocalHospital, Psychology, Group, Work } from '@mui/icons-material';
import * as SurveyUtils from '../utils/SurveyUtils';

// 레이블 및 매핑
const labelMap = {
  physicalChange: '암 이후 내 몸의 변화',
  healthManagement: '건강한 삶을 위한 관리',
  socialSupport: '회복을 도와주는 사람들',
  psychologicalBurden: '심리적 부담',
  socialBurden: '사회적 삶의 부담',
  resilience: '암 이후 탄력성'
};

const maxScores = {
  physicalChange: 40,
  healthManagement: 25,
  socialSupport: 20,
  psychologicalBurden: 40,
  socialBurden: 15,
  resilience: 25
};

// 영역별 맞춤 지원 정보
const supportInfo = {
  physicalChange: {
    title: "신체적 관리 지원",
    contacts: [
      { name: "의료진 상담", phone: "병원 주치의", icon: <LocalHospital /> },
      { name: "재활치료센터", phone: "1577-0199", icon: <LocalHospital /> },
      { name: "영양상담", phone: "병원 영양과", icon: <LocalHospital /> }
    ],
    resources: "신체 증상 관리 가이드북 다운로드"
  },
  psychologicalBurden: {
    title: "심리적 지원 서비스",
    contacts: [
      { name: "정신건강복지센터", phone: "1577-0199", icon: <Psychology /> },
      { name: "의료사회복지사", phone: "병원 사회복지팀", icon: <Psychology /> },
      { name: "암환자 심리상담", phone: "1588-5587", icon: <Psychology /> }
    ],
    resources: "스트레스 관리 가이드 다운로드"
  },
  socialSupport: {
    title: "사회적 지지 네트워크",
    contacts: [
      { name: "암환자 자조모임", phone: "1588-5587", icon: <Group /> },
      { name: "가족상담센터", phone: "1577-9337", icon: <Group /> },
      { name: "종교기관 상담", phone: "해당 종교기관", icon: <Group /> }
    ],
    resources: "가족 소통 가이드 다운로드"
  },
  socialBurden: {
    title: "사회복귀 지원",
    contacts: [
      { name: "직업재활센터", phone: "1588-1919", icon: <Work /> },
      { name: "고용복지플러스센터", phone: "국번없이 1350", icon: <Work /> },
      { name: "산업재해보상", phone: "1588-0075", icon: <Work /> }
    ],
    resources: "직장복귀 준비 가이드 다운로드"
  },
  healthManagement: {
    title: "건강관리 교육",
    contacts: [
      { name: "영양상담실", phone: "병원 영양과", icon: <LocalHospital /> },
      { name: "운동처방센터", phone: "병원 재활의학과", icon: <LocalHospital /> },
      { name: "금연상담", phone: "1588-3030", icon: <LocalHospital /> }
    ],
    resources: "건강관리 실천 가이드 다운로드"
  },
  resilience: {
    title: "회복 탄력성 강화",
    contacts: [
      { name: "상담심리센터", phone: "1577-0199", icon: <Psychology /> },
      { name: "명상센터", phone: "지역 명상센터", icon: <Psychology /> },
      { name: "요가/힐링센터", phone: "지역 센터", icon: <Psychology /> }
    ],
    resources: "긍정적 사고 강화 가이드 다운로드"
  }
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
  // 1) 데이터 전처리 - 실제 응답이 있는 섹션만 포함
  const processed = Object.keys(rawScores)
    .filter(key => typeof meanScores[key] === 'number' && !isNaN(meanScores[key]))
    .map((key) => {
      const value = rawScores[key] ?? 0;
      const mean = meanScores[key];
      const included = key !== 'lifestyle';
      const sectionName = labelMap[key];
      const stdScore = included && typeof stdScores[key] === 'number' && !isNaN(stdScores[key]) 
        ? stdScores[key] 
        : 0;
      return {
        key,
        label: sectionName,
        value,
        mean,
        max: maxScores[key],
        stdScore: stdScore,
        level: included ? SurveyUtils.getRiskGroup(sectionName, mean) : '저위험집단',
        included
      };
    });

  // 미응답(제외)된 섹션 안내 메시지 생성
  const allSectionKeys = ['physicalChange','healthManagement','socialSupport','psychologicalBurden','socialBurden','resilience'];
  const answeredKeys = processed.map(p => p.key);
  const excludedSections = allSectionKeys.filter(k => !answeredKeys.includes(k));
  const excludedLabels = excludedSections.map(k => labelMap[k]);

  // 전체 점수 계산
  const totalScore = processed
    .filter((p) => p.included)
    .reduce((sum, p) => sum + p.stdScore, 0) /
    processed.filter((p) => p.included).length;

  // 추가 피드백
  const additionalComments = SurveyUtils.getAdditionalFeedback(
    answers,
    meanScores,
    riskByMean
  );

  // 고위험/주의 집단 영역 찾기
  const needsSupportAreas = processed.filter(p => 
    p.level === '고위험집단' || p.level === '주의집단'
  );

  // 가로 막대 그래프 컴포넌트
  const HorizontalBarChart = ({ data }) => (
    <Box sx={{ width: '100%' }}>
      {data.map((item, index) => {
        const score = Math.round(item.stdScore);
        const percentage = Math.min(Math.max((score - 20) / 60 * 100, 0), 100); // 20-80 범위를 0-100%로 변환
        const isGood = score >= 50;
        
        // 색상 결정 (점수에 따라)
        let color, bgColor, textColor;
        if (score >= 60) {
          color = '#4caf50'; bgColor = '#e8f5e8'; textColor = '#2e7d32';
        } else if (score >= 50) {
          color = '#2196f3'; bgColor = '#e3f2fd'; textColor = '#1565c0';
        } else if (score >= 40) {
          color = '#ff9800'; bgColor = '#fff3e0'; textColor = '#ef6c00';
        } else {
          color = '#f44336'; bgColor = '#ffebee'; textColor = '#c62828';
        }

        return (
          <Box key={index} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                {item.label}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={`${score}점`} 
                  sx={{ 
                    bgcolor: bgColor, 
                    color: textColor, 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }} 
                />
                <Chip 
                  label={item.level} 
                  color={item.level === '저위험집단' ? 'success' : item.level === '주의집단' ? 'warning' : 'error'}
                  variant="outlined"
                  sx={{ fontWeight: 'bold', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                />
              </Box>
            </Box>
            
            {/* MBTI 스타일 가로 바 */}
            <Box sx={{ position: 'relative', height: { xs: 40, sm: 50 }, backgroundColor: '#f5f5f5', borderRadius: 2, overflow: 'hidden' }}>
              {/* 배경 구분선 */}
              <Box sx={{ 
                position: 'absolute', 
                left: '50%', 
                top: 0, 
                bottom: 0, 
                width: 2, 
                backgroundColor: '#999',
                zIndex: 1
              }} />
              
              {/* 점수 바 */}
              <Box sx={{
                position: 'absolute',
                left: score < 50 ? `${Math.max(percentage - 10, 0)}%` : '50%',
                width: score < 50 ? `${Math.min(50 - percentage + 10, 50)}%` : `${Math.min(percentage - 50, 50)}%`,
                height: '100%',
                backgroundColor: color,
                transition: 'all 0.3s ease',
                borderRadius: score < 50 ? '0 8px 8px 0' : '8px 0 0 8px'
              }} />
              
              {/* 점수 텍스트 */}
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 1,
                px: 1,
                py: 0.5
              }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                  {score}점
                </Typography>
              </Box>
              
              {/* 라벨 */}
              <Box sx={{ position: 'absolute', bottom: -25, left: 0, right: 0, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 'bold', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  주의 (20-49점)
                </Typography>
                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'bold', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  양호 (50-80점)
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );

  return (
    <Box sx={{ backgroundColor: 'background.default', py: { xs: 3, sm: 6 } }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
          {/* 타이틀 & 설명 */}
          <Typography
            variant="h5"
            align="center"
            sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main', fontSize: { xs: '1.3rem', sm: '1.5rem' } }}
          >
            건강 관리 결과
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{ mb: 4 }}
            color="text.secondary"
          >
            현재 상태를 확인하고 필요한 지원 서비스를 안내해드립니다.
          </Typography>

          {/* 점수 기준 설명 */}
          <Paper elevation={1} sx={{ p: 2, mb: 4, backgroundColor: '#e3f2fd', borderLeft: '4px solid #1976d2' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
              📊 점수 해석 기준
            </Typography>
            <Typography variant="body2" sx={{ color: '#1565c0', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
              • <strong>50점</strong>이 일반 집단 평균입니다<br/>
              • <strong>50점 이상</strong>: 양호한 상태 (저위험집단)<br/>
              • <strong>40-49점</strong>: 관심이 필요한 상태 (주의집단)<br/>
              • <strong>40점 미만</strong>: 적극적인 지원이 필요한 상태 (고위험집단)
            </Typography>
          </Paper>

          {/* 영역별 T점수 막대 그래프 */}
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
            <Typography
              variant="h6"
              align="center"
              sx={{ fontWeight: 'bold', mb: 3, color: 'primary.dark', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
            >
              영역별 건강 상태
            </Typography>
            <HorizontalBarChart data={processed.filter(p => p.included)} />
          </Paper>

          {/* 점수 요약표 */}
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
            <Typography
              variant="h6"
              align="center"
              sx={{ fontWeight: 'bold', mb: 2, color: 'primary.dark', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
            >
              점수 요약표
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ccc', padding: '12px 8px', fontWeight: 'bold' }}>구분</th>
                    {processed.filter(p => p.included).map((p) => (
                      <th key={p.key} style={{ border: '1px solid #ccc', padding: '12px 8px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                        {p.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>내 T점수</td>
                    {processed.filter(p => p.included).map((p) => (
                      <td key={p.key} style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>
                        {Math.round(p.stdScore)}점
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>평균점수</td>
                    {processed.filter(p => p.included).map((p) => (
                      <td key={p.key} style={{ border: '1px solid #ccc', padding: '8px' }}>50점</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>수준</td>
                    {processed.filter(p => p.included).map((p) => (
                      <td key={p.key} style={{ 
                        border: '1px solid #ccc', 
                        padding: '8px', 
                        fontWeight: 'bold',
                        color: p.level === '저위험집단' ? '#2e7d32' : p.level === '주의집단' ? '#ef6c00' : '#c62828'
                      }}>
                        {p.level}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </Box>
          </Paper>

          {/* 전체 점수 표시 */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4, width: '100%' }}>
            <Paper elevation={3} sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, width: '100%', textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.dark', mb: 1 }}>
                전체 평균 점수
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
                {Math.round(totalScore)}점
              </Typography>
              <Chip 
                label={overallRiskGroup} 
                color={overallRiskGroup === '저위험집단' ? 'success' : overallRiskGroup === '주의집단' ? 'warning' : 'error'}
                sx={{ fontWeight: 'bold' }}
              />
              
              {/* 미응답(제외) 섹션 안내 */}
              {excludedLabels.length > 0 && (
                <Typography variant="body2" sx={{ mt: 2, color: 'warning.main', fontWeight: 500 }}>
                  {excludedLabels.join(', ')} 영역은 응답하지 않아 결과에서 제외되었습니다.
                </Typography>
              )}
            </Paper>
          </Box>

          {/* 피드백 카드 그리드 */}
          <Grid container spacing={2} direction="column">
            {/* 전체 피드백 카드 */}
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 3, borderLeft: '4px solid #1976d2' }}>
                <Typography variant="subtitle1" align="center" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.dark' }}>
                  종합 피드백
                </Typography>
                <Typography variant="subtitle2" align="center" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                  {overallRiskGroup}
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary">
                  {overallFeedback}
                </Typography>
              </Paper>
            </Grid>

            {/* 추가 피드백 카드 */}
            {additionalComments.length > 0 && (
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 3, borderLeft: '4px solid #4caf50' }}>
                  <Typography variant="subtitle1" align="center" sx={{ fontWeight: 'bold', mb: 1, color: 'success.dark' }}>
                    맞춤 건강 조언
                  </Typography>
                  {additionalComments.map(({ text, style }, idx) => (
                    <Typography
                      key={idx}
                      variant="body2"
                      align="center"
                      sx={{
                        mb: 0.5,
                        color: style === 'error' ? 'error.main' : style === 'info' ? 'primary.main' : style === 'success' ? 'success.main' : 'text.primary',
                        fontWeight: 'bold'
                      }}
                    >
                      {text}
                    </Typography>
                  ))}
                </Paper>
              </Grid>
            )}
          </Grid>

          {/* 지원 서비스 안내 */}
          {needsSupportAreas.length > 0 && (
            <Paper elevation={2} sx={{ p: { xs: 2, sm: 4 }, mt: 4, borderLeft: '4px solid #ff9800' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: 'warning.dark', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                🔔 맞춤 지원 서비스 안내
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                관심이 필요한 영역에 대한 전문 지원 서비스를 안내해드립니다.
              </Typography>
              
              {needsSupportAreas.map((area) => {
                const support = supportInfo[area.key];
                if (!support) return null;
                
                return (
                  <Box key={area.key} sx={{ mb: 4, p: 3, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.dark' }}>
                      {area.label} - {support.title}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {support.contacts.map((contact, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                          <Box sx={{ 
                            p: 2, 
                            backgroundColor: 'white', 
                            borderRadius: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            minHeight: 60
                          }}>
                            {contact.icon}
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                                {contact.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                {contact.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    
                    <Button
                      startIcon={<Download />}
                      variant="outlined"
                      size="small"
                      sx={{ mt: 2, fontSize: '0.8rem' }}
                      onClick={() => alert('준비 중인 서비스입니다.')}
                    >
                      {support.resources}
                    </Button>
                  </Box>
                );
              })}
            </Paper>
          )}

          <Divider sx={{ my: 4 }} />
          
          {/* 추가 안내 */}
          <Paper elevation={1} sx={{ p: 3, backgroundColor: '#e8f5e8', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 500 }}>
              💚 더 자세한 상담을 원하시면 아래 상담 요청 버튼을 눌러주세요.<br/>
              전문 사회복지사가 맞춤형 지원 서비스를 제공해드립니다.
            </Typography>
          </Paper>
        </Paper>
      </Container>
    </Box>
  );
};

export default SurveyResult;
