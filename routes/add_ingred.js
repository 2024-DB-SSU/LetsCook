const router = require('express').Router()
const server = require('../class/Server')

router.get('', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    let ingreds = server.login_users[req.user.ID].Fridge.ingreds
    ingreds = await server.cal_remaining_days(ingreds);
    res.render('add_ingred.ejs', {ingreds : ingreds})
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});

router.post('', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    await server.add_ingreds(req.user.ID, req.body.ingredient, req.body.expiry)
    res.redirect('/add_ingred')
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});

router.post('/change_status', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    await server.change_ingred_status(req.user.ID, req.query.ingred_name, req.query.ingred_status)
    res.redirect('/add_ingred')
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});


router.delete('/delete_ingred', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    await server.delete_ingreds(req.user.ID, req.query.ingred_name)
    res.redirect('/add_ingred')
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});

module.exports = router