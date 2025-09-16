// src/pages/ReportsPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// 컨테이너
const Container = styled.div`
  margin-bottom: 2rem;
`;

// 필터 컨테이너
const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

// 필터 그룹
const FilterGroup = styled.div`
  display: flex;
  align-items: center;
`;

// 필터 라벨
const FilterLabel = styled.label`
  margin-right: 0.5rem;
  font-weight: 500;
  color: #495057;
`;

// 필터 선택
const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;
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
  margin-left: auto;
  
  &:hover {
    background-color: ${props => props.secondary ? '#5a6268' : '#1d4269'};
  }
`;

// 통계 그리드
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

// 통계 카드
const StatCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
`;

// 카드 제목
const CardTitle = styled.h3`
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0 0 0.5rem;
  text-transform: uppercase;
`;

// 카드 값
const CardValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2a5e8c;
  margin-bottom: 0.5rem;
`;

// 차트 컨테이너
const ChartContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

// 차트 제목
const ChartTitle = styled.h2`
  font-size: 1.25rem;
  margin: 0 0 1.5rem;
  color: #343a40;
`;

// 통계 테이블 컨테이너
const TableContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

// 테이블 제목
const TableTitle = styled.h2`
  font-size: 1.25rem;
  margin: 0;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
`;

// 통계 테이블
const StatsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

// 테이블 헤더
const TableHeader = styled.thead`
  background-color: #f8f9fa;
`;

// 헤더 셀
const HeaderCell = styled.th`
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
`;

// 테이블 바디
const TableBody = styled.tbody``;

// 테이블 행
const TableRow = styled.tr`
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`;

// 테이블 셀
const TableCell = styled.td`
  padding: 1rem;
  color: #495057;
`;

// 차트 그리드
const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

// 챠트 내부 컨테이너
const ChartInnerContainer = styled.div`
  height: 300px;
`;

// 로딩 인디케이터
const LoadingIndicator = styled.div`
  text-align: center;
  padding: 2rem;
`;

// 다운로드 버튼
const DownloadButton = styled.a`
  background-color: #28a745;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  margin-left: 1rem;
  
  &:hover {
    background-color: #218838;
  }
