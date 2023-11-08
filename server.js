var http = require('http');
var fs = require('fs');
var path = require('path');

server = http.createServer(function (req, res) {
    console.log('request ', req.url);

    var file_path = '.' + req.url;
    if (file_path == './') {
        file_path = './index.html';
    }

    var extname = String(path.extname(file_path)).toLowerCase();
    
    if (file_path.lastIndexOf('/') == file_path.length - 1) {
        file_path = file_path.slice(0, -1);
    }
    if (extname == '') {
        extname = '.html';
        file_path = file_path + '.html';
    }
    var mimeTypes = {
        '.txt': 'text/plain',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff2': 'font/woff2',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm',
        '.7z': 'application/x-7z-compressed'
    };

    var contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(file_path, function (error, content) {
        if (error) {
            if (error.code == 'ENOENT') {
                fs.readFile('./error.html', function (error, content) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            }
            else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        }
        else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

/*
 * This was for logging requests
    if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) {
            // body += data;
            fs.writeFile('/logs/fuze_telemetry_09_22.txt', data + "\n")
        });
         req.on('end', function () {
             try {
                 var post = JSON.parse(body);
                 deal_with_post_data(request,post);
                 console.log(post); // <--- here I just output the parsed JSON
                 response.writeHead(200, { "Content-Type": "text/plain" });
                 response.end();
                return;
             }
              catch (err) {
                 response.writeHead(500, { "Content-Type": "text/plain" });
                 response.write("Bad Post Data.  Is your data a proper JSON?\n");
                 response.end();
                 return;
            }
        });
    }
*/
});
server.listen(5000);
console.log('Server running at http://127.0.0.1:5000');
