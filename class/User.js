
class User {
  constructor(User_info) {  // User_info : Object
    this.ID = User_info.ID;
    this.PWD = User_info.PWD;
    this.name = User_info.name;
    this.email = User_info.email;
    this.phone = User_info.phone;
  }

  greet() {
    console.log(`Hello, ${this.name}!`);
  }
}

module.exports = User;  // 클래스를 export 합니다.
