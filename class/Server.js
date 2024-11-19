const db = require('../db');

class Server {
  constructor() {  
    this.login_users = {};
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
module.exports = server;  
