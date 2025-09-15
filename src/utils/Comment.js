import OpenAI from "openai"; // ES 모듈 import 사용
// algorithm.json에서 규칙과 출력 형식 설명을 가져옵니다.
import llmRulesConfig from './algorithm.json';
// SurveyUtils에서 역코딩 함수를 가져옵니다.
import { applyReverseScore } from './SurveyUtils';

// Create React App 환경 변수는 process.env.REACT_APP_* 를 통해 접근함
const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
let client; // client를 여기서 선언합니다.

if (apiKey) {
    client = new OpenAI({
        apiKey: apiKey,
        // dangerouslyAllowBrowser: true 옵션은 개발/테스트 중 클라이언트 측에서만 사용해야 합니다.
        // 프로덕션 환경에서는 API 키를 보호하기 위해 API 호출이 백엔드 서버에서 이루어져야 합니다.
        // 이 옵션을 true로 설정하면 브라우저 환경에서 API 키를 사용하여 직접 API를 호출할 수 있게 되지만,
        // API 키가 외부에 노출될 수 있는 심각한 보안 위험이 따릅니다. -> 테스트후에는 서버 코드에서 api호출하기
        dangerouslyAllowBrowser: true, 
    });
    console.log("API 있음"); // API 호출 시 콘솔에 로그를 출력합니다.
} else {
    console.error("오류: REACT_APP_OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.");
}

// OpenAI API를 호출하여 프롬프트를 처리하는 비동기 함수를 정의합니다.
async function callOpenAIWithPrompt(promptContent) {
    // client가 초기화되지 않았는지 확인합니다.
    if (!client) {
        console.error("오류: OpenAI 클라이언트가 초기화되지 않았습니다. API 키를 확인하세요.");
        return [{ text: "AI 코멘트를 생성할 수 없습니다: 클라이언트 초기화 실패." }];
    }

    // 프롬프트 내용이 비어있는지 확인합니다.
    if (!promptContent) {
        // 프롬프트 내용이 비어있으면 콘솔에 오류를 기록합니다.
        console.error("오류: 프롬프트 내용이 비어있습니다.");
        // 오류 메시지와 함께 AI 코멘트를 생성할 수 없음을 나타내는 객체 배열을 반환합니다.
        return [{ text: "AI 코멘트를 생성할 수 없습니다: 프롬프트가 비어있습니다." }];
    }

    // OpenAI API 호출을 시도합니다.
    try {
        // OpenAI API에 요청을 보냄
        const response = await client.chat.completions.create({
            model: "gpt-4o", // 사용할 OpenAI 모델을 지정합니다. (예: "gpt-3.5-turbo")
            messages: [ // API에 전달할 메시지 배열입니다.
                {
                    role: "system", // 시스템 메시지 역할입니다.
                    // 시스템 메시지를 수정하여 JSON 형식이 아닌 일반 텍스트 응답을 요청합니다.
                    content: "You are an AI assistant. Provide your response as plain Korean text."
                },
                {
                    role: "user", // 사용자 메시지 역할입니다.
                    content: promptContent, // 사용자 메시지 내용으로, 실제 프롬프트 내용을 전달합니다.
                }
            ],
        });

        // API 응답에서 AI 어시스턴트의 메시지 내용을 가져옵니다.
        const assistantResponse = response.choices[0]?.message?.content;

        // AI 어시스턴트의 응답이 있는지 확인합니다.
        if (assistantResponse) {
            // AI 응답을 직접 텍스트로 사용합니다. JSON 파싱 로직을 제거합니다.
            return [{ text: assistantResponse }]; // 배열 형태로 반환하여 기존 구조와 호환성 유지
        }
        // AI로부터 유효한 코멘트를 받지 못했으면 오류 메시지를 반환합니다.
        return [{ text: "AI로부터 유효한 코멘트를 받지 못했습니다." }];

    } catch (error) { // OpenAI API 호출 중 오류가 발생하면 catch 블록이 실행됩니다.
        // 콘솔에 API 호출 오류를 기록합니다.
        console.error("OpenAI API 호출 중 오류 발생:", error);
        // 오류 메시지와 함께 OpenAI API 호출 오류를 나타내는 객체 배열을 반환합니다.
        return [{ text: `OpenAI API 호출 오류: ${error.message}` }];
    }
}

