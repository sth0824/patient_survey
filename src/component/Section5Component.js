// src/components/Section5Component.js
// Section5: 사회적 삶의 부담 질문 (Q26~Q28)

import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

const Section5Component = ({ answers, setAnswers }) => {
  const questions = [
    {
      id: 'q26',
      label:
        '26. 암 발병 전과 비교해서 다른 사람(예: 친구, 직장 동료 등)과 잘 어울리지 못한다.'
    },
    {
      id: 'q27',
      label:
        '27. 암 발병 전과 비교해서 사회생활(예: 취미, 봉사 활동, 직장 등)을 하는데 어려움을 느낀다.'
    },
    {
      id: 'q28',
      label:
        '28. 암 발병으로 인해 취직, 직장복귀 및 적응(예: 업무시간, 업무량, 업무 질 등)에 부담감을 느낀다.'
    }
  ];

  const options = [
    { value: '1', label: '전혀 그렇지 않다' },
    { value: '2', label: '약간 그렇지 않다' },
    { value: '3', label: '보통이다' },
    { value: '4', label: '약간 그렇다' },
    { value: '5', label: '매우 그렇다' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box>
      {questions.map((q) => (
        <FormControl component="fieldset" key={q.id} sx={{ mb: 2 }} fullWidth>
          <FormLabel component="legend"
          sx={{ fontWeight: 'bold' , color:"primary.main"}}
          
          >{q.label}</FormLabel>

          <RadioGroup 
          //row 
          name={q.id} 
          value={answers[q.id] || ''} 
          onChange={handleChange}>
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
      ))}
    </Box>
  );
};

export default Section5Component;
