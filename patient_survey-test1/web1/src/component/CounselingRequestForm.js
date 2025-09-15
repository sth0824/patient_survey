import React, { useState } from "react";
import { Box, TextField, Button, MenuItem, Select, InputLabel, FormControl, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const initialForm = {
  name: "",
  contact: "",
  counselingType: "",
  detail: "",
  preferredDate: "",
  preferredMethod: "",
  urgency: "보통",
  additionalNote: "",
};

const CounselingRequestForm = () => {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 실제 서비스에서는 API 또는 DB 연동 필요
    setSubmitted(true);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  if (submitted) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" sx={{ backgroundColor: 'background.default' }} px={2} py={4}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400, borderRadius: 2 }}>
          <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
            상담 요청이 정상적으로 접수되었습니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            담당자가 곧 연락드릴 예정입니다.
          </Typography>
          <Button variant="contained" color="primary" onClick={handleGoHome} fullWidth>
            홈으로 가기
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" sx={{ backgroundColor: 'background.default' }} px={2} py={8}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: "100%", borderRadius: 2 }}>
        <Typography variant="h5" align="center" fontWeight="bold" color="primary" gutterBottom>
          상담 요청
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 3 }} color="text.secondary">
          궁금한 점이나 도움이 필요하신 내용을 자유롭게 남겨주세요.
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              name="name"
              label="이름"
              value={form.name}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
            />
            <TextField
              name="contact"
              label="연락처 (휴대폰 또는 이메일)"
              value={form.contact}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
            />
            <FormControl required fullWidth variant="outlined">
              <InputLabel>상담 분야</InputLabel>
              <Select
                name="counselingType"
                value={form.counselingType}
                label="상담 분야"
                onChange={handleChange}
              >
                <MenuItem value="건강관리">건강관리</MenuItem>
                <MenuItem value="심리상담">심리상담</MenuItem>
                <MenuItem value="가족/사회적 지원">가족/사회적 지원</MenuItem>
                <MenuItem value="기타">기타</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="detail"
              label="상담받고 싶은 구체적인 내용"
              value={form.detail}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />
            <TextField
              name="preferredDate"
              label="상담 희망 날짜"
              type="date"
              value={form.preferredDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              variant="outlined"
            />
            <FormControl fullWidth variant="outlined">
              <InputLabel>상담 방식(선택)</InputLabel>
              <Select
                name="preferredMethod"
                value={form.preferredMethod}
                label="상담 방식(선택)"
                onChange={handleChange}
              >
                <MenuItem value="">선택안함</MenuItem>
                <MenuItem value="대면">대면</MenuItem>
                <MenuItem value="전화">전화</MenuItem>
                <MenuItem value="화상">화상</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined">
              <InputLabel>긴급도</InputLabel>
              <Select
                name="urgency"
                value={form.urgency}
                label="긴급도"
                onChange={handleChange}
              >
                <MenuItem value="긴급">긴급</MenuItem>
                <MenuItem value="보통">보통</MenuItem>
                <MenuItem value="여유">여유</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="additionalNote"
              label="추가 전달 사항(선택)"
              value={form.additionalNote}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              variant="outlined"
            />
            <Box display="flex" gap={2} mt={2}>
              <Button variant="contained" color="primary" fullWidth onClick={handleGoHome}>
                홈으로 가기
              </Button>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                상담 요청 제출
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CounselingRequestForm;
