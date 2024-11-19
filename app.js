// ==================== 세팅 ===========================================
const passport = require('./passport'); // 분리한 파일 불러오기
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const MySQLStore = require('express-mysql-session')(session);
const { User, Fridge, server } = require('./class');
const app = express();

app.use(express.static(__dirname + '/public'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set('view engine', 'ejs') // 템플릿 엔진으로 ejs 설정

// passport 설정
app.use(
  session({
    secret: '2024_SSU_DB', // 원하는 키로 변경
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore({
      host: 'dbproject.cp6ikkuwamgv.ap-southeast-2.rds.amazonaws.com',
      port: 3306,
      user: 'admin',
      password: 'ssumath2024',
      database: 'LetsCook',
      expiration: 30000,
      createDatabaseTable: true
    }),
    cookie : { maxAge : 60 * 60 * 1000 }
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.listen(8080, () => {
  console.log('http://localhost:8080 에서 실행 중입니다.');
});
// ======================================================================


// =============== 첫 페이지 ===============
app.get('/', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    res.redirect('/main');
  } else {
    // 로그인 상태가 아닐 경우
    res.render('index.ejs')
  }
});
// =======================================



// =============== 회원가입/로그인/로그아웃 ===============
app.post('/sign_in', async (req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    res.redirect('/main');
  } else {
    // 로그인 상태가 아닐 경우
    console.log(req.body);
    let hashed = await bcrypt.hash(req.body.PWD, 10) 
    const result = await server.signin(req.body.ID, hashed, req.body.email, req.body.Name);
    console.log(result);
    res.redirect("/");
  }
});

app.post('/log_in', async (req, res, next) => { 
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    res.redirect('/main');
  } else {
    // 로그인 상태가 아닐 경우
    passport.authenticate('local', (error, user,info)=>{
      if (error) return res.status(500).json(error)  
      if (!user) return res.status(401).json(info.message)
      req.logIn(user, (err)=>{
        if (err) return next(err)
        res.redirect('/main')    
      })
    })(req, res, next)
  }
})

app.get('/log_out', (req, res) => { 
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    req.logout((err) => {
      if (err) {
          return next(err); // 에러가 있을 경우 처리
      }
      req.session.destroy((err) => {
        if(err){
          return res.status(500).json({error : err});
        }
      })
      res.redirect('/'); // 로그아웃 후 리다이렉트
    });
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/');
  }
})
// ==================================================



// =============== 메인 페이지 ===============
app.get('/main', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    let result = await server.get_ingreds(req.user.ID)
    let ingreds = result.ingreds[0]
    res.render('main.ejs', {ingreds : ingreds})
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});
// ========================================



// =============== 재료 등록 페이지 ===============
app.get('/add_ingred', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    let result = await server.get_ingreds(req.user.ID)
    let ingreds = result.ingreds[0]
    res.render('add_ingred.ejs', {ingreds : ingreds})
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});

app.post('/add_ingred', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    await server.add_ingreds(req.user.ID, req.body.ingredient, req.body.expiry)
    res.redirect('/add_ingred')
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});

app.post('/add_ingred/change_status', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    await server.change_ingred_status(req.user.ID, req.query.ingred_name, req.query.ingred_status)
    res.redirect('/add_ingred')
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});
// ========================================



// =============== 레시피 추천 페이지 ===============
app.get('/recommend', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    let result = await server.get_ingreds(req.user.ID)
    let ingreds = result.ingreds[0]
    res.render('recipe1.ejs', {ingreds : ingreds})
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});

app.get('/recommend/done', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    res.render('recipe2.ejs')
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});

app.get('/recommend/recipe', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    res.render('recipe2.ejs')
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});

app.get('/recommend/previous', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    res.render('recipe2.ejs')
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});
// =============================================



// ================ 좋아요 ====================
app.get('/likes', async(req, res) => {
  if (req.isAuthenticated()) {
    // 로그인 상태일 경우
    res.render('recipe2.ejs')
  } else {
    // 로그인 상태가 아닐 경우
    res.redirect('/')
  }
});
// ==========================================

