var socket,
	localPlayer,
	networkPlayers;

function getPlayer(id) {
	var i;
	for (i = 0; i < networkPlayers.length; i++) {
		if (networkPlayers[i].id == id) {
			return networkPlayers[i];
		}
	};
	return false;
};

class LocalPlayer {
	constructor(xStart,yStart) {
		this.x = xStart;
		this.y = yStart;
		this.xPrevious = this.x;
		this.yPrevious = this.y;
		this.Speed = 300;
	}

	update(dt) {
		if (game.keyboard.keys.left) { 
			this.x -= this.Speed*dt;	
		}

		if (game.keyboard.keys.right) { 
			this.x += this.Speed*dt;
		}

		if (game.keyboard.keys.up) { 
			this.y -= this.Speed*dt;
		}

		if (game.keyboard.keys.down) { 
			this.y += this.Speed*dt;
		}

		if (this.xPrevious != this.x
		||  this.yPrevious != this.y) {
			socket.emit('pos', {
				x:this.x, 
				y:this.y
			});
		}

		this.xPrevious = this.x;
		this.yPrevious = this.y;
	}

	render() {
		game.layer
			.fillStyle("#ffffff")
			.fillRect(this.x,this.y,64,64);
			/*.font(24 + "px font")
			.textAlign("center")
			.fillText(this.name, this.x+32, this.y-32);*/
	}
}

class NetworkPlayer {
	constructor(id,x,y) {
		this.id = id;
		this.x = x;
		this.y = y;
	}

	render() {
		game.layer
			.fillStyle("#ffffff")
			.fillRect(this.x,this.y,64,64);
			/*.font(24 + "px font")
			.textAlign("center")
			.fillText(this.name, this.x+32, this.y-32);*/
	}
}

var networkEvents = function() {

	//Local player has logged in
	socket.on('connect', function() {
		console.log("Connected to server");
		socket.emit('new', {
			x: localPlayer.x, 
			y: localPlayer.y
		});
	});

	//Local player has logged out
	socket.on('disconnect', function() {
		console.log("Disonnected from server");
	});

	//Network player has logged in
	socket.on('new', function(data) {
		console.log("New player connected: " + data.id);
		var newPlayer = new NetworkPlayer(data.id, data.x, data.y);
		networkPlayers.push(newPlayer);
	});

	//Network player has logged out
	socket.on('out', function(data) {
		var playerToRemove = getPlayer(data.id);

		if (!playerToRemove) {
			console.log("Player not found: " + data.id);
			return;
		}

		networkPlayers.splice(networkPlayers.indexOf(playerToRemove), 1);
	});

	//Network player has moved
	socket.on('pos', function(data) {
		var playerToMove = getPlayer(data.id);

		if (!playerToMove) {
			console.log("Player not found: " + data.id);
			return;
		}

		playerToMove.x = data.x;
		playerToMove.y = data.y;
	});
};

var STATES = {
	Play : {
	  	create: function() {
	  		socket = io();
			localPlayer = new LocalPlayer(32,64);
			networkPlayers = [];
			networkEvents();
		},

		step: function(dt) {
			localPlayer.update(dt);
		},

		render: function() {
			game.layer.clear("#000088");
			localPlayer.render();

			var i;
			for (i = 0; i < networkPlayers.length; i++) {
				networkPlayers[i].render();
			};
		}
	}
};

var game = playground({

	create: function() {
		this.loadFont("font");
	},

	ready: function() {
    	this.setState(STATES.Play);
  	}

});

