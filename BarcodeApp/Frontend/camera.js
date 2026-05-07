let stream = null

const constraints = {
    video: true
}

const scan = async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);

        const video = document.getElementById("video");
        video.srcObject = stream;
        video.style.display = "block";

        video.onloadedmetadata = () => {
            video.play();
            console.log("Camera ready");
            startLoop();
        };

    } catch (error) {
        console.log("user denied camera access", error);
    }
};


const pauseVideo = () => {
    if (!stream) {
        alert("please allow access to camera!");
        return;
    }
    const video = document.getElementById('video');
    video.style.display = "none";   // hides <video> element, stream stays
    // non null 
}

const stopVideo = () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop()); //stop all tracks
        stream = null;
    }
    const video = document.getElementById("video");
    video.srcObject = null;
    // so far just for testing
    play();
}




document.getElementById("Scan").addEventListener('click', scan)
//document.getElementById("share").addEventListener('click', e => getCamera(e))
//document.getElementById("showVideo").addEventListener("click", showVideo)
//document.getElementById("hide").addEventListener("click", pauseVideo);
document.getElementById("stopVideo").addEventListener("click", stopVideo);

