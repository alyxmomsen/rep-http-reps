window.addEventListener("DOMContentLoaded" , () => {

        const ws = new WebSocket('http://localhost:3000');
    
        ws.addEventListener("open" , (s) => {
            console.log('web socket connection is opened!');
    
            ws.addEventListener("message" , (message) => {

                // console.log(message.data)
                
                hendleMessage(JSON.parse(message.data));
    
            });
    
            ws.addEventListener("error" , () => {
    
            });
    
            ws.addEventListener("close" , () => {
    
            });

            orderFiles(ws);
    
        });

    });

    async function hendleMessage (data) {

        const handlers = {
            data: {
                handler: (data) => {

                }
            } ,
            order:{
                handler: () => {

                }
            } ,
            'new-connection' : {
                handler: (data) => {
                    
                    const htmlelement = document.getElementById('smth')
        
                    if(htmlelement) {
                        htmlelement.innerHTML = data;
                    }
                }
            } , 
            result: {

                handler: (data) => {
                    
                    const htmlelem =document.getElementById('smth');

                    const datahtml = data.map(elem => `<div><a href="#">${elem}</a></div>`).join('');

                    htmlelem.innerHTML = datahtml ;

                    console.log('data' , data);
                    // console.log(JSON.parse(data));
                }
            }
        }


        handlers[data.type]?.handler(data.payload);

        console.log(handlers[data.type] , data.payload);

    }

    async function orderFiles (ws) {

        ws.send(JSON.stringify({
            type:'order' ,
            name:'scan-dir' ,
            details: {
                filter:'mp3'
            }            
        }));
    }