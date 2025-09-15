// src/components/Section6Component.js
// Section6: 암 이후 탄력성 질문 (Q29~Q31)

import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

const Section6Component = ({ answers, setAnswers }) => {
  const questions = [
    { id: 'q29', label: '29. 암 치료가 끝났지만, 여전히 건강관리는 중요하다.' },
    { id: 'q30', label: '30. 나는 암을 잘 견뎌냈다는 자신감이 있다.' },
    { id: 'q31', label: '31. 암 발병 후, 내 인생을 긍정적으로 보고 있다.' }
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

export default Section6Component;
