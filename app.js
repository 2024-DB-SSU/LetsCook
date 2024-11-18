const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport')
const LocalStrategy = require('passport-local');
const MySQLStore = require('express-mysql-session')(session);
const { User, Fridge, server } = require('./class');
const app = express(); 

app.use(express.static(__dirname + '/public'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set('view engine', 'ejs') // 템플릿 엔진으로 ejs 설정

app.use(passport.initialize());
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

app.use(passport.session());
passport.use(new LocalStrategy({
  usernameField: 'ID',
  passwordField: 'PWD'
}, async (username, password, cb) => {
  let ID = username
  let PWD = password
  let result = await server.get_user(ID);
  let user = result.user_info[0];
  if (!user) {
    return cb(null, false, { message: '없는 아이디 입니다' })
  }
  if (await bcrypt.compare(PWD, user.PWD)) {
    return cb(null, user) 
  } else {
    return cb(null, false, { message: '틀린 비밀번호 입니다' });
  }
}))

passport.serializeUser((user, done) => {
  process.nextTick(() => { 
    done(null, { ID: user.ID, Email: user.Email })
  })
})

passport.deserializeUser(async (user, done) => {
  let result = await server.get_user(user.ID);
  user = result.user_info[0];
  process.nextTick(() => {
    delete user.PWD        
    return done(null, user) 
  })
})

app.listen(8080, () => {
  console.log('http://localhost:8080 에서 실행 중입니다.');
});


// ======================================================================

app.get('/', async(req, res) => {
  res.render('index.ejs')
});

app.post('/sign_in', async (req, res) => {
  console.log(req.body);
  let hashed = await bcrypt.hash(req.body.PWD, 10) 
  const result = await server.signin(req.body.ID, hashed, req.body.email);
  console.log(result);
  res.redirect("/");
});

app.post('/log_in', async (req, res, next) => { 
  passport.authenticate('local', (error, user,info)=>{
    if (error) return res.status(500).json(error)  
    if (!user) return res.status(401).json(info.message)
    req.logIn(user, (err)=>{
      if (err) return next(err)
      res.redirect('/main')    
    })
  })(req, res, next)
})

app.get('/log_out', (req, res) => { 
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
})



app.get('/main', (req, res) => {
  res.render('main.ejs')
});