`;

// 문자열을 CSV로 다운로드
const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function ReportsPage() {
  const [dateRange, setDateRange] = useState('month');
  const [counselingStats, setCounselingStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0
  });
  const [patientStats, setPatientStats] = useState({
    total: 0,
    newThisMonth: 0,
    highRisk: 0
  });
  const [counselingByCategory, setCounselingByCategory] = useState({});
  const [counselingByDate, setCounselingByDate] = useState([]);
  const [topConcerns, setTopConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 통계 데이터 불러오기
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 날짜 범위 설정
        const now = new Date();
        let startDate;
        
        if (dateRange === 'week') {
          // 일주일 전
          startDate = new Date();
          startDate.setDate(now.getDate() - 7);
        } else if (dateRange === 'month') {
          // 한 달 전
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 1);
        } else if (dateRange === 'quarter') {
          // 3개월 전
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 3);
        } else if (dateRange === 'year') {
          // 1년 전
          startDate = new Date();
          startDate.setFullYear(now.getFullYear() - 1);
        } else {
          // 전체 기간
          startDate = new Date(0); // 1970년 1월 1일
        }
        
        // 상담 요청 데이터 불러오기
        const counselingRef = collection(db, "counselingRequests");
        const querySnapshot = await getDocs(counselingRef);
        
        // 환자 데이터 불러오기
        const patientsRef = collection(db, "patients");
        const patientsSnapshot = await getDocs(patientsRef);
        
        // 상담 통계 계산
        const counselingRequests = [];
        let totalCounseling = 0;
        let pendingCounseling = 0;
        let acceptedCounseling = 0;
        let completedCounseling = 0;
        let cancelledCounseling = 0;
        
        // 카테고리별 통계
        const categoryCounts = {};
        
        // 날짜별 통계
        const dateCounts = {};
        
        // 상담 내용 분석
        const concerns = {};
        
        querySnapshot.forEach(doc => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate() || new Date();
          
          // 지정된 기간 내의 데이터만 필터링
          if (createdAt >= startDate && createdAt <= now) {
            counselingRequests.push({
              id: doc.id,
              ...data,
              createdAt
            });
            
            totalCounseling++;
            
            // 상태별 카운트
            if (data.status === 'pending') pendingCounseling++;
            else if (data.status === 'accepted') acceptedCounseling++;
            else if (data.status === 'completed') completedCounseling++;
            else if (data.status === 'cancelled') cancelledCounseling++;
            
            // 날짜별 통계
            const dateKey = createdAt.toISOString().split('T')[0];
            if (!dateCounts[dateKey]) {
              dateCounts[dateKey] = 1;
            } else {
              dateCounts[dateKey]++;
            }
            
            // 암 종류별 통계
            if (data.userScreening && data.userScreening.cancerType) {
              const category = data.userScreening.cancerType;
              if (!categoryCounts[category]) {
                categoryCounts[category] = 1;
              } else {
                categoryCounts[category]++;
              }
            }
            
            // 상담 내용 단어 분석
            if (data.concerns) {
              // 간단한 단어 빈도 분석
              const words = data.concerns.toLowerCase()
                .replace(/[^\w\s가-힣]/g, '')
                .split(/\s+/)
                .filter(word => word.length > 1);
              
              words.forEach(word => {
                if (!concerns[word]) {
                  concerns[word] = 1;
                } else {
                  concerns[word]++;
                }
              });
            }
          }
        });
        
        // 환자 통계 계산
        let totalPatients = 0;
        let newPatients = 0;
        let highRiskPatients = 0;
        
        patientsSnapshot.forEach(doc => {
          const data = doc.data();
          totalPatients++;
          
          // 최근 가입한 환자 수 계산
          if (data.screening && data.screening.completedAt) {
            const completedAt = new Date(data.screening.completedAt);
            if (completedAt >= startDate) {
              newPatients++;
            }
          }
          
          // 고위험군 환자 수 계산
          if (data.surveyAnswers) {
            const psychologicalAnswers = Object.entries(data.surveyAnswers)
              .filter(([key]) => key.startsWith('q16') || key.startsWith('q17') || key.startsWith('q20'));
            
            const highScoreCount = psychologicalAnswers
              .filter(([_, value]) => parseInt(value) >= 4).length;
            
            if (highScoreCount >= 2) {
              highRiskPatients++;
            }
          }
        });
        
        // 날짜별 데이터 정렬
        const sortedDates = Object.entries(dateCounts)
          .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
          .map(([date, count]) => ({ date, count }));
        
        // 단어 빈도 상위 10개 추출
        const topWords = Object.entries(concerns)
          .sort(([, countA], [, countB]) => countB - countA)
          .slice(0, 10)
          .map(([word, count]) => ({ word, count }));
        
        // 상태 업데이트
        setCounselingStats({
          total: totalCounseling,
          pending: pendingCounseling,
          accepted: acceptedCounseling,
          completed: completedCounseling,
          cancelled: cancelledCounseling
        });
        
        setPatientStats({
          total: totalPatients,
          newThisMonth: newPatients,
          highRisk: highRiskPatients
        });
        
        setCounselingByCategory(categoryCounts);
        setCounselingByDate(sortedDates);
        setTopConcerns(topWords);
        
        setLoading(false);
      } catch (error) {
        console.error("통계 데이터 불러오기 오류:", error);
        setError("통계 데이터를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [dateRange]);
  
  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
    setLoading(true);
  };
  
  // 상담 상태 분포 차트 데이터
  const statusChartData = {
    labels: ['대기중', '예약확정', '완료', '취소'],
    datasets: [
      {
        data: [
          counselingStats.pending,
          counselingStats.accepted,
          counselingStats.completed,
          counselingStats.cancelled
        ],
        backgroundColor: [
          '#ffc107',
          '#2a5e8c',
          '#28a745',
          '#dc3545'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // 암 종류별 분포 차트 데이터
  const categoryChartData = {
    labels: Object.keys(counselingByCategory).map(key => {
      const categories = {
        'breast': '유방암',
        'colorectal': '대장암',
        'lung': '폐암',
        'gastric': '위암',
        'liver': '간암',
        'thyroid': '갑상선암',
        'prostate': '전립선암',
        'other': '기타'
      };
      return categories[key] || key;
    }),
    datasets: [
      {
        data: Object.values(counselingByCategory),
        backgroundColor: [
          '#4e73df',
          '#1cc88a',
          '#36b9cc',
          '#f6c23e',
          '#e74a3b',
          '#5a5c69',
          '#6f42c1',
          '#fd7e14'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // 날짜별 상담 요청 추이 차트 데이터
  const dateChartData = {
    labels: counselingByDate.map(item => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: '상담 요청 수',
        data: counselingByDate.map(item => item.count),
        borderColor: '#2a5e8c',
        backgroundColor: 'rgba(42, 94, 140, 0.2)',
        tension: 0.1,
        fill: true
      },
    ],
  };
  
  // 상담 요청 통계 테이블 CSV 다운로드
  const downloadCounselingStats = () => {
    const headers = "날짜,상담 요청 수,대기 중,예약 확정,완료,취소\n";
    
    // 여기서는 간단한 예시만 제공
    const rows = `${new Date().toLocaleDateString()},${counselingStats.total},${counselingStats.pending},${counselingStats.accepted},${counselingStats.completed},${counselingStats.cancelled}`;
    
    const csvContent = headers + rows;
    downloadCSV(csvContent, `counseling_stats_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
  };
  
  // 카테고리별 통계 CSV 다운로드
  const downloadCategoryStats = () => {
    const headers = "카테고리,상담 요청 수\n";
    
    const rows = Object.entries(counselingByCategory)
      .map(([category, count]) => {
        const categories = {
          'breast': '유방암',
          'colorectal': '대장암',
          'lung': '폐암',
          'gastric': '위암',
          'liver': '간암',
          'thyroid': '갑상선암',
          'prostate': '전립선암',
          'other': '기타'
        };
        return `${categories[category] || category},${count}`;
      })
      .join('\n');
    
    const csvContent = headers + rows;
    downloadCSV(csvContent, `category_stats_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
  };
  
  if (loading) {
    return (
      <Layout title="통계 리포트">
        <Container>
          <LoadingIndicator>
            통계 데이터를 불러오는 중...
          </LoadingIndicator>
        </Container>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="통계 리포트">
        <Container>
          <p>{error}</p>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout title="통계 리포트">
      <Container>
        <FiltersContainer>
          <FilterGroup>
            <FilterLabel htmlFor="dateRange">기간:</FilterLabel>
            <FilterSelect
              id="dateRange"
              value={dateRange}
              onChange={handleDateRangeChange}
            >
              <option value="week">최근 1주일</option>
              <option value="month">최근 1개월</option>
              <option value="quarter">최근 3개월</option>
              <option value="year">최근 1년</option>
              <option value="all">전체 기간</option>
            </FilterSelect>
          </FilterGroup>
          
          <Button onClick={downloadCounselingStats}>
            상담 통계 다운로드
          </Button>
          
          <Button onClick={downloadCategoryStats}>
            카테고리 통계 다운로드
          </Button>
        </FiltersContainer>
        
        <StatsGrid>
          <StatCard>
            <CardTitle>총 상담 요청</CardTitle>
            <CardValue>{counselingStats.total}</CardValue>
          </StatCard>
          
          <StatCard>
            <CardTitle>대기 중인 요청</CardTitle>
            <CardValue>{counselingStats.pending}</CardValue>
          </StatCard>
          
          <StatCard>
            <CardTitle>완료된 상담</CardTitle>
            <CardValue>{counselingStats.completed}</CardValue>
          </StatCard>
          
          <StatCard>
            <CardTitle>총 환자 수</CardTitle>
            <CardValue>{patientStats.total}</CardValue>
          </StatCard>
          
          <StatCard>
            <CardTitle>신규 환자</CardTitle>
            <CardValue>{patientStats.newThisMonth}</CardValue>
          </StatCard>
          
          <StatCard>
            <CardTitle>고위험 환자</CardTitle>
            <CardValue>{patientStats.highRisk}</CardValue>
          </StatCard>
        </StatsGrid>
        
        <ChartGrid>
          <ChartContainer>
            <ChartTitle>상담 상태 분포</ChartTitle>
            <ChartInnerContainer>
              <Pie 
                data={statusChartData} 
                options={{ maintainAspectRatio: false }} 
              />
            </ChartInnerContainer>
          </ChartContainer>
          
          <ChartContainer>
            <ChartTitle>암 종류별 상담 분포</ChartTitle>
            <ChartInnerContainer>
              <Pie 
                data={categoryChartData} 
                options={{ maintainAspectRatio: false }} 
              />
            </ChartInnerContainer>
          </ChartContainer>
        </ChartGrid>
        
        <ChartContainer>
          <ChartTitle>날짜별 상담 요청 추이</ChartTitle>
          <ChartInnerContainer>
            <Line 
              data={dateChartData} 
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }} 
            />
          </ChartInnerContainer>
        </ChartContainer>
        
        <TableContainer>
          <TableTitle>자주 언급되는 상담 주제</TableTitle>
          <StatsTable>
            <TableHeader>
              <tr>
                <HeaderCell>순위</HeaderCell>
                <HeaderCell>단어</HeaderCell>
                <HeaderCell>언급 횟수</HeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {topConcerns.map((item, index) => (
                <TableRow key={item.word}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.word}</TableCell>
                  <TableCell>{item.count}</TableCell>
                </TableRow>
              ))}
              {topConcerns.length === 0 && (
                <TableRow>
                  <TableCell colSpan="3" style={{ textAlign: 'center' }}>
                    분석할 데이터가 충분하지 않습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </StatsTable>
        </TableContainer>
      </Container>
    </Layout>
  );
}

export default ReportsPage;