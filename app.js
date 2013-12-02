var express = require('express');
var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(8850);

app.configure(function() {
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.set( 'views', __dirname + '/views' );
	app.set( 'view engine', 'ejs' );
	app.use( express.favicon());
	app.use( express.static( __dirname + '/public' ));
	app.use(express.cookieParser());
	app.use(app.router);
});

/*  res.sendfile(__dirname + '/public/index.html');
});
app.get('/mctrl', function (req, res) {
  res.sendfile(__dirname + '/public/mctrl.html');
});*/


var clients = {};
io.sockets.on('connection', function (socket) {
	console.log('connecting socket: [' + socket.id + ']');
  socket.emit('connection_success', { id: socket.id });

  socket.on('reg', function(data){
    console.log('reg ['+ data.id + '] [' + socket.id + ']');
    clients[data.id] = socket;
  });
  socket.on('next', function (data){
    console.log('toId=' + data.toId);
    if(clients[data.toId]){
      clients[data.toId].emit('next', data);
    }
  });
  socket.on('prev', function (data){
    console.log('toId=' + data.toId);
    if(clients[data.toId]){
      clients[data.toId].emit('prev', data);
    }
  });
});

app.post('/api/mctrl', function(req, res){
  var toid = req.body.toid;
  var direction = req.body.direction;
  console.log(req.body);

  if(clients[toid]){
    clients[toid].emit(direction, {});
    res.json({status:'ok'});
  }
  else{
    res.json({status:'fail'});
  }
});