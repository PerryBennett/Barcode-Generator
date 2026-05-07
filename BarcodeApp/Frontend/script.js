let video;
let canvas;
let ctx;
let scanActive;
let finaltext = "";
//let scanInterval = null;
let lastFrame = null;
let running = false;
let passCount = 0;
let triggered = false;
let thresholdValue = 5;
// updating this value, 3 felt to short , 5 isnt triggering state 2 
const requiredPasses = 4;

function init() {
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
}



function captureFrame() {

    if (!video || video.videoWidth === 0) return;

    canvas.width = 1280;
    canvas.height = 720;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

}

async function runOCR() {
    const image = canvas.toDataURL("image/png");
    const result = await Tesseract.recognize(image, "eng");
    const text = result.data.text.trim();
    const confidence = result.data.confidence;
    //console.log("OCR result:", text);
    return { text, confidence };
}



// better understanding of whats happening here 
function getGrayScaleData() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data

    const gray = [];

    for (let i = 0; i < data.length; i += 4) {
        // luminance formula (standard perception-based grayscale)
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const brightness = .299 * r + .587 * g + 0.114 * b;
        // pushes clean non float values 
        gray.push(Math.round(brightness));
    }

    return gray;
}

// what is variance? tells you how varied the image is
function getVariance(values) {
    let sum = 0;

    for (let i = 0; i < values.length; i++) {
        sum += values[i];
    }

    const mean = sum / values.length;

    let sqaureDiffs = 0;

    for (let i = 0; i < values.length; i++) {
        const diff = values[i] - mean;
        sqaureDiffs += diff * diff;
    }

    return sqaureDiffs / values.length;
}

function isStableFrame(currentFrame) {
    if (!lastFrame) {
        lastFrame = currentFrame;
        return false;
    }

    let diff = 0;

    for (let i = 0; i < currentFrame.length; i++) {
        diff += Math.abs(currentFrame[i] - lastFrame[i]);
    }

    lastFrame = currentFrame;

    // how much change is allowed
    return diff < 1000000;
}



// i going to used otsu's to generate a new threshold value every frame
// need to modify this function for 1:1 approach instead of 8 buckets
// dont need to modify, just pass the gray array, this fucntion does the grouping 

function generateHistogram(values) {
    const buckets = new Array(256).fill(0); // 0-255 inclusive 

    for (let i = 0; i < values.length; i++) {
        const index = values[i];
        buckets[index]++;
    }
    return buckets;
}

function otsuThreshold(histogram) {

}


function play() {
    running = true;
}


function checkFrame() {
    // proper js destructing
    captureFrame();

    const gray = getGrayScaleData();
    const variance = getVariance(gray);
    const stable = isStableFrame(gray);

    // implemented a band pass filter
    // broad filtering is being done here
    if ((variance > 250) && (variance < 800) && stable) {
        // why does interval have to be cleared prior to reassignment 
        // clearInterval(scanInterval);
        // scanInterval = null;
        console.log("PASS: ", variance);
        passCount++;
        // dont need an off condition right now, trying find the right threshold
        // running = false;
    }
    else {
        passCount = 0;
    }

    // why is the greater than sign needed? 
    if ((!triggered) && passCount >= requiredPasses) {
        running = false; // pausing entire system to analyze frame that passed the first 3 checks

        // taking a snapshot for analysis
        // using shallow copy, dont want to mutate original gray arr
        const snapshot = [...gray];

        const histogram = generateHistogram(snapshot);
        console.log(histogram.length);


        triggered = true;
        // intiate stage 2 (thresholding)
        //console.log("Start Stage 2")
    }

    // console.log("variance:", variance);
    // output variance and stability
    console.log("variance:", variance, "stability: ", stable);
}

/*function startDetectionLoop() {
    if (!scanInterval) {
        scanInterval = setInterval(checkframe(), 300);
    } */


function startLoop() {
    if (running) return;

    running = true;
    //wrong call
    //requestAnimationFrame(loop);
    loop();
}


function loop() {
    if (!running) return;

    checkFrame();
    requestAnimationFrame(loop);
}






function generateBarcode() {
    console.clear();

    var inputValue = document.getElementById("barcodeInput").value;
    var barcodeSVG = document.getElementById("barcodeSVG");


    if (inputValue === '') {
        alert("Please enter some data first");
        return;
    }

    JsBarcode(barcodeSVG, inputValue, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 50,
        displayValue: true
    })

    barcodeSVG.style.display = "inline-block";
}

init();

