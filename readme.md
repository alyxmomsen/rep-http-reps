
# Custom Node.js Web Framework with Form Processing

A from-scratch implementation of a web server framework for Node.js, featuring custom routing, multipart form parsing, file upload handling, and data validation.

## 🚀 Key Features

### 1. Custom Router
- Dynamic route parameters (`/users/:id/posts/:postId`)
- Middleware support (global and route-specific)
- Query string parsing
- No external dependencies

### 2. Manual Multipart/Form-Data Parser
- Pure Node.js implementation using `Buffer`
- Handles both text fields and file uploads
- Stream-based data collection
- No `multer` or similar libraries

### 3. Intelligent Form Data Grouping
- Group related form fields for multi-table database insertion
- Support for complex data structures
- File metadata extraction (original filename, MIME type)

### 4. Built-in Validation Layer
- Model-based validation schemas
- Type checking
- Required field validation
- Default value support

### 5. File Management System
- Secure filename generation using crypto
- Stream-based file writing
- Organized storage structure

## 🛠 Technical Stack

- **Runtime:** Node.js (native modules only)
- **Core:** `http`, `fs`, `crypto`, `stream`, `buffer`
- **No external dependencies** - pure Node.js

## 📁 Project Structure


├── index.js                 # Server entry point
├── app/
│   └── services/
│       ├── router/          # Custom HTTP router
│       │   └── controller/  # Route definitions
│       ├── request-handlers/
│       │   ├── form/        # Form processing logic
│       │   │   ├── controller/
│       │   │   └── model/   # Multipart parser
│       │   └── public/      # Static file serving
│       ├── database/         # In-memory DB with validation
│       │   ├── models/       # Table schemas
│       │   └── controller/   # DB operations
│       ├── group-form-data/  # Field grouping logic
│       └── filemanager.service.js/ # File operations


## 💡 How It Works

### Form Data Structure
The form uses a special naming convention to organize data:

name="groupId.tableName.columnName.dataType"

Example: `name="profile.users.username.string"`

### Request Flow
1. Client submits multipart form
2. Server collects chunks and parses boundary
3. Each form part is processed (headers + body)
4. Files are saved to `/uploads` with secure names
5. Text fields are validated against models
6. Data is grouped and inserted into appropriate "tables"
7. Client receives JSON response with inserted IDs

## 🏁 Getting Started

