"""
from http.server import HTTPServer, BaseHTTPRequestHandler

class web_server(SimpleHTTPRequestHandler):
 
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        try:
            #Reading the file
            file_to_open = open(self.path[1:]).read()
            self.send_response(200)
        except:
            file_to_open = "File not found"
            self.send_response(404)
        
        self.end_headers()
        self.wfile.write(bytes(file_to_open, 'utf-8'))

httpd = HTTPServer(('localhost', 9000), web_server)
print("server started")
httpd.serve_forever()
"""
# server.py
import http.server # Our http server handler for http requests
import socketserver # Establish the TCP Socket connections
 
PORT = 5000
 
class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)
 
Handler = MyHttpRequestHandler
 
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("Http Server Serving at port", PORT)
    httpd.serve_forever()
