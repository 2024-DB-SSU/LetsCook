const router = require('express').Router()
const server = require('../class/Server')

// 재료 등록 페이지
router.get('', async(req, res) => {
  if (req.isAuthenticated()) {
    let ingreds = server.login_users[req.user.ID].Fridge.ingreds
    ingreds = await server.cal_remaining_days(ingreds);
    res.render('add_ingred.ejs', {ingreds : ingreds})
  } else {
    res.redirect('/')
  }
});


// 재료 등록 
router.post('', async(req, res) => {
  if (req.isAuthenticated()) {
    await server.add_ingreds(req.user.ID, req.body.ingredient, req.body.expiry)
    res.redirect('/add_ingred')
  } else {
    res.redirect('/')
  }
});


// 재료 상태 변경
router.post('/change_status', async(req, res) => {
  if (req.isAuthenticated()) {
    await server.change_ingred_status(req.user.ID, req.query.ingred_name, req.query.ingred_status)
    res.redirect('/add_ingred')
  } else {
    res.redirect('/')
  }
});


// 재료 삭제
router.delete('/delete_ingred', async(req, res) => {
  if (req.isAuthenticated()) {
    await server.delete_ingreds(req.user.ID, req.query.ingred_name)
    res.redirect('/add_ingred')
  } else {
    res.redirect('/')
  }
});




module.exports = router