// src/pages/CalendarPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';

// 컨테이너
const Container = styled.div`
  margin-bottom: 2rem;
`;

// 헤더 컨테이너
const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

// 날짜 네비게이션
const DateNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// 현재 월 표시
const CurrentMonth = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

// 네비게이션 버튼
const NavButton = styled.button`
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

// 뷰 전환 버튼 그룹
const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #ced4da;
  border-radius: 4px;
  overflow: hidden;
`;

// 뷰 버튼
const ViewButton = styled.button`
  background-color: ${props => props.active ? '#2a5e8c' : 'white'};
  color: ${props => props.active ? 'white' : '#495057'};
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? '#2a5e8c' : '#f8f9fa'};
  }
`;

// 캘린더 그리드
const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

// 요일 헤더
const WeekdayHeader = styled.div`
  background-color: #f8f9fa;
  text-align: center;
  padding: 0.75rem;
  font-weight: 500;
  border-bottom: 1px solid #e9ecef;
`;

// 날짜 셀
const DateCell = styled.div`
  min-height: 100px;
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  background-color: ${props => 
    props.isToday ? '#e8f5ff' : 
    props.isCurrentMonth ? 'white' : '#f8f9fa'
  };
  position: relative;
  
  ${props => !props.isCurrentMonth && `
    opacity: 0.5;
  `}
`;

// 날짜 표시
const DateNumber = styled.div`
  font-weight: ${props => props.isToday ? '700' : '400'};
  color: ${props => props.isToday ? '#2a5e8c' : '#343a40'};
  margin-bottom: 0.5rem;
`;

// 이벤트 목록
const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

// 이벤트 아이템
const EventItem = styled.div`
  background-color: ${props => props.color || '#2a5e8c'};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// 더보기 표시
const MoreIndicator = styled.div`
  text-align: center;
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
  cursor: pointer;
`;

// 리스트 뷰 컨테이너
const ListView = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

// 리스트 뷰 날짜 그룹
const ListDateGroup = styled.div`
  margin-bottom: 1.5rem;
`;

// 리스트 뷰 날짜 헤더
const ListDateHeader = styled.div`
  background-color: #f8f9fa;
  padding: 0.75rem 1rem;
  font-weight: 600;
  border-bottom: 1px solid #e9ecef;
`;

// 리스트 뷰 이벤트 목록
const ListEventsList = styled.div`
  padding: 0.5rem 0;
`;

// 리스트 뷰 이벤트 아이템
const ListEventItem = styled.div`
  display: flex;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`;

// 이벤트 시간
const EventTime = styled.div`
  width: 100px;
  font-weight: 500;
`;

// 이벤트 정보
const EventInfo = styled.div`
  flex: 1;
`;

// 이벤트 제목
const EventTitle = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

// 이벤트 설명
const EventDescription = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
`;

