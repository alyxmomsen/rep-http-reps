
class HTMLelement_ {

    onclick () {
        
    }

    #elem ;
    #handlers ;
    #styles ;
    #stylesDefault;

    constructor ({elem , handlers = [] , stylesDefault = {}}) {
        this.#elem = elem ;
        this.#handlers = [...handlers] ;
        this.#stylesDefault = {...stylesDefault} ;
        this.#styles = {...this.#stylesDefault} ;
    }
}

// ------------------------------ main ------------------------------

window.addEventListener("DOMContentLoaded" , () => {

    (function() {

        // -- grab html elems --
        
        const form = document.getElementById('form--main');
        const formSubmitStatus = document.getElementById('status--form-submit');
        const responseLogTooltip = document.getElementById('tool-tip--response-logs');
        responseLogTooltip.addEventListener('click' , (e) => {
            e.stopPropagation();
        });
        
        /* ----------------------- */

        // --- playlist elem init
        const playlistDefaultStyle = {
            display:'flex'
        } ;
        const mainModalwindow = document.getElementById('modal-window--main');
        mainModalwindow.style.display = 'none';

        mainModalwindow.addEventListener("click" , (e) => {
            e.stopImmediatePropagation();
            e.currentTarget.style.display = 'none' ;
        });

        /* ----------------------- */
        
        // -- instance a submit handler -- 
    
        const submitHandler = new RequestRouter(
            '/api/handle-form' , 'post'
        );

        // -- config the submit handler --

        submitHandler.addHandlers(async (res) => {
            try {
                const jsonResponse = await res.json();
                const { } = jsonResponse ;
                responseLogTooltip.innerHTML = '<div>responsed data</div>';
                formSubmitStatus.innerHTML = '<div class="clickable">uploaded!</div>'
                console.log({jsonResponse});

                mainModalwindow.style.display = playlistDefaultStyle.display;

            }catch (e) {
                console.log({e});
            }
        });

        // ================================

        // -- add listeners on these html elems

        form.addEventListener("submit" , async (e) => {
            
            e.preventDefault();
            
            const formdata = new FormData (form) ;

            submitHandler.onBeforeRequestStarted(() => {
                formSubmitStatus.innerHTML = 'uploading...';
                mainModalwindow.style.display = 'none';
            });
            
            await submitHandler.exec(formdata);
            
    
        });

    })()


});

// ------------------------------------------------------------------

// class HTMLelement_  {

//     #elem;

//     #listeners;

//     constructor (elem) {
//         this.#elem ;
//     }
// }

