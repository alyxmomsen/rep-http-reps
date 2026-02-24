
// ======================= main ============================

window.addEventListener('DOMContentLoaded' , async () => {

    let tooltips = [] ;

    // grab html elements

    const formMain = document.getElementById("form--main");
    const modalWindow = document.getElementById("modal-window--main");
    const formSubmitStatusContainer = document.getElementById("status--form-submit");
    
    // instance RequestRouters

    const submitRequest = new RequestRouter ({url:'/api/handle-form' , method:'post'}) ;
    const getAllFilesRequest = new RequestRouter ({url:'/api/get-all-files' , method:'get'}) ;

    submitRequest.addBeforeRequestListeners(async (context) => {
        await handleBeforeSubmit({
            modalWindow , 
            formSubmitStatusContainer , context
        });
    });

    submitRequest.addListeners(async (responseRawData  , context) => await submitHandler({
        responseRawData ,
        modalWindow, tooltips ,
        formSubmitStatusContainer, formMain , 
        getAllFilesRequest , context ,
    }));

    getAllFilesRequest.addListeners(async (rawResponse, context) => {
        await getAllFilesHandler({rawResponse , modalWindow, context}) ;
    });


    // ---------------------------

    formMain.addEventListener("submit" , async (e) => {
        e.preventDefault();
        const formdata = new FormData(formMain);
        await submitRequest.exec(formdata , {});
    });

    // ---------------------------

    modalWindow.addEventListener("click" , (e) => {

        if(e.currentTarget !== modalWindow) return 

        while (modalWindow.firstChild) {
            modalWindow.firstChild.remove();
        }

        e.currentTarget.style.display = 'none' ;
    });
});


// ====================================================================


async function getAllFilesHandler (payload) {

    const { rawResponse , modalWindow , context } = payload ;
    // console.log(await rawResponse.json());
    const { files } = await rawResponse.json()

    const createInner = (text) => {
        const inner = document.createElement('p');
        inner.innerText = `- ${text}` ;
        return inner ;
    }

    const tooltip = createToolTip(
        '' , 
        'all files: \r\n' , 
        [
            ['click' , () => console.log('tooltip')] ,
        ] , 
        ...files.map(elem => createInner(elem.rowData.title))
    );

    modalWindow.appendChild(tooltip);

}

async function handleBeforeSubmit (context) {

    const { modalWindow , formSubmitStatusContainer , context:globContext } = context ;
    formSubmitStatusContainer.innerHTML = 'upload...'
}

async function submitHandler (payload) {

    const { 
        responseRawData , modalWindow , 
        formSubmitStatusContainer, formMain ,
        getAllFilesRequest , tooltips , context ,
    } = payload ;

    formMain.reset();

    formSubmitStatusContainer.innerHTML = 'done!' ;

    try {

        const JSONResponseData = await responseRawData.json();
        console.log({JSONResponseData});
        modalWindow.style.display = 'flex' ;

        const { files } = JSONResponseData.payload || {} ;
        const { added } = files || {added:[]} ;
        
        let index = 0 ;
        for (const addedFile of added) {
            
            const {id , row} = addedFile ;
            
            const { title , description } = row ;
            
            const addedOneTooltip = createToolTip(
                'tool-tip--content', 
                title , 
                [
                    ['click' , (e) => {
                        localStorage.setItem('video-id' ,id);
                    }] ,
                ] ,
                createLink(
                    'read more...' , 
                    `/l/video-stream` , 
                    'flx-align-self-end',
                ) ,
            );
            
            modalWindow.appendChild(addedOneTooltip);
        }

        // demo timeout
        setTimeout(
            () => {
                getAllFilesRequest.exec();
            } , 1000 
        );
    }
    catch(e) {
        console.error({e});
    }
}

function createElement (type , innerText = '' , childs = [] , styles = [] , attr = [] , ...eventListeners) {
    try {
        const baseElem = document.createElement(type);
        baseElem.innerText = innerText ;

        childs.forEach(child => {
            baseElem.appendChild(child);
        });

        eventListeners.forEach(listener => {
            const [evName , handler] = listener ;
            baseElem.addEventListener(evName , handler);
        });

        attr.forEach(([key , value]) => {
            baseElem.setAttribute(key , value);
        });

        return baseElem ;
    }
    catch (e) {
        console.error({e});
        return null ;
    }
}

/**
 * 
 * @param {string} type 
 */
function createEl (type , text , eventListeners = [] , ...children) {
    const baseElement = document.createElement(type);
    baseElement.innerText
}

/**
 * 
 * @param {string} id 
 * @param {string} innerText 
 * @param {([string , ((e:Event) => void)])[]} eventListeners 
 * @param  {...HTMLElement} children 
 */
function createToolTip (id='' , innerText = '' , eventListeners = [] , ...children) {

    const baseElem = document.createElement('div');
    baseElem.className = 'tool-tip' ;
    baseElem.id = '' ;
    baseElem.innerText = innerText ;

    children.forEach(elem => {
        baseElem.appendChild(elem);
    });

    baseElem.addEventListener('click' , (e) => {
        e.stopPropagation();
    });

    eventListeners.forEach(([name , handler]) => {
        console.log({name , handler});
        baseElem.addEventListener(name , handler);
    });

    return baseElem ;
}

/**
 * 
 * @param {string} innerText 
 * @param {string} href 
 * @param {...([string , ((e:Event) => void)])} eventListeners 
 */
function createLink (innerText = '' , href = '' , className = '' , ...eventListeners) {

    const baseElement = document.createElement('a');
    baseElement.innerText = innerText ;

    baseElement.href = href ;

    baseElement.classList = className ;

    eventListeners.forEach(([listenerName , handler]) => {
        baseElement.addEventListener(listenerName , handler);
    });

    return baseElement ;
}