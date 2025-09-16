## 🏗️ 시스템 동작 흐름

1. 홈 → 2. 개인정보 입력 → 3. 섹션별 설문 → 4. 결과 확인

> 모든 UI 컴포넌트는 **상태(state)**나 비즈니스 로직을 직접 다루지 않고, “어떻게 보일지만” 정의한 컴포넌트임
> 이 조각들을 페이지 단위 컴포넌트에서 조합하여 최종 화면을 구성


### 🗂️ src 폴더 구조
```bash
.  
src/
│
├── component/                   # UI 컴포넌트 모음
│   ├── home_ui.js               # 메인 페이지 UI 컴포넌트 (카드/버튼 등)
│   ├── SurveyForm.js            # 설문 전 개인정보/진단 정보 입력 폼
│   ├── SurveyResult.js          # 결과 리포트 시각화 (Radar, Bar 차트 + 피드백)
│   ├── Section1Component.js     # 섹션 1: 신체 변화
│   ├── Section2Component.js     # 섹션 2: 건강한 삶을 위한 관리
│   ├── Section3Component.js     # 섹션 3: 가족/사회 지지
│   ├── Section4Component.js     # 섹션 4: 심리적 부담
│   ├── Section5Component.js     # 섹션 5: 사회적 삶의 부담
│   ├── Section6Component.js     # 섹션 6: 암 이후 탄력성
│   └── Section7Component.js     # 섹션 7: 생활 습관 (절주/금연)
│
├── pages/                       # 라우팅 페이지 컴포넌트
│   ├── home.js                  # 홈 소개 페이지 (/)
│   ├── info.js                  # 설문 시작 전 개인정보 입력 페이지 (/info)
│   ├── Section1Page.js          # 섹션 1 설문 페이지
│   ├── Section2Page.js          # 섹션 2 설문 페이지
│   ├── Section3Page.js          # 섹션 3 설문 페이지
│   ├── Section4Page.js          # 섹션 4 설문 페이지
│   ├── Section5Page.js          # 섹션 5 설문 페이지
│   ├── Section6Page.js          # 섹션 6 설문 페이지
│   ├── Section7Page.js          # 섹션 7 설문 페이지
│   └── SurveyResultPage.js      # 결과 페이지 (/survey-result)
│
└── utils/                       # 공통 유틸리티 함수
    └── SurveyUtils.js           # 설문 답안 처리 알고리즘 모아놓은 파일
```

```bash
#
---

### 사회복지사 웹 페이지 데이터 필요한거 정리 (빠트린거 있으면 추가바람)

| 필드명                | 타입             | 설명                                                         |
|-----------------------|------------------|--------------------------------------------------------------|
| `patientId`           | `string`         | 환자(또는 사용자) 고유 ID                                    |
| `answers`             | `object (JSON)`  | 원본 답변: `{ "q1":"3", "q2":"1", … }`                       |
| `sectionZScores`      | `object (JSON)`  | 섹션별 변환점수(T-score) `{ "physicalChange": 50, … }`        |
| `sectionGroups`       | `object (JSON)`  | 섹션별 집단 분류 `{ "physicalChange":"주의집단", … }`        |
| `overallMeanScore`    | `number`         | 6개 섹션 평균 점수의 평균                                     |
| `overallGroup`        | `string`         | 전체 지표 집단 분류 (`고위험집단`/`주의집단`/`저위험집단`)    |
| `socialWorkerComment` | `string`         | 사회복지사용 코멘트  

---

### 예시 JSON 구조(빠트린거 있으면 추가바람)
```json
{
  "patientId": "user-1234",
  "answers": {
    "q1": "3",
    "q2": "1",
    "...": "…",
    "q33": "2"
  },
  "sectionZScores": {
    "physicalChange": 47,
    "healthManagement": 52,
    "socialSupport": 49,
    "psychologicalBurden": 45,
    "socialBurden": 50,
    "resilience": 55
  },
  "sectionGroups": {
    "physicalChange": "주의집단",
    "healthManagement": "저위험집단",
    "socialSupport": "저위험집단",
    "psychologicalBurden": "고위험집단",
    "socialBurden": "주의집단",
    "resilience": "저위험집단"
  },
  "overallMeanScore": 49.67,
  "overallGroup": "주의집단",
  "socialWorkerComment": "환자가 주의집단에 해당합니다. 정기적인 모니터링과 예방적 지원이 권장됩니다."
}

### 💾DB로 보내는 위치 (권장 포인트)

> SurveyResultPage.jsx에서 JSON을 만든 직후 API 호출을 붙이면 한 번에 저장
