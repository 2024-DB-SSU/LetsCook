from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import time


def initialize_client():
    load_dotenv()
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("API 키가 설정되지 않았습니다.")
    return OpenAI(api_key=api_key)


def create_assistant(client, vector_store_id):
    assistant = client.beta.assistants.create(
        name="Recipe Bot",
        instructions="""
            You are a culinary assistant specializing in providing tailored recipes. Based on the given inputs:

            Selected ingredients: A list of ingredients chosen by the user.
            Preferred cooking style: A brief description of the desired flavor or type of dish (e.g., spicy, sweet, or savory).

            Your task is to generate three creative and practical recipes using the provided ingredients while considering the user's cooking preferences. Each recipe should include:

            - A title describing the dish.
            - A list of ingredients (including the selected ones).
            - Step-by-step cooking instructions.

            If the user does not specify a cooking style, default to a general, versatile approach. Aim to inspire and delight the user with your suggestions.

            In addition to your culinary expertise, you can retrieve information from the uploaded documents to enhance your suggestions or answer user queries. Use this knowledge to provide more accurate, detailed, and contextually relevant recipes or suggestions.

            If the selected ingredients are insufficient for the recipe, suggest additional ingredients.
            
            
            Do not include any additional commentary, introductions, or explanations outside of the provided structure. 
            The output must strictly adhere to the following examples:
            
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

            # 레시피 3: 매운 삼겹살 김치 찌개

            [재료]
            - 삼겹살 200g (한 입 크기로 자른다)
            - 양파 1개 (슬라이스)
            - 감자 1개 (큐브)
            - 양송이 100g (슬라이스)
            - 대파 1대 (송송 썰기)
            - 김치 2컵
            - 간장 2큰술
            - 고춧가루 2큰술 (매운 맛을 위해)
            - 물 3컵
            - 후춧가루 약간

            [조리 방법]
            1. 큰 냄비에 삼겹살을 넣고 중불에서 볶아 기름이 나올 때까지 익힙니다.
            2. 삼겹살이 바삭하게 익으면 양파, 감자, 양송이를 추가하고 볶아줍니다.
            3. 김치를 넣고 간장, 고춧가루를 추가하여 모든 재료가 잘 섞이도록 볶습니다.
            4. 물을 부어 끓기 시작하면, 중불에서 약 15분간 끓여줍니다.
            5. 후춧가루를 넣고 마지막으로 대파를 넣고 2분 더 끓입니다.
            6. 그릇에 담아 뜨겁게 서빙하며, 맛있게 드세요!

            ---
            
            Follow this format to ensure clarity and completeness in your recipes.

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


def make_user_inputs(essential, available, cooking_style):
    user_inputs = [essential, available, cooking_style]
    return user_inputs
    

def submit_message(client, assistant_id, thread_id, user_inputs):
    essential, available, cooking_style = user_inputs
    
    message_content = f"""
    Here are the user's inputs:
    - Selected essential ingredients: {essential}
    - Selected available ingredients: {available}
    - Preferred cooking style: {cooking_style}
    
    Please generate three recipes considering the above inputs.
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
    
    
def format_response_to_result(response):
    results = {}
    recipes = response[0].content[0].text.value.strip().split("\n---\n")
    
    with open("model_response.json", "w", encoding="utf-8") as json_file:
        json.dump(recipes, json_file, ensure_ascii=False, indent=4)
    
    for idx, recipe in enumerate(recipes, start=1):
        lines = recipe.strip().split("\n")
        title = lines[0].split(": ")[-1].strip()
        ingredients_start = lines.index("[재료]") + 1
        steps_start = lines.index("[조리 방법]") + 1

        ingredients = "\n".join(lines[ingredients_start:steps_start - 1]).strip()
        steps = "\n".join(lines[steps_start:]).strip()

        results[f"recipe{idx}"] = {
            "title": title,
            "ingredients": ingredients,
            "steps": steps
        }
    
    return results


def ask(client, assistant_id, thread_id, user_inputs):
    run = submit_message(client, assistant_id, thread_id, user_inputs)
    run = wait_on_run(client, run, thread_id)
    response_data = get_response(client, thread_id).data
    
    if response_data:
        print_message(response_data[-1:])
        return format_response_to_result(response_data[-1:])
    else:
        print("응답이 없습니다.")
        return None


def recommend(essential, basic, prompt):
    client = initialize_client()

    # Vector store 생성
    file_paths = ["../data/recipes.json"]
    vector_store_id = create_vector_store(client, file_paths)

    # Assistant 생성
    assistant_id = create_assistant(client, vector_store_id)

    # Thread 생성
    thread_id = create_thread(client)

    # 사용자 입력
    # essential = "닭고기, 양배추, 양파, 고구마"
    # available = "감자, 간장, 대파, 마늘, 두부, 계란"
    # cooking_style = "약간 맵게 해줘"
    user_inputs = make_user_inputs(essential, basic, prompt)
    print(user_inputs)

    # Assistant 호출
    results = ask(client, assistant_id, thread_id, user_inputs)
    # with open("model_response.json", "w", encoding="utf-8") as json_file:
    #     json.dump(results, json_file, ensure_ascii=False, indent=4)
    return results
    

if __name__ == "__main__":
    recommend()
