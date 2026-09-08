#!/usr/bin/env python3
"""
Boomi Crackers - Local development server with proper UTF-8 charset headers.
Ensures Tamil Unicode text renders correctly in all browsers.
"""
import http.server
import socketserver
import os
import sys

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class UTF8Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def send_response_header_with_charset(self, content_type):
        """Override content-type to always include UTF-8 charset for text files."""
        if content_type.startswith('text/') or content_type in (
            'application/javascript',
            'application/json',
        ):
            if 'charset' not in content_type:
                content_type += '; charset=UTF-8'
        return content_type

    def end_headers(self):
        # Patch the content type if it's a text file
        if hasattr(self, '_headers_buffer'):
            new_buffer = []
            for header in self._headers_buffer:
                line = header.decode('latin-1') if isinstance(header, bytes) else header
                if line.lower().startswith('content-type:') and ('text/' in line or 'javascript' in line or 'json' in line):
                    if 'charset' not in line.lower():
                        line = line.rstrip('\r\n') + '; charset=UTF-8\r\n'
                new_buffer.append(line.encode('latin-1') if isinstance(line, str) else line)
            self._headers_buffer = new_buffer
        super().end_headers()

    def guess_type(self, path):
        mtype, _ = super().guess_type(path)
        if mtype is None:
            mtype = 'application/octet-stream'
        return mtype, None

    def log_message(self, format, *args):
        # Quiet mode - only show errors
        if args and len(args) >= 2 and str(args[1]) not in ('200', '304', '404'):
            super().log_message(format, *args)

# Override types to include charset
import mimetypes
mimetypes.add_type('text/html; charset=UTF-8', '.html')
mimetypes.add_type('text/css; charset=UTF-8', '.css')
mimetypes.add_type('application/javascript; charset=UTF-8', '.js')

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    """Simple server with charset UTF-8 in all text content-types."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def send_header(self, keyword, value):
        if keyword.lower() == 'content-type':
            if ('text/' in value or 'javascript' in value) and 'charset' not in value:
                value = value + '; charset=UTF-8'
        super().send_header(keyword, value)
    
    def log_message(self, format, *args):
        print(f"  {args[0]} {args[1]}")

socketserver.TCPServer.allow_reuse_address = True

print(f"\n🎆 Boomi Crackers Dev Server")
print(f"   Serving: {DIRECTORY}")  
print(f"   URL: http://localhost:{PORT}")
print(f"   Tamil Unicode: UTF-8 charset headers enabled ✓")
print(f"   Press Ctrl+C to stop\n")

with socketserver.TCPServer(("", PORT), QuietHandler) as httpd:
    httpd.serve_forever()
