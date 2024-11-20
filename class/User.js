const Fridge = require('./Fridge')

class User {
  constructor(User_info, User_ingreds) {  
    // console.log(User_info)
    this.ID = User_info.ID;
    this.name = User_info.Name;
    this.email = User_info.Email;
    this.Fridge = new Fridge(User_info.ID, User_ingreds)
  }
}

module.exports = User;  // 클래스를 export 합니다.
