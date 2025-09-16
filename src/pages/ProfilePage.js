// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

// 컨테이너
const Container = styled.div`
  margin-bottom: 2rem;
`;

// 프로필 카드
const ProfileCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin-bottom: 1.5rem;
`;

// 섹션 제목
const SectionTitle = styled.h2`
  font-size: 1.25rem;
  margin: 0 0 1.5rem;
  color: #343a40;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e9ecef;
`;

// 폼 그룹
const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

// 라벨
const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
`;

// 인풋
const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out;
  
  &:focus {
    border-color: #2a5e8c;
    outline: none;
  }
`;

// 버튼
const Button = styled.button`
  background-color: #2a5e8c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
  
  &:hover {
    background-color: #1d4269;
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

// 성공 메시지
const SuccessMessage = styled.p`
  color: #28a745;
  margin-top: 1rem;
`;

// 에러 메시지
const ErrorMessage = styled.p`
  color: #dc3545;
  margin-top: 1rem;
`;

function ProfilePage() {
  const { currentUser, socialWorkerData, updateSocialWorkerData } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    organization: '',
    email: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 사용자 데이터 불러오기
  useEffect(() => {
    if (socialWorkerData) {
      setFormData({
        name: socialWorkerData.name || '',
        phone: socialWorkerData.phone || '',
        organization: socialWorkerData.organization || '',
        email: currentUser.email || ''
      });
    }
  }, [socialWorkerData, currentUser]);
  
  // 폼 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 비밀번호 변경 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      await updateSocialWorkerData(currentUser.uid, {
        name: formData.name,
        phone: formData.phone,
        organization: formData.organization
      });

      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      setError('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout title="내 프로필">
      <Container>
        <ProfileCard>
          <SectionTitle>프로필 정보</SectionTitle>
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">이름</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="email">이메일</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
              />
              <small>이메일은 변경할 수 없습니다.</small>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="phone">연락처</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="organization">소속 기관</Label>
              <Input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
              />
            </FormGroup>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
            
            <Button type="submit" disabled={loading}>
              {loading ? '업데이트 중...' : '프로필 업데이트'}
            </Button>
          </form>
        </ProfileCard>
        
      </Container>
    </Layout>
  );
}

export default ProfilePage;