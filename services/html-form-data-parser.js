
class HTMLFormDataParser {

    async getFiles () {
        return this.#files ;
    }

    async gulp (dataPartBundle) {

        const {
            filename , 
            contentType ,
            inputname ,
            body ,
        } = dataPartBundle ;

        console.log('gulp: ' , {filename , contentType  ,inputname , body});

        const matchers = [
            await _matchersFactory('file' , (subj , target , filename , contentType , body) => {
                
                console.log('handler' ,{filename , contentType ,body , subj , target});

                this.#files.set(subj.id , {
                    filename ,
                    contentType , 
                    body ,
                    surname:subj.surname ,
                });



            }) , 
            // await _matchersFactory('file' , (subj , target , filename , contentType , body) => {

            // }) , 
            // await _matchersFactory('file' , (subj , target , filename , contentType , body) => {

            // }) , 
            // await _matchersFactory('file' , (subj , target , filename , contentType , body) => {

            // }) , 
        ];

        const { subj , target } = this.#parseInputName(inputname);

        for (const matcher of matchers) {
            const handlerlike = matcher(subj.type);
            if (handlerlike === null) {
                continue ;
            }

            handlerlike(subj ,  target , filename , contentType , body);
        }

    }

    #parseInputName (data) {

        const [subj , target] = data.split('--');

        const [type , id , surname] = subj.split('.');

        return {
            subj:{
                type ,
                id ,
                surname ,
            } ,
            target:{
                id:target ,
            }
        }
    }

    #files ;
    #queue

    constructor () {

        this.#files = new Map();
    }
}

module.exports = HTMLFormDataParser ;


async function _matchersFactory (filter , handler) {
    return (_filter) => {

        if(_filter === filter) {
            return (subj , target , filename , contentType , body) => {
                handler(subj , target , filename , contentType  , body);
            }
        }

        return null ;

    }
}