var express = require('express')
var app = express();
// var cookie = require('cookie-parser');
// var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var api = require('./api');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.set('view engine','jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(api);


app.listen(8866);