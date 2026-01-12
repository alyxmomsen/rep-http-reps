
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
            await _matchersFactory('file' , (subj , target) => {
                
                console.log('handler' ,{subj , target });

                this.#files.set(subj.id , {
                    filename:subj.filename ,
                    contentType:subj.contentType , 
                    body:subj.body ,
                    surname:subj.surname ,
                });
            }) , 
            await _matchersFactory('caption' , (subj , target) => {

                console.log('caption: ' , {subj , target});

                const targetBundle = this.#files.get(target.id);

                if(targetBundle === undefined) {
                    return ;
                }

                targetBundle[subj.surname] = subj.body.toString('utf-8'); 

            }) , 
            await _matchersFactory('option' , (subj , target) => {
                const targetBundle = this.#files.get(target.id);

                if(targetBundle === undefined) {
                    return ;
                }

                targetBundle[subj.surname] = subj.body.toString('utf-8'); 

            }) , 
            // await _matchersFactory('file' , (subj , target , filename , contentType , body) => {

            // }) , 
        ];

        const { subj , target } = this.#parseInputName(inputname);

        subj.filename = filename ;
        subj.contentType = contentType ;
        subj.body = body ;

        for (const matcher of matchers) {
            const handlerlike = matcher(subj.type);
            if (handlerlike === null) {
                continue ;
            }

            handlerlike(subj ,  target);
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
            return (subj , target) => {
                handler(subj , target);
            }
        }

        return null ;

    }
}