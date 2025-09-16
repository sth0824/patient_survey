// src/pages/CounselingRequestsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { collection, query, getDocs, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// 필터 컨테이너
const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
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

// 검색 입력
const SearchInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  margin-left: auto;
  width: 250px;
`;

// 요청 카드 컨테이너
const RequestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

// 요청 카드
const RequestCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
`;

// 카드 헤더
const CardHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  background-color: ${props => {
    if (props.status === 'pending') return '#fff8e6';
    if (props.status === 'accepted') return '#e8f7ee';
    if (props.status === 'completed') return '#f8f9fa';
    return '#feeceb';
  }};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// 카드 내용
const CardContent = styled.div`
  padding: 1rem;
  flex: 1;
`;

// 카드 푸터
const CardFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
    return '#dc3545';
  }};
  color: white;
`;

// 환자 이름
const PatientName = styled.h3`
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
`;

// 환자 정보
const PatientInfo = styled.p`
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
`;

// 요청 날짜
const RequestDate = styled.span`
  font-size: 0.8rem;
  color: #6c757d;
`;

// 요청 내용
const RequestContent = styled.p`
  margin-bottom: 1rem;
  white-space: pre-line;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

// 세부사항 목록
const DetailsList = styled.ul`
  padding-left: 1.5rem;
  margin: 0;
`;

