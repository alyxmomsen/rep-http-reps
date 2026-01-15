// const childprocess = require('child_process')
class StoreAdapter {

    #files;

    async getAllFiles() {
        return this.#files ;
    }

    async gulp(type , payload) {

        console.log({payload});

        const schema = {
            'file':{
                handler: (payload) => {
                    this.#files.set(payload.id , {
                        name:payload.id ,
                        targetId:payload.targetId ,
                        body:payload.body ,
                        originalName:payload.originalFilename ,
                    });
                } ,
            } ,
            'caption':{
                handler:(payload) => {
                    const file = this.#files.get(payload.targetid);
                    if(file === undefined) return ;
                    file[payload.name] = payload.body ;
                }
            } ,
            'option': {
                handler:(payload) => {
                    console.log('option handler');
                }
            }
        }

        const _type = schema[type];

        if(_type === undefined) {
            return ;
        }

        _type.handler.bind(this)(payload);
    }

    // #store;

    constructor () {
        
        this.#files = new Map();
        // this.#store = childprocess.fork('./services/forks/store.js');
    }
}

module.exports = StoreAdapter ;