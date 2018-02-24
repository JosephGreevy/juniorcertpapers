const express       = require("express");
const app           = express();
const router        = express.Router();
const passport      = require("passport");

const papers        = require("../public/data/papers.json");
const analysis      = require("../public/data/analysis.json");

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated()){
		console.log("Is authenticated middleware finds no problems");
		return next();
	}
	// if the user is not authenticated then redirect him to the login page
	req.flash("error", "Why would you want to do that?");
	res.redirect('/login');
}

var notAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (!req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	req.flash("error", "You can't do that");
	res.redirect('/subjects');
}

router.use(function(req, res, next){
	res.locals.user = req.user;
	res.locals.juniorCert = papers;
	res.locals.message = req.flash();
	next();
})

router.get('/', (req, res) => {
	res.redirect("/subjects");
})
router.get('/subjects', (req, res) => {
	res.render("index");
});
router.get('/:subject/:level/papers', (req, res) => {
	req.app.locals.subject = req.params.subject;
	req.app.locals.level = req.params.level;
	req.app.locals.feature = "papers";
	res.render("papers", {juniorCert : papers});
});
router.get("/register", notAuthenticated, (req, res) => {
	res.render("register", {juniorCert : papers});
});
router.get("/login", notAuthenticated, (req, res) => {
	res.render("login", {juniorCert : papers});
});
router.get('/:subject/:level/analysis', (req, res) => {
	req.app.locals.subject = req.params.subject;
	req.app.locals.level = req.params.level;
	req.app.locals.feature = "analysis";
	res.render("analysis", {analysis : analysis, juniorCert : papers});
});
router.get('/about', (req, res) => {
	res.render("about");
});
// Authentication Requests
router.post('/register', 
	passport.authenticate("register", { failureRedirect : '/register'}), 
	(req, res) => {
		console.log("Registered");
		res.redirect('/subjects');
	}
);
router.post("/login",
	passport.authenticate("login", { failureRedirect : '/login'}), 
	(req, res) => {
		console.log("Logged In");
		res.redirect('/subjects');
	}
);
router.get("/logout", isAuthenticated, function(req, res){
	req.logout();
	req.flash("success", "User has successfully been logged out");
	res.redirect("/subjects");
});
router.get('/auth/facebook', passport.authenticate('facebook', { 
  scope : ['email']
}));

// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect : "/login" }),
    function(req, res){;
    	res.redirect("/subjects");
    }
);
router.get("/notfound", (req, res) => {
	res.render("notfound");
})

router.get("*", (req, res) => {
	res.redirect("/notfound");
})

module.exports = router; 