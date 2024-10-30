const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const invertBtn = document.getElementById('invertBtn');
const snapshotBtn = document.getElementById('snapshotBtn'); // Button to take a snapshot
const controlsBtn = document.getElementById('controlsBtn');
const effectControls = document.getElementById('effectControls');
const toggleCameraBtn = document.getElementById('toggleCameraBtn'); // New button for toggling camera

let invertColors = false;
let videoStream;
let useFrontCamera = true; // Track the currently used camera

// Function to start the video stream with the selected camera
function startVideoStream() {
    const constraints = {
        video: {
            facingMode: useFrontCamera ? 'user' : 'environment' // Switch between front and rear camera
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop()); // Stop previous video stream
            }

            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            videoStream = stream;

            requestAnimationFrame(() => updateCanvas(video));
        })
        .catch(err => {
            console.error("Error accessing webcam: ", err);
        });
}

// Call the function initially to start the video with the front camera
startVideoStream();

// Function to update the canvas with the video feed
function updateCanvas(video) {
    canvas.width = 640; // Set a width for the canvas
    canvas.height = 480; // Set a height for the canvas

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    applyEffects();

    if (invertColors) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Invert colors
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];       // Red
            data[i + 1] = 255 - data[i + 1]; // Green
            data[i + 2] = 255 - data[i + 2]; // Blue
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

    // Create a temporary canvas to apply effects
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    tempCtx.drawImage(canvas, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    // Apply brightness
    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(data[i] + brightness, 0, 255);       // Red
        data[i + 1] = clamp(data[i + 1] + brightness, 0, 255); // Green
        data[i + 2] = clamp(data[i + 2] + brightness, 0, 255); // Blue
    }

    // Apply color intensity
    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp((data[i] * redIntensity) / 255, 0, 255);       // Red
        data[i + 1] = clamp((data[i + 1] * greenIntensity) / 255, 0, 255); // Green
        data[i + 2] = clamp((data[i + 2] * blueIntensity) / 255, 0, 255); // Blue
    }

    tempCtx.putImageData(imageData, 0, 0);
    
    // Draw the adjusted image on the main canvas
    ctx.drawImage(tempCanvas, 0, 0);
    
    // Apply blur if needed (optional)
    if (blur > 0) {
        ctx.filter = `blur(${blur}px)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none'; // Reset filter for future drawings
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
    link.href = snapshotData; // Set the link to the image data URL
    link.download = 'snapshot.png'; // Specify the file name for the download
    document.body.appendChild(link); // Append the link to the body
    link.click(); // Trigger the download
    document.body.removeChild(link); // Remove the link from the document
});

// Toggle between front and rear cameras
toggleCameraBtn.addEventListener('click', () => {
    useFrontCamera = !useFrontCamera; // Toggle camera
    startVideoStream(); // Restart the video stream with the new camera
    toggleCameraBtn.textContent = useFrontCamera ? 'Switch to Rear Camera' : 'Switch to Front Camera';
});

// Optional: Stop the video stream when the user navigates away
window.addEventListener('beforeunload', () => {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop()); // Stop all video tracks
    }
});

// Function to create heavenly bodies
function createHeavenlyBodies() {
    const numberOfStars = 50; // Adjust the number of stars
    const bodyContainer = document.body; // Reference to the body

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('heavenly-body');

        // Set random position and size
        const size = Math.random() * 10 + 5; // Random size between 5px to 15px
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.background = `rgba(255, 255, 255, ${Math.random()})`; // Random opacity

        const leftPosition = Math.random() * 100; // Random left position
        const topPosition = Math.random() * 100; // Random top position
        star.style.left = `${leftPosition}%`;
        star.style.top = `${topPosition}%`;

        // Append to body
        bodyContainer.appendChild(star);
    }
}

// Call the function to create heavenly bodies
createHeavenlyBodies();
