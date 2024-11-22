// 예제 데이터
const recipeDataList = [
    {
        id: 1,
        name: "가지무침",
        ingredients: "가지 2개, 진간장 3T, 고춧가루 1T, 설탕 1T, 참기름 1T, 마늘 1t, 파 약간, 청양고추 약간, 통깨 약간",
        recipe: [
            "1. 먼저 가지를 깨끗하게 씻은 다음 어슷하게 썰어줍니다. (두께는 한 0.8~1cm 정도)",
            "2. 달궈진 팬에 가지를 올려 구워줍니다. 식용유는 NO~ 기름없이 그냥 구워줍니다.",
            "3. 진간장 3, 고추가루 1, 설탕 1, 참기름 1, 파, 마늘, 깨를 넣고 양념장을 만듭니다.",
            "4. 구운 가지에 양념장을 넣고~",
            "5. 양념장이 가지에 잘 배이도록 조물조물 무쳐주면 끝~"
        ],
        image_link: "https://recipe1.ezmember.co.kr/cache/recipe/2015/08/19/ee994efa0ddbcda632c1ef90f49d8e4f1.jpg"
    },
    {
        id: 2,
        name: "김치찌개",
        ingredients: "묵은지 200g, 돼지고기 100g, 두부 1모, 고춧가루 1T, 다진 마늘 1t, 대파 약간, 국물용 멸치, 다시마",
        recipe: [
            "1. 돼지고기를 기름 없이 볶아냅니다.",
            "2. 묵은지를 함께 넣고 볶아줍니다.",
            "3. 물 500ml와 멸치, 다시마를 넣고 끓입니다.",
            "4. 두부와 고춧가루를 넣고 한소끔 더 끓입니다.",
            "5. 대파를 넣고 간을 맞춘 후 마무리합니다."
        ],
        image_link: "https://recipe1.ezmember.co.kr/cache/recipe/2017/09/12/fe17298ef77e53b115eb7a37decc4a801.jpg"
    },
    {
        id: 3,
        name: "된장찌개",
        ingredients: "된장 2T, 감자 1개, 애호박 1/2개, 두부 1/2모, 대파 약간, 청양고추 1개, 멸치 육수 500ml",
        recipe: [
            "1. 감자와 애호박을 먹기 좋은 크기로 썰어줍니다.",
            "2. 멸치 육수를 끓인 후 된장을 풀어줍니다.",
            "3. 준비한 감자와 애호박을 넣고 끓입니다.",
            "4. 두부와 대파, 청양고추를 넣고 한소끔 끓여줍니다."
        ],
        image_link: "https://recipe1.ezmember.co.kr/cache/recipe/2020/01/20/a73e34a67a789e194b45edc0a45ec0911.jpg"
    }
];

// 동적 데이터 표시 함수
function displayRecipe(data) {
    // 우측 박스
    const rightBox = document.querySelector(".right-box");

    // 요리명
    const recipeTitle = document.getElementById("recipe-title");
    recipeTitle.textContent = data.name;

    // 재료
    const ingredientsList = document.getElementById("ingredients-list");
    ingredientsList.innerHTML = ""; // 초기화
    const ingredientItem = document.createElement("p");
    ingredientItem.textContent = data.ingredients;
    ingredientsList.appendChild(ingredientItem);

    // 과정
    const processContent = document.getElementById("process-content");
    processContent.innerHTML = ""; // 초기화
    data.recipe.forEach(step => {
        const stepParagraph = document.createElement("p");
        stepParagraph.textContent = step;
        processContent.appendChild(stepParagraph);
    });

    // 기존 이미지 제거
    const existingImageBox = rightBox.querySelector(".image-box");
    if (existingImageBox) {
        existingImageBox.remove();
    }

    // 이미지 추가
    const imageBox = document.createElement("div");
    imageBox.classList.add("image-box");
    imageBox.style.backgroundImage = `url(${data.image_link})`;
    imageBox.style.backgroundSize = "cover";
    imageBox.style.backgroundPosition = "center";
    rightBox.prepend(imageBox); // 이미지 상단에 추가

    // 우측 박스 보이기
    rightBox.classList.remove("hidden");
}

// 페이지 로드 후 클릭 이벤트 설정
document.addEventListener("DOMContentLoaded", () => {
    const recommendItems = document.querySelectorAll(".recommend-item");

    recommendItems.forEach(item => {
        item.addEventListener("click", () => {
            console.log(item.dataset)
            const recipeId = parseInt(item.dataset.id, 10); // 클릭한 요소의 id 추출
            const selectedRecipe = recipeDataList.find(recipe => recipe.id === recipeId); // id에 해당하는 데이터 찾기
            console.log(recipeId)
            console.log(selectedRecipe)
            if (selectedRecipe) {
                displayRecipe(selectedRecipe); // 데이터 표시
            }
        });
    });
});
