const express = require('express');
const app = express(); 
const User = require('./class/User');
const Fridge = require('./class/Fridge'); 
const Server = require('./class/Server'); 

app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs') // 템플릿 엔진으로 ejs 설정
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.listen(8080, () => {
  server = new Server()
  console.log('http://localhost:8080 에서 실행 중입니다.');
});
// ======================================================================

app.get('/', (req, res) => {
  res.render('index.ejs')
});

app.get('/test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM recipe');  // 쿼리 실행
    res.json(rows);  // 결과를 JSON 형식으로 응답
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});


app.post('/sign_in', async (req, res) => {
  console.log(req.body.username)
  console.log(req.body.password)
  console.log(req.body.email)
  const result = server.signin(req.body.username, req.body.password, req.body.email)
  res.redirect("/main")
});

app.get('/main', (req, res) => {
  res.render('main.ejs')
});
