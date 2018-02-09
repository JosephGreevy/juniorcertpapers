const mongoose = require("mongoose");
const bcrypt   = require("bcrypt-nodejs");

var userSchema = new mongoose.Schema({
	local : {
		username: String,
		email : String,
		school : String,
		password: String
	},
	facebook : {
		id: String,
		token: String,
		email: String,
		name: String
	}
});
userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}
userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.local.password);
}

module.exports = mongoose.model("User", userSchema);