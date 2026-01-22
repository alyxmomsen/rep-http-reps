const storageManager = require("../../../../services/custom-store-manager/custom-storage-manager");

class FormDataCompiler {

    // gulp one 
    async gulpOne ({body , contentType , filename  , nameAttribute}) {

        const {id , name , targetId , type} = await this.#parseNameAttribute(nameAttribute);

        this.#pieces.push(
            {
                id , name , 
                targetId , type , 
                body ,contentType , 
                filename
            }
        );
    }

    // pack these pieces
    async linkPieces (/* {storageManager} */) {
        
        const matchers = [
            await matcherFactoryDecorator('subj' , (piece) => {
                console.log(`call subj handler...`);

                if(this.#files[piece.id] === undefined) {
                    this.#files[piece.id] = {} ;
                }

                const file = this.#files[piece.id] ;

                for (const [key, value] of Object.entries(piece)) {

                    if(key === 'id') continue ;

                    file[key] = value ;
                }

                file.meta = {} ;
            }),
            await matcherFactoryDecorator('attr' , (piece) => {
                console.log(`call attr handler...`);

                const file = this.#files[piece.targetId] ;

                if(file === undefined) {
                    // handle
                    return ;
                }

                if(file.meta === undefined) {
                    file.meta = {} ;
                }

                const meta = file.meta ;

                if(piece.name && piece.body) {
                    meta[piece.name] = piece.body ;
                }
                

            }),
        ];

        for (const piece of this.#pieces) {
            
            
            for (const matcher of matchers) {
                const handler = await matcher(piece.type);
                if(handler===null) continue ;
                handler(piece);
            }
        }

        return this.#files ;

    }

    async #parseNameAttribute (nameAttribute) {
        

        const [subj , target] = nameAttribute.split('--');

        const [type ,id , name] = subj.split('.');

        return {
            targetId:target || null ,
            type:type || null, 
            id:id || null ,
            name:name || null ,
        }

    }

    #pieces;
    #queue;
    #files;

    constructor () {
        this.#pieces = [] ;
        this.#files = {};
        this.#queue = [];
    }
}

module.exports = FormDataCompiler ;

async function matcherFactoryDecorator (typeMatcherString , handler) {
    
    return async (pieceTypeString) => {

        if(pieceTypeString === typeMatcherString) {
            return async (piece) => {

                await handler(piece);
            }
        }

        return null ;

    }
}