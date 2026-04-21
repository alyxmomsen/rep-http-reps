module.exports = {
    parseContentDisposition,
    splitHeaders,
    parseFormDataPart,
    splitFormData,
    findSeparatorIndex,
};

/**
 *
 * @param {string} contentDispositionHeaderData
 * @returns {{
 *  name: string | null;
 *  filename: string | null;
 * }}
 */
function parseContentDisposition(contentDispositionHeaderData) {
    const nameMatch = contentDispositionHeaderData.match(/name="([^"]+)"/);
    const filenameMatch =
        contentDispositionHeaderData.match(/filename="([^"]+)"/);

    return {
        name: (nameMatch && nameMatch[1]) || null,
        filename: (filenameMatch && filenameMatch[1]) || null,
    };
}

/**
 *
 * @param {string} headersRaw
 */
function splitHeaders(headersRaw) {
    const headers = {};

    const separator = '\r\n';

    const rows = headersRaw.split(separator);
    rows.forEach((row) => {
        const [key, value] = row.split(': ');
        if (key && value) {
            const normalizedKey = key.toLowerCase();
            headers[normalizedKey] = value;
        }
    });

    return headers;
}

/**
 *
 * @param {Buffer<ArrayBuffer>} part
 */
function parseFormDataPart(part) {
    const separatorBuffer = Buffer.from(`\r\n\r\n`);
    const separatorIndex = findSeparatorIndex(part, separatorBuffer);

    if (separatorIndex === -1) {
        throw new Error(
            `MultipartFormdataHandler/fn.parseFormDataPart: incorrect part`
        );
    }

    const headers = part.subarray(0, separatorIndex);

    let bodyEndIndex = part.length;

    if (part[bodyEndIndex - 2] === 0x0d && part[bodyEndIndex - 1]) {
        bodyEndIndex -= 2;
    }

    const body = part.subarray(
        separatorIndex + separatorBuffer.length,
        bodyEndIndex
    );

    return {
        headers,
        body,
    };
}

/**
 *
 * @param {Buffer<ArrayBuffer>} data
 * @param {Buffer<ArrayBuffer>} separator
 */
function splitFormData(data, separator) {
    let start = 0;
    let index = 0;

    const parts = [];

    while ((index = findSeparatorIndex(data, separator, start)) !== -1) {
        parts.push(data.subarray(start, index));
        start = index + separator.length;

        if (data[start] === 0x0d && data[start + 1] === 0x0a) {
            start += 2;
        }
    }

    parts.push(data.subarray(start));

    return parts;
}

/**
 *
 * @param {Buffer<ArrayBuffer>} data
 * @param {Buffer<ArrayBuffer>} separator
 * @param {number} start
 */
function findSeparatorIndex(data, separator, start = 0) {
    for (let index = start; index <= data.length - separator.length; index++) {
        let found = true;
        for (let j = 0; j < separator.length; j++) {
            if (data[index + j] !== separator[j]) {
                found = false;
                break;
            }
        }
        if (found === true) {
            return index;
        }
    }

    return -1;
}
