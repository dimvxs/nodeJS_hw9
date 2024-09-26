var express  = require('express'); 
var connection = require('./js/config');
var app = express();
var port = 8080; 
var path = require('path');
var bodyParser = require('body-parser');

var studentsRoutes = require('./js/students');
var facultiesRoutes = require('./js/faculties');
var groupsRoutes = require('./js/groups');

app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'html')));


app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'html/index.html'));
});


app.use('/student', studentsRoutes);
app.use('/faculty', facultiesRoutes);
app.use('/group', groupsRoutes);







app.listen(port, function() { 
	console.log('app listening on port: 8080'); 
}); 
