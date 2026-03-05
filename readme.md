
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