const schedule      = require("node-schedule");
const User          = require("../models/user");
const mongoose      = require("mongoose");
const transporter   = require("../config/transporter");


var j = schedule.scheduleJob('0 0 * * *', function(){
	console.log("Schedule is being run");
	var now = new Date();
	User.find({$or : [
		{"local.expires" : {$lt : now}},
		{"facebook.expires" : {$lt : now}}
	]}, function(err, expiredAccounts){
			expiredAccounts.forEach(user => {
				if(user.local){
					user.local.subscribed = 1;
					user.local.expires    = null;
					user.save(function(err, updatedUser){
						if(err){
							console.log(err);
						}else{
							console.log(updatedUser);
						}

					});
					sendMail(user.local);
				}else{
					user.facebook.subscribed = 1;
					user.facebook.expires    = null;
					user.save(function(err, updatedUser){
						if(err){
							console.log(err);
						}else{
							console.log(updatedUser);
						}
					});
					sendMail(user.facebook);
				}
				
			})
	});
})
function sendMail(user){
	let email = user.email;
	let name = (user.username || user.name);
	let mailOptions = {
		from : '"Joseph" <jpgreevy@gmail.com',
		to : email,
		subject : "JC Papers Free Trial Expiration",
		html : "Hello " + (name) + ", <br> Unfortunately your <a href='https://juniorcertpapers.ie'>JC Papers</a> free trial has expired." +
		"If you wish to continue using premium features such as Exam Paper " +
		"Analysis, you can upgrade to a premium account for as little as €1 per month(€5 for 5 months) <br>" +
		"If you'd rather not pay for a premium account we encourage you to continue using the free portions of the site. We also ask that " +
		"you send us an email with any improvements you think should be make. It would be greatly appreciated." +
		"Kind Regards" 
	}
	transporter.sendMail(mailOptions, (error, data) => {
		if(error)
			return console.log(error);

		console.log("Email was sent to " + name);
	});
	
}
module.exports = j;