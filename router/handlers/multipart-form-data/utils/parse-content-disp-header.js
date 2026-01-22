async function parseContentDispositionHeader(contentDispositionHeader) {

    const namematch  = contentDispositionHeader.match(/name="([^"]+)"/);
    const filenamematch = contentDispositionHeader.match(/filename="([^"]+)"/);

    return {
        nameAttribute:namematch === null ? null : namematch[1] ,
        filename:filenamematch === null ? null : filenamematch[1] ,
    }
}

module.exports = parseContentDispositionHeader ;