// 세부사항 아이템
const DetailsItem = styled.li`
  margin-bottom: 0.5rem;
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

// 링크 버튼
const LinkButton = styled(Link)`
  background-color: ${props => props.secondary ? '#6c757d' : '#2a5e8c'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  
  &:hover {
    background-color: ${props => props.secondary ? '#5a6268' : '#1d4269'};
  }
`;

// 버튼 그룹
const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

// 아무것도 없을 때 메시지
const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

// 페이지 네비게이션
const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  gap: 0.5rem;
`;

// 페이지 버튼
const PageButton = styled.button`
  background-color: ${props => props.active ? '#2a5e8c' : 'white'};
  color: ${props => props.active ? 'white' : '#2a5e8c'};
  border: 1px solid #2a5e8c;
  border-radius: 4px;
  padding: 0.5rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? '#1d4269' : '#e9f5ff'};
  }
  
  &:disabled {
    background-color: #f8f9fa;
    color: #ced4da;
    border-color: #ced4da;
    cursor: not-allowed;
  }
`;

// 상태를 한글로 변환
const getStatusText = (status) => {
  const statuses = {
    'pending': '대기 중',
    'accepted': '예약 확정',
    'completed': '완료',
    'cancelled': '취소됨'
  };
  return statuses[status] || '알 수 없음';
};

// 암 종류를 한글로 변환
const getCancerTypeText = (type) => {
  const types = {
    'breast': '유방암',
    'colorectal': '대장암',
    'lung': '폐암',
    'gastric': '위암',
    'liver': '간암',
    'thyroid': '갑상선암',
    'prostate': '전립선암',
    'other': '기타'
  };
  return types[type] || '알 수 없음';
};

function CounselingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    date: 'all',
    searchTerm: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 6;
  
  // 상담 요청 데이터 불러오기
  useEffect(() => {
    const fetchCounselingRequests = async () => {
      try {
        const requestsRef = collection(db, "counselingRequests");
        const q = query(requestsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const requestsData = [];
        querySnapshot.forEach(doc => {
          requestsData.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          });
        });
        
        setRequests(requestsData);
        setFilteredRequests(requestsData);
        setLoading(false);
      } catch (error) {
        console.error("상담 요청 불러오기 오류:", error);
        setError("상담 요청을 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };
    
    fetchCounselingRequests();
  }, []);
  
  // 필터링 로직
  useEffect(() => {
    let filtered = [...requests];
    
    // 상태 필터
    if (filters.status !== 'all') {
      filtered = filtered.filter(request => request.status === filters.status);
    }
    
    // 날짜 필터
    if (filters.date !== 'all') {
      const now = new Date();
      
      if (filters.date === 'today') {
        // 오늘
        filtered = filtered.filter(request => {
          const requestDate = new Date(request.createdAt);
          return requestDate.toDateString() === now.toDateString();
        });
      } else if (filters.date === 'week') {
        // 일주일 이내
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        filtered = filtered.filter(request => {
          const requestDate = new Date(request.createdAt);
          return requestDate >= weekAgo;
        });
      } else if (filters.date === 'month') {
        // 한 달 이내
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        filtered = filtered.filter(request => {
          const requestDate = new Date(request.createdAt);
          return requestDate >= monthAgo;
        });
      }
    }
    
    // 검색어 필터
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        (request.name && request.name.toLowerCase().includes(term)) || 
        (request.concerns && request.concerns.toLowerCase().includes(term)) ||
        (request.id && request.id.toLowerCase().includes(term))
      );
    }
    
    setFilteredRequests(filtered);
    setCurrentPage(1); // 필터링 시 첫 페이지로 리셋
  }, [filters, requests]);
  
  // 필터 변경 핸들러
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 현재 페이지의 요청 리스트
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
  
  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // 이전 페이지로 이동
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // 다음 페이지로 이동
  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredRequests.length / requestsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // 상태 업데이트 핸들러 (수락, 취소 등)
  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      // Firestore 문서 업데이트
      await updateDoc(doc(db, "counselingRequests", requestId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // 로컬 상태 업데이트
      setRequests(prev => 
        prev.map(request => 
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      );
    } catch (error) {
      console.error("상태 업데이트 오류:", error);
      alert("상태 업데이트 중 오류가 발생했습니다.");
    }
  };
  
  if (loading) {
    return (
      <Layout title="상담 요청 관리">
        <p>상담 요청을 불러오는 중...</p>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="상담 요청 관리">
        <p>{error}</p>
      </Layout>
    );
  }
  
  return (
    <Layout title="상담 요청 관리">
      <FiltersContainer>
        <FilterGroup>
          <FilterLabel htmlFor="status">상태:</FilterLabel>
          <FilterSelect
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="all">전체</option>
            <option value="pending">대기 중</option>
            <option value="accepted">예약 확정</option>
            <option value="completed">완료</option>
            <option value="cancelled">취소됨</option>
          </FilterSelect>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel htmlFor="date">기간:</FilterLabel>
          <FilterSelect
            id="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
          >
            <option value="all">전체</option>
            <option value="today">오늘</option>
            <option value="week">일주일 이내</option>
            <option value="month">한 달 이내</option>
          </FilterSelect>
        </FilterGroup>
        
        <SearchInput
          type="text"
          name="searchTerm"
          value={filters.searchTerm}
          onChange={handleFilterChange}
          placeholder="환자 이름, 내용 검색..."
        />
      </FiltersContainer>
      
      {filteredRequests.length === 0 ? (
        <EmptyState>
          <h3>상담 요청이 없습니다.</h3>
          <p>현재 필터 조건에 맞는 상담 요청이 없습니다. 필터를 변경해보세요.</p>
        </EmptyState>
      ) : (
        <>
          <RequestsGrid>
            {currentRequests.map(request => (
              <RequestCard key={request.id}>
                <CardHeader status={request.status}>
                  <div>
                    <Badge status={request.status}>
                      {getStatusText(request.status)}
                    </Badge>
                  </div>
                  <RequestDate>
                    요청일: {request.createdAt.toLocaleDateString()}
                  </RequestDate>
                </CardHeader>
                
                <CardContent>
                  <PatientName>{request.name || '익명'}</PatientName>
                  <PatientInfo>
                    {request.userScreening?.cancerType && 
                      getCancerTypeText(request.userScreening.cancerType)}
                    {request.userScreening?.age && 
                      ` | ${request.userScreening.age}세`}
                  </PatientInfo>
                  
                  <RequestContent>
                    {request.concerns || '상담 내용이 없습니다.'}
                  </RequestContent>
                  
                  <DetailsList>
                    <DetailsItem>
                      <strong>연락처:</strong> {request.phone || '정보 없음'}
                    </DetailsItem>
                    <DetailsItem>
                      <strong>희망 날짜:</strong> {request.preferredDate || '정보 없음'}
                    </DetailsItem>
                    <DetailsItem>
                      <strong>희망 시간:</strong> {request.preferredTime || '정보 없음'}
                    </DetailsItem>
                  </DetailsList>
                </CardContent>
                
                <CardFooter>
                  <LinkButton to={`/counseling-record/${request.id}`}>
                    상세보기
                  </LinkButton>
                  
                  <ButtonGroup>
                    {request.status === 'pending' && (
                      <>
                        <Button onClick={() => handleStatusUpdate(request.id, 'accepted')}>
                          수락
                        </Button>
                        <Button 
                          secondary 
                          onClick={() => handleStatusUpdate(request.id, 'cancelled')}
                        >
                          거절
                        </Button>
                      </>
                    )}
                    
                    {request.status === 'accepted' && (
                      <Button onClick={() => handleStatusUpdate(request.id, 'completed')}>
                        완료
                      </Button>
                    )}
                  </ButtonGroup>
                </CardFooter>
              </RequestCard>
            ))}
          </RequestsGrid>
          
          {/* 페이지네이션 */}
          {filteredRequests.length > requestsPerPage && (
            <Pagination>
              <PageButton 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
              >
                &lt;
              </PageButton>
              
              {[...Array(Math.ceil(filteredRequests.length / requestsPerPage))].map((_, index) => (
                <PageButton
                  key={index}
                  active={currentPage === index + 1}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </PageButton>
              ))}
              
              <PageButton 
                onClick={handleNextPage} 
                disabled={currentPage === Math.ceil(filteredRequests.length / requestsPerPage)}
              >
                &gt;
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </Layout>
  );
}

export default CounselingRequestsPage;