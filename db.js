const mysql = require('mysql2');

// 연결 풀 생성
const pool = mysql.createPool({
  host: 'dbproject.cp6ikkuwamgv.ap-southeast-2.rds.amazonaws.com', // RDS 엔드포인트
  user: 'admin',                  // 사용자 이름
  password: 'ssumath2024',        // 비밀번호
  database: 'LetsCook',           // 데이터베이스 이름
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();  // Promise 기반으로 사용하기 위해 promise() 호출

// 현재 비활성화 된 상태
// aws rds 인스턴스 생성후 연결 풀 생성 할 것
