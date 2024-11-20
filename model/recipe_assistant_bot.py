from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import time


def initialize_client():
    load_dotenv()
    api_key = os.environ.get("OpenAI_API_KEY")
    if not api_key:
        raise ValueError("API 키가 설정되지 않았습니다.")
    return OpenAI(api_key=api_key)


def create_assistant_with_file_search(client, vector_store_id):
    assistant = client.beta.assistants.create(
        name="Recipe Bot",
        instructions="""
            You are a culinary assistant specializing in providing tailored recipes. Based on the given inputs:

            Selected ingredients: A list of ingredients chosen by the user.
            Preferred cooking style: A brief description of the desired flavor or type of dish (e.g., spicy, sweet, or savory).

            Your task is to generate three creative and practical recipes using the provided ingredients while considering the user's cooking preferences. Each recipe should include:

            - A title describing the dish.
            - A brief summary of the dish.
            - A list of ingredients (including the selected ones).
            - Step-by-step cooking instructions.

            If the user does not specify a cooking style, default to a general, versatile approach. Aim to inspire and delight the user with your suggestions.

            In addition to your culinary expertise, you can retrieve information from the uploaded documents to enhance your suggestions or answer user queries. Use this knowledge to provide more accurate, detailed, and contextually relevant recipes or suggestions.

            If the selected ingredients are insufficient for the recipe, suggest additional ingredients and explain why they are necessary.

            Your responses should be in Korean.
        """,
        model="gpt-4o-mini",
        tools=[{"type": "file_search"}],
        tool_resources={"file_search": {"vector_store_ids": [vector_store_id]}},
    )
    return assistant.id


def create_thread(client):
    thread = client.beta.threads.create()
    return thread.id


def create_vector_store(client, file_paths):
    vector_store = client.beta.vector_stores.create(name="RECIPE")
    file_streams = [open(path, "rb") for path in file_paths]

    client.beta.vector_stores.file_batches.upload_and_poll(
        vector_store_id=vector_store.id, files=file_streams
    )

    return vector_store.id


def wait_on_run(client, run, thread_id):
    while run.status == "queued" or run.status == "in_progress":
        run = client.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run.id
        )
        time.sleep(0.5)
    return run


def submit_message(client, assistant_id, thread_id, user_input):
    ingredients, cooking_style, document_list = user_input
    message_content = f"""
    Here are the user's inputs:
    - Selected ingredients: {ingredients}
    - Preferred cooking style: {cooking_style}
    - Additional information:
        * Please consider the following documents when generating recipes: {document_list}

    You have access to the contents of the uploaded documents. Use this information to enhance your suggestions or answer user queries. 
    Please generate three recipes considering the above inputs and the information from the documents.
    """
    client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=message_content
    )

    run = client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=assistant_id
    )
    return run


def get_response(client, thread_id):
    return client.beta.threads.messages.list(thread_id=thread_id, order="asc")


def print_message(response):
    for res in response:
        print(f"[{res.role.upper()}]\n{res.content[0].text.value}\n")
    print("-" * 50)


def ask(client, assistant_id, thread_id, user_input):
    run = submit_message(client, assistant_id, thread_id, user_input)
    run = wait_on_run(client, run, thread_id)
    response_data = get_response(client, thread_id).data
    if response_data:
        print_message(response_data[-1:])
    else:
        print("응답이 없습니다.")
    return run


def main():
    client = initialize_client()

    # Vector store 생성
    file_paths = ["../crawling/recipes.json"]  # 업로드할 파일 경로
    vector_store_id = create_vector_store(client, file_paths)

    # Assistant 생성
    assistant_id = create_assistant_with_file_search(client, vector_store_id)

    # Thread 생성
    thread_id = create_thread(client)

    # 사용자 입력
    ingredients = "양파, 감자, 간장, 김치, 대파, 삼겹살, 간장, 마늘, 두부, 계란"
    cooking_style = "약간 맵게 해줘"
    document_list = ["../crawling/recipes.json"]  # 관련 문서 목록
    user_input = [ingredients, cooking_style, document_list]

    # Assistant 호출
    ask(client, assistant_id, thread_id, user_input)


if __name__ == "__main__":
    main()
