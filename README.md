# CraftBoard

Небольшая живая витрина моих проектов. Собрал ради интереса, без больших
планов — а она взяла и работает.

Сайт показывает проекты и краткое состояние VPS, на котором они размещены.
Фронтенд написан на React и Vite, статика отдаётся через nginx, а небольшой
локальный Python API собирает загрузку сервера и состояния systemd-сервисов.

## Адрес

- Production: https://craftboard.online
- VPS: Selectel, Ubuntu 24.04 LTS, 2 vCPU, 2 GB RAM, 40 GB

## Локальный запуск

```bash
cd craftboard-react
npm ci
npm run dev
```

## Проверки

```bash
cd craftboard-react
npm run lint
npm run build
```

## Деплой

Push в `main` запускает GitHub Actions. Workflow собирает приложение и
атомарно переключает `/var/www/craftboard/current` на новый release.

Серверные файлы лежат в `ops/`:

- `nginx-craftboard.conf` — виртуальный хост nginx;
- `status.py` — локальный API статуса на `127.0.0.1:9191`;
- `status-api.service` — systemd unit для API.

## Статусы после переноса бота

Сайт и `/api/status` работают на `139.100.237.243`. Метрики и `services` (nginx и VK-бот)
относятся к этому VPS. У каждого VPS отдельная страница: `/server-selectel.html` и `/server-amsterdam.html`. Плашки на главной открывают соответствующую страницу. Старый `/server.html` показывает Selectel. Метрики Амстердама поступают в `project_server` из endpoint нового VPS. Карточки проектов используют `project_services`,
полученные с `http://178.62.199.241:9192/status`: Telegram-бот и
`uptime-monitor.timer` проверяются на новом VPS. При недоступности источника
обе карточки показывают неизвестный статус. Таймер между проверками остаётся
`active`; состояние oneshot-сервиса monitoring для карточки не используется.

На новом VPS отдельно установлен `ops/project-status.py` с unit
`ops/project-status.service` в `/opt/project-status/`. Он работает от `nobody`
и отдаёт только состояния двух сервисов и время ответа, без секретов и данных бота.
Автодеплой сайта обновляет локальный status API на старом VPS; endpoint нового
VPS устанавливается отдельно при изменении `ops/project-status.py`.
