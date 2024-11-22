import json
import requests


""" 사용할 column
    - RCP_SEQ : 일련번호
    - RCP_NM : 메뉴명
    - ATT_FILE_NO_MK : 이미지(소)
    - INFO_ENG : 열량
    - INFO_CAR : 탄수화물
    - INFO_PRO : 단백질
    - INFO_FAT : 지방
    - RCP_PARTS_DTLS : 재료정보
    - MANUAL(num) : 조리과정  
"""
def processing_data(json_object):
    data = {
        'id':[],
        'recipe_name':[],
        'image':[],
        'nutrition':[],  # 열량, 탄단지
        'ingredients':[],
        'manual':[]        
    }
    row = json_object['COOKRCP01']['row']
    # 조리과정 concatenate
    
    return data

# API 요청
url = "http://openapi.foodsafetykorea.go.kr/api/007a15d53def41f480bb/COOKRCP01/json/1/10"
response = requests.get(url)
contents = response.text

