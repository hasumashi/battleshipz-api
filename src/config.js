const { env } = require('node:process');

const config = {
	port: env.PORT ?? 8080,
};

console.log('CONFIG:', config);

module.exports = config;
