/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./webpack-src/index.js"
/*!******************************!*\
  !*** ./webpack-src/index.js ***!
  \******************************/
(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

eval("{\r\nconst _Unit = __webpack_require__(/*! ./module */ \"./webpack-src/module.js\");\r\n\r\nasync function main (params) {\r\n\r\n    window.addEventListener(\"DOMContentLoaded\"  , () => {\r\n\r\n        const canvas = document.getElementById('canvas');\r\n\r\n        if(canvas === null || canvas instanceof HTMLCanvasElement === false) {\r\n            return ;\r\n        }\r\n\r\n        const keys = {};\r\n\r\n        window.addEventListener(\"keydown\" , (e) => {\r\n\r\n            keys[e.key] = true ;\r\n\r\n        });\r\n\r\n        window.addEventListener(\"keyup\" , (e) => {\r\n\r\n            keys[e.key] = false ;\r\n\r\n        });\r\n\r\n        const ctx = canvas.getContext(\"2d\");\r\n\r\n        let timeoutid = Infinity ;\r\n        let deltax = 0 ;\r\n        let deltay = 0 ;\r\n\r\n\r\n        const user = new _Unit();\r\n\r\n        // const pos = {\r\n        //     x:0 , \r\n        //     y:0 ,\r\n        // }\r\n\r\n        const maxDelta = 3 ;\r\n        const deltastepabs = 0.2 ;\r\n        const deltaDemph = 1.02 ;\r\n\r\n        const athmosphere = {\r\n            x:0.0 , \r\n            y:0.2 ,\r\n        }\r\n\r\n\r\n        const elems = [] ;\r\n\r\n        const units = [\r\n            new _Unit() ,\r\n            new _Unit() ,\r\n            new _Unit() ,\r\n        ] ;\r\n\r\n        // elems.push({x:Math.floor(Math.random() * canvas.width - 100) , y:Math.floor(Math.random() * canvas.height - 100) , widht:100 , height:100 , color:'black' , deltax:0 , deltay:0});\r\n        // elems.push({x:Math.floor(Math.random() * canvas.width - 100) , y:Math.floor(Math.random() * canvas.height - 100) , widht:100 , height:100 , color:'black' , deltax:0 , deltay:0});\r\n        // elems.push({x:Math.floor(Math.random() * canvas.width - 100) , y:Math.floor(Math.random() * canvas.height - 100) , widht:100 , height:100 , color:'black' , deltax:0 , deltay:0});\r\n        // elems.push({x:Math.floor(Math.random() * canvas.width - 100) , y:Math.floor(Math.random() * canvas.height - 100) , widht:100 , height:100 , color:'black' , deltax:0 , deltay:0});\r\n        \r\n        \r\n        \r\n        const update = () => {\r\n\r\n            const random = Math.floor(Math.random() * 100);\r\n            \r\n            if(random > 90) {\r\n\r\n                elems.push({x:Math.floor(Math.random() * canvas.width - 100) , y:Math.floor(Math.random() * canvas.height - 100) , widht:10 , height:10 , color:'white' , deltax:0 , deltay:0});\r\n            }\r\n\r\n\r\n            if(keys['w']) {\r\n\r\n                if(Math.abs(deltay - deltastepabs) < maxDelta) {\r\n                    deltay -= deltastepabs ;\r\n                }\r\n            } \r\n            else if (keys['s'] !== true ) {\r\n                \r\n                deltay /= deltaDemph ;\r\n\r\n            }\r\n            \r\n            if(keys['s']) {\r\n\r\n                if(Math.abs(deltay + deltastepabs) < maxDelta) {\r\n                    deltay += deltastepabs ;\r\n                }\r\n            }\r\n            else if (keys['w'] !== true ) {\r\n                \r\n                deltay /= deltaDemph;\r\n\r\n            } \r\n\r\n            if(keys['a']) {\r\n\r\n                if(Math.abs(deltax - deltastepabs) < maxDelta) {\r\n                    deltax -= deltastepabs ;\r\n                }\r\n            } \r\n            else if (keys['d'] !== true ) {\r\n                \r\n                deltax /= deltaDemph ;\r\n\r\n            } \r\n            \r\n            if(keys['d']) {\r\n\r\n                if(Math.abs(deltax + deltastepabs) < maxDelta) {\r\n                    deltax += deltastepabs ;\r\n                }\r\n            } \r\n            else if (keys['a'] !== true ) {\r\n                \r\n                deltax /= deltaDemph ;\r\n\r\n            } \r\n\r\n            // deltay += athmosphere.y ;\r\n\r\n            user.update(athmosphere , deltax , deltay);\r\n            \r\n            // console.log({deltax , deltay});\r\n\r\n            ctx.fillStyle = '#59798c' ;\r\n            ctx.fillRect(0 , 0 , canvas.width , canvas.height);\r\n\r\n            const toDelete = [\r\n\r\n            ]\r\n\r\n            user.render(ctx);\r\n\r\n            for (let i=0 ; i<units.length ; i++) {\r\n\r\n\r\n                units[i].update(athmosphere , 0 , 0);\r\n\r\n                units[i].render(ctx);\r\n\r\n            }\r\n\r\n            timeoutid = setTimeout(update , 0) ;\r\n        }\r\n\r\n        update();\r\n    });\r\n}\r\n\r\nmain();\n\n//# sourceURL=webpack://http-server/./webpack-src/index.js?\n}");

/***/ },

