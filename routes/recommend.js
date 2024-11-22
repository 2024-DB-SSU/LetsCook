const router = require('express').Router()
const axios = require('axios');
const server = require('../class/Server')


// 프롬프트 입력 페이지
router.get('', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    let ingreds = server.login_users[req.user.ID].Fridge.ingreds
    ingreds = await server.cal_remaining_days(ingreds);
    res.render('recipe1.ejs', {ingreds : ingreds})
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});


// 추천받은 레시피 보여주는 페이지
router.post('/done', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    let result = await server.get_ingreds(req.user.ID) 
    let ingreds = result.ingreds[0]
    let essential = ingreds.filter(ingredient => ingredient.Status === 1).map(ingredient => ingredient.Name);
    let basic = ingreds.filter(ingredient => ingredient.Status === 0).map(ingredient => ingredient.Name);
    let prompt = req.body.prompt
    const user_input = { 
      essential: essential.join(', '),
      basic: basic.join(', '),
      prompt: prompt
    };
    try {
      const response = await axios.post('http://localhost:5000/api/data', user_input);
      const recipes = JSON.parse(response.data);
      console.log(recipes);
      res.render('recipe2.ejs', { recipes : recipes })
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error communicating with Python");
    }
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});


// 개별 레시피 페이지
router.get('/recipe', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    res.render('recommend_recipe.ejs')
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});


// 이전 검색 레시피 페이지
router.get('/previous', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    res.render('recommend_previous.ejs')
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});

// 선택한 레시피 저장
router.post('/select', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    console.log(req.query.title)
    console.log(req.query.ingreds)
    console.log(req.query.process)
    await server.select_recipe(req.user.ID, {title:req.query.title, ingreds:req.query.ingreds, process:req.query.process})
    res.redirect('/recommend')
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});

module.exports = router