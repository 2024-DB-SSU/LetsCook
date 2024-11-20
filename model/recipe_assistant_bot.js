const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");
const fs = require("fs");
const axios = require("axios");
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
const createAssistantWithFileSearch = async (client, vectorStoreId) => {
  const response = await client.createChatCompletion({
    model: "gpt-4o-mini",
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
    tools: [
      {
        type: "file_search",
        vectorStoreIds: [vectorStoreId],
      },
    ],
  });

  return response.data.id;
};

// 스레드 생성
const createThread = async (client) => {
  const response = await client.createThread();
  return response.data.id;
};

// 벡터 저장소 생성
const createVectorStore = async (client, filePaths) => {
  const vectorStoreResponse = await client.createVectorStore({
    name: "RECIPE",
  });

  const vectorStoreId = vectorStoreResponse.data.id;

  const fileStreams = filePaths.map((filePath) => fs.createReadStream(filePath));

  await client.uploadAndPoll({
    vectorStoreId: vectorStoreId,
    files: fileStreams,
  });

  return vectorStoreId;
};

// 실행 대기 함수
const waitOnRun = async (client, run, threadId) => {
  let status = run.status;
  while (status === "queued" || status === "in_progress") {
    run = await client.retrieveRun(threadId, run.id);
    status = run.status;
    await sleep(500); // 0.5초 대기
  }
  return run;
};

// 메시지 제출
const submitMessage = async (client, assistantId, threadId, userInput) => {
  const [ingredients, cookingStyle, documentList] = userInput;
  const messageContent = `
    사용자의 입력 내용:
    - 선택된 재료: ${ingredients}
    - 선호하는 요리 스타일: ${cookingStyle}
    - 추가 정보:
        * 문서에서 다음 정보를 고려해 주세요: ${documentList}
  `;

  await client.createThreadMessage(threadId, {
    role: "user",
    content: messageContent,
  });

  const run = await client.createRun(threadId, assistantId);
  return run;
};

// 응답 가져오기
const getResponse = async (client, threadId) => {
  const response = await client.listThreadMessages(threadId, { order: "asc" });
  return response.data;
};

// 메시지 출력
const printMessage = (response) => {
  response.forEach((res) => {
    console.log(`[${res.role.toUpperCase()}]\n${res.content}\n`);
  });
  console.log("-".repeat(50));
};

// 어시스턴트에게 질문 보내기
const ask = async (client, assistantId, threadId, userInput) => {
  let run = await submitMessage(client, assistantId, threadId, userInput);
  run = await waitOnRun(client, run, threadId);

  const responseData = await getResponse(client, threadId);
  if (responseData.length > 0) {
    printMessage(responseData[responseData.length - 1]);
  } else {
    console.log("응답이 없습니다.");
  }

  return run;
};

// 메인 함수
const main = async () => {
  const client = initializeClient();

  // 벡터 저장소 생성
  const filePaths = ["../crawling/recipes.json"]; // 업로드할 파일 경로
  const vectorStoreId = await createVectorStore(client, filePaths);

  // 어시스턴트 생성
  const assistantId = await createAssistantWithFileSearch(client, vectorStoreId);

  // 스레드 생성
  const threadId = await createThread(client);

  // 사용자 입력
  const ingredients = "양파, 감자, 간장, 김치, 대파, 삼겹살, 간장, 마늘, 두부, 계란";
  const cookingStyle = "약간 맵게 해줘";
  const documentList = ["../crawling/recipes.json"]; // 관련 문서 목록
  const userInput = [ingredients, cookingStyle, documentList];

  // 어시스턴트 호출
  await ask(client, assistantId, threadId, userInput);
};

// 프로그램 실행
main().catch((err) => console.error("Error:", err));
