var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

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

  db.todo.findById(todoId).then(function(todo) {
    if (!!todo) { // if true
      db.todo.destroy({
        where: {
          id: todoId
        }
      });
      res.json(todo);
    } else {
      res.status(404).send();
    }
  }, function(e) {
    res.status(500).send();
  });
});

// PUT /todos;:id
app.put('/todos/:id', function(req, res) {
  // sets parameter to int
  var todoId = parseInt(req.params.id, 10);
  // allow only defined properties
  var body = _.pick(req.body, 'description', 'completed');

  db.todo.findById(todoId).then(function(todo) {
    if (!!todo) {
      if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        todo.updateAttributes({
          completed: body.completed
        }).then(function(to) {
          res.json(to);
        });
      } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
      }
      // validate if description exists
      if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        todo.updateAttributes({
          description: body.description
        }).then(function(to) {
          res.json(to);
        });
      } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
      }
    } else {
      res.status(404).send();
    }
  }, function(e) {
    res.status(500).send();
  });

});

db.sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log('Express listening on port: ' + PORT);
  });
});