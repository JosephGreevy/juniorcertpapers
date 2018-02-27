const express       = require("express");
const app           = express();
const router        = express.Router();
const passport      = require("passport");
const stripe        = require("stripe")("sk_test_wjdasnUAO3hAL20gLI91gypi");

const papers        = require("../public/data/papers.json");
const analysis      = require("../public/data/analysis.json");
const User          = require("../models/user");
const transporter   = require("../config/transporter");

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated()){
		console.log("Is authenticated middleware finds no problems");
		return next();
	}
	// if the user is not authenticated then redirect him to the login page
	req.flash("error", "You have to be logged in to do that");
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
var notVerified = function(req, res, next){
	if(req.user.local.verified || req.user.facebook.verified){
		req.flash("error", "Your email is already verified");
		res.redirect('/profile');
	}else{
		return next();
	}

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
router.get('/profile', isAuthenticated, (req, res) => {
	res.render("profile");
});
router.get('/upgrade', isAuthenticated, (req, res) => {
	res.render('upgrade');
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

router.post("/pay", (req, res) => {
	var token = req.body.stripeToken;
	console.log(token);
	stripe.charges.create({
		amount: 999,
		currency: "eur",
		description: "Example charge",
		source: token,
	}, function(err, charge) {
		console.log(charge);
		console.log(req.user.local.username || req.user.facebook.name);
		
		if(req.user.local){
			if(req.user.local.expires === null){
				var expires = new Date();
				expires.setDate(expires.getDate() + 152);
			}else{
				var expires = new Date(req.user.local.expires);
				console.log("New Date() = " + expires);
				expires.setDate(expires.getDate() + 152);
				console.log("Expires = " + expires);
			}
			User.findOneAndUpdate( { "local.username" : req.user.local.username }, { $set: {
				"local.subscribed" : 2,
				"local.expires"    : expires
			 } }, function(err, updatedUser){
				if(err){
					console.log(err);
					res.redirect("/about");
				}else{
					console.log(updatedUser);
					res.redirect("/profile");
				}
			});
		}else{
			if(req.user.facebook.expires === null){
				var expires = new Date();
				expires.setDate(expires.getDate() + 152);
			}else{
				var expires = new Date(req.user.facebook.expires);
				console.log("New Date() = " + expires);
				expires.setDate(expires.getDate() + 152);
				console.log("Expires = " + expires);
			}
			User.findOneAndUpdate( { "facebook.name" : req.user.facebook.namename }, { $set: {
				"facebook.subscribed" : 2,
				"facebook.expires"    : expires
			 } }, function(err, updatedUser){
				if(err){
					console.log(err);
					res.redirect("/about");
				}else{
					console.log(updatedUser);
					res.redirect("/profile");
				}
			});
		}
		
	});
});
// Email Verfiication
router.get('/verify/:token', (req, res) => {
	var token = req.params.token;
	User.findOneAndUpdate({'local.emailToken' : token}, { $set : {
		"local.emailToken" : null,
		"local.verified" : true
	}}, function(err, user){
		if(err){
			console.log("Error verifying local user " + err);
		}else if(user){
			console.log(user);
			
			if(isAuthenticated){
				req.logout();
			}
			req.flash('success', 'Email was successfully verified');
			res.redirect("/login");
		}else{
			console.log("User does not exist locally");
			User.findOneAndUpdate({'facebook.emailToken' : token}, { $set : {
				"facebook.emailToken" : null,
				"facebook.verified" : true
			}}, function(err, user){
				if(err){
					console.log("Error verifying facebook user " + err);
				}else if(user){
					console.log(user);
					req.flash("success", "Email was successfully verified");
					if(isAuthenticated){
						req.logout();
					}
					res.redirect("/login");
				}else{
					console.log("User does not exist on facebook");
				}
			});
			req.flash('error', 'Email Verfiication unsuccessful. That token was not associated with any account');
			if(isAuthenticated){
				req.logout();
			}
			res.redirect('/login');
		}
	});

});

router.get("/sendemail", isAuthenticated, notVerified, (req, res) => {
	let email = req.user.local.email || req.user.facebook.email;
	let token = req.user.local.emailToken || req.user.facebook.emailToken;
	let mailOptions = {
		from : '"Joseph" <jpgreevy@gmail.com',
		to : email,
		subject : "JC Papers Email Verification",
		html : "Click on <a href='http://localhost:5000/verify/" +
		token +"'>this</a> link in order to verify your email address." +
		"If you have any questions please do not hesitate to contact us at this email or our facebook page. <br>" +
		"Kind Regards" 
	}
	transporter.sendMail(mailOptions, (error, data) => {
		if(error){
			req.flash('error', "Something went wrong while sending the verification email. Sorry about that. :(");
			res.redirect("/profile");
			return console.log(error);

		}
		req.flash('success', "Email was sent successfully");
		res.redirect("profile");
		console.log("Email was sent");
	});
})

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