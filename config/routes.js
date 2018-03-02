const express       = require("express");
const app           = express();
const router        = express.Router();
const passport      = require("passport");
const stripe        = require("stripe")("sk_live_RrSvq8JAWWctQN0LWBNk3n2v");

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
		amount: 500,
		currency: "eur",
		description: "5 Months JC Papers Premium",
		source: token,
	}, function(err, charge) {
		console.log(charge);
		console.log(req.user.local.username || req.user.facebook.name);
		let email = req.user.local.email || req.user.facebook.email;
		
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
					let name = req.user.local.username;
					let mailOptions = {
						from : '"Joseph" <jpgreevy@gmail.com',
						to : email,
						subject : "JC Papers Upgrade Confirmation",
						html :  "<h1 style='margin-bottom: 0'>" +
									"<a href='www.juniorcertpapers.ie' style='text-decoration:none; color:black; text-align:center; height: 30px;" + 
									"line-height: 30px; display: block;'>" +
										"<img src='cid:logo32-jcpapers' style='margin-right:5px; vertical-align:middle; padding-bottom: 3px;'/>" +
										"JC Papers" +
									"</a>" +
								"</h1>" +
								"<hr style='height: 1.5px; background-color: #101010; width: 80%; margin: .5em 0 1em 10%;'>"  +
								"<div style='width: 60%; margin-left: 20%; font-size:20px; line-height:1.2em;'>" +
									"<p style='margin-bottom: 1.75em'>" +
										"Hi " + name + ", <br>" + 
									"</p>" +
									"<p style='margin-bottom: 1.75em'>" +
										"This is confirmation that you paid €5 to upgrade to premium." +
									"</p>" +
									"<p style='margin-bottom: 2em; margin-top: 1.75em;'>" +
										"If you have any questions please do not hesitate to contact us at this email address or our facebook page." +
									"</p>" +
									"<p style='margin-bottom: 1.75em'>" +
										"Kind Regards," +
									"</p>" +
									"<p>" +
										"	JC Papers" +
									"</p>" +
								"</div>",
						attachments: [{
					        filename: 'logo-32.png',
					        path: 'public/images/logo-32.png',
					        cid: 'logo32-jcpapers' //same cid value as in the html img src
				    	}]
					}
					transporter.sendMail(mailOptions, (error, data) => {
						if(error){
							res.redirect("/profile");
							return console.log(error);

						}
						console.log("Email was sent");
					});
					console.log(updatedUser);
					req.flash('success', 'You successully upgraded to premium')
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
					let mailOptions = {
						from : '"Joseph" <jpgreevy@gmail.com',
						to : email,
						subject : "JC Papers Upgrade Confirmation",
						html :  "<h1 style='margin-bottom: 0'>" +
									"<a href='www.juniorcertpapers.ie' style='text-decoration:none; color:black; text-align:center; height: 30px;" + 
									"line-height: 30px; display: block;'>" +
										"<img src='cid:logo32-jcpapers' style='margin-right:5px; vertical-align:middle; padding-bottom: 3px;'/>" +
										"JC Papers" +
									"</a>" +
								"</h1>" +
								"<hr style='height: 1.5px; background-color: #101010; width: 80%; margin: .5em 0 1em 10%;'>"  +
								"<div style='width: 60%; margin-left: 20%; font-size:20px; line-height:1.2em;'>" +
									"<p style='margin-bottom: 1.75em'>" +
										"Hi " + name + ", <br>" + 
									"</p>" +
									"<p style='margin-bottom: 1.75em'>" +
										"This is confirmation that you paid €5 to upgrade to premium." +
									"</p>" +
									"<p style='margin-bottom: 2em; margin-top: 1.75em;'>" +
										"If you have any questions please do not hesitate to contact us at this email address or our facebook page." +
									"</p>" +
									"<p style='margin-bottom: 1.75em'>" +
										"Kind Regards," +
									"</p>" +
									"<p>" +
										"	JC Papers" +
									"</p>" +
								"</div>",
						attachments: [{
					        filename: 'logo-32.png',
					        path: 'public/images/logo-32.png',
					        cid: 'logo32-jcpapers' //same cid value as in the html img src
				    	}]
					}
					transporter.sendMail(mailOptions, (error, data) => {
						if(error){
							res.redirect("/profile");
							return console.log(error);

						}
						console.log("Email was sent");
					});
					console.log(updatedUser);
					req.flash('success', 'You successully upgraded to premium')
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
			
			if(req.isAuthenticated()){
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
					if(req.isAuthenticated()){
						req.logout();
					}
					req.flash('success', 'Email was successfully verified');
					res.redirect("/login");
				}else{
					console.log("User does not exist on facebook");
				}
			});
			req.flash('error', 'Email Verfiication unsuccessful. That token was not associated with any account');
			if(req.isAuthenticated){
				req.logout();
			}
			res.redirect('/login');
		}
	});

});

router.get("/sendemail", isAuthenticated, notVerified, (req, res) => {
	let email = req.user.local.email || req.user.facebook.email;
	let token = req.user.local.emailToken || req.user.facebook.emailToken;
	let name  = req.user.local.username || req.user.facebook.name;
	let mailOptions = {
		from : '"Joseph" <jpgreevy@gmail.com',
		to : email,
		subject : "JC Papers Email Address Verification",
		html :  "<h1 style='margin-bottom: 0'>" +
					"<a href='www.juniorcertpapers.ie' style='text-decoration:none; color:black; text-align:center; height: 30px;" + 
					"line-height: 30px; display: block;'>" +
						"<img src='cid:logo32-jcpapers' style='margin-right:5px; vertical-align:middle; padding-bottom: 3px;'/>" +
						"JC Papers" +
					"</a>" +
				"</h1>" +
				"<hr style='height: 1.5px; background-color: #101010; width: 80%; margin: .5em 0 1em 10%;'>"  +
				"<div style='width: 60%; margin-left: 20%; font-size:20px; line-height:1.2em;'>" +
					"<p style='margin-bottom: 1.75em'>" +
						"Hi " + name + ", <br>" + 
					"</p>" +
					"<p style='margin-bottom: 1.75em'>" +
						"Please click the button below to confirm your email address." +
					"</p>" +
					"<a href='https://juniorcertpapers.ie/verify/" + token + "'" +
					"style='background-color:#27bb5b; border-radius: 5px; font-size: 20px; color: rgba(255,255,255, 1);" +
					"text-align: center; padding: 10px 40px 10px 40px; text-decoration: none;" +
			 		"'>Verify Email</a>" +
					"<p style='margin-bottom: 2em; margin-top: 1.75em;'>" +
						"If you have any questions please do not hesitate to contact us at this email address or our facebook page." +
					"</p>" +
					"<p style='margin-bottom: 1.75em'>" +
						"Kind Regards," +
					"</p>" +
					"<p>" +
						"	JC Papers" +
					"</p>" +
				"</div>",
		attachments: [{
	        filename: 'logo-32.png',
	        path: 'public/images/logo-32.png',
	        cid: 'logo32-jcpapers' //same cid value as in the html img src
    	}]
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
router.get("/privacypolicy", function(req, res){
	res.render("privacypolicy");
});

router.get("*", (req, res) => {
	res.redirect("/notfound");
})

module.exports = router; 