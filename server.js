var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3002;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

// GET /
app.get('/', function(req, res){
	res.send('ToDo API Root');
});

// GET /todos
app.get('/todos', function(req, res){
	res.json(todos);
});

// GET /todos/:id (req.params.id)
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
	// push todo into body
	todos.push(body);
  // return the body
	res.json(body);
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res){
	// sets parameter to int
	var todoId = parseInt(req.params.id, 10);
	// find item by id
  var match = _.findWhere(todos, {id: todoId});
  // return the match
	if (match) {
		todos = _.without(todos, match);
		res.json(match);
	}
	else {
		res.status(404).json({"error": "no todo found with that id"});
	}
});

// PUT /todos;:id
app.put('/todos/:id', function(req, res){
	// sets parameter to int
	var todoId = parseInt(req.params.id, 10);
	// find item by id
	var match = _.findWhere(todos, {id: todoId});
  // allow only defined properties
	var body = _.pick(req.body, 'description', 'completed');
	// create new empty object
	var validAttributes = {};
	// check match
	if(!match) {
		return res.status(404).json({"error": "id not found"});
	}
	// validate if item is completed
	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
	  validAttributes.completed = body.completed;
  } else if(body.hasOwnProperty('completed')) {
	  return res.status(400).send();
  }
  // validate if description exists
  if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
	  validAttributes.description = body.description;
  } else if (body.hasOwnProperty('description')) {
	  return res.status(400).send();
  }
  // pass object by reference
  _.extend(match, validAttributes);
  res.json(match);

});

app.listen(PORT, function(){
	console.log('Express listening on port: ' + PORT);
});