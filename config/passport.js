const User           		= require("../models/user");
const app            		= require("express")();
const LocalStrategy  		= require("passport-local").Strategy;
const FacebookStrategy      = require("passport-facebook").Strategy;
const randomstring          = require("randomstring");
const bCrypt                = require("bcrypt-nodejs");
const fbConfig              = require("../config/facebook");
const transporter           = require("../config/transporter");

// Facebook Import

module.exports = function(passport){
	passport.serializeUser(function(user, done) {
	    done(null, user.id);
	});

	// used to deserialize the user
	passport.deserializeUser(function(id, done) {
	    User.findById(id, function(err, user) {
	        done(err, user);
	    });
	});	

	passport.use("register", new LocalStrategy({
			passReqToCallback : true
		},
		function(req, username, password, done){
			User.findOne( { $or : [
					{ "local.username" : username },
					{ "local.email"    : req.body.email },
					{ "facebook.name " : username },
					{ "facebook.email" : req.body.email }
					]
			}, function(err, user){
				if(err){
					console.log("Error finding user", err);
					return done(err, req.flash('error', 'Something went wrong with our code we will try to fix it as soon as we can'));	
				}
				if(user){
					console.log("User already exists");
					// TODO: Add Flash Messages
					return done(null, false, req.flash('error', 'Username or email is already taken'));
				}else{
					var expires = new Date();
					var newUser = new User();
					newUser.local.username = username;
					newUser.local.email    = req.body.email;
					newUser.local.school   = req.body.school;
					newUser.local.password = createHash(password);
					newUser.local.created = new Date();
					newUser.local.subscribed = 0;
					expires.setDate(expires.getDate() + 7);
					newUser.local.expires = expires;
					newUser.local.verified = false;
					newUser.local.emailToken = randomstring.generate(64);
					newUser.save(function(err){
						if(err){
							console.log("Error saving user", err);	
						}
						let mailOptions = {
							from : '"Joseph" <jpgreevy@gmail.com',
							to : req.body.email,
							subject : "Successful Registration to JC Papers and Email Verfication",
							html : "Thank you for registering for JC Papers. <br>" + 
							"You have been given a 7 Day Free Trial to try out JC-Papers' premium features i.e exam paper analysis. <br>" +
							"To get started verify this email address by clicking this link <a href='http://localhost:5000/verify/" +
							newUser.local.emailToken +"'>Verify Email</a>" +
							"If you have any questions please do not hesitate to contact me at this email. <br>" +
							"Kind Regards" 
						}
						transporter.sendMail(mailOptions, (error, data) => {
							if(error){
								return console.log(error);
							}
							console.log("Email was sent");
						});
						return done(null, newUser, req.flash("success", username + " has successfully registered"));
					});
				}
			});
		}
	));
	passport.use("login", new LocalStrategy({
		passReqToCallback : true
	},
	function(req, username, password, done){
		User.findOne({
			 $or : [
				{ 'local.username' : username },
				{ 'local.email'    : username }
			]
		}, function(err, user){
			if(err){
				console.log("Error finding user", user);
				return done(err, req.flash('error', 'Something went wrong with our code we will try to fix it as soon as we can'));
			}
			if(!user){
				console.log("");
				return done(null, false, req.flash('error', 'Username or Email is incorrect'));
			}
			if(!isValidPassword(user, password)){
				console.log("Password is incorrect");
				return done(null, false, req.flash('error', 'Password is incorrect'));
			}
			console.log("User authentication successful");
			return done(null, user, req.flash("success", user.local.username + " has successfully logged in"));
		})
	}));
	passport.use(new FacebookStrategy({
		passReqToCallback : true,
		clientID : fbConfig.auth.clientID,
		clientSecret : fbConfig.auth.clientSecret,
		callbackURL : fbConfig.auth.callbackURL,
		profileFields: ['id', 'displayName', 'email']
	},
	function(req, accessToken, refreshToken, profile, cb){
		User.findOne({ 'facebook.id' : profile.id }, function(err, user){
			if(err)
				return cb(err, req.flash('error', 'Facebook authentication failed please try again later'));

			if(user){
				return cb(null, user, req.flash("success", user.facebook.name + " has successfully logged in."));
			}else{
				User.findOne( { $or : [
					{ "local.username" : profile.displayName },
					{ "local.email"    : profile.emails[0].value }
					]
				}, function(err2, user2){
					if(user){
						return cb(null, false, req.flash('error', 'User already exists'));
					}
					var newUser = new User();
					newUser.facebook.id = profile.id;
					newUser.facebook.token = accessToken;
					newUser.facebook.name  = profile.displayName;
					newUser.facebook.email    = profile.emails[0].value;
					newUser.facebook.created = new Date();
					newUser.facebook.subscribed = 0;
					var expires = new Date();
					expires.setDate(expires.getDate() + 7);
					newUser.facebook.expires = expires;
					newUser.facebook.verified = false;
					newUser.facebook.emailToken = randomstring.generate(64);
					newUser.save(function(err){
						if(err){
							console.log(err);
							throw err;
						}
						let mailOptions = {
							from : '"Joseph" <jpgreevy@gmail.com',
							to : req.body.email,
							subject : "Successful Registration to JC Papers",
							html : "Thank you for registering for JC Papers. <br>" + 
							"You have been given a 7 Day Free Trial to try out JC-Papers' premium features i.e exam paper analysis." +
							"If you have any questions please do not hesitate to contact me at this email. <br>" +
							"Kind Regards" 
						}
						transporter.sendMail(mailOptions, (error, data) => {
							if(error){
								return console.log(error);
							}
							console.log("Email was sent");
						});  
		                return cb(null, newUser, req.flash("success", newUser.facebook.name + " has successfully registered"));
					})
				});
				

			}
		})
	}));
}
var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}
var isValidPassword = function(user, password){
	return bCrypt.compareSync(password, user.local.password);
}