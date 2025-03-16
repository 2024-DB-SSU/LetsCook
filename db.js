const mysql = require('mysql2');

// 연결 풀 생성
const pool = mysql.createPool({
  host: '',             // RDS 엔드포인트
  user: '',             // 사용자 이름
  password: '',         // 비밀번호
  database: '',         // 데이터베이스 이름
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();  // Promise 기반으로 사용하기 위해 promise() 호출

// 현재 비활성화 된 상태
// aws rds 인스턴스(MySQL) 생성후 연결 풀 생성 할 것
