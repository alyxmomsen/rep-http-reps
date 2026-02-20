

window.addEventListener('DOMContentLoaded' , async () => {


    // grab html elements

    const formMain = document.getElementById("form--main");
    const modalWindow = document.getElementById("modal-window--main");
    const toolTipMain = document.getElementById("tool-tip--main");
    const toolTipContent = document.getElementById("tool-tip--content");

    // ------------------

    const submitRequest = new RequestRouter ('/api/handle-form' , 'post' , [] , []) ;

    submitRequest.addOnBeforeRequest(async () => beforeSubmit({modalWindow}));
    submitRequest.addListener(async (responseRawData) => submitHandler({
        responseRawData , modalWindow , toolTipContent ,
    }));

    formMain.addEventListener("submit" , async (e) => {
        e.preventDefault();
        const formdata = new FormData(formMain);
        await submitRequest.exec(formdata);
    });


});

async function beforeSubmit (context) {

    const { modalWindow } = context ;
    
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

        for (const addedFile of added) {
            console.log({addedFile});
            const {id , fields} = addedFile ;
            
            const { title , description } = fields ;

            const divElem = createElement(
                'div' , `<span>${id}</span><span>: </span><span>${title}</span>` ,
                ['click' , (e) => {alert(e)}] , ['mouseover' , (e) => {alert(e)}] ,
            );

            toolTipContent.appendChild(divElem);
        }

    }
    catch(e) {
        console.error({e});
    }
}

function createElement (type , innerHTML = '' , ...eventListeners) {
    try {
        const elem = document.createElement(type);
        elem.innerHTML = innerHTML ;

        eventListeners.forEach(listener => {
            const [evName , handler] = listener ;
            elem.addEventListener(evName , handler);
        });

        return elem ;
    }
    catch (e) {
        console.error({e});
        return null ;
    }
}