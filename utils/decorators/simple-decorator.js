
async function simpleDecorator(payload , fn) {
    
    console.log({payload});

    return async (...params) => {

        await fn(payload , ...params);
    }

}

module.exports = simpleDecorator;

async function matcher(payload , type) {
    
    const { params } = req;

    const { type:_type , handler } = payload;

    if (
        typeof _type !== 'string'
        || typeof type !== "string"
    ) throw new Error('payload.type and type must be "string" type')

    if (type === _type) {
        return simpleDecorator({
            foo: 'bar', handler: () => {
                console.log('simple handler');
            }
        }, () => {
            
        });
    }

    return null
}