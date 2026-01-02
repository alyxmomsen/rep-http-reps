require('fs');

// const mainstring = Buffer.from("258EAFA5-E914-47DA-95CA-C5AB0DC85B11") ;
const mainstring = Buffer.from("258EAFA5-E914-47DA-95CA-E914-C5AB0DC85B11") ;
const substr = Buffer.from('E914') ;


launch().then(data => {

    console.log(data);

    // data.forEach(part => {
    //     console.log(part.toString('utf-8'));
    // });
})



async function launch () {

    const parts = [];

    let start = 0 ;
    let index = 0 ;

    while((index = await findIndex(mainstring , substr , start)) !== -1) {

        const part = mainstring.subarray(start , start + index);

        // console.log(part.toString('utf-8'));

        parts.push(part.toString('utf-8'));
        
        start = index + substr.length ;
        
        // console.log({index , start});

    }

    const endPart = mainstring.subarray(start + substr)

    if(endPart.length > 0) {
        parts.push(endPart.toString('utf-8'))
    }

    return parts;
}

async function findIndex (buffer , substr , start = 0) {
    
    for (let i = start ; i <= buffer.length - substr.length ; i++) {

        let found = true ;

        for (let j = 0 ; j < substr.length ; j++) {

            if(buffer[i + j] !== substr[j]) {
                found = false; 
                break ;
            }
        } 

        if(found === true) {
            return i ;
        }
    }

    return -1 ;
}

// async function launch () {
    
// }