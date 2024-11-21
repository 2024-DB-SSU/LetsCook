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
          You are a culinary assistant specializing in creating three creative and practical recipes based on the user's selected ingredients and cooking preferences.
          
          Selected ingredients: A list of ingredients chosen by the user.
          Preferred cooking style: A brief description of the desired flavor or type of dish (e.g., spicy, sweet, savory).

          Each recipe must include:
          - A title describing the dish
          - A summary of the dish
          - A list of ingredients (including both provided and additional ingredients if necessary)
          - Step-by-step cooking instructions
          
          If the selected ingredients are insufficient, suggest additional ingredients and include them in the recipe's ingredient list.

          Use the examples below for reference:
          
          ### Examples of Recipes:
          
          # 레시피 1: 매운 김치 삼겹살 파스타

          [재료]
          - 파스타 면 200g
          - 삼겹살 150g (한 입 크기로 자른다)
          - 양파 1개 (슬라이스)
          - 감자 1개 (작게 큐브)
          - 양송이 100g (슬라이스)
          - 대파 1대 (송송 썰기)
          - 김치 1컵
          - 간장 2큰술
          - 고춧가루 1큰술 (매운 맛을 위해)
          - 식용유

          [조리 방법]
          1. 큰 냄비에 물을 끓이고 소금을 넣은 후, 파스타 면을 패키지 지시에 따라 삶습니다. 삶은 면은 체에 걸러 물기를 빼고 둡니다.
          2. 팬에 식용유를 두르고 중불에서 삼겹살을 바삭하게 익힙니다.
          3. 삼겹살이 익어가면 양파와 감자를 추가하고 함께 볶아 부드러워질 때까지 조리합니다.
          4. 양송이를 넣고 조금 더 볶은 후, 김치와 간장을 추가하고 잘 섞습니다.
          5. 고춧가루를 넣고 전체 재료가 잘 어우러지도록 볶아줍니다.
          6. 삶은 파스타 면을 넣고 모든 재료가 잘 혼합될 때까지 볶은 후, 접시에 담아 대파를 뿌리고 즐기세요!

          ---

          # 레시피 2: 매운 양파와 감자 볶음

          [재료]
          - 감자 2개 (작은 큐브)
          - 양파 1개 (슬라이스)
          - 대파 1대 (송송 썰기)
          - 김치 1컵
          - 간장 1큰술
          - 고춧가루 1큰술 (매운 맛을 위해)
          - 식용유

          [조리 방법]
          1. 팬에 식용유를 두르고 중불에서 감자를 넣고 약 5분간 볶습니다.
          2. 감자가 어느 정도 익으면 양파를 추가하고 계속 볶아줍니다.
          3. 양파가 투명해지면 김치를 넣고 간장과 고춧가루를 추가하여 잘 섞습니다.
          4. 모든 재료가 잘 어우러지도록 볶은 후, 대파를 넣고 한 번 더 볶습니다.
          5. 간을 보고 필요시 간장 또는 고춧가루를 추가하여 조절한 후, 접시에 담아 맛있게 드세요.

          ---

          Follow this structure to ensure clarity and completeness in your suggestions.

          Your response should include both provided and necessary additional ingredients and maintain consistency in format. Only respond in Korean.
        `,
      },
      {
        role: "user",
        content: `Please create three recipes based on the given ingredients and cooking preferences.`,
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
    Here are the user's inputs:
    - Selected ingredients: ${ingredients}
    - Preferred cooking style: ${cookingStyle}
    - Additional information:
        * Please consider the following documents when generating recipes: ${documentList}
    
    You have access to the contents of the uploaded documents. Use this information to enhance your suggestions or answer user queries. 
    Please generate three recipes considering the above inputs and the information from the documents.
    
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
