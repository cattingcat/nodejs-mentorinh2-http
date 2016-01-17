var supervisor = require('node-supervisor');

supervisor.watch({
	exec: __dirname + '/src/server.js'
});
