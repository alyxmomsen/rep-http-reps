window.addEventListener('DOMContentLoaded' , async () => {

    const formHTML = document.getElementById('form--main');


    const {error , success} = await useFetch('/get-all-files' , {method:'post'});

    handleSuccess(success , async (response) => {

        const container = document.getElementById('files');

        const { files } = await response.json() ;

        console.log({files});

        container.innerHTML = '' ;

        files.forEach(elem => {
            const divelem = document.createElement('div');
            divelem.className = 'clickable' ;
            divelem.onclick = async (ev) => await onItemClick(ev , elem.id ) ;
            divelem.innerHTML = elem.id ;

            container.appendChild(divelem);
        });

    });

    handleError(error , f=>f);

    formHTML.onsubmit = async (ev) => {

        ev.preventDefault();

        const container = document.getElementById('files');
        container.innerHTML = 'updating...'

        const formdata = new FormData(formHTML);

        const fetchResult = await useFetch('/handle-form' , {body:formdata , method:'post'});

        const {error , success} = fetchResult ;

        handleError(error);
        handleSuccess(success , smth);
    }

});


async function smth(response) {
    
    try {

        const container = document.getElementById('files');

        const jsondata = await response.json();
        console.log(jsondata);

        const { added , allFiles } = jsondata.payload ;

        container.innerHTML = ''

        allFiles.forEach(fileid => {
            const div = document.createElement('div');
            div.className = 'clickable';
            div.innerHTML = fileid.id ;
            div.onclick = (ev) => onItemClick(ev ,fileid ) ;
            container.appendChild(div);
        });

    }
    catch (e) {
        console.log({e})
    }
}

async function onItemClick(ev , fileid) {
    
    const { error , success } = await useFetch(`/get-stream-by-id/${fileid}` ,  {method:'post'} );
    console.log({error});
}

async function handleSuccess(success , handler) {
    
    const { code , response } = success ;

    if(code === undefined) {
        console.log('no fetch response status code');
        return;
    }

    if(!response) {
        console.log('no payload');
        return ;
    }

    await handler(response);

}

async function handleError(error , handler) {
    console.log({error});
    return ;
}

async function useFetch (url , {method , body}) {

    try {
        
        const response = await fetch (url , {method:method || 'get' , body:body || undefined} ) ;
        console.log('succ');
        return {
            success:{
                code:0 ,
                response ,
            } ,
            error:{} ,
        }
    }
    catch (e) {
        console.log('errror');
        return {
            success:{} ,
            error:{
                details:e ,
            }
        }
    }


}