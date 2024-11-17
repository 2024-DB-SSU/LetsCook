const db = require('./db');

// 수정
// db 클래스 따로 만들어서 Server가 db에 요청하는 방식으로
// server가 status 관련 코드들을 받고, app.js에는 진짜 결과물만 보내주는게 좋을...까??

class Server {
  constructor() {  
    
  }

  async signin(ID, PWD, Email){
    try {
      const query = 'INSERT INTO User (ID, PWD, Email) VALUES (?, ?, ?)';
      const values = [ID, PWD, Email];
      await db.execute(query, values);
      return {status : 200, error : 'No Error'}
    } catch (err) {
      console.error(err);
      return {status : 500, error : 'Database query failed'}
    }
  }

  async get_user(user_ID){
    try {
      const query = 'SELECT * FROM User WHERE ID = ?';
      const user_info = await db.execute(query, [user_ID]);
      return {status : 200, error : 'No Error', user_info : user_info[0]}
    } catch (err) {
      console.error(err);
      return {status : 500, error : 'Database query failed', user_info : NaN}
    }
  }
}

module.exports = Server;  // 클래스를 export 합니다.
