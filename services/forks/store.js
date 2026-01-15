

class _Store {
    
    #files;
    
    add(type , payload) {

        console.log('store method: ' , type , payload );
    }

    constructor () {
        this.#files = new Map();
    }
}

const store = new _Store();

process.addListener("message" , (message) => {

    console.log({message});

    // store.add(message.type , message.payload);
    
})