const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const invertBtn = document.getElementById('invertBtn');
const snapshotBtn = document.getElementById('snapshotBtn'); 
const controlsBtn = document.getElementById('controlsBtn');
const effectControls = document.getElementById('effectControls');
const cameraSwitchBtn = document.getElementById('cameraSwitchBtn'); // Button to switch cameras

let invertColors = false;
let videoStream;
let currentFacingMode = 'user'; // Default to the front camera

// Function to start the video stream with the selected facing mode
function startCamera(facingMode = 'user') {
    const constraints = {
        video: {
            facingMode: facingMode
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            videoStream = stream; // Store the stream for later use

            // Update the canvas with the video stream
            requestAnimationFrame(() => updateCanvas(video));
        })
        .catch(err => {
            console.error("Error accessing webcam: ", err);
        });
}

// Call the function to start with the default camera (front)
startCamera(currentFacingMode);

// Function to switch the camera
cameraSwitchBtn.addEventListener('click', () => {
    // Toggle facing mode
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

    // Stop the current video stream
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }

    // Start the camera with the new facing mode
    startCamera(currentFacingMode);
});

// Function to update the canvas with the video feed
function updateCanvas(video) {
    canvas.width = 640; 
    canvas.height = 480;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    applyEffects();

    if (invertColors) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];       
            data[i + 1] = 255 - data[i + 1]; 
            data[i + 2] = 255 - data[i + 2]; 
        }

        ctx.putImageData(imageData, 0, 0);
    }

    requestAnimationFrame(() => updateCanvas(video));
}

// Apply effects based on the slider values
function applyEffects() {
    const warmth = parseInt(document.getElementById('warmth').value);
    const brightness = parseInt(document.getElementById('brightness').value);
    const blur = parseInt(document.getElementById('blur').value);
    const redIntensity = parseInt(document.getElementById('redIntensity').value);
    const greenIntensity = parseInt(document.getElementById('greenIntensity').value);
    const blueIntensity = parseInt(document.getElementById('blueIntensity').value);

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    tempCtx.drawImage(canvas, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(data[i] + brightness, 0, 255);       
        data[i + 1] = clamp(data[i + 1] + brightness, 0, 255);
        data[i + 2] = clamp(data[i + 2] + brightness, 0, 255);
    }

    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp((data[i] * redIntensity) / 255, 0, 255);       
        data[i + 1] = clamp((data[i + 1] * greenIntensity) / 255, 0, 255); 
        data[i + 2] = clamp((data[i + 2] * blueIntensity) / 255, 0, 255);
    }

    tempCtx.putImageData(imageData, 0, 0);
    
    ctx.drawImage(tempCanvas, 0, 0);
    
    if (blur > 0) {
        ctx.filter = `blur(${blur}px)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
    }
}

// Clamp function to limit values between min and max
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Toggle dropdown visibility
controlsBtn.addEventListener('click', () => {
    effectControls.style.display = effectControls.style.display === 'block' ? 'none' : 'block';
});

// Invert colors on button click
invertBtn.addEventListener('click', () => {
    invertColors = !invertColors;
    invertBtn.textContent = invertColors ? 'Show Original Colors' : 'Invert Colors';
});

// Capture a snapshot of the canvas and trigger download
snapshotBtn.addEventListener('click', () => {
    const snapshotData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = snapshotData;
    link.download = 'snapshot.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Optional: Stop the video stream when the user navigates away
window.addEventListener('beforeunload', () => {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
});

// Function to create heavenly bodies
function createHeavenlyBodies() {
    const numberOfStars = 50;
    const bodyContainer = document.body;

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('heavenly-body');

        const size = Math.random() * 10 + 5;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.background = `rgba(255, 255, 255, ${Math.random()})`;

        const leftPosition = Math.random() * 100;
        const topPosition = Math.random() * 100;
        star.style.left = `${leftPosition}%`;
        star.style.top = `${topPosition}%`;

        bodyContainer.appendChild(star);
    }
}

// Call the function to create heavenly bodies
createHeavenlyBodies();
