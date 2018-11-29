var db = require(`./models`);
var express = require("express");
var passport = require("passport");
var Strategy = require ("passport-local").Strategy;
var path = require('path');

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new Strategy(
  function (username, password, cb) {
    console.log(password, 'pass')
    db.User.findOne({
      where: {
        username: username
      }
    }).then(function(user) {
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    }).catch(function(err){
      if (err) { return cb(err); }
    })
  }));

passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  db.User.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

// TESTING
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '/index.html'))
})

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.post('/register', function(req, res) {
  console.log(req.body);
  db.User.create({
    username: req.body.username,
    password: req.body.password,
    fav_Team: req.body.favTeam
  })
});
// app.get('/login',
//   function (req, res) {
//     res.redirect('/team/') // teamName goes here
//   });

// app.get("/api/login", function(req,res) {
//   db.User.findOne({
//     where: {
//       username: req.params.username
//     }
//   })
//   .then(function(userData) {
//     res
//   })
// })
db.sequelize.sync({ force: false }).then(function() { //sync and force true drops tables if exists
  app.listen(3000, function() {
    console.log("App listening on PORT " + 3000);
  });
});