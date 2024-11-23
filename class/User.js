const Fridge = require('./Fridge')

class User {
  constructor(User_info, User_ingreds) {  
    this.ID = User_info.ID;
    this.name = User_info.Name;
    this.email = User_info.Email;
    this.Fridge = new Fridge(User_info.ID, User_ingreds)
  }
}

module.exports = User; 
