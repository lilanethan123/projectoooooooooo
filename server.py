import http.server
import socketserver
import os

PORT = 5000
HOST = '0.0.0.0'
DIRECTORY = 'client'

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

class ReuseAddrTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with ReuseAddrTCPServer((HOST, PORT), NoCacheHandler) as httpd:
    print(f"Serving '{DIRECTORY}' at http://{HOST}:{PORT}")
    httpd.serve_forever()
