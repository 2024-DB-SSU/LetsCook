const db = require('./db');


class Server {
  constructor() {  
    
  }

  async signin(ID, PWD, Email) {
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
}

module.exports = Server;  // 클래스를 export 합니다.
