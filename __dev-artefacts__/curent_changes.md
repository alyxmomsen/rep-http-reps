

# this.#assembleRouteBundle

добавлена новая обработка URL

let regexTemplate = template.replace(/\*/g, '.*');

# app\services\request-handlers\public\handle-public.js

# app\services\request-handlers\static\static-handler.js

обрабатывает запросы на статику

# build-react.js

# app\services\request-handlers\react\react-handler.js

# app\services\router\controller\http-controller.js

добавлены новые andpoints :

// this first
<!-- 
этот роут обрабатывается в первую очередь
на тот случай, если нужно обрабатывать статические файлы которые могут случайно 
совпадать с другими маршрутами
-->
router.get('/static/*', async (req, res) => await handleStatic(req, res));

router.get('/app', async (req, res) => handleReactApp(req , res));
router.get('/api/videos', async (req, res) => {});
router.get('/video/:filename' , async (req  ,res) => {});

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   .gitignore
        modified:   app/services/request-handlers/public/handle-public.js
        modified:   app/services/router/controller/http-controller.js
        modified:   app/services/router/router.js
        modified:   build-react.js
        modified:   index.js

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        app/services/request-handlers/react/
        app/services/request-handlers/static/
        client/
        public/react.html
        public/react/
        public/static/