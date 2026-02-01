const metaTypeHandler = require("./utils/meta-type-handler");
const subjectTypeHandler = require("./utils/subject-type-handler");

class MultipartDataCompiler {

    getAssembledDataArray () {
        const files = [] ;
        for (const [semanticId , file] of this.#files.entries() ) {

            files.push({
                ...file ,
            });
        }

        return files ;
    }

    gulpOnePiece (data) {

        const {contentType , filename , body , semantic} = data ;

        const {type:semanticType , id , name , target} = semantic ;

        console.log({data});

        const decoratedFactory = factoryDecorator(semanticTypeMatcherFactory, {files:this.#files , queue:this.#queue });

        const matchers = [

            decoratedFactory('subj' , subjectTypeHandler) ,
            decoratedFactory('meta' , metaTypeHandler) ,

        ];

        for (const matcher of matchers) {

            const handler = matcher(semanticType);
            if(!handler) continue ;
            handler({
                contentType , filename ,
                body , semantic
            }); 

        }

    }

    #files;
    #queue ;

    constructor () {

        this.#files = new Map();
        this.#queue = [];
    }
}

module.exports = MultipartDataCompiler ;


// utils 


function factoryDecorator (factory  , context ) {

    return (semanticTypeMatcherString , handler) => factory(semanticTypeMatcherString , context , handler);
}

function semanticTypeMatcherFactory (semanticTypeMatcherString  , context , handler) {

    // matcher 
    return (testSemanticTypeString) => {

        // match
        if (testSemanticTypeString === semanticTypeMatcherString) {

            // return handler
            return (payload) => {

                handler(context , payload);
            }

        }

        // ---------
        return null ;

    }

}