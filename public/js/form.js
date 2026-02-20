
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
    const formSubmitStatusContainer = document.getElementById("status--form-submit");
    
    // ------------------

    const submitRequest = new RequestRouter ('/api/handle-form' , 'post' , [] , []) ;

    submitRequest.addOnBeforeRequest(async () => beforeSubmit({
        modalWindow ,toolTipContent , formSubmitStatusContainer
    }));

    submitRequest.addListener(async (responseRawData) => submitHandler({
        responseRawData , modalWindow , toolTipContent , formSubmitStatusContainer ,
    }));

    // ---------------------------

    formMain.addEventListener("submit" , async (e) => {
        e.preventDefault();
        const formdata = new FormData(formMain);
        await submitRequest.exec(formdata);
    });

    // ---------------------------

    modalWindow.addEventListener("click" , (e) => {
        e.currentTarget.style.display = 'none' ;
    });
});


// ====================================================================

async function beforeSubmit (context) {

    const { modalWindow , toolTipContent , formSubmitStatusContainer } = context ;
    toolTipContent.innerHTML = '';
    formSubmitStatusContainer.innerHTML = 'upload...'
    
}

async function submitHandler (context) {
    const { 
        responseRawData , modalWindow , 
        toolTipContent , formSubmitStatusContainer
    } = context ;

    formSubmitStatusContainer.innerHTML = 'done!' ;

    try {
        const JSONResponseData = await responseRawData.json();
        console.log({JSONResponseData});
        modalWindow.style.display = 'flex' ;

        const { files } = JSONResponseData.payload || {} ;
        const { added } = files || {added:[]} ;

        for (const addedFile of added) {

            const {id , row} = addedFile ;
            
            const { title , description } = row ;

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