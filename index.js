const dotenv = require('dotenv');
dotenv.config({});
const http = require('http');
const { router } = require('./services/router/controller/router.controller');

const httpServer = http.createServer(async (req, res) => {
    await router.handleRequest(req, res);
});

const startServer = async () => {
    await printGreatings()();
    httpServer.listen(3333, '0.0.0.0', async () => {
        console.log(`server started`);
    });
};

startServer();

/**
 *
 * @param {Object} deps
 * @returns {() => Promise<void>}
 */
function printGreatings(deps = {}) {
    const fn = async function () {
        return new Promise(async (resolve, reject) => {
            const messageParts = [
                `welcome to the Knight Bus!`,
                `Emergency transport for stranded witch or wizzard.`,
                `My name is Stan Shunpike,`,
                `and i\`ll be you conductor for this evening`,
            ];

            const message = messageParts.join(`\r\n`);

            // console.log(`\x1b[38;2;255;0;255m` + message + `\x1b[0m`);

            const TimoutBuffer = {
                id: Infinity,
                duration: 1000,
                messageLength: 0,
                appearMessage: '',
            };

            const print = async function () {
                if (++TimoutBuffer.messageLength <= message.length) {
                    TimoutBuffer.appearMessage = message.slice(
                        0,
                        TimoutBuffer.messageLength
                    );
                } else {
                    if (TimoutBuffer.id !== Infinity) {
                        clearTimeout(TimoutBuffer.id);
                    }

                    return resolve();
                }
                console.clear();
                console.log(
                    `\x1b[38;2;` +
                        `${Math.floor(Math.random() * 255)};` +
                        `${Math.floor(Math.random() * 255)};` +
                        `${Math.floor(Math.random() * 255)}m` +
                        TimoutBuffer.appearMessage +
                        `\x1b[0m`
                );

                if (TimoutBuffer.id !== Infinity) {
                    clearTimeout(TimoutBuffer.id);
                }
                TimoutBuffer.id = setTimeout(
                    print,
                    Math.floor(Math.random() * 5)
                );
            };

            await print();
        });
    };

    return fn;
}
