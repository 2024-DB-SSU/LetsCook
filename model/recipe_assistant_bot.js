const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const util = require("util");

// 환경 변수 로드
dotenv.config();

// OpenAI 클라이언트 초기화
const initializeClient = () => {
  const apiKey = process.env.OPENAI_API_KEY; // 환경 변수에서 API 키 가져오기
  if (!apiKey) {
    throw new Error("API 키가 설정되지 않았습니다.");
  }

  // Configuration 객체 생성
  const configuration = new Configuration({
    apiKey: apiKey,
  });

  // OpenAIApi 객체 생성
  const client = new OpenAIApi(configuration);

  return client;
};

// 스레드 생성 - 내부적으로 관리
let threads = [];
const createThread = () => {
  const threadId = `thread-${threads.length + 1}`;
  threads.push({ threadId, messages: [] });
  return threadId;
};

// 메시지 추가
const addMessageToThread = (threadId, role, content) => {
  const thread = threads.find((t) => t.threadId === threadId);
  if (!thread) throw new Error("스레드가 존재하지 않습니다.");
  thread.messages.push({ role, content });
};

// OpenAI API 호출
const callAssistant = async (client, threadId, userInput) => {
  const thread = threads.find((t) => t.threadId === threadId);
  if (!thread) throw new Error("스레드가 존재하지 않습니다.");

  // 사용자 입력 처리
  const [ingredients, cookingStyle] = userInput;

  const systemPrompt = `
  당신은 요리 전문가 AI입니다. 사용자 입력과 관련된 문서를 참고하여 창의적이고 실용적인 요리 3가지를 제안하세요.
  - 재료: ${ingredients}
  - 요리 스타일: ${cookingStyle}
  
  아래 형식을 사용하세요:
  [레시피 제목]
  [재료]
  - ...
  [조리 방법]
  1. ...
  `;
  
  addMessageToThread(threadId, "system", systemPrompt);
  addMessageToThread(threadId, "user", `Please create recipes based on the given information.`);

  // OpenAI API 호출
  const response = await client.createChatCompletion({
    model: "gpt-4o-mini",
    messages: thread.messages,
  });

  // 응답 추가 및 반환
  const assistantResponse = response.data.choices[0].message.content;
  addMessageToThread(threadId, "assistant", assistantResponse);
  return assistantResponse;
};

// 어시스턴트 실행
const main = async () => {
  const client = initializeClient();

  // 스레드 생성
  const threadId = createThread();

  // 사용자 입력
  const ingredients = "양파, 감자, 간장, 김치, 대파, 삼겹살, 간장, 마늘, 두부, 계란";
  const cookingStyle = "약간 맵게 해줘";
  const userInput = [ingredients, cookingStyle];

  try {
    const response = await callAssistant(client, threadId, userInput);
    console.log("\n[Assistant's Response]");
    console.log(response);
  } catch (err) {
    console.error("Error:", err.message);
  }
};

main();
