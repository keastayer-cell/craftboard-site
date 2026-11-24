import copy
import importlib.util
import io
import json
import pathlib
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('status_api', pathlib.Path(__file__).parents[1] / 'ops/status.py')
api = importlib.util.module_from_spec(spec)
spec.loader.exec_module(api)


def payload(timestamp=1000):
    return {'timestamp': timestamp, 'uptime': '1 day', 'cpu': 7,
            'ram': {'used_mb': 320, 'total_mb': 956, 'percent': 33},
            'disk': {'used_gb': 5, 'total_gb': 24, 'percent': 21},
            'services': {'tg-poll-bot': 'active', 'uptime-monitor.timer': 'inactive',
                         'nginx': 'active'}}


def response(data):
    return io.BytesIO(json.dumps(data).encode())


class StatusTests(unittest.TestCase):
    def setUp(self):
        api._last_remote_attempt = None
        api._last_remote = None

    def test_servers_do_not_share_metrics_or_services(self):
        local = copy.deepcopy(payload())
        local['ram']['total_mb'] = 1968
        with patch.object(api, 'local_metrics', return_value=local), \
                patch.object(api, 'service_state', return_value='active'), \
                patch.object(api.time, 'time', return_value=1000), \
                patch.object(api, 'urlopen', return_value=response(payload())):
            result = api.status()
        self.assertEqual(set(result), {'version', 'timestamp', 'servers'})
        local, remote = result['servers']['selectel'], result['servers']['amsterdam']
        self.assertEqual(local['host'], '139.100.237.243')
        self.assertEqual(remote['host'], '178.62.199.241')
        self.assertEqual(local['metrics']['ram']['total_mb'], 1968)
        self.assertEqual(remote['metrics']['ram']['total_mb'], 956)
        self.assertNotIn('nginx', remote['services'])
        self.assertNotIn('tg-poll-bot', local['services'])
        self.assertEqual(remote['services']['uptime-monitor.timer'], 'inactive')

    def test_outage_retains_last_success_without_reporting_fresh_data(self):
        with patch.object(api.time, 'time', return_value=1000), \
                patch.object(api, 'urlopen', return_value=response(payload())):
            api.project_status()
        with patch.object(api.time, 'time', return_value=1030), \
                patch.object(api, 'urlopen', side_effect=TimeoutError):
            result = api.project_status()
        self.assertEqual(result['connection'], 'unavailable')
        self.assertTrue(result['stale'])
        self.assertEqual(result['last_success_at'], 1000)
        self.assertEqual(result['checked_at'], 1030)
        self.assertEqual(result['metrics']['ram']['total_mb'], 956)

    def test_first_outage_has_no_invented_metrics(self):
        with patch.object(api.time, 'time', return_value=1000), \
                patch.object(api, 'urlopen', side_effect=TimeoutError):
            result = api.project_status()
        self.assertIsNone(result['metrics'])
        self.assertIsNone(result['last_success_at'])
        self.assertEqual(result['services']['tg-poll-bot'], 'unknown')

    def test_invalid_or_old_response_is_not_healthy(self):
        for bad in [payload(800), {'services': {}}, {**payload(), 'cpu': float('nan')}]:
            self.setUp()
            with patch.object(api.time, 'time', return_value=1000), \
                    patch.object(api, 'urlopen', return_value=response(bad)):
                self.assertEqual(api.project_status()['connection'], 'unavailable')

    def test_recovers_after_outage(self):
        with patch.object(api.time, 'time', return_value=1000), \
                patch.object(api, 'urlopen', side_effect=TimeoutError):
            api.project_status()
        with patch.object(api.time, 'time', return_value=1030), \
                patch.object(api, 'urlopen', return_value=response(payload(1030))):
            result = api.project_status()
        self.assertEqual(result['connection'], 'ok')
        self.assertFalse(result['stale'])
        self.assertEqual(result['last_success_at'], 1030)

    def test_cache_limits_requests_and_does_not_allow_external_mutation(self):
        with patch.object(api.time, 'time', return_value=1000), \
                patch.object(api, 'urlopen', return_value=response(payload())) as fetch:
            first = api.project_status()
            first['metrics']['ram']['total_mb'] = 1
            second = api.project_status()
        self.assertEqual(fetch.call_count, 1)
        self.assertEqual(second['metrics']['ram']['total_mb'], 956)


if __name__ == '__main__':
    unittest.main()
