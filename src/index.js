const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: '*',
	}
});

const config = require('./config');
const { Game } = require('./game');


let usersConnected = 0;
const gameMap = new Map();

function findOrCreateGame() {
	const games = Array.from(gameMap.values());
	console.log('Games:', games.map((g) => ({id: g.id, ready: g.isReady(), sockets: g.sockets.map(s=>s.id)})))
	const foundGame = games.find(game => game.isReady() === false);
	if (!foundGame) {
		const newGame = new Game(io);
		gameMap.set(newGame.id, newGame);
		return newGame;
	}
	return foundGame;
}

io.on('connection', (socket) => {
	console.log('a user connected:', socket.id);
	usersConnected += 1;

	io.emit('playersOnline', usersConnected);

	socket.on('disconnect', () => {
		console.log('a user disconnected:', socket.id);
		usersConnected -= 1;
		io.emit('playersOnline', usersConnected);
	});

	socket.on('game:request', () => {
		const game = findOrCreateGame();
		game.joinPlayer(socket);
	})
});


app.get('/', (req, res) => {
	res.send('<h1>Battleshipz API</h1>');
});

httpServer.listen(config.port, () => {
	console.log('listening on', config.port);
});
