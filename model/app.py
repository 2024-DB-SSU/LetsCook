from flask import Flask, request, jsonify
from recipe_assistant_bot import recommend
import json


app = Flask(__name__)

@app.route('/api/data', methods=['POST'])
def get_data():
    data = request.json
    print("Received from Node.js:", data)
    
    results = recommend()
    json_data = json.dumps(results, ensure_ascii=False)

    return jsonify(json_data)

if __name__ == '__main__':
    app.run(port=5000)


