const { IncomingMessage, ServerResponse } = require('http');
const { findSeparatorIndexInBuffer } = require('../../../../utils/find-index-in-buffer-by-separator');

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

	return new Promise((res , rej) => {

		const formDataBufferParts = [];
		let bufferDataCounter = 0;
		req.on('data', (chunk) => {
			bufferDataCounter += chunk.length;
			formDataBufferParts.push(chunk);
		});

		req.on('error' , (error) => {
			rej({
				error,
			});
		});
	
		req.on('end', () => {
			console.log(`size: ${bufferDataCounter}`);
			const wholeBuffer = Buffer.concat(formDataBufferParts);
			const parts = splitBuffer(wholeBuffer, Buffer.from(`--${boundary}`));
	
			const fields = [];
			for (const part of parts) {
				try {
					const { headers:formDataPartHeaders , body } = splitFormDataBufferPart(part);
					const stringyfiedFormDataPartHeaders = formDataPartHeaders.toString('utf-8');
					const headers = parseFormDataPartHeaders(stringyfiedFormDataPartHeaders);
					const contentDispositionHeader = headers['content-disposition'];
					const contentType = headers['content-type'] || null;
					const { name, filename } = parseContentDispositionHeader(contentDispositionHeader);
					
					const parsedData = {
						body, contentType, name, filename,
					};
	
					fields.push(parsedData);
				}catch(e){
					console.log({e});
				}
			}
			res({
				success:{
					fields,
				},
			});
		});
	});

	
	
}

module.exports = { multipartHandler } ;

function parseContentDispositionNameAttr (nameAttr) {
	const [ groupId, tableName, columnName ] = nameAttr.split('.');
	if(!groupId || !tableName || !columnName) {
		throw new Error(`incorrect name attribute`);
	}
	return {
		groupId,
		tableName,
		columnName,
	}
}

function parseContentDispositionHeader (contentDispositionHeader) {
	const name = contentDispositionHeader.match(/name="([^"]+)"/)?.[1] || null;
	const filename = contentDispositionHeader.match(/filename="([^"]+)"/)?.[1] || null;
	
	return {
		name ,
		filename,
	}
}

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
	const separator = `\r\n\r\n`;
	const separatorBuffer = Buffer.from(separator);
	const separatorIndex = findSeparatorIndexInBuffer(formDataBufferPart, separatorBuffer);
	if(separatorIndex === -1) {
		throw new Error(`incorrect data part`);
	}
	const headers = formDataBufferPart.subarray(0, separatorIndex);
	let bodyEndIndex = formDataBufferPart.length;
	if(formDataBufferPart[bodyEndIndex - 2] === 0x0d && formDataBufferPart[bodyEndIndex - 1] === 0x0a) {
		bodyEndIndex -= 2;
	}
	const body = formDataBufferPart.subarray(separatorIndex + separatorBuffer.length, bodyEndIndex);
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
		const part = dataBuffer.subarray(start, index);
		parts.push(part);
		start = index + separatorBuffer.length;
		if(dataBuffer[start] === 0x0d && dataBuffer[start + 1] === 0x0a) {
			start += 2;
		}
	}
	parts.push(dataBuffer.subarray(start));
	return parts;
}

// function