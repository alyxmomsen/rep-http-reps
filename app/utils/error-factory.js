const { ServerResponse } = require("node:http");

const statusMessageMap = new Map([
    [200 , 'ok'] , [400 , 'bad request'] , [500 , 'internal error']
]);

/**
 * 
 * @param {string} location 
 * @param {string} message 
 * @param {Object} subjects 
 * @returns {{location:string;message:string;subjects:Object}}
 */
function errorFactory (location = 'no location' , message = 'no message' , subjects = {}) {
    return {
        location, 
        message ,
        subjects ,
    }
}

/**
 * @param {ServerResponse} res
 * @param {number} [statusCode=520]  
 * @param {string} [location='no location'] 
 * @param {string} [message='no message'] 
 * @param {Object} [subjects={}] 
 * @returns {{location:string;message:string;subjects:Object}}
 */
function sendFallBack (
    res , statusCode = 520 ,
    location = 'no location' , message = 'no message' , subjects = {}
) {
    
    res.writeHead(statusCode , statusMessageMap.get(statusCode) || 'unknown error'  , {
        'content-type':'application/json' ,
    });
    res.end(JSON.stringify(
        errorFactory(
            location, message, subjects
        )
    ));
}

module.exports = { sendFallBack , errorFactory }