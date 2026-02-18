
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
        const statusModalwindowCloseButton = document.getElementById('modal-window__btn--close');
        
        /* ----------------------- */

        // --- playlist elem init
        const playlistDefaultStyle = {
            display:'flex'
        } ;
        const playlistStatuslog = document.getElementById('modal-window--playlist-status-log');
        playlistStatuslog.style.display = 'none';
        // playlistStatuslog.setDefaultStyles = function (elem) {
        //     console.log(this);
        //     this.style.display = 'flex' ;
        // }
        // playlistStatuslog.setDefaultStyles();

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
                formSubmitStatus.innerHTML = '<div class="clickable">uploaded!</div>'
                console.log({jsonResponse});

                playlistStatuslog.style.display = playlistDefaultStyle.display;

            }catch (e) {
                console.log({e});
            }
        });

        // ================================

        // -- add listeners on these html elems

        statusModalwindowCloseButton.addEventListener("click" , (e) => {
            e.preventDefault();
            playlistStatuslog.style.display = 'none' ;
        });

        form.addEventListener("submit" , async (e) => {
            
            e.preventDefault();
            
            const formdata = new FormData (form) ;

            submitHandler.onBeforeRequestStarted(() => {
                formSubmitStatus.innerHTML = 'uploading...';
                playlistStatuslog.style.display = 'none';
            });
            
            await submitHandler.exec(formdata);
            
    
        });

    })()


});

// ------------------------------------------------------------------

