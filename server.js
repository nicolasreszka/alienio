
//NodeJS requirements
var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	Player = require("./Player").Player;
	
//Server initialisation
var port = 3000,
	players = [];

//Find player by ID
function getPlayer(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};
	return false;
};

//Send 'public' folder to client
app.use(express.static('public'));
app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html');
});

//Handle events
io.on('connection', function(socket){

	//Player connected
 	console.log('connected :' + socket.id);
 	
 	//Player disconnected
 	socket.on('disconnect', function() {

		console.log('disconnected :' + socket.id);
		var playerToRemove = getPlayer(socket.id);

		if (!playerToRemove) {
			console.log("Player not found: " + socket.id);
			return;
		}

		players.splice(players.indexOf(playerToRemove), 1);
		
		//Broadcast removed player to other players
		socket.broadcast.emit('out', {
			id: socket.id
		});

	});

 	//Player has logged in
 	socket.on('new', function(data) {
 		console.log('New player has logged in :' + socket.id);

	    var newPlayer = new Player(data.x, data.y);
	    newPlayer.id = socket.id;
 
 		//Send new player to existing players
	    socket.broadcast.emit('new', {
	    	id: newPlayer.id, 
	    	x: newPlayer.getX(), 
	    	y: newPlayer.getY()
	    });

	    //Send existing players to new player
	    var i, p;
		for (i = 0; i < players.length; i++) {
			p = players[i];
			socket.emit('new', {
				id: p.id, 
				x: p.getX(), 
				y: p.getY()
			});
		};

	    players.push(newPlayer);

	});

 	//Player has moved
 	socket.on('pos', function(data) {
	    var playerToMove = getPlayer(socket.id);

	    if (!playerToMove) {
	    	console.log("Player not found: " + socket.id);
			return;
	    };

	    playerToMove.setX(data.x);
	    playerToMove.setY(data.y);

	    //Broadcast updated position to other players 
	    socket.broadcast.emit('pos', {
	    	id: playerToMove.id,
	    	x: playerToMove.getX(),
	    	y: playerToMove.getY()
	    });
	});
});

//Http stuff
http.listen(port, function(){
	console.log('listening on *:3000');
});