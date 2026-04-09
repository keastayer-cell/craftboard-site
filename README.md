# CraftBoard

Современный портал для управления и отслеживания проектов.

## Описание

CraftBoard — это тёмная, минималистичная веб-страница для отображения статуса проектов и сервисов в реальном времени.

## Возможности

- 🎨 Тёмная тема с современным дизайном
- 📱 Адаптивный дизайн (desktop + mobile)
- 🖥️ Серверный бейдж с информацией о хосте
- 🔐 Модальная система авторизации
- ✨ Плавные анимации и переходы

## Файлы проекта

- `index.html` — главная страница с карточками проектов
- `server.html` — страница информации о сервере
- `tg-poll-bot.html` — страница бота для опросов

## Развёртывание

```bash
# Клонировать репозиторий
git clone https://github.com/keastayer-cell/craftboard-site.git

# Запустить локальный сервер
cd craftboard-site
python3 -m http.server 8000

# Открыть в браузере
# http://localhost:8000
```

## Развёртывание на VPS

```bash
# На сервере
cd /var/www
git clone https://github.com/keastayer-cell/craftboard-site.git craftboard

# Если используется nginx
# Настроить root на папку /var/www/craftboard
```

## Стуктура

```
craftboard-site/
├── index.html           # главная страница
├── server.html          # информация о сервере
├── tg-poll-bot.html     # страница бота
└── README.md            # этот файл
```

## Лицензия

MIT
