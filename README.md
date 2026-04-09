# CraftBoard Site

Статический сайт-витрина для `craftboard.online` с тремя страницами:
- главная (`index.html`)
- сервер (`server.html`)
- бот (`tg-poll-bot.html`)

## Как и откуда рендерится контент

### 1) Главная страница (`index.html`)
- Рендер: полностью статический HTML + CSS + встроенный JS.
- Что делает JS:
	- открывает модалку `ServerConfig`;
	- проверяет пароль локально в браузере (`btoa(input)` сравнивается с зашитым значением);
	- при успехе переводит на `server.html`.
- Карточка бота ведет на `tg-poll-bot.html`.

### 2) Страница сервера (`server.html`)
- Базовый контент (разделы, таблицы, структура) статический.
- Динамика: блоки статуса/ресурсов обновляются через `fetch('/api/status')`.
- Ожидаемый формат API:
	- `uptime`, `cpu`
	- `ram: { used_mb, total_mb, percent }`
	- `disk: { used_gb, total_gb, percent }`
	- `services: { nginx: 'active', 'tg-poll-bot': 'active', ... }`
- Если API недоступен, UI показывает `Нет данных`.

### 3) Страница бота (`tg-poll-bot.html`)
- Контент страницы не хардкодится в HTML.
- При загрузке выполняется `fetch('README.md', { cache: 'no-store' })`.
- Полученный Markdown рендерится в HTML через `marked.js` (CDN).
- Если `README.md` не загрузился, показывается сообщение об ошибке.

Итог: единственный markdown-источник для страницы бота на сайте - это текущий `README.md` в этом же репозитории.

## Структура проекта

```text
craftboard-site/
├── index.html                 # главная
├── server.html                # сервер + /api/status
├── tg-poll-bot.html           # рендер README.md через marked.js
├── README.md                  # документация и контент для страницы бота
└── .github/workflows/deploy.yml
```

## Локальный запуск

```bash
cd craftboard-site
python3 -m http.server 8000
# http://localhost:8000
```

Примечание: локально `/api/status` обычно не существует, поэтому на `server.html` будет `Нет данных`.

## Продакшен-деплой

Текущий web root на сервере: `/var/www/html` (nginx).

Быстрое ручное обновление:

```bash
scp README.md index.html server.html tg-poll-bot.html root@195.133.49.214:/var/www/html/
```

Если используется GitHub Actions для автодеплоя, в workflow путь должен совпадать с nginx root (`/var/www/html`).

Требования на сервере:
- установлен `git`;
- либо настроен git-репозиторий в каталоге деплоя, либо копирование файлов по SSH;
- ключ из секрета `DEPLOY_KEY` имеет доступ к репозиторию;
- веб-сервер отдает статические файлы из `/var/www/html`.

## Лицензия

MIT
