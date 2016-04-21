var User          = require('../models/user'),
    Chart         = require('../models/chart'),
    express       = require('express'),
    router        = express.Router(),
    bcrypt        = require('bcrypt'),
    dbSalt        = bcrypt.genSaltSync(10);

    // ------------------ GET home -------------------------
router.get('/', function(req, res, next) {
  // check if person is logged in?
  res.render('index', { title: 'MU Builder' });
}) // ------------------ GET logout -------------------------
.get('/logout', function(req, res, next) {
  req.session.loggedIn = null;
  req.session.currentUserId = null;
  console.log('You have been logged out.');
  res.redirect('/');
}) // ------------------ GET register ------------------------
.get('/register', function(req, res, next) {
  if (req.session.loggedIn === true) {
    res.redirect('/');
  } else res.render('register', { title: 'Register' });

}) // ------------------ POST register -----------------------
.post('/register', function(req, res, next) {
  User.findOne({ username: req.body.username }, function(err, user) {
    if (user) {
      console.log('This user already exists.');
      res.redirect('/register');
    } else {
        User.create({
          username      : req.body.username,
          passwordHash  : bcrypt.hashSync(req.body.passnwordHash, dbSalt),
          email         : req.body.email,
      }, function(err, user) {
        req.session.loggedIn = true;
        req.session.currentUserId = user._id;
        req.session.currentUser = user.username;
        var currentUser = user.username;
        console.log('-----------------------------');
        console.log(req.session);
        console.log('-----------------------------');
        console.log(req.session.currentUserId);
        console.log('-----------------------------');
        console.log("You have created an account under the name "+ currentUser +" and been logged in.");
        res.redirect('/');
      });
    }
  });
}) // ------------------ GET login ---------------------------
.get('/login', function(req, res, next) {
  if (req.session.loggedIn === true) {
    console.log("You're already logged in!");
    res.redirect('/');
  } else res.render('login', { title: 'Login'});
}) // ------------------ POST login --------------------------
.post('/login', function(req, res, next) {
  User.findOne({ username: req.body.username }, function(err, user) {
    if (user) {
      var enteredPassword = req.body.passwordHash;
      var comparison = bcrypt.compareSync(enteredPassword, user.passwordHash);
      if (comparison === true) {
        req.session.loggedIn = true;
        req.session.currentUserId = user._id;
        req.session.currentUser = user.username;
        var currentUser = user.username;
        console.log("Welcome to the site, "+ currentUser);
        console.log('-----------------------------');
        console.log(req.session);
        console.log('-----------------------------');
        console.log(req.session.currentUserId);
        console.log('-----------------------------');
        console.log(req.session.currentUser);
        res.redirect('/build');
      } else {
          console.log("The username or password you entered was incorrect.");
          res.redirect('/login');
      }
    } else {
        console.log("User doesn't exist.");
        res.redirect('/register');
      }
  });
}) // ------------------ GET chart-builder --------------------
.get('/build', function(req, res, next) {
  if(req.session.loggedIn === true) {
    res.render('chart-builder', { title: 'Build a chart' });
  } else res.redirect('/login');
})
.post('/build', function(req, res, next) {
  Chart.create({
    nameOfChart : req.body.nameOfChart,
    authorId    : req.session.currentUserId,
    contents    : req.body.chart
  }, function(err, chart) {
    console.log("You have created a chart!");
    // console.log(db.chart.find({}));
    res.redirect('/account');
  })
})

.get('/chartjson', function(req, res, next) {
  // if(req.session.loggedIn === true) {
    Chart.find(function(err, chart){
      res.json(chart)
    })
    // res.render('chart-viewer', { title: 'View a Chart' });

  // } else res.redirect('/login');
})
.get('/chartviewer', function(req, res, next) {
    res.render('chart-viewer', { title: 'View a Chart' });
})
  // ---------------- TESTING ------------------
.get('/getchart', function(req, res, next) {
    Chart.findOne({ _id: "5717a60158d2867e1c5d6f10" }, function(err, chart) {
      if (chart) {
        console.log(chart);
        res.send(chart);
      } else console.log("no such chart exists");
    });
})

.post('/edit', function(req, res, next) {
  console.log(req.body);
  // if(req.session.loggedIn === true) {
  //   res.render('profile-edit', { title: "Edit my account" });
  // } else res.redirect('/login');
});

module.exports = router;
