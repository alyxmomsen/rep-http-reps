
class HTMLElement_ {

    get innerHTML () {
        return this.#elem.innerHTML ;
    }

    set innerHTML (value) {
        this.#elem.innerHTML = value ;
    }

    get elem () {
        return this.#elem ;
    }

    #elem;

    constructor (elem) {
        if(elem instanceof HTMLElement === false) throw new Error ;
        this.#elem = elem ;
    }
}

window.addEventListener('DOMContentLoaded' , () => {

    // grab elems

    const formelem = document.getElementById('form--main');
    const mainModalWindow = document.getElementById('modal-window--main');
    const toolTipContent = document.getElementById('tool-tip--content');
    const toolTipWrapper = document.getElementById('tool-tip--response-logs');
    
    toolTipWrapper.addEventListener('click' , (e)=> {
        e.stopPropagation();
    });

    mainModalWindow.onclick = (e) => {
        e.stopPropagation();
        mainModalWindow.style.display = 'none' ;
    }

    toolTipContent.addEventListener('click' , (e) => {
        e.stopPropagation();
    });

    // const formElem = new HTMLElement_(formelem);
    // const modalElem = new HTMLElement_(mainModalWindow);
    // const toolTipElem = new HTMLElement_(toolTipContent);

    const submitRequest = new RequestRouter ({url:'/api/handle-form' , method:'post'}) ;
    submitRequest.onBeforeRequest(() => {
        console.log('before the request');
        toolTipContent.innerHTML = '' ;

    });
    submitRequest.addHandlers(async (res) => {
        const json = await res.json();
        const { files , users } = json.payload || {} ;

        console.log({ files , users });

        
        if(files) {

            const { added } = files ;
            added.forEach(item => {
                const listItem = new HTMLElement_ (document.createElement('div')) ;
                console.log({item});
                const { id , fields } = item ;

                const { title , description } = fields || {} ;
                
                const linkelem = document.createElement('a');
                linkelem.innerHTML = `<span>${title}</span><span>: </span><span>${description}</span>` ;
                linkelem.href = '/l/video-stream' ;
                linkelem.addEventListener('click' , (e) => {
                    e.stopPropagation();
                });

                console.log({toolTipContent});

                toolTipContent.appendChild(linkelem);
                // mainModalWindow.appendChild(divelem);

            });
        }

        mainModalWindow.style.display = 'flex';

    });

    formelem.onsubmit = (e) => {
        e.preventDefault();
        const formdata = new FormData(formelem);
        submitRequest.exec(formdata);
    }

});

// function createFile