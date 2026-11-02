#!/usr/bin/env python3
"""Public read-only statuses for the Amsterdam VPS; no credentials or user data."""
import json
import shutil
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


def metrics():
    mem = {}
    with open("/proc/meminfo", encoding="utf-8") as handle:
        for line in handle:
            key, value = line.split(":", 1)
            mem[key] = int(value.strip().split()[0])
    total = round(mem["MemTotal"] / 1024)
    used = total - round(mem["MemAvailable"] / 1024)
    disk = shutil.disk_usage("/")
    uptime = subprocess.run(["uptime", "-p"], capture_output=True, text=True, timeout=3).stdout.strip().removeprefix("up ")
    def sample():
        with open("/proc/stat", encoding="utf-8") as handle:
            values = [int(value) for value in handle.readline().split()[1:]]
        return values[3] + values[4], sum(values)
    idle, total_cpu = sample()
    time.sleep(0.1)
    idle_after, total_after = sample()
    elapsed = total_after - total_cpu
    return {
        "uptime": uptime,
        "cpu": round((1 - (idle_after - idle) / elapsed) * 100) if elapsed > 0 else 0,
        "ram": {"used_mb": used, "total_mb": total, "percent": round(used / total * 100)},
        "disk": {"used_gb": round(disk.used / 1024**3, 1), "total_gb": round(disk.total / 1024**3, 1), "percent": round(disk.used / disk.total * 100)},
    }


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/status":
            self.send_error(404)
            return
        body = json.dumps({
            **metrics(),
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
