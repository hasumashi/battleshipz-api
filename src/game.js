const { nanoid } = require('nanoid');

class Game {
	players = {}

	get sockets() {
		return Object.values(this.players).map(player => player.socket);
	}

	gameStarted = false
	playersReady = 0

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
		this.players[socket.id] = {
			socket,
			board: null,
		};
		if (this.isReady()) {
			this.io.to(this.socketIoRoom).emit('game:ready', this.id);
			console.log('game:ready', this.id);
		}
		this.#handleSocketEvents(socket);
	}

	/**
	 * Register callbacks on SocketIO events
	 * @param {SocketIO.Socket} socket
	 */
	#handleSocketEvents(socket) {
		socket.on('disconnect', () => {
			console.warn(`User from game ${this.id} has disconected: ${socket.id}`);
			socket.to(this.socketIoRoom).emit('opponent:disconnected');
		});

		socket.on('player:ready', (playerBoard) => {
			this.players[socket.id].board = playerBoard.board;
			console.log('currentBoard:', this.players[socket.id].board)
			this.playersReady++;

			if (this.playersReady < 2) {
				console.log('opponent:ready in', this.socketIoRoom);
				socket.to(this.socketIoRoom).emit('opponent:ready');
			} else {
				this.gameStarted = true;
				console.log('game:start in', this.socketIoRoom);
				const firstPlayer = Math.random() < 0.5;
				const sockets = this.sockets;
				sockets[+firstPlayer].emit('game:start', { first: true });
				sockets[1 - firstPlayer].emit('game:start', { first: false });
			}
		});

		socket.on('player:shoot', (field, callback) => {
			const [row, col] = this.#parseFieldString(field);
			console.log('player:shoot <-', field, row, col);
			const opponent = this.#getOpponentPlayer(socket);
			const opponentBoard = opponent.board;
			const hit = opponentBoard[row][col];
			callback({
				hit,
			});

			const dataForOpponent = { field, hit };
			console.log('opponent:shot', opponent?.socket?.id, dataForOpponent);
			opponent.socket.emit('opponent:shot', dataForOpponent)
		});
	}

	#parseFieldString(field) {
		return [
			field.charCodeAt(0) - 'A'.charCodeAt(0),
			+field.charAt(1),
		];
	}

	#getOpponentPlayer(socket) {
		return Object.values(this.players).find(player => player.socket.id !== socket.id);
	}
}

module.exports = { Game };