// 설문 조사 데이터를 기반으로 AI 코멘트를 생성하고 가져오는 비동기 함수를 정의합니다.
export async function generateAndFetchAIComments({
    answers, // 사용자 답변 (역코딩 전)
    rawScores, // 원점수
    meanScores, // 평균 점수
    stdScores, // 표준화 점수 (T-점수)
    riskGroups, // 섹션별 위험 그룹
    overallFeedback, // 전반적인 피드백 텍스트
    overallRiskGroup // 전체 위험 그룹
}) {
    // 1. 답변에 역코딩 적용
    const reversedAnswers = applyReverseScore(answers);

    // 2. llmRulesConfig에서 llm_rules를 가져와 각 규칙을 문자열로 변환하고 줄바꿈 문자로 연결합니다.
    const rulesForLLM = llmRulesConfig.llm_rules.map(rule => {
        // 각 규칙을 "규칙 ID "id": 만약 condition_description_for_llm라면, action_instruction_for_llm" 형식의 문자열로 만듭니다.
        return `- 규칙 ID "${rule.id}": 만약 ${rule.condition_description_for_llm}라면, ${rule.action_instruction_for_llm}`;
    }).join("\n"); // 각 규칙 문자열을 줄바꿈 문자로 연결합니다.

    // 3. OpenAI API에 전달할 프롬프트 내용을 구성합니다.
    const promptContent = `당신은 암 생존자를 위한 건강 설문 결과를 분석하고 개인화된 조언을 제공하는 AI 건강 코치입니다.
제공되는 '기본적인 전체 피드백 템플릿'을 **기본 골격**으로 사용하세요.
환자의 데이터와 아래 '규칙'들을 분석하여, **환자의 상태에 해당하는 규칙들의 조언만을 선택적으로 '기본적인 전체 피드백 템플릿'에 자연스럽게 통합**하여 최종 조언을 생성해주세요.

환자의 전체 위험 그룹: "${overallRiskGroup}".
환자에게 제공될 기본적인 전체 피드백 템플릿: "${overallFeedback}"

환자 데이터:
- 역코딩된 답변 (reversedAnswers): ${JSON.stringify(reversedAnswers, null, 2)}
- 원점수 (rawScores): ${JSON.stringify(rawScores, null, 2)}
- 평균 점수 (meanScores): ${JSON.stringify(meanScores, null, 2)}
- 표준화 T-점수 (stdScores): ${JSON.stringify(stdScores, null, 2)}
- 섹션별 위험 그룹 (riskGroups): ${JSON.stringify(riskGroups, null, 2)}

규칙:
${rulesForLLM}

**지침:**
1.  **기본 골격:** '${overallFeedback}' 템플릿을 주요 내용으로 사용합니다.
2.  **조건부 조언 통합 및 자연스러운 흐름:** 환자 데이터를 기반으로 '규칙' 섹션의 조건들이 충족되는지 판단합니다. 충족되는 규칙에 해당하는 'action_instruction_for_llm'만을 '${overallFeedback}' 템플릿 내용에 **매우 자연스럽게** 통합하고 확장합니다. 단순히 모든 해당 조언을 나열하는 것이 아니라, 문맥에 맞게, 그리고 서로 잘 어우러지도록 조정해야 합니다. **특히, '기본적인 전체 피드백 템플릿'의 내용과 규칙 기반 조언 간에 의미상 중복이 발생할 경우, 이를 하나의 간결한 문장으로 통합하거나 가장 적절한 표현만 남겨 중복을 최소화해주세요.** 중복되거나 어색한 표현은 피해주세요.
3.  **일관성, 어조 및 간결성:** 모든 조언을 하나의 일관되고 자연스러운 문단으로 통합합니다. 환자에게 친근하고 지지적인 어조를 유지하며 한국어로 제공해주세요. 답변의 길이가 중요한 것이 아니라, 환자에게 가장 필요하고 관련성 높은 조언을 간결하고 명확하게 전달하는 것이 중요합니다. 여러 조건이 만족되더라도, 각 조언을 단순 나열하기보다 연관된 내용끼리 묶거나, 이야기하듯 자연스러운 흐름으로 연결하여 전체적으로 하나의 조언처럼 느껴지도록 내용을 조정하고 통합해주세요.
4.  **이모지 사용:** 전체 메시지에서 최대 1~2개만 사용하여 감정을 부드럽게 전달하는 용도로만 제한적으로 사용해주세요.
5.  **출력 형식:** 최종 조언 메시지를 한국어 일반 텍스트로 제공해주세요.
`;

    // 4. 구성된 프롬프트 내용으로 callOpenAIWithPrompt 함수를 호출하고 결과를 반환합니다.
    return await callOpenAIWithPrompt(promptContent);
}
console.log(generateAndFetchAIComments); // 디버깅용