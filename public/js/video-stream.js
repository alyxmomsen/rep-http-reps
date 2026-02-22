
window.addEventListener('DOMContentLoaded' , async () => {
    
    // grab html

    const video = document.getElementById('video--main');

    // =====
    const videoId = localStorage.getItem('video-id');
    if(videoId) {
        video.src = `/api/video-stream/${videoId}` ;
        video.load();
    }

    const response = await fetch('/api/get-all-files', {
        method:'get' ,
    });

    const { files } = await response.json() ;

    console.log({files});


    files.forEach(file => {
        console.log(file);
    });
    
});