import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Typography
} from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

const Section2Component = ({ answers, setAnswers, setValidationError }) => {
  const questions = [
    { id: 'q9', label: '9. 여러 가지 식품군을 골고루 섭취한다 (예: 균형식).' },
    { id: 'q10', label: '10. 암 진단 및 치료 이후, 규칙적인 운동을 하고 있다.' },
    { id: 'q11', label: '11. 규칙적인 식사를 한다.' },
    { id: 'q12', label: '12. 나는 내가 생각한 건강관리 방법을 잘 실천하고 있다.' },
    { id: 'q13', label: '13. 암 진단 및 치료 이후, 식이조절을 한다.' }
  ];

  const reasons12_1 = [
    '1) 무엇을 해야 할지 몰라서',
    '2) 건강관리 자체를 스트레스라고 생각해서',
    '3) 의지가 없어서',
    '4) 시간이 많이 걸려서',
    '5) 가족이 도와주지 않아서',
    '6) 경제적으로 부담이 되어서',
    '7) 기타'
  ];

  const sub13 = [
    { id: 'q13_1_1', num: '1)', text: '조미료 섭취를 줄인다.' },
    { id: 'q13_1_2', num: '2)', text: '식품의 신선도를 중요시한다.' },
    { id: 'q13_1_3', num: '3)', text: '채식 및 과일 위주의 식습관을 한다.' },
    { id: 'q13_1_4', num: '4)', text: '육류 섭취를 조절한다.' },
    { id: 'q13_1_5', num: '5)', text: '탄수화물 섭취를 조절한다.' },
    { id: 'q13_1_6', num: '6)', text: '항암식품(예: 버섯, 도라지, 두유, 현미식 등)을 먹는다.' }
  ];

  const options = [
    { value: '1', label: '전혀 그렇지 않다' },
    { value: '2', label: '약간 그렇지 않다' },
    { value: '3', label: '보통이다' },
    { value: '4', label: '약간 그렇다' },
    { value: '5', label: '매우 그렇다' }
  ];

  const handleRadio = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({ ...prev, [name]: value }));
  };

  const handleReasons = (e) => {
    const { value } = e.target;
    const prev = answers.q12_reasons || [];
    const next = prev.includes(value)
      ? prev.filter((v) => v !== value)
      : [...prev, value];
    setAnswers((prevState) => ({ ...prevState, q12_reasons: next }));
  };

  // 🔍 유효성 검사 함수 (UI에서는 이 함수 결과를 활용)
  const validateSection2 = () => {
    const requiredQuestions = ['q9', 'q10', 'q11', 'q12', 'q13'];
    const missing = requiredQuestions.filter((q) => !answers[q]);

    if (answers.q12 === '1' || answers.q12 === '2') {
      if (!answers.q12_reasons || answers.q12_reasons.length === 0) {
        missing.push('q12_reasons');
      }
    }

    if (answers.q13 === '4' || answers.q13 === '5') {
      sub13.forEach((q) => {
        if (!answers[q.id]) {
          missing.push(q.id);
        }
      });
    }

    const isValid = missing.length === 0;
    setValidationError(!isValid);
    return isValid;
  };

  return (
    <Box sx={{ backgroundColor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 1 }}>
      {questions.slice(0, 4).map((q) => (
        <FormControl component="fieldset" key={q.id} sx={{ mb: 2 }} fullWidth>
          <FormLabel component="legend" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {q.label}
          </FormLabel>
          <RadioGroup
            name={q.id}
            value={answers[q.id] || ''}
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
      ))}

      {/* Q12-1 */}
      {['1', '2'].includes(answers.q12) && (
        <Box sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ fontWeight: 'bold', display: 'block', mb: 1, color: 'text.primary' }}>
            ※ 12-1. 건강관리를 잘 하지 못한다면, 다음 중 무엇 때문입니까? (해당되는 것 모두 체크해 주세요)
          </FormLabel>
          <FormGroup>
            {reasons12_1.map((r, idx) => (
              <FormControlLabel
                key={idx}
                control={
                  <Checkbox
                    icon={<RadioButtonUncheckedIcon />}
                    checkedIcon={<RadioButtonCheckedIcon />}
                    checked={(answers.q12_reasons || []).includes(r)}
                    onChange={handleReasons}
                    value={r}
                  />
                }
                label={r}
              />
            ))}
          </FormGroup>
        </Box>
      )}

      {/* Q13 */}
      <FormControl component="fieldset" key="q13" sx={{ mb: 2 }} fullWidth>
        <FormLabel component="legend" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          13. 암 진단 및 치료 이후, 식이조절을 한다.
        </FormLabel>
        <RadioGroup
          name="q13"
          value={answers['q13'] || ''}
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

      {/* Q13-1 */}
      {['4', '5'].includes(answers.q13) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
            ※ 13-1. 아래 각각의 사항에 대해서 식이조절을 얼마나 잘 하는지 체크해 주세요.
          </Typography>
          {sub13.map((q) => (
            <FormControl component="fieldset" key={q.id} sx={{ mb: 2 }} fullWidth>
              <FormLabel component="legend">
                <Typography component="span" sx={{ fontWeight: 'bold', mr: 1 }}>{q.num}</Typography>
                <Typography component="span">{q.text}</Typography>
              </FormLabel>
              <RadioGroup
                name={q.id}
                value={answers[q.id] || ''}
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
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Section2Component;
