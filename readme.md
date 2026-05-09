# Knight Bus

## Why I built this

I built Knight Bus because I wanted to understand what happens under the hood when a form with a file is submitted. I didn't want to rely on magic. I wanted to see every byte of the boundary, every chunk of the stream, every transaction committed or rolled back.

This framework is not a competitor to Express. It's a statement: you can build complex, transactional systems from scratch, and you should understand how they work before you abstract them away.

A lightweight web framework on pure Node.js. No Express. No Multer. Just native modules.

**Knight Bus** is a framework for processing complex HTML forms that involve multiple database tables, file uploads, and transactional guarantees — all described directly in HTML markup via a custom DSL.

> _"Welcome to the Knight Bus! Emergency transport for stranded witch or wizard."_

## 🧠 DSL: `multitable://`

The core idea of Knight Bus is that **an HTML form is a valid description of a database transaction**. This is achieved through a custom URL-like protocol inside the `name` attribute of form inputs.

### Syntax

```
multitable://<tableCode><groupId>.<columnName>.<dataType>
```

| Part         | Example  | Meaning                                         |
| :----------- | :------- | :---------------------------------------------- |
| `tableCode`  | `8e`     | Hex code of the target database table           |
| `groupId`    | `00`     | Groups inputs into one database row             |
| `columnName` | `title`  | Target column in the database                   |
| `dataType`   | `string` | Expected data type (`string`, `link`, `binary`) |

### Example

```html
<!-- Row 1 of video-playlist table -->
<input type="text" name="multitable://8e00.title.string" value="Best Video" />
<input
    type="text"
    name="multitable://8e00.description.string"
    value="A cool video"
/>
<input type="file" name="multitable://8e00.video.link" />

<!-- Row 2 of video-playlist table -->
<input
    type="text"
    name="multitable://8e01.title.string"
    value="Another Video"
/>
<input
    type="text"
    name="multitable://8e01.description.string"
    value="Also cool"
/>
<input type="file" name="multitable://8e01.video.link" />

<!-- Row 1 of users table -->
<input type="text" name="multitable://af00.name.string" value="John" />
<input type="text" name="multitable://af00.last-name.string" value="Doe" />
<input type="file" name="multitable://af00.avatar.link" />
```

This single form submission will:

1. Create two rows in the `video-playlist` table
2. Create one row in the `users` table
3. Upload three files to disk
4. Link the files to their corresponding rows

**No JavaScript required on the client.**

## 🏗 Architecture

The framework processes a form submission through a strict pipeline of architectural patterns.

### 1. Raw Binary Parsing (State Machine)

- **File:** `multi-part-parser.model.js`
- **What it does:** Reads the raw `multipart/form-data` `Buffer` byte by byte, searching for the boundary delimiter, splitting the stream into parts.
- **Why it matters:** No `multer`, no `busboy`. Pure Node.js Buffer manipulation.

### 2. Data Grouping (Interpreter + Visitor)

- **File:** `multi-table-gruping-agent.js`
- **What it does:** Interprets the `multitable://` protocol and routes flat data into a hierarchical structure.

### 3. PreMapper (Two-Phase Processing)

- **File:** `premapper.model.js`
- **What it does:** Transforms the hierarchical data into a **Normalized Intermediate Representation** via recursive schema traversal.
- **Why:** It separates "How the data arrived" from "How the data is stored". It can distinguish file metadata from regular fields without mixing logic.

### 4. PostMapper + StateController (Unit of Work / Saga)

- **File:** `post-mapper.model.js`, `statecontroller.model.js`
- **What it does:** Executes the actual database inserts and file writes with **atomic guarantees**.
- **Pattern:** **Unit of Work**.
    - Each action (Write File, Insert DB Row) is wrapped in a `StateController`.
    - The controller has a `try` (do it) and a `rollback` (undo it).
    - If **any** step fails, the entire `StateController` rolls back **all** completed steps.
- **Result:** You will never have a file on disk without a corresponding database row.

## ✅ Tests

The project includes **21 unit tests** (Jest) covering the core transactional logic:

- `PostMapper` — orchestration of groups and controllers
- `StateController` / `LeafTryBehavior` — handling of `data`, `file`, and `link` actions
- `SecondTryBehavior` — processing of a single database row
- `InMemoryDataBase` — CRUD operations

## 📂 Project Structure

```
├── index.js
├── services/
│   ├── router/                       # HTTP Router with middleware
│   ├── final-handlers/
│   │   └── handle-form/              # Form processing pipeline
│   │       ├── routes/multipart-route/
│   │       │   ├── multipart-route.model.js   # Main multipart handler
│   │       │   └── services/
│   │       │       ├── pre-mapper/            # Data normalization
│   │       │       └── post-mapper/           # Transactional commit
│   │       └── utils/                         # Buffer & header parsing
│   ├── in-memory-db/                 # In-memory database
│   ├── db-adapter/                   # Schema-based validation
│   ├── file-manager/                 # Stream-based file I/O
│   └── utit-of-work/                 # StateController (Strategy Pattern)
├── assets/                           # Frontend (HTML, CSS, JS)
└── __test__/                         # Unit tests
```

## 🚀 Running the Project

1. **Install:** `npm install`
2. **Env:** Copy `.env.example` to `.env`
3. **Create Dir:** `mkdir uploads`
4. **Start:** `node index.js`
5. **Open:** `http://localhost:3333/l/form`
