const { nanoid } = require('nanoid');

class Game {
	sockets = []

	isReady() {
		return this.sockets.length === 2;
	}

	get socketIoRoom() {
		return 'game:' + this.id;
	}

	/**
	 * Game constructor assiging random ID
	 * @param {SocketIO.Server} io 
	 */
	constructor(io) {
		this.io = io;
		this.id = nanoid();
		console.log('created game', this.id);
	}

	/**
	 * Join player's socket to the game
	 * @param {SocketIO.Socket} socket 
	 * @returns 
	 */
	joinPlayer(socket) {
		if (this.isReady()) {
			console.error('Game already has 2 players!');
			return;
		}
		if (this.sockets.includes(socket)) {
			console.warn('Socket already joined this game', socket, this.id);
			return;
		}
		socket.join(this.socketIoRoom);
		this.sockets.push(socket);
		if (this.isReady()) {
			this.io.to(this.socketIoRoom).emit('game:ready', this.id);
			console.log('game:ready', this.id);
		}
		socket.on('disconnect', () => {
			console.warn(`User from game ${this.id} has disconected: ${socket.id}`);
			socket.to(this.socketIoRoom).emit('opponent:disconnected');
		});
	}
}

module.exports = { Game };
