const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
	service : "Gmail",
	secure : false,
	port: 25,
	auth : {
		user : "jpgreevy@gmail.com",
		pass : "joe@city5"
	},
	tls: {
		rejectUnauthorized : false
	}
})

module.exports = transporter;