var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var bcrypt = require('bcrypt');

// require data object
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3002;

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

// GET /
app.get('/', function(req, res) {
  res.send('ToDo API Root');
});

// GET /todos or /todos?completed=true?q=walk
app.get('/todos', function(req, res) {
  // grabs the query parameters from the url
  var queryParams = req.query;
  // create blank filter object
  var where = {};
  // filter by completed tasks
  if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
    where.completed = true;
  }
  // filter by incompleted tasks
  else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
    where.completed = false;
  }
  // filter by description
  if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
    var desc = queryParams.q;
    where.description = {
      $like: '%' + desc + '%'
    }
  }

  db.todo.findAll({ where: where }).then(function(todo) {
    res.json(todo);
  }, function(e) {
    res.status(500).send();
  })

});

// GET /todos/:id (req.params.id)
app.get('/todos/:id', function(req, res) {
  // sets parameter to int
  var todoId = parseInt(req.params.id, 10);
  // find item by id
  db.todo.findById(todoId).then(function(todo) {
    if (!!todo) { // if true
      res.json(todo);
    } else {
      res.status(404).send();
    }
  }, function(e) {
    res.status(500).send();
  });
});

// POST /todos
app.post('/todos', function(req, res) {
  // allow only defined properties
  var body = _.pick(req.body, 'description', 'completed');
  // validate data types and empty strings
  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    return res.status(400).send();
  }
  // trim white spaces
  body.description = body.description.trim();
  // increment to next id
  db.todo.create(body).then(function(todo) {
    res.json(todo.toJSON());
  }, function(e) {
    res.status(400).json(item);
  });
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
  // sets parameter to int
  var todoId = parseInt(req.params.id, 10);

  db.todo.destroy({
    where: {
      id: todoId
    }
  }).then(function(rowDeleted) {
    if (rowDeleted === 0) {
      res.status(404).json({
        error: 'No todo with id'
      });
    } else {
      res.status(204).send();
    }
  }, function() {
    res.status(500).send();
  });
});

// PUT /todos;:id
app.put('/todos/:id', function(req, res) {
  // sets parameter to int
  var todoId = parseInt(req.params.id, 10);
  // allow only defined properties
  var body = _.pick(req.body, 'description', 'completed');
  var attributes = {};

  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }

  // call a model method
  db.todo.findById(todoId).then(function(todo) {
    if (todo) {
      todo.update(attributes).then(function(todo) {
        res.json(todo.toJSON());
      }, function(e) {
        res.status(400).json(e);
      });
    } else {
      res.status(404).send();
    }
  }, function() {
    res.status(500).send();
  });
});

// POST /users
app.post('/users', function(req, res) {
  // allow only defined properties
  var body = _.pick(req.body, 'email', 'password');
  // validate data types and empty strings
  if (!_.isString(body.email) || body.email.trim().length === 0 || !_.isString(body.password) || body.password.trim().length < 6) {
    return res.status(400).send();
  }
  // trim white spaces
  body.email = body.email.trim();
  // increment to next id
  db.user.create(body).then(function(user) {
    res.json(user.toPublicJSON());
  }, function(e) {
    res.status(400).json(e);
  });
});

//POST users/login
app.post('/users/login', function(req, res) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.authenticate(body).then(function (user){
    var token = user.generateToken('authentiation');
    if (token) {
      res.header('Auth', token).json(user.toPublicJSON());
    } else {
      res.status(401).send();
    }
  }, function () {
      res.status(401).send();
  });
});

db.sequelize.sync({ force: true }).then(function() {
  app.listen(PORT, function() {
    console.log('Express listening on port: ' + PORT);
  });
});