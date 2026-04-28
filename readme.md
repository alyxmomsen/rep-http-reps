# Knight Bus

> _"Welcome to the Knight Bus! Emergency transport for stranded witch or wizard."_

Самописный веб-фреймворк на чистом Node.js. Без Express. Без Multer. Только нативные модули.

## Что это

Knight Bus — это учебный проект, который вырос в полноценный фреймворк для обработки сложных форм с файлами. Всё написано с нуля: HTTP-роутер, парсер multipart/form-data, транзакционная система сохранения данных, стриминг видео.

## Возможности

- **HTTP-роутер** с middleware, параметрами URL (`:id`) и query-строками
- **Парсер multipart/form-data** через побайтовый поиск boundary в Buffer (без Multer)
- **Кастомный DSL `multitable://`** для группировки полей формы в связанные таблицы
- **Транзакционное сохранение** файлов и данных с откатом при ошибках (Unit of Work)
- **Стриминг видео** с поддержкой Range-запросов (206 Partial Content)
- **Валидация данных** по схемам (Strategy Pattern)
- **In-memory БД** с поддержкой CRUD-операций

## Как запустить

Создай файл `.env` (или скопируй `.env.example`) с содержимым:

```env
UPLOADS_DIR=./uploads
PORT=3333
HOST=0.0.0.0
```

```bash
git clone https://github.com/alyxmomsen/rep-http-reps.git
cd rep-http-reps
git checkout http/framework/v2
npm install
mkdir uploads



node index.js
```

Открыть в браузере: `http://localhost:3333/l/form`

## Как это работает

### Отправка формы

1. **Клиент** отправляет multipart-форму с файлом
2. **Роутер** принимает запрос и направляет его в `HandleFormFinalHandler`
3. **Content-Type роутер** определяет, что это `multipart/form-data`
4. **Парсер** разбивает сырой Buffer на части, извлекает заголовки и тело
5. **MultiTableParser** разбирает кастомный протокол `multitable://`
6. **PreMapper** строит иерархическую структуру: таблицы → группы → колонки
7. **PostMapper** выполняет транзакции: файлы на диск, данные в БД, связи между ними
8. **Ответ** возвращается клиенту в JSON

### Стриминг видео

1. Клиент запрашивает `/video-stream/:rowId`
2. **DBAdapter** читает метаданные файла (имя на диске, MIME-тип)
3. **FileManager** получает статистику файла (размер)
4. Если есть заголовок `Range` — отдаётся 206 Partial Content
5. Если нет — весь файл стримится через `ReadStream`

## Структура проекта

```
├── index.js                          # Точка входа
├── services/
│   ├── router/                       # HTTP-роутер
│   │   ├── model/router.model.js
│   │   └── controller/router.controller.js
│   ├── final-handlers/
│   │   └── handle-form/              # Обработка форм
│   │       ├── handle-form.fh.model.js
│   │       ├── content-type-router.controller.js
│   │       └── routes/multipart-route/
│   │           ├── multipart-route.model.js   # Главный обработчик multipart
│   │           ├── services/
│   │           │   ├── pre-mapper/            # Построение иерархии
│   │           │   └── post-mapper/           # Транзакции
│   │           └── utils/                     # Парсинг Buffer'ов
│   ├── in-memory-db/                 # In-memory БД
│   ├── db-adapter/                   # Адаптер с валидацией
│   ├── file-manager/                 # Файловый менеджер (Streams)
│   └── utit-of-work/                 # StateController (Unit of Work)
├── assets/
│   ├── html/form.html                # HTML-форма
│   ├── css/                          # Стили
│   └── js/                           # Фронтенд-логика
└── uploads/                          # Загруженные файлы
```

## Паттерны проектирования

| Паттерн                     | Где применяется                                 |
| :-------------------------- | :---------------------------------------------- |
| **Chain of Responsibility** | Middleware в роутере и фронтенде                |
| **Unit of Work**            | `StateController` — транзакции с откатом        |
| **Interpreter**             | `MultiTableParser` — разбор DSL `multitable://` |
| **Strategy**                | `DBAdapter` — валидация по схемам               |
| **State Machine**           | Парсер multipart — поиск boundary в Buffer      |
| **Dependency Injection**    | Фабрики и конструкторы handler'ов               |

## Стек

**Runtime:** Node.js (нативные модули)
**Модули:** `http`, `fs`, `crypto`, `stream`, `buffer`, `path`
**Без внешних зависимостей** (кроме `dotenv` для переменных окружения)

## Почему Knight Bus?

Название — отсылка к автобусу-спасателю из «Гарри Поттера и узника Азкабана». Knight Bus подбирает волшебников, попавших в беду.

Так же и этот фреймворк — он «подбирает» сложные формы с файлами и «отвозит» их в безопасное место (базу данных и файловую систему).

## Контакты

GitHub: [github.com/alyxmomsen](https://github.com/alyxmomsen)
Telegram: @daemon13
Email: myowngin@yandex.ru
