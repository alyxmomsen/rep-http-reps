

function parseHeadersPart (formDataPartString) {

    const headersRows = formDataPartString.split('\r\n');

    const headers = {};
    headersRows.forEach(row => {
        const [key , value] = row.split(': ') ;
        if(key && value) {
            headers[key.toLowerCase()] = value ;
        }
    });

    const contentDisposition = headers['content-disposition'] ;
    const contentType = headers['content-type'] || null ;

    if(!contentDisposition && !contentType) throw new Error('no content-type of content-disposition in form data part headers'.toUpperCase());

    const extractAttrByAttrName = createContentDispositionParser(contentDisposition , extractContentDispositionAttr);

    const nameAttr = extractAttrByAttrName('name');
    const filenameAttr = extractAttrByAttrName('filename');

    return {
        contentType , nameAttr , filenameAttr
    };
}

module.exports = parseHeadersPart ;

// utils

function createContentDispositionParser (contentDisposition , handler) {

    return (attrName) => handler(contentDisposition , attrName);
}

function extractContentDispositionAttr (contentDisposition , attrName) {
    const regex = new RegExp(`${attrName}="([^"]+)"`);
    const match = contentDisposition.match(regex);
    const toReturn = match ? match[1] : null

    return toReturn/* match ? match[1] : null */
}