const _findIndex = require("../router/utils/find-index");

class CustomStoreManager {

    async #compileItem (databundle , behavior) {

        const bundle = await behavior(databundle);

        if(bundle === null) return ;
        
        const nameInputBundle = await parseNameAttribut(bundle.contentDisposition.name);

        const _bundle = {
            id:nameInputBundle.id ,
            contentType:bundle.contentType ,
            body:bundle.body ,
            name:nameInputBundle.name ,
            type:nameInputBundle.type ,
            targetId:nameInputBundle.targetId ,
        } ;

        console.log({_bundle});

        if(_bundle.type === 'subj') {

            if(this.#files[_bundle.type] === undefined) {
                
                this.#files[_bundle.type] = {} ;
            }

            const file = this.#files[_bundle.type] ;

            for (const [key , value] of Object.entries(_bundle)) {
                
                if(key === 'type') {
                    continue ;
                }

                file[key] = value ;
            }

            return ;
        }

        if(_bundle.type == 'attr') {

            console.log('set attr');

            const subjectId = _bundle.targetId ;

            const file = this.#files[subjectId] ;

            if(file === undefined) {
                
                return ;
            } 


            if(file.metadata === undefined) {
                file.metadata = {} ;
            }

            file.metadata[_bundle.name] = _bundle.body ;


        }

        console.log({files:this.#files});
    }

    async #uploadFiles (bundle) {



    }

    async gulp(databundle) {

        const item = await this.#compileItem(databundle , behavior);
    }

    #files;
    #items;

    constructor() {
        this.#files = {} ;
        this.#items = [];
    }
}

module.exports = CustomStoreManager;

async function parseNameAttribut(nameAttr) {

    const [subject , target] = nameAttr.split('--')

    console.log({subject , target});

    const [type , id, name] = subject.split('.');

    return {
        type ,
        id ,
        name ,
        targetId:target ,
    }
}

async function behavior(dataBufferPart) {
    
    const bodySeparator = '\r\n\r\n';

    const separatorBuffer = Buffer.from(bodySeparator);

    const _index = await _findIndex(dataBufferPart , separatorBuffer);

    if(_index === -1) {
        console.log('incorrect part'.toUpperCase());
        return null ;
    }

    const headersPart = dataBufferPart.subarray(0 , _index) ;

    let bodyPartEndBufferIndex = dataBufferPart.length ;

    if(
        dataBufferPart[bodyPartEndBufferIndex - 2] === 0x0d 
        && dataBufferPart[bodyPartEndBufferIndex - 1] === 0x0a
    ) {
        bodyPartEndBufferIndex -= 2 ;
    }

    const bodyPart = dataBufferPart.subarray(
            _index + separatorBuffer.length , 
            bodyPartEndBufferIndex
        ) ;

    const headerPartString = headersPart.toString('utf-8');

    const dataHeaders = await parseHeadersPartString(headerPartString);

    const contentDispositionHeader = dataHeaders.conentDisposition ;

    const bundle  = {
        body:bodyPart ,
        contentType:dataHeaders.contentType ,
        contentDisposition:await parseContentDispositionHeader(contentDispositionHeader) ,

    }

    return bundle ;
}

async function parseContentDispositionHeader (contentDispHeader) {
    
    if(contentDispHeader === null) return null ;

    const name = contentDispHeader.match(/name="([^"]+)"/);
    const filename = contentDispHeader.match(/filename="([^"]+)"/);

    return {
        name:name ? name[1] : null ,
        filename:filename ? filename[1] : null ,
    }
}

async function parseHeadersPartString (headerPartString) {
    
    const rows = headerPartString.split('\r\n');
    const headers = {} ;
    rows.forEach((row) => {

        const [key , value] = row.split(': ');

        if(key && value) {
            headers[key.toLowerCase()] = value ;
        }

    });

    return {
        conentDisposition:headers['content-disposition'] || null ,
        contentType:headers['content-type'] || null ,
    }

}