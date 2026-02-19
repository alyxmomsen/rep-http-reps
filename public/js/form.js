
window.addEventListener('DOMContentLoaded' , () => {

    // grab elems

    const formelem = document.getElementById('form--main');
    // const formelem = document.getElementById('form--main');

    const submitRequest = new RequestRouter ({url:'/api/handle-form' , method:'post'}) ;
    submitRequest.onBeforeRequest(() => {
        console.log('before the request');
    });
    submitRequest.addHandlers(async (res) => {
        const json = await res.json();
        console.log({json});
    });

    formelem.onsubmit = (e) => {
        e.preventDefault();
        const formdata = new FormData(formelem);
        submitRequest.exec(formdata);
    }

});