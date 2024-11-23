const router = require('express').Router()
const axios = require('axios');
const server = require('../class/Server')


// 프롬프트 입력 페이지
router.get('', async(req, res) => {
  if (req.isAuthenticated()) {
    let ingreds = server.login_users[req.user.ID].Fridge.ingreds
    ingreds = await server.cal_remaining_days(ingreds);
    res.render('recipe1.ejs', {ingreds : ingreds})
  } else {
    res.redirect('/')
  }
});


// 추천받은 레시피 보여주는 페이지
router.post('/done', async(req, res) => {
  if (req.isAuthenticated()) {
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
      res.render('recipe2.ejs', { recipes : recipes })
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error communicating with Python");
    }
  } else {
    res.redirect('/')
  }
});



// 이전 검색 레시피 페이지
router.get('/previous', async(req, res) => {
  if (req.isAuthenticated()) {
    let result = await server.get_previous_recipes(req.user.ID)
    let recipes = result.previous_recipes[0]
    res.render('recommend_previous.ejs', {recipes : recipes, User_ID : req.user.ID})
  } else {
    res.redirect('/')
  }
});


// 선택한 레시피 저장
router.post('/select', async(req, res) => {
  if (req.isAuthenticated()) {
    const ingreds = decodeURIComponent(req.query.ingreds).replace(/\n/g, '\\n');
    const process = decodeURIComponent(req.query.process).replace(/\n/g, '\\n');
    await server.select_recipe(req.user.ID, {title:req.query.title, ingreds:ingreds, process:process})
    res.redirect('/recommend')
  } else {
    res.redirect('/')
  }
});

// 이전 레시피에서 좋아요 누름
router.post('/like', async(req, res) => {
  if (req.isAuthenticated()) {
    await server.like_recipe(req.user.ID, {Name:req.query.Name, Date:req.query.Date, Status:req.query.Status})
    res.redirect('/recommend/previous')
  } else {
    res.redirect('/')
  }
});



module.exports = router