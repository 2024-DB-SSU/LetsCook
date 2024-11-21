from flask import Flask, request, jsonify
from recipe_assistant_bot import recommend
import re



# 정규식을 사용해 각 레시피를 구분하는 함수
def parse_recipes(text):
    # 레시피의 시작을 나타내는 패턴
    recipe_pattern = re.compile(r"레시피 (\d+): ([^\n]+)\n\n\[재료\](.*?)\[조리 방법\](.*?)\n\n", re.DOTALL)
    
    recipes = {}
    
    # 레시피를 매칭하고 추출
    for match in recipe_pattern.finditer(text):
        number = match.group(1)
        name = match.group(2).strip()
        ingredients = match.group(3).strip().split("\n")[1:]  # 첫 줄은 "재료" 제목을 제외하고
        instructions = match.group(4).strip().split("\n")[1:]  # 첫 줄은 "조리 방법" 제목을 제외하고

        # 각 레시피를 딕셔너리 형태로 저장
        recipes[f"레시피 {number}"] = {
            "이름": name,
            "재료": [ingredient.strip() for ingredient in ingredients],
            "조리 방법": [instruction.strip() for instruction in instructions]
        }
    
    return recipes



app = Flask(__name__)

@app.route('/api/data', methods=['POST'])
def get_data():
    data = request.json
    print("Received from Node.js:", data)
    
    

    return jsonify({"message": "Hello from Python!"})

if __name__ == '__main__':
    app.run(port=5000)


