

window.addEventListener("DOMContentLoaded" , () => {

    document.addEventListener('scroll' , () => {
        
    });

    const conentHTML = document.getElementById('content');

    console.log('content loaded');
    const port = 8080;

    const ws = new WebSocket(`http://localhost:${port}`);

    console.log(ws);

    ws.onopen = () => {

        conentHTML.innerHTML = "loading ..."

        ws.send(JSON.stringify({foo:'bar'}));

        ws.addEventListener("message" , (message) => {

            const messageData = JSON.parse(message.data);
            let counter = 0 ;

            const getCounter  = () => {

                const value = counter ;
                counter = counter > 0 ? 0 : counter + 1 ;
                return value ;
            }



            conentHTML.innerHTML = messageData.files.map((file ,i) => {



                const result = i % 20 

                console.log(result);

                const wrapperState = (result === 0) ? getCounter() : null; 

                // console.log(wrapperState);

                return `${wrapperState === 0 ? '</div><div class="wrapper">' : ''}<div class="hideable">${file}</div>${wrapperState === 1 ? '</div><div class="wrapper">' : ''}` ;
            }).join('');

            // message.data;

            console.log(messageData);
        });
    }
});
