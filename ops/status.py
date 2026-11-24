#!/usr/bin/env python3
"""Read-only status API. Each server owns its metrics, services and freshness."""
import copy
import json
import math
import os
import shutil
import subprocess
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from http.client import HTTPException
from urllib.request import urlopen

SERVERS = {
    'selectel': {
        'name': 'Сайт и VK-бот · Selectel', 'host': '139.100.237.243',
        'services': ('nginx', 'vk-poll-bot', 'football-stats-app@test',
                     'football-stats-mailer@test', 'efgen-bosh-app@test'),
    },
    'amsterdam': {
        'name': 'Telegram-бот · DigitalOcean', 'host': '178.62.199.241',
        'services': ('tg-poll-bot', 'uptime-monitor.timer'),
    },
}
STATES = {'active', 'inactive', 'failed', 'activating', 'deactivating', 'reloading'}
MAX_AGE = 90
REMOTE_CACHE_SECONDS = 10
_remote_lock = threading.Lock()
_last_remote_attempt = None
_last_remote = None


def command(*args):
    return subprocess.run(args, capture_output=True, text=True, check=False,
                          timeout=3).stdout.strip()


def service_state(name):
    try:
        state = command('systemctl', 'is-active', name)
        return state if state in STATES else 'unknown'
    except (OSError, subprocess.TimeoutExpired):
        return 'unknown'


def local_metrics():
    mem = {}
    with open('/proc/meminfo', encoding='utf-8') as handle:
        for line in handle:
            key, value = line.split(':', 1)
            mem[key] = int(value.strip().split()[0])
    total = round(mem['MemTotal'] / 1024)
    used = total - round(mem['MemAvailable'] / 1024)
    disk = shutil.disk_usage('/')

    def sample():
        with open('/proc/stat', encoding='utf-8') as handle:
            values = [int(value) for value in handle.readline().split()[1:]]
        return values[3] + values[4], sum(values)

    idle, cpu_total = sample()
    time.sleep(.1)
    idle_after, total_after = sample()
    elapsed = total_after - cpu_total
    return {
        'uptime': command('uptime', '-p').removeprefix('up '),
        'cpu': round((1 - (idle_after - idle) / elapsed) * 100) if elapsed > 0 else 0,
        'ram': {'used_mb': used, 'total_mb': total, 'percent': round(used / total * 100)},
        'disk': {'used_gb': round(disk.used / 1024**3, 1),
                 'total_gb': round(disk.total / 1024**3, 1),
                 'percent': round(disk.used / disk.total * 100)},
    }


def server_snapshot(server_id, metrics, services, timestamp):
    config = SERVERS[server_id]
    return {
        'id': server_id, 'name': config['name'], 'host': config['host'],
        'metrics': metrics,
        'services': {name: services.get(name, 'unknown')
                     if services.get(name) in STATES else 'unknown'
                     for name in config['services']},
        'connection': 'ok', 'stale': False, 'checked_at': timestamp,
        'last_success_at': timestamp, 'error': None,
    }


def unavailable(server_id, checked_at, previous=None, error='unreachable'):
    result = copy.deepcopy(previous) if previous else server_snapshot(server_id, None, {}, None)
    result.update(connection='unavailable', stale=bool(result['metrics']),
                  checked_at=checked_at, error=error)
    return result


def validate_remote(data, now):
    if not isinstance(data, dict) or not isinstance(data.get('services'), dict):
        raise ValueError('Invalid status')
    timestamp = data.get('timestamp')
    if not isinstance(timestamp, (int, float)) or not math.isfinite(timestamp):
        raise ValueError('Invalid timestamp')
    if now - timestamp > MAX_AGE or timestamp - now > 30:
        raise ValueError('Stale timestamp')
    if not isinstance(data.get('uptime'), str):
        raise ValueError('Invalid uptime')
    metrics = {key: data.get(key) for key in ('uptime', 'cpu', 'ram', 'disk')}
    numbers = [metrics['cpu']]
    for group, fields in [('ram', ('used_mb', 'total_mb', 'percent')),
                          ('disk', ('used_gb', 'total_gb', 'percent'))]:
        if not isinstance(metrics[group], dict):
            raise ValueError('Invalid metrics')
        numbers.extend(metrics[group].get(field) for field in fields)
    if any(not isinstance(value, (int, float)) or not math.isfinite(value)
           for value in numbers):
        raise ValueError('Invalid metrics')
    return server_snapshot('amsterdam', metrics, data['services'], timestamp)


def project_status():
    global _last_remote_attempt, _last_remote
    with _remote_lock:
        now = time.time()
        if _last_remote_attempt is not None and now - _last_remote_attempt < REMOTE_CACHE_SECONDS:
            cached = copy.deepcopy(_last_remote)
            if cached['connection'] == 'ok' and now - cached['last_success_at'] > MAX_AGE:
                return unavailable('amsterdam', now, cached, 'stale')
            return cached
        _last_remote_attempt = now
        try:
            url = os.getenv('PROJECT_STATUS_URL', 'http://178.62.199.241:9192/status')
            with urlopen(url, timeout=3) as response:
                _last_remote = validate_remote(json.load(response), time.time())
        except (OSError, ValueError, TypeError, AttributeError, HTTPException):
            _last_remote = unavailable('amsterdam', time.time(), _last_remote)
        return copy.deepcopy(_last_remote)


def status():
    local = server_snapshot('selectel', local_metrics(),
                            {name: service_state(name) for name in SERVERS['selectel']['services']},
                            time.time())
    return {'version': 2, 'timestamp': time.time(),
            'servers': {'selectel': local, 'amsterdam': project_status()}}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != '/status':
            self.send_error(404)
            return
        body = json.dumps(status(), ensure_ascii=False, allow_nan=False).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        return


if __name__ == '__main__':
    ThreadingHTTPServer(('127.0.0.1', 9191), Handler).serve_forever()
