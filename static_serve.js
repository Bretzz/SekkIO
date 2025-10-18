const http = require('http');		// server hosting
const url = require('url');			// parse urls
const fs = require('fs');			// read/write files
const path = require('path');		// navigate and parse paths
const busboy = require('busboy');	// POST requests parsing

const hostname = '127.0.0.1';
const port = 3000;

const baseDir = path.join(__dirname, 'data');

// maps file extention to MIME types
// full list can be found here: https://www.freeformatter.com/mime-types-list.html
const mimeType = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.doc': 'application/msword',
  '.eot': 'application/vnd.ms-fontobject',
  '.ttf': 'application/x-font-ttf',
};

/* creates a json with all the buckets and the files */
/* -------------------------------------------------------------------------------- */
function listBucketsAndFiles(callback) {
	fs.readdir(baseDir, { withFileTypes: true }, (err, entries) => {
		if (err) return callback(err);

		const buckets = entries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
		const result = {};

		let pending = buckets.length;
		if (pending === 0) return callback(null, result);

		buckets.forEach(bucket => {
			const bucketPath = path.join(baseDir, bucket);
			fs.readdir(bucketPath, (err, files) => {
				if (err) {
					result[bucket] = [];
				} else {
					result[bucket] = files.filter(f => !f.startsWith('.'));
				}

				if (--pending === 0) {
					callback(null, result);
				}
			});
		});
	});
}
/* -------------------------------------------------------------------------------- */

/* what happens if we receive a POST request */
function POST(request, response, sanitizePath) {
	/* ------------------------------------------ */
	/* --------------- POST REQUEST ------------- */
	/* ------------------------------------------ */
	let fileAlreadyExists = false;	// helps to writ the response
	let	bucketExists = true			// check if the bucket exists
	let savePath = '';				// where the file will be saved

	const contentLength = parseInt(request.headers['content-length'] || '0', 10);
	const dirs = sanitizePath.split("/").length - 1;

	/* not an URI we like, only '/<bucket>' */
	if (dirs !== 1 || sanitizePath === "/") {
		/* send fail response */
		console.log("Invalid URI");
		response.writeHead(400, { 'Content-Type': 'text/plain' });
		response.end(`Invalid URI '${sanitizePath}', only /<bucket> accepted`);
		return ;
	}

	/* if the POST request has no body it's a bucket creation request */
	if (contentLength == 0) {
		console.log(`Creating bucket ${sanitizePath} ...`);

		let bucketPath = path.join(baseDir, sanitizePath);
	
		if (fs.existsSync(bucketPath)) {
			/* send fail response */
			console.log("Bucket already exists");
			response.writeHead(409, { 'Content-Type': 'text/plain' });
			response.end(`Bucket '${sanitizePath}' already exists`);
			return ;
		}
		/* creates the dir */
		fs.mkdir(bucketPath, (err) => {
			if (err) {
				console.log(`Error ${err} while creating bucket`);
				/* send fail response */
				response.writeHead(500, { 'Content-Type': 'text/plain' });
				response.end(`Error ${err} while creating bucket '${sanitizePath}'`);
			} else {
				/* send successful response */
				response.writeHead(200, { 'Content-Type': 'text/plain' });
				response.end(`Bucket '${sanitizePath}' created successfully`);
			}
		});
	}
	/* if the POST request has a body it's a file creation request */
	else {
		console.log(`Creating file ${sanitizePath} ...`);
		
		const bb = busboy({ headers: request.headers });

		/* while receiving data */
		bb.on('file', (fieldname, file, info) => {
			const { filename, encoding, mimeType } = info;
			console.log(`Uploading: ${fieldname} ${file} ${filename} ${encoding} ${mimeType}`);

			// You can customize where to save
			savePath = path.join(baseDir, sanitizePath, filename);

			/* ----------- check folder exists ---------- */
			if (fs.existsSync(path.join(baseDir, sanitizePath)) == false) {
				file.resume(); // discard the stream
				bucketExists = false;
			}
			// Check if file exists
			else if (fs.existsSync(savePath)) {
				file.resume(); // discard the stream
				fileAlreadyExists = true;
			} else {
				// create file write stream
				const stream = fs.createWriteStream(savePath);
				// Pipe the file stream to disk
				file.pipe(stream);
			}
		});

		/* when all data is sent, write response */
		bb.on('finish', () => {
			console.log('Upload complete');
			if (fileAlreadyExists == true) {
				/* send error response */
				response.statusCode = 409;
				response.end(`File already exists!`);
			} else if (bucketExists == false) {
				/* send successful response */
				response.writeHead(404, { 'Content-Type': 'text/plain' });
				response.end(`File uploaded to ${savePath}, bucket doesn't exists`);
			} else if (fileAlreadyExists == false) {
				/* send successful response */
				response.writeHead(200, { 'Content-Type': 'text/plain' });
				response.end(`File uploaded to ${savePath}`);
			}
		});

		request.pipe(bb);	// passes the request to busboy
	}
}

/* what happens if we receive a GET request */
function GET(request, response, sanitizePath) {
	/* ------------------------------------------ */
	/* --------------- GET REQUEST -------------- */
	/* ------------------------------------------ */
	// the actual path of the file in our filesystem
	let pathname = path.join(baseDir, sanitizePath);
	const parsedUrl = url.parse(request.url);

	/* ------------------------------------------- */
	/* returns the list of buckets with all items */
	if (parsedUrl.query) {console.log(parsedUrl.query); console.log(parsedUrl.query['bucket']);}
	if (parsedUrl.query && parsedUrl.query['bucket'] === 'all') {
		listBucketsAndFiles((err, data) => {
			if (err) {
				response.statusCode = 500;
				response.end('Error listing buckets');
			} else {
				response.setHeader('Content-Type', 'application/json');
				response.end(JSON.stringify(data));
			}
		});
		return ;
	}
	/* ------------------------------------------- */

	// Check if the file exists in the current directory.
	fs.access(pathname, fs.constants.F_OK, (err) => {
		if (err) {
			// if the file is not found, return 404
			response.statusCode = 404;
			response.end(`File ${pathname} not found!`);
			return;
		}
	});

	// Check if the file is readable.
	fs.access(pathname, fs.constants.R_OK, (err) => {
		if (err) {
			// if the file is not found, return 403
			response.statusCode = 403;
			response.end(`File ${pathname} forbidden!`);
			return;
		}
	});

	// read file from file system
	fs.readFile(pathname, function(err, data){
		if (err) {
			response.statusCode = 500;
			response.end(`Error getting the file: ${err}.`);
		} else {
			// based on the URL path, extract the file extention. e.g. .js, .doc, ...
			const ext = path.parse(pathname).ext;
			// if the file is found, set Content-type and send data
			response.setHeader('Content-type', mimeType[ext] || 'text/plain' );
			response.end(data);
		}
	});
}

/* my bigass server definition */
const server = http.createServer(function (request, response) {
	console.log(`${request.method} ${request.url}`);

	// parse URL
	const parsedUrl = url.parse(request.url);

	// extract URL path
	// Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
	// e.g curl --path-as-is http://localhost:9000/../fileInDanger.txt
	// by limiting the path to current directory only
	const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
	console.log(`sanitizePath ${sanitizePath}`);

	if (request.method == 'POST')
	{
		console.log('POST');
		POST(request, response, sanitizePath);
	}

	if (request.method == 'GET')
	{
		console.log('GET');
		GET(request, response, sanitizePath);
	}
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});