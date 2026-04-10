const mw = [];

async function executeMiddleware(middleware, finalHandler, payload) {
    let index = 0;

    const next = async (nextPayload) => {
        if (index < middleware.length) {
            const currentIndex = index++;
            const handler = middleware[currentIndex];
            try {
                await handler(next, nextPayload);
            } catch (err) {
                throw err;
            }
        } else if (finalHandler) {
            await finalHandler(next, nextPayload);
        }
    };

    if (middleware.length > 0) {
        await next(payload);
        return;
    }

    if (finalHandler) {
        console.log('final handler');
        await finalHandler(next, payload);
    }
}

// concrete factory
function mw1Factory(deps = {}) {
    return async (next, payload) => {
        console.log({ payload });
        await next({ data: 'foo' });
    };
}

// concrete factory
function mw2Factory(deps = {}) {
    return async (next, payload) => {
        console.log({ payload });
        await next({ data: 'bar' });
    };
}

// concrete factory
function mw3Factory(deps = {}) {
    return async (next, payload) => {
        console.log({ payload });
        // await next({data:'baz'});
    };
}

function addMiddleware(...middleware) {
    middleware.forEach((mw_) => {
        mw.push(mw_);
    });
}

addMiddleware(mw1Factory(), mw2Factory());

executeMiddleware(mw, mw3Factory(), { hello: 'world' });
