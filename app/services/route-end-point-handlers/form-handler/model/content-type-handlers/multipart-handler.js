const { IncomingMessage, ServerResponse } = require('http');
const { findSeparatorIndexInBuffer } = require('../../../../../utils/find-index-in-buffer-by-separator');

/**
 * 
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 * @param {string} rawBoundary 
 */
async function multipartHandler(req, res, rawBoundary) {
    
	if(!rawBoundary) {
		throw new Error(`payload is not provided`);
	}
	
	const boundary = rawBoundary.match(/boundary=(----[^\s$]+)/)?.[1] || null;

	if(!boundary) {
		throw new Error(`the buffer string is not provided`);
	}

	const formDataBufferParts = [];
	let bufferDataCounter = 0;
	req.on('data', (chunk) => {
		bufferDataCounter += chunk.length;
		formDataBufferParts.push(chunk);
	});

	req.on('end', () => {
		console.log(`size: ${bufferDataCounter}`);
		const wholeBuffer = Buffer.concat(formDataBufferParts);
		const parts = splitBuffer(wholeBuffer, Buffer.from(`--${boundary}`));
		
		for (const part of parts) {
			continue;
			try {
				const { headers:formDataPartHeaders , body } = splitFormDataBufferPart(part);
				console.log(formDataPartHeaders);
				const stringyfiedFormDataPartHeaders = formDataPartHeaders.toString('utf-8');
				const headers = parseFormDataPartHeaders(stringyfiedFormDataPartHeaders);
				// console.log({headers:headers, body});
			}catch(e){
				
				console.log({e});
			}
			
		}

		res.end(JSON.stringify({status:'handled' , rawBoundary , boundary}));
	});
	
	
}

module.exports = { multipartHandler } ;

function parseFormDataPartHeaders (formDataPartHeaders) {
	// console.log({formDataPartHeaders});
	const headers = {};
	const separator = '\r\n';
	const rawHeadersRows = formDataPartHeaders.split(separator);
	for (const row of rawHeadersRows) {
		// console.log({row});
		const [propertyKey, propertyValue] = row.split(/: /);
		// console.log({propertyKey , propertyValue});
		if(!propertyKey || !propertyValue) continue ;
		const lowerCasedPropertyKey = propertyKey.toLowerCase();
		headers[lowerCasedPropertyKey] = propertyValue;
	}
	return headers ;
}

function splitFormDataBufferPart (formDataBufferPart) {
	console.log({formDataBufferPart:formDataBufferPart.toString('utf-8')});
	const separatorBuffer = Buffer.from(`\r\n\r\n`);

	const separatorIndex = findSeparatorIndexInBuffer(formDataBufferPart, separatorBuffer);
	if(separatorIndex === -1) {
		throw new Error(`incorrect form-data part`);
	}
	const headers = formDataBufferPart.subarray(0, separatorIndex);
	// console.log({headers , separatorIndex});
	let bodyEndIndex = formDataBufferPart.length;
	if(formDataBufferPart[bodyEndIndex - 2] === 0x0d && formDataBufferPart[bodyEndIndex - 1]) {
		bodyEndIndex -= 2;
	}
	const body = formDataBufferPart.subarray(separatorIndex + separatorBuffer.length , bodyEndIndex);
	
	return {
		headers,
		body,
	}
}

/** 
 * @param {Buffer<ArrayBuffer>} dataBuffer
 * @param {Buffer<ArrayBuffer>} separatorBuffer
 * @returns {Buffer<ArrayBuffer>[]} 
*/
function splitBuffer (dataBuffer, separatorBuffer) {
	const parts = [];
	let start = 0;
	let index = 0;
	while((index = findSeparatorIndexInBuffer(dataBuffer, separatorBuffer, start)) !== -1){
		console.log({index , separatorBuffer:separatorBuffer.toString('utf-8')});
		const part = dataBuffer.subarray(start, index);
		console.log({part:part.toString('utf-8')});
		start = index + separatorBuffer.length;
		if(dataBuffer[start] === 0x0d && dataBuffer[start + 1] === 0x0a) {
			console.log('check');
			start += 2;
		}
		parts.push(part);
	}
	parts.push(dataBuffer.subarray(start));
	return parts;
}

// function