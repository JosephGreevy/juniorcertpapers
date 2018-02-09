const mongoose  = require("mongoose");

mongoose.promise = global.promise;
mongoose.connect("mongodb://localhost/jcPapers");

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("Connected to DB");
});

module.exports = db;