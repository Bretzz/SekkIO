const { createServer } = require('node:http');

const hostname = '127.0.0.1';
const port = 3000;

const server = createServer((req, res) => {
	// console.log(req); // <-- lot's of stuff

	/* se la request e' GET */
	if (req.method == 'GET')
		console.log(req.url);

	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Hello World');
});


server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
