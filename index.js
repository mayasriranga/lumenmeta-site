// DOM Elements
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
const loader = document.getElementById('loader');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const heroSection = document.getElementById('hero');

// Configuration
const totalFrames = 663;
const frameRate = 30; // Target FPS
const imagePrefix = 'Mob';
const imageExtension = '.jpg';
const images = [];
let imagesLoaded = 0;
let currentFrame = 0;
let lastFrameTime = 0;
let isPlaying = false;
let canvasWidth, canvasHeight;
let imageAspectRatio = 16 / 9; // Default, will update

// --- Preloader ---

function pad(num, size) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function preloadImages() {
    for (let i = 0; i < totalFrames; i++) {
        const img = new Image();
        const filename = `${imagePrefix}${pad(i, 3)}${imageExtension}`;
        img.src = filename;

        img.onload = () => {
            imagesLoaded++;
            updateProgress();

            // Get aspect ratio from the first image
            if (i === 0) {
                imageAspectRatio = img.naturalWidth / img.naturalHeight;
                resizeCanvas();
            }

            if (imagesLoaded === totalFrames) {
                startAnimation();
            }
        };

        img.onerror = () => {
            console.error(`Failed to load frame: ${filename}`);
            // Continue anyway to avoid freezing
            imagesLoaded++;
            updateProgress();
            if (imagesLoaded === totalFrames) {
                startAnimation();
            }
        };

        images[i] = img;
    }
}

function updateProgress() {
    const percentage = Math.floor((imagesLoaded / totalFrames) * 100);
    progressFill.style.width = `${percentage}%`;
    progressText.innerText = `${percentage}%`;
}

function startAnimation() {
    // Hide loader
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';

    // Start loop
    isPlaying = true;
    requestAnimationFrame(renderLoop);
}

// --- Animation Loop ---

function renderLoop(timestamp) {
    if (!isPlaying) return;

    // Frame timing control
    const interval = 1000 / frameRate;
    const elapsed = timestamp - lastFrameTime;

    if (elapsed > interval) {
        lastFrameTime = timestamp - (elapsed % interval);
        drawFrame();
        currentFrame = (currentFrame + 1) % totalFrames;
    }

    requestAnimationFrame(renderLoop);
}

function drawFrame() {
    if (!images[currentFrame]) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw with 'object-fit: cover' logic
    const img = images[currentFrame];

    let drawWidth = canvasWidth;
    let drawHeight = canvasWidth / imageAspectRatio;

    if (drawHeight < canvasHeight) {
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imageAspectRatio;
    }

    const x = (canvasWidth - drawWidth) / 2;
    const y = (canvasHeight - drawHeight) / 2;

    ctx.drawImage(img, x, y, drawWidth, drawHeight);
}

// --- Responsive Canvas ---

function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    // Set actual canvas size (avoids blur)
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Redraw immediately if not playing (e.g. paused or just resized)
    if (!isPlaying && images[0]) {
        drawFrame();
    }
}

window.addEventListener('resize', resizeCanvas);

// --- Intersection Observer for Fade-ins ---

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Optional: Stop observing once visible
            // observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// --- Mouse Interaction (Subtle Parallax/Glow) ---
// Adding a subtle tilt effect to model cards
const cards = document.querySelectorAll('.model-card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate rotation (very subtle)
        const xPct = x / rect.width; // 0 to 1
        const yPct = y / rect.height; // 0 to 1

        const rotateX = (0.5 - yPct) * 10; // -5 to 5 deg
        const rotateY = (xPct - 0.5) * 10; // -5 to 5 deg

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});


// Start
resizeCanvas();
preloadImages();
