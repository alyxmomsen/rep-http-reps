



function fileScanner () {

    process.send({type:'hello' , payload: undefined});;

    console.log('file scanner is running');

    process.on('message' , (msg ,sh) => {

        console.log(msg , sh);

        if(msg.type && msg.type === 'hello') {
            const payload = msg.payload;


            console.log('payload from parent: ' , payload);
        }

    });
}

fileScanner();