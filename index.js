const http = require('http');
const { MainServiceFactory } = require("./services/main/main.controller");
const { MainService } = require("./services/main/main.model");
const { pathes } = require("./services/pathes/pathes.model");
const { DefaulScan } = require("./services/scan-dir/behaviors/default.behavior");
const { ScanDirFactory } = require("./services/scan-dir/scan-dir.controller");
const { HTTPRouter } = require('./services/http-router/model/router.model');
const { router } = require('./services/http-router/controller/router.controller');

const HTTPServer = http.createServer(RequestListenerFactory({
    router:router,
}));

/**
 *
 * @param {Object} deps
 * @param {MainService} deps.mainService
 * @param {http.Server} deps.httpServer
 * @returns
 */
function start(deps = {}) {
    console.log("factory called...");

    if (!deps.mainService) {
        throw new Error(`start/factory: deps.mainService required`);
    }

    if (!deps.httpServer) {
        throw new Error(`start/factory: deps.httpServer required`);
    }

    const fn = async function () {

        const port = 3333;
        const host = '127.0.0.1';

        deps.httpServer.listen(port, host, () => {
            console.log(`served: ${port} ${host}`);
        });

        deps.mainService.process();
    };

    return fn;
}

start({
	mainService:new MainServiceFactory({
		scanDirFactory:new ScanDirFactory().Instance({
			scanBehavior:new DefaulScan({
				path:'C://Users//AnturNevut//Desktop//polnoch-gp',
			}),
		}),
	}).Instance(),
    httpServer:HTTPServer,
})();


/**
 * 
 * @param {Object} deps 
 * @param {HTTPRouter} deps.router 
 * @returns 
 */
function RequestListenerFactory (deps = {}) {

    if (!deps.router) {
        throw new Error(`deps.router required`);
    }

    /**
     * 
     * @param {http.IncomingMessage} req 
     * @param {http.ServerResponse} res 
     */
    const fn = async function (req, res) {
        await deps.router.handleRequest(req, res);
    }

    return fn;
}
