#!/usr/bin/env python3
"""Public read-only statuses for the Amsterdam VPS; no credentials or user data."""
import json
import subprocess
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SERVICES = ("tg-poll-bot", "uptime-monitor.timer")


def service_state(name):
    try:
        result = subprocess.run(
            ["systemctl", "is-active", name], capture_output=True,
            text=True, timeout=3, check=False,
        )
        return result.stdout.strip() or "unknown"
    except (OSError, subprocess.TimeoutExpired):
        return "unknown"


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/status":
            self.send_error(404)
            return
        body = json.dumps({
            "services": {name: service_state(name) for name in SERVICES},
            "timestamp": int(time.time()),
        }).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", 9192), Handler).serve_forever()