// 이벤트 링크
const EventLink = styled(Link)`
  margin-left: auto;
  align-self: center;
  color: #2a5e8c;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

// 월 이름 배열
const monthNames = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
];

// 요일 이름 배열
const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('month'); // 'month' 또는 'list'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 상담 일정 불러오기
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // 캘린더에 표시할 기간 계산
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // 확장된 기간 (이전 달과 다음 달의 표시되는 날짜들 포함)
        const startDate = new Date(startOfMonth);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // 이번 달 1일이 있는 주의 일요일
        
        const endDate = new Date(endOfMonth);
        const daysToAdd = 6 - endDate.getDay();
        endDate.setDate(endDate.getDate() + daysToAdd); // 이번 달 마지막날이 있는 주의 토요일
        
        // Firestore에서 해당 기간의 상담 예약 불러오기
        const appointmentsRef = collection(db, "counselingRequests");
        const q = query(
          appointmentsRef,
          where("status", "==", "accepted")
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedEvents = [];
        
        querySnapshot.forEach(doc => {
          const data = doc.data();
          
          // 날짜 문자열을 Date 객체로 변환
          if (data.appointmentDate) {
            const [year, month, day] = data.appointmentDate.split('-').map(Number);
            const appointmentDate = new Date(year, month - 1, day);
            
            // 지정된 기간 내의 상담만 필터링
            if (appointmentDate >= startDate && appointmentDate <= endDate) {
              fetchedEvents.push({
                id: doc.id,
                title: `${data.name || '익명'} 상담`,
                description: data.concerns ? data.concerns.substring(0, 30) + (data.concerns.length > 30 ? '...' : '') : '상담',
                date: appointmentDate,
                time: data.appointmentTime || '',
                color: '#2a5e8c'
              });
            }
          }
        });
        
        setEvents(fetchedEvents);
        setLoading(false);
      } catch (error) {
        console.error("상담 일정 불러오기 오류:", error);
        setError("상담 일정을 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [currentDate]);
  
  // 캘린더 그리드용 날짜 배열 생성
  const getDaysArray = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 해당 월의 첫째 날과 마지막 날
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // 캘린더 그리드에 표시할 첫 날 (이전 달의 일부 포함)
    const firstDayOfCalendar = new Date(firstDayOfMonth);
    firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfCalendar.getDay());
    
    // 캘린더 그리드에 표시할 마지막 날 (다음 달의 일부 포함)
    const lastDayOfCalendar = new Date(lastDayOfMonth);
    const daysToAdd = 6 - lastDayOfCalendar.getDay();
    lastDayOfCalendar.setDate(lastDayOfCalendar.getDate() + daysToAdd);
    
    // 날짜 배열 생성
    const daysArray = [];
    let currentDay = new Date(firstDayOfCalendar);
    
    while (currentDay <= lastDayOfCalendar) {
      daysArray.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return daysArray;
  };
  
  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  
  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  
  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // 날짜별 이벤트 그룹화
  const getEventsForDate = (date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };
  
  // 날짜가 현재 월에 속하는지 확인
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };
  
  // 날짜가 오늘인지 확인
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  // 리스트 뷰용 날짜 그룹화
  const getGroupedEvents = () => {
    // 날짜별로 이벤트 그룹화
    const groupedEvents = {};
    
    events.forEach(event => {
      const dateString = event.date.toISOString().split('T')[0];
      
      if (!groupedEvents[dateString]) {
        groupedEvents[dateString] = [];
      }
      
      groupedEvents[dateString].push(event);
    });
    
    // 날짜 기준으로 정렬
    return Object.entries(groupedEvents)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([dateString, events]) => ({
        date: new Date(dateString),
        events: events.sort((a, b) => a.time.localeCompare(b.time))
      }));
  };
  
  // 날짜 포맷팅
  const formatDate = (date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${weekdayNames[date.getDay()]})`;
  };
  
  if (loading) {
    return (
      <Layout title="상담 일정">
        <Container>
          <p>일정을 불러오는 중...</p>
        </Container>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="상담 일정">
        <Container>
          <p>{error}</p>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout title="상담 일정">
      <Container>
        <HeaderContainer>
          <DateNavigation>
            <NavButton onClick={goToPreviousMonth}>&lt;</NavButton>
            <CurrentMonth>
              {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
            </CurrentMonth>
            <NavButton onClick={goToNextMonth}>&gt;</NavButton>
            <NavButton onClick={goToToday}>오늘</NavButton>
          </DateNavigation>
          
          <ViewToggle>
            <ViewButton 
              active={viewMode === 'month'} 
              onClick={() => setViewMode('month')}
            >
              월간
            </ViewButton>
            <ViewButton 
              active={viewMode === 'list'} 
              onClick={() => setViewMode('list')}
            >
              목록
            </ViewButton>
          </ViewToggle>
        </HeaderContainer>
        
        {viewMode === 'month' ? (
          <CalendarGrid>
            {/* 요일 헤더 */}
            {weekdayNames.map(day => (
              <WeekdayHeader key={day}>{day}</WeekdayHeader>
            ))}
            
            {/* 날짜 셀 */}
            {getDaysArray().map((date, index) => {
              const dateEvents = getEventsForDate(date);
              const maxVisibleEvents = 3;
              
              return (
                <DateCell 
                  key={index} 
                  isCurrentMonth={isCurrentMonth(date)}
                  isToday={isToday(date)}
                >
                  <DateNumber isToday={isToday(date)}>
                    {date.getDate()}
                  </DateNumber>
                  
                  <EventsList>
                    {dateEvents.slice(0, maxVisibleEvents).map(event => (
                      <EventItem 
                        key={event.id}
                        color={event.color}
                        as={Link}
                        to={`/counseling-record/${event.id}`}
                      >
                        {event.time && `${event.time} `}{event.title}
                      </EventItem>
                    ))}
                    
                    {dateEvents.length > maxVisibleEvents && (
                      <MoreIndicator>
                        +{dateEvents.length - maxVisibleEvents}개 더보기
                      </MoreIndicator>
                    )}
                  </EventsList>
                </DateCell>
              );
            })}
          </CalendarGrid>
        ) : (
          <ListView>
            {getGroupedEvents().length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                이번 달 예정된 상담이 없습니다.
              </div>
            ) : (
              getGroupedEvents().map(group => (
                <ListDateGroup key={group.date.toISOString()}>
                  <ListDateHeader>
                    {formatDate(group.date)}
                  </ListDateHeader>
                  
                  <ListEventsList>
                    {group.events.map(event => (
                      <ListEventItem key={event.id}>
                        <EventTime>{event.time || '시간 미정'}</EventTime>
                        <EventInfo>
                          <EventTitle>{event.title}</EventTitle>
                          <EventDescription>{event.description}</EventDescription>
                        </EventInfo>
                        <EventLink to={`/counseling-record/${event.id}`}>
                          상세보기
                        </EventLink>
                      </ListEventItem>
                    ))}
                  </ListEventsList>
                </ListDateGroup>
              ))
            )}
          </ListView>
        )}
      </Container>
    </Layout>
  );
}

export default CalendarPage;