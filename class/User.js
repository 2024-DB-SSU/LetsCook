const Fridge = require('./Fridge')

class User {
  constructor(User_info, User_ingreds) {  
    this.ID = User_info.ID;
    this.PWD = User_info.PWD;
    this.name = User_info.name;
    this.email = User_info.email;
    this.Fridge = new Fridge(User_info.ID, User_ingreds)
  }
}

module.exports = User;  // 클래스를 export 합니다.