### Prerequisites
- Node.js (v12 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/alyxmomsen/rep-http-reps.git

# Install dependencies (if any - currently none)
npm install

# Create uploads directory
mkdir uploads

# Start the server
node index.js
```

### Test the Application

1. Open your browser: `http://localhost:3333/l/form`
2. Fill out the test form with:
   - Text fields (name, description)
   - File uploads (avatar, documents)
3. Submit and check the JSON response
4. Verify files in `/uploads` directory
5. Check server console for database logs

## 🔧 Configuration

### Adding New Routes
```javascript
// In app/services/router/controller/http-controller.js
router.get('/your-path/:param', async (req, res) => {
    const { params, queryParams } = req;
    res.end(JSON.stringify({ params, queryParams }));
});
```

### Creating Validation Models
```javascript
// In app/services/database/models/
const yourModel = new DBController({
    fieldName: {
        [VALUE_TYPE]: 'string',
        [REQUIRED]: true,
        [DEFAULT_VALUE]: 'default'
    }
});
```

## 📊 Performance Considerations

- **Stream-based processing:** Handles large files efficiently
- **Buffer management:** Controlled memory usage
- **No external dependencies:** Minimal overhead

## 🎯 Why This Project?

This project demonstrates deep understanding of:
- HTTP protocol internals
- Node.js streams and buffers
- Web server architecture
- Data validation strategies
- File system operations
- Clean code organization

Built from scratch to truly understand how frameworks like Express work under the hood.

## 🔜 Planned Features

- [ ] PostgreSQL/MySQL integration
- [ ] Centralized error handling
- [ ] Request logging middleware
- [ ] Session management
- [ ] Unit tests
- [ ] Docker support

## 📝 License

MIT

## 🤝 Contact

Your Name - [telegram/@yourusername](https://t.me/yourusername) - email@example.com

Project Link: [https://github.com/alyxmomsen/rep-http-reps](https://github.com/alyxmomsen/rep-http-reps)


# issues


## link groups

- [ ] link groups

вариант:
<currentGoup[targetGroup]>

должно быть линкование, 
- либо с группой которая отправляется в одном request
- либо с конкретным id строки в конкретной таблицы
- либо и так, и так

вариант решения:

- изначально кажды файл отправляется как отдельная группа, но если файл имеет отношение к группе
    которая отправляется в одном и том же реквесте, то присвоить файлу ту же группу что и та группа
    к которой он имеет отношение,
    соответственно <columnName> файла будет присвоен группе, как и ожидается в соответствии с правилами группировки

- вообще файл должен быть всегда к чему-то привязан 

### решение

в квадратных скобах перечисляются локальные (попадающие в один и тот же реквест) идентификаторы,

но, опять же, - на данный момент нет возможности линковать видео с уже существующей записью (производить UPDATE)
или добавлять в связывающую таблицу

```html
<input type="text" name="multitable://R=0025[].name.string" id="">
<input type="file" name="multitable://F=028e.thumb-nail[R=0025].binary" id="" accept=".img, .jpeg, .png">

<!-- что здесь происходит:
1. создается запись в таблице "VIDEO-FILES" (8e) в соответствии c
    R=00<25> - "USERS"
    R=00<af> - "VIDEO-PLAYLIST"
    F=01<8e> - "VIDEO-FILES"
2. линкуется с таблицей "USERS" (25)
    "thumb-nail" теперь является именем колонки в таблице "USERS"
 -->
```

```html
<div class="flex flex--col flex--jtf-ctr flex--align-start flex--gap-1 form-element">
    <h3>user</h3>
    <!-- users table g00t25 -->
    <input type="text" name="multitable://R=0025[].name.string" id="">
    <input type="text" name="multitable://R=0025[].last-name.string" id="">
    <!-- video-files table g01t8e -->
    <input type="file" name="multitable://F=018e.avatar[R=0025].binary" id="" accept=".img, .jpeg, .png">
    <!-- video-files table -->
    <input type="file" name="multitable://F=028e.thumb-nail[R=0025].binary" id="" accept=".img, .jpeg, .png">
    <!-- video-files table -->
    <input type="file" name="multitable://F=038e.logo[R=0025].binary" id="" accept=".img, .jpeg, .png">
</div>
<div>
    <button type="button" id="button--add-element">ADD ELEMENT</button>
</div>
<div id="playlist-items-group" class="flex flex--gap-1">
    <div class="flex flex--col flex--jtf-ctr flex--align-start flex--gap-1 form-element">
        <h3>playlist element</h3>
        <!-- video-playlist table -->
        <input type="text" name="multitable://R=04af[].title.string" id="">
        <input type="text" name="multitable://R=04af[].description.string" id="">
        <!-- video-files table -->
        <input type="file" name="multitable://F=058e.video-min[R=04af,R=0025].binary" id="" accept=".mkv, .mp4">
        <button class="playlist-element--close-button" type="button">X</button>
    </div>
</div>

```



# dev-flow

## 26.03.11

```html
<!-- 
    разберем строку: <input type="text" name="multitable://R=0025.last-name.string" id="">
    и строку: <input type="file" name="multitable://F=018e.logo.binary" id="" accept=".img, .jpeg, .png">
    <multitable> - protocol id; 
    <://> - delimeter; 
    <R=dddd> - тип группы, где "R"(regular) "F"(fille) "00" - шестнадцатеричный код группы  "25"- код БД таблицы
        т.е в форме не нужно указывать название таблицы, т.к. это уже заключено в коде,-
        на сервере для каждого кода ассоциирована конкретная таблица
        например: 
        R=00<25> - "USERS"
        R=00<af> - "VIDEO-PLAYLIST"
        F=01<8e> - "VIDEO-FILES"
    <last-name> - имя столбца в строке таблицы
    <string> - тип данных для базы данных, это тоже лучше выразить в коде
-->
<input type="text" name="multitable://R=0025.last-name.string" id="">
<input type="file" name="multitable://R=0025.avatar.binary" id="" accept=".img, .jpeg, .png">
<input type="file" name="multitable://R=0025.thumb-nail.binary" id="" accept=".img, .jpeg, .png">
<input type="file" name="multitable://F=018e.logo.binary" id="" accept=".img, .jpeg, .png">

<input type="text" name="multitable://R=02af.title.string" id="">
<input type="text" name="multitable://R=02af.description.string" id="">
<input type="file" name="multitable://F=038e.video-min.binary" id="" accept=".mkv, .mp4">
```
# patterns:

- schema
- transaction