""" https://otugi.tistory.com/393 게시글을 수정한 코드"""
import requests
import json
import os
from bs4 import BeautifulSoup


def food_info(name):
    '''
    This function gives you food information for the given input.

    PARAMETERS
        - name(str): name of Korean food in Korean ex) food_info("김치찌개")
    RETURN
        - res(list): list of dict that containing info for some Korean food related to 'name'
            - res['name'](str): name of food
            - res['ingredients'](str): ingredients to make the food
            - res['recipe'](list[str]): contain recipe in order
    '''
    url = f"https://www.10000recipe.com/recipe/list.html?q={name}"
    response = requests.get(url)
    if response.status_code == 200:
        html = response.text
        soup = BeautifulSoup(html, 'html.parser')
    else : 
        print("HTTP response error :", response.status_code)
        return
    
    food_list = soup.find_all(attrs={'class':'common_sp_link'})
    food_id = food_list[0]['href'].split('/')[-1]
    new_url = f'https://www.10000recipe.com/recipe/{food_id}'
    new_response = requests.get(new_url)
    if new_response.status_code == 200:  # HTTP request OK
        html = new_response.text
        soup = BeautifulSoup(html, 'html.parser')
    else : 
        print("HTTP response error :", response.status_code)
        return
    
    food_info = soup.find(attrs={'type':'application/ld+json'})
    result = json.loads(food_info.text)
    image_link = result['image'][-1]  # 배너 사진 추가
    ingredient = ','.join(result['recipeIngredient'])
    recipe = [result['recipeInstructions'][i]['text'] for i in range(len(result['recipeInstructions']))]
    for i in range(len(recipe)):
        recipe[i] = f'{i+1}. ' + recipe[i]
    
    res = {
        'name': name,
        'ingredients': ingredient,
        'recipe': recipe,
        'image_link': image_link
    }

    return res


def crawl_recipes(recipe_names, save_directory="../data/"):
    '''
    Automates the crawling and saving of recipes.

    PARAMETERS
        - recipe_names(list[str]): list of recipe names to crawl
        - save_directory(str): directory to save the crawled recipes
    '''
    os.makedirs(save_directory, exist_ok=True)
    
    for name in recipe_names:
        recipe_data = food_info(name)
        
        if recipe_data is not None:
            save_path = os.path.join(save_directory, f"{name}.json")
            with open(save_path, 'w', encoding='utf-8') as f:
                json.dump(recipe_data, f, ensure_ascii=False, indent=4)
            print(f"Success to save recipe for: {name}")
        else:
            print(f"Failed to save recipe for: {name}")


recipe_list = ["김치찌개", "된장찌개"]

crawl_recipes(recipe_list)