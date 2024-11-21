const db = require('../db');
const User = require('./User');

class Server {
  constructor() {  
    this.login_users = {};
  }

  async init(){
    try {
      const [rows] = await db.execute(`SELECT data FROM sessions WHERE expires > UNIX_TIMESTAMP(NOW());`);
      const loggedInUsers = rows.map(row => {
        try {
          const sessionData = JSON.parse(row.data); // JSON 파싱
          return sessionData.passport?.user || null; // 사용자 ID 추출
        } catch (err) {
          console.error('Error parsing session data:', err);
          return null;
        }
      }).filter(userId => userId !== null);

      for(const loggedInUser of loggedInUsers){
        let User_ingreds = await this.get_ingreds(loggedInUser.ID);
        User_ingreds = User_ingreds.ingreds[0]
        this.login_users[loggedInUser.ID] = new User(loggedInUser, User_ingreds);
        
      }
      console.log(this.login_users)
      return {status : 200, error : 'No Error'}
    } catch (err) {
      console.error(err);
      return {status : 500, error : 'Database query failed'}
    }
  }

  async signin_verification(ID){
    let result = await this.get_user_list();
    let user_list = result.user_list;

    for(const user of user_list){
      if(ID === user.ID){
        console.log("중복되는 아이디")
        return {result : -1, message : '중복되는 아이디'}
      }
    }
    return {result : 1, message : '사용 가능한 아이디'}
  }

  async signin(ID, PWD, Email, Name){
    let result = await this.signin_verification(ID);
    if (result.result === 1){
      try {
        const query = 'INSERT INTO User (ID, PWD, Email, Name) VALUES (?, ?, ?, ?)';
        const values = [ID, PWD, Email, Name];
        await db.execute(query, values);
        return {status : 200, message : '회원가입 성공'}
      } catch (err) {
        console.error(err);
        return {status : 500, message : '서버 문제로 인한 에러'}
      }
    }
    else{
      return {status : 409, error : '이미 존재하는 아이디'}
    }
    
  }

  async login(User_info){
    let User_ingreds = await server.get_ingreds(User_info.ID);
    User_ingreds = User_ingreds.ingreds[0];
    const user = new User(User_info, User_ingreds)
    this.login_users[User_info.ID] = user
  }

  async logout(ID){
    this.login_users[ID] = null
    delete server.login_users[ID]
  }

  async get_user_list(){
    try {
      const query = 'SELECT * FROM User';
      const user_list = await db.execute(query);
      return {status : 200, error : 'No Error', user_list : user_list[0]}
    } catch (err) {
      console.error(err);
      return {status : 500, error : 'Database query failed', user_list : NaN}
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

  async get_ingreds(user_ID){
    try {
      const query = 'SELECT * FROM Ingredient WHERE User_ID = ?';
      const ingreds = await db.execute(query, [user_ID]);
      return {status : 200, error : 'No Error', ingreds : ingreds}
    } catch (err) {
      console.error(err);
      return {status : 500, error : 'Database query failed', ingreds : NaN}
    }
  }

  async add_ingreds(User_ID, ingred, expiry){
    try {
      const query = 'INSERT INTO Ingredient (User_ID, Name, Expiration) VALUES (?, ?, ?)';
      const values = [User_ID, ingred, expiry];
      await db.execute(query, values);
      let new_ingred = {
        Name : ingred,
        Expiration : new Date(expiry),
        Status : 0,
        User_ID : User_ID
      }
      this.login_users[User_ID].Fridge.ingreds.push(new_ingred)
      return {status : 200, error : 'No Error'}
    } catch (err) {
      console.error(err);
      return {status : 500, error : 'Database query failed'}
    }
  }

  async delete_ingreds(User_ID, ingred){
    try {
      const query = 'DELETE FROM Ingredient WHERE Name = ? AND User_ID = ?';
      const values = [ingred, User_ID];
      await db.execute(query, values);
      this.login_users[User_ID].Fridge.ingreds = this.login_users[User_ID].Fridge.ingreds.filter(item => item.Name !== ingred);
      return {status : 200, error : 'No Error'}
    } catch (err) {
      console.error(err);
      return {status : 500, error : 'Database query failed'}
    }
  }

  async change_ingred_status(User_ID, ingred_name, ingred_status){
    try {
      const query = 'UPDATE Ingredient SET Status = ? WHERE User_ID = ? AND Name = ?';
      const values = [ingred_status, User_ID, ingred_name];
      await db.execute(query, values);
      let target = this.login_users[User_ID].Fridge.ingreds.find(item => item.Name === ingred_name);
      if (target) { target.Status = Number(ingred_status); } 

      return {status : 200, error : 'No Error'}
    } catch (err) {
      console.error(err);
      return {status : 500, error : 'Database query failed'}
    }
  }

  async cal_remaining_days(ingreds){
    const today = new Date();
    for(const ingred of ingreds){
      const remainingDays = Math.ceil((ingred.Expiration - today) / (1000 * 60 * 60 * 24));
      ingred["remainingDays"] = remainingDays;
    }
    return ingreds;
  }
}


const server = new Server()
server.init()
module.exports = server;  
