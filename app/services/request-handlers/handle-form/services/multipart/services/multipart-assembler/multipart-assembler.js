const findIndexInBuffer = require("../../../../../../../../utils/find-index-in-buffer");
const metaTypeHandler = require("./utils/meta-semanthic-type-handler");
const subjectTypeHandler = require("./utils/subject-semanthic-type-handler");

class MultipartAssembler {

    getAssembledItemsArr () {
     
        const arr = [];
        for (const [semanticId , bundle] of this.#files.entries()) {
            
            arr.push(bundle);
        }

        return arr ;
    }

    gulpOnePiece (payload) {  

        console.log('gulp one: ' , {payload});
        
        const {
            body,
            semantic,
            filename,
            contentType,
        } = payload ;

        const { 
            type:semanticType,
            id:semanthicId,
            name:semanthicName,
            target:semanthicTarget,
        } = semantic ;

        
        // assemble
        
        const matcherContext = {
            files:this.#files , 
            queue:this.#queue , 
            payload:{
                semantic ,
                /* type:semanticType, */ filename, 
                contentType, 
                /* id:semanthicId, */ body, 
                /* name:semanthicName, target:semanthicTarget,  */
            },
        }
        
        // console.log({payload , matcherContext});
        const factory = createMatcerFactory(matcherContext);

        const matchers = [
            factory('subject' , subjectTypeHandler) ,
            factory('meta' , metaTypeHandler) ,
        ] ;

        for (const matcher of matchers) {

            const handler = matcher(semanticType) ;
            if(!handler) continue ;
            handler();
        }
    }

    #files;
    #queue;

    constructor () {
        this.#files = new Map();
        this.#queue = [] ;
    }
}

module.exports = MultipartAssembler ;

// utils

function createMatcerFactory (context) {
    
    return (typeMatcher , handler) => {
        return semanticTypeMatcherFactory(typeMatcher, context , handler);
    }
}

function semanticTypeMatcherFactory (typeMatcher , context , handler) {
    
    return (testTypeString) => {

        console.log({testTypeString , typeMatcher});

        if(testTypeString === typeMatcher ) {



            return () => {

                handler(context);
            }
        }

        return null ;

    }
}