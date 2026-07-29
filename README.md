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
