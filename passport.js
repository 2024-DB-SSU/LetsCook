const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const server = require('./class/Server'); // 기존 경로 유지

// Local Strategy 설정
passport.use(
  new LocalStrategy(
    {
      usernameField: 'ID',
      passwordField: 'PWD',
    },
    async (username, password, cb) => {
      let ID = username;
      let PWD = password;
      let result = await server.get_user(ID);
      let user = result.user_info[0];

      if (!user) {
        return cb(null, false, { message: '없는 아이디 입니다' });
      }

      if (await bcrypt.compare(PWD, user.PWD)) {
        return cb(null, user);
      } else {
        return cb(null, false, { message: '틀린 비밀번호 입니다' });
      }
    }
  )
);


passport.serializeUser((user, done) => {
  process.nextTick(() => {
    done(null, { ID: user.ID, Email: user.Email, Name: user.Name });
  });
});


passport.deserializeUser(async (user, done) => {
  let result = await server.get_user(user.ID);
  user = result.user_info[0];

  process.nextTick(() => {
    delete user.PWD;
    return done(null, user);
  });
});

module.exports = passport;
