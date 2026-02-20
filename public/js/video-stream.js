
window.addEventListener('DOMContentLoaded' , () => {
    
    // grab html

    const video = document.getElementById('video--main');

    // =====
    const videoId = localStorage.getItem('video-id');
    if(videoId) {
        video.src = `/api/video-stream/${videoId}` ;
        video.load();
    }

    
});