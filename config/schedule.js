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
				console.log("User is a " + typeof user);
				console.log("User is local : " + user.hasOwnProperty('local'));
				if(user.hasOwnProperty('local')){
					console.log("Sending email to local user");
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
		subject : "Successful Registration to JC Papers and Email Verification",
		html :  "<h1 style='margin-bottom: 0'>" +
					"<a href='www.juniorcertpapers.ie' style='text-decoration:none; color:black; text-align:center; height: 30px;" + 
					"line-height: 30px; display: block;'>" +
						"<img src='cid:logo32-jcpapers' style='margin-right:5px; vertical-align:middle; padding-bottom: 3px;'/>" +
						"JC Papers" +
					"</a>" +
				"</h1>" +
				"<hr style='height: 1.5px; background-color: #101010; width: 80%; margin: .5em 0 1em 10%;'>"  +
				"<div style='width: 80%; margin-left: 10%; font-size:20px; color: black; line-height:1.2em;'>" +
					"<p style='margin-bottom: 1.75em'>" +
						"Hi " + name + "," + 
					"</p>" +
					"<p style='margin-bottom: 1.75em'>" +
						"Unfortunately your free trial has run out. If you have found JC Papers useful we encourage you to upgrade below. " +
						"We are currently running a special offer where you can get 5 months of premium for only €5" +
					"</p>" +

					"<a href='https://juniorcertpapers.ie/upgrade'" +
					"style='background-color:#27bb5b; border-radius: 5px; font-size: 20px; color: rgba(255,255,255, 1);" +
					"text-align: center; padding: 10px 40px 10px 40px; text-decoration: none; white-space: nowrap;" +
			 		"'>Upgrade to Premium</a>" +
					"<p style='margin-bottom: 2em; margin-top: 1.75em;'>" +
						"If you do not wish to upgrade to premium, we urge you to continue using the basic features of JC Papers. " +
						"We would also greatly appreciate any feedback you have about the service." +
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
		if(error)
			return console.log(error);

		console.log("Email was sent to " + name);
	});
	
}
module.exports = j;