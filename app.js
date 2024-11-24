// ================================ 세팅 ===========================================
const passport = require("./passport"); 
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const MySQLStore = require("express-mysql-session")(session);
const { User, Fridge, server } = require("./class");
const app = express();

app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs"); 

// passport 설정
app.use(
  session({
    secret: "2024_SSU_DB", // 원하는 키로 변경
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore({
      host: "dbproject.cp6ikkuwamgv.ap-southeast-2.rds.amazonaws.com",
      port: 3306,
      user: "admin",
      password: "ssumath2024",
      database: "LetsCook",
      expiration: 30000,
      createDatabaseTable: true,
    }),
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// 서버 띄우기
app.listen(8080, () => {
  console.log("http://localhost:8080 에서 실행 중입니다.");
});
// ==============================================================================
// ==============================================================================



// =============== 첫 페이지 ===============
app.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/main");
  } else {
    res.render("index.ejs");
  }
});
// =======================================



// =============== 회원가입/로그인/로그아웃 ===============
app.post("/sign_in", async (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/main");
  } else {
    let hashed = await bcrypt.hash(req.body.PWD, 10);
    const result = await server.signin(req.body.ID, hashed, req.body.email, req.body.Name);
    console.log(result);
    res.redirect("/");
  }
});

app.post("/log_in", async (req, res, next) => {
  if (req.isAuthenticated()) {
    res.redirect("/main");
  } else {
    passport.authenticate("local", (error, user, info) => {
      if (error) {
        // 서버 내부 오류
        return res.status(500).json({ message: "Internal Server Error" });
      }
      if (!user) {
        // 인증 실패 시 사용자에게 메시지 반환
        return res.status(401).json({ message: "Invalid ID or Password. Please try again." });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        // 로그인 성공 시
        res.redirect("/main");
      });
    })(req, res, next);
  }
});


app.get("/log_out", (req, res, next) => {
  if (req.isAuthenticated()) {
    let user_ID = req.user.ID;
    req.logout((err) => {
      if (err) {
        return next(err); 
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: err });
        }
      });
      server.logout(user_ID);
      res.redirect("/"); 
    });
  } else {
    res.redirect("/");
  }
});
// ==================================================



// =============== 메인 페이지 ===============
app.get("/main", async (req, res) => {
  if (req.isAuthenticated()) {
    let ingreds = server.login_users[req.user.ID].Fridge.ingreds;
    ingreds = await server.cal_remaining_days(ingreds);
    res.render("main.ejs", { ingreds: ingreds });
  } else {
    res.redirect("/");
  }
});
// ========================================



// =============== 재료 등록 페이지 ===============
app.use("/add_ingred", require("./routes/add_ingred.js"));
// ========================================



// =============== 레시피 추천 페이지 ===============
app.use("/recommend", require("./routes/recommend.js"));
// =============================================



// ================ 좋아요 ====================
app.get("/likes", async (req, res) => {
  if (req.isAuthenticated()) {
    let recipes = await server.get_previous_recipes(req.user.ID);
    recipes = recipes.previous_recipes[0]
    const likedRecipes = recipes.filter(recipe => recipe.Like === 1);
    res.render("likes.ejs", {likedRecipes : likedRecipes});
  } else {
    res.redirect("/");
  }
});
// ==========================================

