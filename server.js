var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3002;
var todos = [];
var todoNextId = 1;
/*
var todos = [{
	id: 1,
	description: 'Take car to the shop',
	completed: false,
}, {
	id: 2,
	description: 'Complete NodeJS course',
	completed: false,
}, {
	id: 3,
	description: 'Complete Java programming course',
	completed: true,
}];
*/

app.use(bodyParser.json());

// GET /
app.get('/', function(req, res){
	res.send('ToDo API Root');
});

// GET /todos
app.get('/todos', function(req, res){
	res.json(todos);
});

// GET/todos/:id (req.params.id)
app.get('/todos/:id', function(req, res){
	// sets parameter to int
	var todoId = parseInt(req.params.id, 10);
	// find item by id
  var match = _.findWhere(todos, {id: todoId});
  // return the match
	if (match) {
		res.json(match);
	}
	else {
		res.status(404).send();
	}
});

// POST /todos
app.post('/todos', function(req, res){
	// allow only defined properties
	var body = _.pick(req.body, 'description', 'completed');
  // validate data types and empty strings
  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
	  return res.status(400).send();
  }
  // trim white spaces
  body.description = body.description.trim();
  // increment to next id
	body.id = todoNextId++;
	// push body into array
	todos.push(body);
  // return the body
	res.json(body);
});

app.listen(PORT, function(){
	console.log('Express listening on port: ' + PORT);
});