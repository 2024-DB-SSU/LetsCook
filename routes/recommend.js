const router = require('express').Router()
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

router.get('/done', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    res.render('recipe2.ejs')
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