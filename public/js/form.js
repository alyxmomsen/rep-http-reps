
// ======================= main ============================

window.addEventListener('DOMContentLoaded' , async () => {

    for (const elem of document.getElementsByTagName('a')) {
        elem.addEventListener('click' , (e) => {
            e.stopPropagation();
        });
    }

    for (const elem of document.getElementsByTagName('div')) {
        elem.addEventListener('click' , (e) => {
            e.stopPropagation();
        });
    }

    // grab html elements

    const formMain = document.getElementById("form--main");
    const modalWindow = document.getElementById("modal-window--main");
    const toolTipMain = document.getElementById("tool-tip--main");
    const toolTipContent = document.getElementById("tool-tip--content");
    
    // ------------------

    const submitRequest = new RequestRouter ('/api/handle-form' , 'post' , [] , []) ;

    submitRequest.addOnBeforeRequest(async () => beforeSubmit({modalWindow ,toolTipContent}));
    submitRequest.addListener(async (responseRawData) => submitHandler({
        responseRawData , modalWindow , toolTipContent ,
    }));

    formMain.addEventListener("submit" , async (e) => {
        e.preventDefault();
        const formdata = new FormData(formMain);
        await submitRequest.exec(formdata);
    });

    modalWindow.addEventListener("click" , (e) => {
        e.currentTarget.style.display = 'none' ;
    });
});


// ====================================================================

async function beforeSubmit (context) {

    const { modalWindow , toolTipContent } = context ;
    toolTipContent.innerHTML = '';
    
}

async function submitHandler (context) {
    const { 
        responseRawData , modalWindow , 
        toolTipContent
    } = context ;

    try {
        const JSONResponseData = await responseRawData.json();
        console.log({JSONResponseData});
        modalWindow.style.display = 'flex' ;

        const { files } = JSONResponseData.payload || {} ;
        const { added } = files || {added:[]} ;

        console.log({added , files});

        for (const addedFile of added) {
            console.log({addedFile});
            const {id , fields} = addedFile ;
            
            const { title , description } = fields ;

            const divElem = createElement(
                'a' , `<span>${'video: '.toUpperCase()}</span><span>: </span><span>${title}</span>` ,
                [] , [['href' , '/l/video-stream']] ,
                ['click' , (e) => {
                    localStorage.setItem('video-id' ,id);
                }] , 
                // ['mouseover' , (e) => {console.log('on')}] ,
                // ['mouseleave' , (e) => {console.log('lieved')}] ,

            );

            toolTipContent.appendChild(divElem);
        }

    }
    catch(e) {
        console.error({e});
    }
}

function createElement (type , innerHTML = '' , styles = [] , attr = [] , ...eventListeners) {
    try {
        const elem = document.createElement(type);
        elem.innerHTML = innerHTML ;

        eventListeners.forEach(listener => {
            const [evName , handler] = listener ;
            elem.addEventListener(evName , handler);
        });

        attr.forEach(([key , value]) => {
            console.log({key ,value});
            elem.setAttribute(key , value);
        });

        return elem ;
    }
    catch (e) {
        console.error({e});
        return null ;
    }
}