/***/ "./webpack-src/module.js"
/*!*******************************!*\
  !*** ./webpack-src/module.js ***!
  \*******************************/
(module) {

eval("{\r\nclass _Unit {\r\n\r\n    #position;\r\n    #dimesions;\r\n\r\n    #posdeltay;\r\n    #posdeltax;\r\n\r\n    update(atmosphere , deltax , deltay) {\r\n\r\n        this.#posdeltax = deltax ;\r\n        this.#posdeltay = deltay ;\r\n        this.#position.x += (this.#posdeltax + atmosphere.x) ;\r\n        this.#position.y += (this.#posdeltay + atmosphere.y) ;\r\n\r\n    }\r\n\r\n    render (ctx) {\r\n\r\n        if(ctx instanceof CanvasRenderingContext2D === false) return;\r\n        console.log('log', this.#position.x , this.#dimesions.width);\r\n    \r\n        ctx.fillStyle = \"#712635\" ;\r\n        ctx.fillRect(\r\n            this.#position.x , \r\n            this.#position.y , \r\n            this.#dimesions.width , \r\n            this.#dimesions.height\r\n        );\r\n        // ctx.fillRect(\r\n        //     0 , 0 , 100 , 100\r\n        // );\r\n    }\r\n\r\n    constructor (posx, posy) {\r\n        this.#position = new Position(posx , posy);\r\n        this.#dimesions = new Dimensions(100 , 100) ;\r\n        this.#posdeltax = 0 ;\r\n        this.#posdeltay = 0 ;\r\n    }\r\n}\r\n\r\nclass Dimensions {\r\n\r\n    width;\r\n    height;\r\n\r\n    constructor (width , height) {\r\n        this.width = width ;\r\n        this.height = height;\r\n    }\r\n}\r\n\r\nclass Position {\r\n    x ;\r\n    y ;\r\n\r\n    constructor (x , y) {\r\n\r\n        this.x = x === undefined ? Math.floor(Math.random() * 500) : x ; \r\n        this.y = y === undefined ? Math.floor(Math.random() * 500) : y ;\r\n    }\r\n}\r\n\r\nmodule.exports =  _Unit;\n\n//# sourceURL=webpack://http-server/./webpack-src/module.js?\n}");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./webpack-src/index.js");
/******/ 	
/******/ })()
;