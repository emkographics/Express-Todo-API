var express = require('express');
var app = express();
var PORT = process.env.PORT || 3002;
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
	description: 'Complete Java course',
	completed: true,
}];

// GET /
app.get('/', function(req, res){
	res.send('ToDo API Root');
});

// GET /todos
app.get('/todos', function(req, res){
	res.json(todos);
})

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
})

app.listen(PORT, function(){
	console.log('Express listening on port: ' + PORT);
})