
window.addEventListener("DOMContentLoaded" , () => {

    const formHTML = document.getElementById('form--main');
    const uploadStatusHTML = document.getElementById('status--upload');
    uploadStatusHTML.innerHTML = '---';
    formHTML.reset();

    let fomcounter = {
        value:0 ,
    } ;

    formHTML.onsubmit = async (e) => {

        e.preventDefault();

        uploadStatusHTML.innerHTML = 'loading...';

        const formdata = new FormData(formHTML);
        
        try {

            const response = await fetch('/api/handle-form' , {method:'post' , body:formdata});
            const responseJSON = await response.json();

            uploadStatusHTML.innerHTML = 'done'.toUpperCase();

            console.log({responseJSON});
        }
        catch (e) {
            console.log({e});
        }
    }

});

function addNewGroup (counterObj) {

    const { value } = counterObj ;

    const count = ++value ;

    const datenow = Date.now();

    const newGroup = `
<div class="flex wrapper--form-group">
    <h3>video #${count}</h3>
    <div class="flex flex-gap--2">
        <input type="text" name="group-${datenow}.file.description" id="group-${datenow}.file.description">
        <label for="group-${datenow}.file.description">description</label>
    </div>
    <div class="flex flex-gap--2">
        <input type="text" name="group-${datenow}.file.title" id="group-${datenow}.file.title">
        <label for="group-${datenow}.file.title">title</label>
    </div>
    <div class="flex flex-gap--2">
        <input type="file" name="group-${datenow}.file.*" id="group-${datenow}.file.*" accept=".mp4 , .mkv">
        <label for="group-${datenow}.file.*">file</label>
    </div>
</div>`

}