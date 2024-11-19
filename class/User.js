const Fridge = require('./Fridge')
const server = require('./Server')

class User {
  constructor(User_info) {  
    // console.log(User_info)
    this.ID = User_info.ID;
    this.PWD = User_info.PWD;
    this.name = User_info.Name;
    this.email = User_info.Email;

    let User_ingreds = server.get_ingreds(User_info.ID)
    this.Fridge = new Fridge(User_info.ID, User_ingreds)
  }
}

module.exports = User;  // 클래스를 export 합니다.
