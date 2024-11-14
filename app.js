const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs') // 템플릿 엔진으로 ejs 설정

const db = mysql.createConnection({
  host: 'dbproject.cp6ikkuwamgv.ap-southeast-2.rds.amazonaws.com', 
  user: 'admin',
  password: 'ssumath2024',
  database: 'LetsCook'
});

db.connect((err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.stack);
    return;
  }
  console.log('데이터베이스에 성공적으로 연결되었습니다.');
});

app.listen(8080, () => {
  console.log('http://localhost:8080 에서 실행 중입니다.');
});
// ======================================================================

app.get('/', (req, res) => {
  
});


// app.get('/main', (req, res) => {
  
// });
