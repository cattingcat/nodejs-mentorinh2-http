'use strict';
const http = require('http'),
	fs = require('fs'),
    path = require('path'),
	url = require('url');

var urlMapping = {
	'/text': function(req, res) {
		res.writeHead(200, {'Content-Type': 'text/plain'});

		let filePath = path.join(__dirname, 'data/plain_text.txt');
		let rs = fs.createReadStream(filePath);
	    rs.pipe(res);
	},
	'/json': function(req, res) {
		res.writeHead(200, {'Content-Type': 'application/json'});

		let filePath = path.join(__dirname, 'data/json_file.json');
		let rs = fs.createReadStream(filePath);
	    rs.pipe(res);
	},
	'/xml': function(req, res) {
		res.writeHead(200, {'Content-Type': 'text/xml'});

		let filePath = path.join(__dirname, 'data/xml_file.xml');
		let rs = fs.createReadStream(filePath);
	    rs.pipe(res);
	},
	'/html': function(req, res) {
		res.writeHead(200, {'Content-Type': 'text/html'});

		let filePath = path.join(__dirname, 'data/index.html');
		let rs = fs.createReadStream(filePath);
	    rs.pipe(res);
	},
	'/jpg': function(req, res) {
		if(req.headers['cache-control'] == 'no-cache'){
			console.log('request for image');
			res.writeHead(200, {
				'Content-Type': 'image/jpeg',
				'Cache-Control': 'public, max-age=31536000',
				'Expires': new Date(Date.now() + 345600000).toUTCString()
			});

			let filePath = path.join(__dirname, 'data/image.jpg');
			let rs = fs.createReadStream(filePath);
		    rs.pipe(res);
		} else {
			console.log('image from cache');
			res.writeHead(304, {
				'Date': new Date(Date.now()).toUTCString()
			});
			res.end();
		}
	},
	'/bin': function(req, res) {
		res.writeHead(200, {
			'Content-Type': 'application/octet-stream',
			'Content-Disposition': 'attachment; filename="boot.o"'
		});

		let filePath = path.join(__dirname, 'data/boot.o');
		let rs = fs.createReadStream(filePath);
	    rs.pipe(res);
	},
	'/test': function(req, res, options) {
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end(options.query.message + '\n');
	},

	'/checkToken': function(req, res) {
		let token = req.headers['token'];
		console.log('Token: ' + token);
		if(token){
			res.writeHead(200);
			res.end('Token accepted \n');
		} else {
			res.writeHead(403);
			res.end('Forbidden \n');
		}
	},

	'/upload': function(req, res){
		debugger;
		let filePath = path.join(__dirname, 'upload/tmp.file');
		let stream = fs.createWriteStream(filePath);
		req.pipe(stream);

		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('Done \n');
	}
}

function resolveUrl(request, response, mapping) {
	for(let i in mapping) {
		let rx = new RegExp(i, 'i');
		if(rx.test(request.url)) {
			let query = url.parse(request.url, true).query;

			mapping[i](request, response, {
				regexp: rx,
				query: query
			});
			return;
		}
	}
	if(mapping.default)
		mapping.default(request, response);
	else {
		response.writeHead(404, {'Content-Type': 'text/plain'});
		response.end('Not found\n');
	}
}




http.createServer( (request, response) => {


	resolveUrl(request, response, urlMapping);
}).listen(8124);

console.log('Server running at http://127.0.0.1:8124/');
