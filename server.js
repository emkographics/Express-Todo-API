var express = require('express');
var bodyParser = require('body-parser');
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
	var todoId = parseInt(req.params.id, 10);
	var match;

	// Iterate over todos array and find the match.
	todos.forEach(function(todo) {
		if (todoId === todo.id) {
			match = todo;
		}
	});

	if (match) {
		res.json(match);
	}
	else {
		res.status(404).send();
	}
});

// POST /todos
app.post('/todos', function(req, res){
	var body = req.body;

	// add id to field
	body.id = todoNextId;
	todoNextId++;

	// push body into array
	todos.push(body);

	res.json(body);
});

app.listen(PORT, function(){
	console.log('Express listening on port: ' + PORT);
});