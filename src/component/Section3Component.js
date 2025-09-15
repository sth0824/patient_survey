// src/components/Section3Component.js
// Section3: 회복하도록 도와주는 사람들 질문 (Q14~Q17 및 Q15-1 하위 문항)

import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup
} from '@mui/material';

const Section3Component = ({ answers, setAnswers }) => {
  // Q14~Q17 라디오 질문
  const questions = [
    { id: 'q14', label: '14. 우리 가족은 나에게 실질적인 도움을 주고 있다.' },
    { id: 'q15', label: '15. 우리 가족은 나에게 충분한 관심과 사랑을 주고 있다.' },
    { id: 'q16', label: '16. 내 성격이 암을 견뎌내는데 도움이 되고 있다.' },
    { id: 'q17', label: '17. 내 친구들은 나에게 충분한 관심과 위로를 주고 있다.' }
  ];

  // Q15-1 라디오 이유 옵션
  const reasons15 = [
    '가족의 도움에 대한 기대감이 낮아서',
    '현실적으로 챙겨줄 수 있는 가족이 없어서',
    '가족이 바빠서',
    '가족의 무심한 성격 때문에',
    '나를 환자로 대하지 않아서',
    '기타'
  ];

  // 공통 옵션
  const options = [
    { value: '1', label: '전혀 그렇지 않다' },
    { value: '2', label: '약간 그렇지 않다' },
    { value: '3', label: '보통이다' },
    { value: '4', label: '약간 그렇다' },
    { value: '5', label: '매우 그렇다' }
  ];

  // 라디오 변경 핸들러
  const handleRadio = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box>
      {/* Q14 */}
      <FormControl component="fieldset" sx={{ mb: 2 }} fullWidth>
        <FormLabel component="legend" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {questions[0].label}
        </FormLabel>
        <RadioGroup
          name={questions[0].id}
          value={answers[questions[0].id] || ''}
          onChange={handleRadio}
        >
          {options.map((opt) => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={<Radio />}
              label={opt.label}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {/* Q15 */}
      <FormControl component="fieldset" sx={{ mb: 2 }} fullWidth>
        <FormLabel component="legend" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {questions[1].label}
        </FormLabel>
        <RadioGroup
          name={questions[1].id}
          value={answers[questions[1].id] || ''}
          onChange={handleRadio}
        >
          {options.map((opt) => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={<Radio />}
              label={opt.label}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {/* Q15-1: Q15가 1 또는 2인 경우에만 표시, 라디오 버튼으로 단일 선택 */}
      {(answers.q15 === '1' || answers.q15 === '2') && (
        <FormControl component="fieldset" sx={{ mb: 2 }} fullWidth>
          <FormLabel component="legend" sx={{ fontWeight: 'bold', display: 'block', mb: 1, color: 'text.primary' }}>
          ※ 15-1. 귀하께서 가족으로부터 관심과 도움을 받지 못하는 이유 (하나만 선택)
          </FormLabel>
          <RadioGroup
            name="q15_reason"
            value={answers.q15_reason || ''}
            onChange={handleRadio}
          >
            {reasons15.map((reason, idx) => (
              <FormControlLabel
                key={idx}
                value={reason}
                control={<Radio />}
                label={reason}
              />
            ))}
          </RadioGroup>
        </FormControl>
      )}

      {/* Q16 */}
      <FormControl component="fieldset" sx={{ mb: 2 }} fullWidth>
        <FormLabel component="legend" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {questions[2].label}
        </FormLabel>
        <RadioGroup
          name={questions[2].id}
          value={answers[questions[2].id] || ''}
          onChange={handleRadio}
        >
          {options.map((opt) => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={<Radio />}
              label={opt.label}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {/* Q17 */}
      <FormControl component="fieldset" sx={{ mb: 2 }} fullWidth>
        <FormLabel component="legend" sx={{ fontWeight: 'bold' , color: 'primary.main'}}>
          {questions[3].label}
        </FormLabel>
        <RadioGroup
          name={questions[3].id}
          value={answers[questions[3].id] || ''}
          onChange={handleRadio}
        >
          {options.map((opt) => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={<Radio />}
              label={opt.label}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default Section3Component;
