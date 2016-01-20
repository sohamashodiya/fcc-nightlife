'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var api = require('./app/routes/api.js');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var Yelp = require('node-yelp');
var app = express();
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));
var yelp = Yelp.createClient({
	oauth: {
		"consumer_key": process.env.YELP_KEY,
		"consumer_secret": process.env.YELP_KEY_SECRET,
		"token": process.env.YELP_TOKEN,
		"token_secret": process.env.YELP_TOKEN_SECRET
	},

	// Optional settings: 
	httpClient: {
		maxSockets: 25 // ~> Default is 10 
	}
});

// var injectYelp = function(req, res, next) {
// 	req.yelp = yelp;
// 	next();
// }
//app.use('/api', injectYelp, api);

app.use(session({
	secret: 'secretClementine1231',
	resave: false,
	saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
	extended: true
}));

routes(app, passport);
api(app, yelp);

var port = process.env.PORT || 8080;
app.listen(port, function() {
	console.log('Node.js listening on port ' + port + '...');
});
