const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const sleep = require("util").promisify(setTimeout);

// 환경 변수 로드
dotenv.config();

// OpenAI 클라이언트 초기화
const initializeClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("API 키가 설정되지 않았습니다.");
  }

  const configuration = new Configuration({
    apiKey: apiKey,
  });
  return new OpenAIApi(configuration);
};

// 파일 검색 기능을 포함한 어시스턴트 생성
const createAssistantWithFileSearch = async (client) => {
  const response = await client.createChatCompletion({
    model: "gpt-4",  // GPT-4 모델 사용
    messages: [
      {
        role: "system",
        content: `
          당신은 요리 비서로 사용자가 제공한 재료와 요리 스타일을 기반으로 3개의 레시피를 창의적이고 실용적으로 생성해야 합니다.
          - 선택된 재료: 사용자가 선택한 재료 목록.
          - 선호하는 요리 스타일: 사용자가 원하는 요리의 맛이나 스타일을 간략히 설명 (예: 매운맛, 달콤한 맛, 고소한 맛 등).
          
          각 레시피는 다음과 같은 항목을 포함해야 합니다:
          - 요리 제목
          - 요리 요약
          - 재료 목록
          - 단계별 요리법
        `,
      },
      {
        role: "user",
        content: `사용자가 선택한 재료와 요리 스타일을 바탕으로 레시피를 생성해 주세요.`,
      },
    ],
  });

  return response.data.id;
};

// 메시지 제출
const submitMessage = async (client, userInput) => {
  const [ingredients, cookingStyle] = userInput;
  const messageContent = `
    사용자의 입력 내용:
    - 선택된 재료: ${ingredients}
    - 선호하는 요리 스타일: ${cookingStyle}
  `;

  // 메시지를 OpenAI API로 전송
  const response = await client.createChatCompletion({
    model: "gpt-4",  // GPT-4 모델 사용
    messages: [
      { role: "user", content: messageContent },
    ],
  });

  return response.data.choices[0].message.content; // 응답 내용 반환
};

// 메시지 출력
const printMessage = (message) => {
  console.log(`[AI]\n${message}\n`);
  console.log("-".repeat(50));
};

// 어시스턴트에게 질문 보내기
const ask = async (client, userInput) => {
  const message = await submitMessage(client, userInput);
  printMessage(message);
};

// 메인 함수
const main = async () => {
  const client = initializeClient();

  // 사용자 입력
  const ingredients = "양파, 감자, 간장, 김치, 대파, 삼겹살, 간장, 마늘, 두부, 계란";
  const cookingStyle = "약간 맵게 해줘";
  const userInput = [ingredients, cookingStyle];

  // 어시스턴트 호출
  await ask(client, userInput);
};

// 프로그램 실행
main().catch((err) => console.error("Error:", err));
