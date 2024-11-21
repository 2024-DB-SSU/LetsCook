const router = require('express').Router()
const axios = require('axios');
const server = require('../class/Server')

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

router.post('/done', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    let result = await server.get_ingreds(req.user.ID) 
    let ingreds = result.ingreds[0]
    let essential = ingreds.filter(ingredient => ingredient.Status === 1).map(ingredient => ingredient.Name);
    let basic = ingreds.filter(ingredient => ingredient.Status === 0).map(ingredient => ingredient.Name);
    let prompt = req.body.prompt
    const data = { 
      essential: essential.join(', '),
      basic: basic.join(', '),
      prompt: prompt
    };
    try {
      const response = await axios.post('http://localhost:5000/api/data', data);
      console.log("Response from Python:", response.data);
      res.render('recipe2.ejs')
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error communicating with Python");
    }
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});

router.get('/recipe', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    res.render('recommend_recipe.ejs')
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});

router.get('/previous', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    res.render('recommend_previous.ejs')
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});

module.exports = router