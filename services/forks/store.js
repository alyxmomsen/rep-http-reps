

class _Store {
    
    add() {

    }    

    #items;

    constructor () {
        this.#items = new Map(); 
    }
}

const store = new _Store();

process.addListener("message" , (message) => {

    console.log({message});

})