const express 			= require("express");
const app				= express();
const bodyParser        = require("body-parser");
const morgan            = require("morgan");
const session    		= require("express-session");
const cookieParser      = require("cookie-parser");
const passport          = require("passport");
const flash             = require("connect-flash");

const db        = require('./config/db');
const passportConfig  = require('./config/passport');
const routes  	= require('./config/routes'); 
const job       = require('./config/schedule');


app.use(morgan('dev'));
app.use(cookieParser("Manchester City are still alive here. Ballotelli, Aguerooooooooooooooo!"));
app.use(session({
	secret: "Manchester City are still alive here. Ballotelli, Aguerooooooooooooooo!",
	resave: false,
	saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.locals.subject = "Subject";
app.locals.level   = "hl";
app.locals.feature  = "papers";

passportConfig(passport);


app.use(routes);

const port = process.env.PORT || '5000';  //port setting
app.set('port', port);
app.listen(port, ()=> console.log(`Listening at localhost: ${port}`));