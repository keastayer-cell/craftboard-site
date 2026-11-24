import { test } from 'node:test'
import assert from 'node:assert/strict'
import { connectionStatus, isCurrent, markUnavailable, serviceStatus } from '../src/status.js'

const current = () => ({ connection: 'ok', stale: false, last_success_at: Date.now() / 1000,
  metrics: { cpu: 8 }, services: { bot: 'active', monitor: 'inactive', failed: 'failed' } })

test('connection and service states have distinct, truthful labels', () => {
  const server = current()
  assert.equal(serviceStatus(server, 'bot').label, 'Служба запущена')
  assert.equal(serviceStatus(server, 'monitor').label, 'Служба остановлена')
  assert.equal(serviceStatus(server, 'failed').label, 'Ошибка службы')
  assert.equal(serviceStatus(server, 'missing').label, 'Нет данных о службе')
  assert.equal(connectionStatus(server).tone, 'ok')
})

test('stale data cannot keep an active service green', () => {
  const server = { ...current(), last_success_at: Date.now() / 1000 - 120 }
  assert.equal(isCurrent(server), false)
  assert.equal(serviceStatus(server, 'bot').label, 'Нет связи с сервером')
  assert.equal(serviceStatus(server, 'bot').tone, 'pending')
})

test('API outage retains old metrics and timestamp but removes healthy state', () => {
  const server = current()
  const failed = markUnavailable({ selectel: server }).selectel
  assert.deepEqual(failed.metrics, server.metrics)
  assert.equal(failed.last_success_at, server.last_success_at)
  assert.equal(failed.stale, true)
  assert.equal(serviceStatus(failed, 'bot').tone, 'pending')
  assert.equal(isCurrent(server), true)
})
