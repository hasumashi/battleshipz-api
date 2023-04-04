const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const config = require('./config');
const { Game } = require('./game');
const { nanoid } = require('nanoid');


let usersConnected = 0;
const gameMap = new Map();

function findOrCreateGame() {
	const foundGame = Array.from(gameMap.values()).find(game => game.isReady() === false);
	if (!foundGame) {
		const newGame = new Game(io);
		gameMap.set(newGame.id, newGame);
		return newGame;
	}
	return foundGame;
}

io.on('connection', (socket) => {
	console.log('a user connected');
	usersConnected += 1;

	io.emit('playersOnline', usersConnected);

	socket.on('disconnect', () => {
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

server.listen(config.port, () => {
	console.log('listening on', config.port);
});
