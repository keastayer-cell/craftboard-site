#!/usr/bin/env python3

import json
import shutil
import subprocess
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


SERVICES = ("nginx", "tg-poll-bot", "uptime-monitor.timer")


def command(*args):
    return subprocess.run(args, capture_output=True, text=True, check=False).stdout.strip()


def service_state(name):
    state = command("systemctl", "is-active", name)
    return state or "unknown"


def cpu_percent():
    def sample():
        values = [int(value) for value in open("/proc/stat", encoding="utf-8").readline().split()[1:]]
        idle = values[3] + values[4]
        return idle, sum(values)

    idle_before, total_before = sample()
    time.sleep(0.1)
    idle_after, total_after = sample()
    elapsed = total_after - total_before
    if elapsed <= 0:
        return 0
    return round((1 - (idle_after - idle_before) / elapsed) * 100)


def status():
    mem = {}
    with open("/proc/meminfo", encoding="utf-8") as handle:
        for line in handle:
            key, value = line.split(":", 1)
            mem[key] = int(value.strip().split()[0])

    total_mb = round(mem["MemTotal"] / 1024)
    available_mb = round(mem["MemAvailable"] / 1024)
    used_mb = total_mb - available_mb
    disk = shutil.disk_usage("/")

    return {
        "uptime": command("uptime", "-p").removeprefix("up "),
        "cpu": cpu_percent(),
        "ram": {
            "used_mb": used_mb,
            "total_mb": total_mb,
            "percent": round(used_mb / total_mb * 100),
        },
        "disk": {
            "used_gb": round((disk.total - disk.free) / 1024**3, 1),
            "total_gb": round(disk.total / 1024**3, 1),
            "percent": round((disk.total - disk.free) / disk.total * 100),
        },
        "services": {name: service_state(name) for name in SERVICES},
        "timestamp": int(time.time()),
    }


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/status":
            self.send_error(404)
            return

        body = json.dumps(status(), ensure_ascii=False).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 9191), Handler).serve_forever()
