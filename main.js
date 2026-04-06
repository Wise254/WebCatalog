import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// --- SETUP SCENE ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050b1a);
scene.fog = new THREE.FogExp2(0x050b1a, 0.008);

// --- CAMERA ---
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 4, 8);
camera.lookAt(0, 0, 0);

// --- RENDERERS ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// CSS2 renderer for text labels
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.left = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// --- CONTROLS ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = false;
controls.enableZoom = true;
controls.zoomSpeed = 1.2;
controls.rotateSpeed = 1.0;
controls.target.set(0, 0.5, 0);

// --- LIGHTING (Dynamic real-world time simulation) ---
// Ambient light
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);

// Main directional light (sun)
const sunLight = new THREE.DirectionalLight(0xfff5e0, 1.2);
sunLight.position.set(5, 10, 3);
sunLight.castShadow = true;
sunLight.receiveShadow = false;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
scene.add(sunLight);

// Fill light
const fillLight = new THREE.PointLight(0x4466cc, 0.4);
fillLight.position.set(-2, 1, 4);
scene.add(fillLight);

// Back rim light
const rimLight = new THREE.PointLight(0xffaa66, 0.5);
rimLight.position.set(0, 2, -3);
scene.add(rimLight);

// Dynamic colored LEDs that rotate (unique feature)
const colorLight = new THREE.PointLight(0xff44aa, 0.6);
colorLight.position.set(2, 1.5, 2);
scene.add(colorLight);

// Floor reflection (invisible but catches shadows)
const floorHelper = new THREE.GridHelper(15, 20, 0x88aaff, 0x335588);
floorHelper.position.y = -0.8;
floorHelper.material.transparent = true;
floorHelper.material.opacity = 0.3;
scene.add(floorHelper);

// --- CREATE 3D WATCH MODELS (Procedural but beautiful) ---
const watches = [];
const watchNames = [
    "Rolex Daytona", "Patek Philippe Nautilus", "Audemars Piguet Royal Oak",
    "Omega Speedmaster", "Richard Mille RM11", "Cartier Santos"
];
const watchColors = [0xcfa435, 0x2c5f8a, 0x6b8e6e, 0x333333, 0xaa4a3e, 0xc0c0c0];
const positions = [
    { x: -2.5, z: -1.2, y: 0 },  // Rolex
    { x: 0, z: -1.5, y: 0.1 },    // Patek
    { x: 2.5, z: -1.2, y: 0 },    // AP
    { x: -1.8, z: 1.5, y: 0 },    // Omega
    { x: 1.2, z: 1.8, y: 0.1 },   // RM
    { x: 3, z: 1, y: 0 }          // Cartier
];

function createWatchModel(brand, colorHex, index) {
    const group = new THREE.Group();
    
    // Watch case (cylinder)
    const caseGeo = new THREE.CylinderGeometry(0.65, 0.7, 0.25, 64);
    const caseMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.85, roughness: 0.25, emissive: 0x000000 });
    const watchCase = new THREE.Mesh(caseGeo, caseMat);
    watchCase.castShadow = true;
    watchCase.receiveShadow = false;
    group.add(watchCase);
    
    // Dial (smaller cylinder on top)
    const dialGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.05, 64);
    const dialMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.2, roughness: 0.4, emissive: 0x111111 });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.position.y = 0.14;
    group.add(dial);
    
    // Glass dome
    const glassGeo = new THREE.SphereGeometry(0.55, 64, 64, 0, Math.PI * 2, 0, Math.PI / 3);
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.05, transparent: true, opacity: 0.25, envMapIntensity: 1.0 });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.y = 0.18;
    group.add(glass);
    
    // Watch hands (simple markers)
    const handMat = new THREE.MeshStandardMaterial({ color: 0xffcc88, metalness: 0.7 });
    const hourHand = new THREE.BoxGeometry(0.08, 0.35, 0.03);
    const hour = new THREE.Mesh(hourHand, handMat);
    hour.position.set(0, 0.17, 0.2);
    group.add(hour);
    
    const minuteHand = new THREE.BoxGeometry(0.05, 0.48, 0.03);
    const minute = new THREE.Mesh(minuteHand, handMat);
    minute.position.set(0.15, 0.17, 0);
    group.add(minute);
    
    // Crown (side button)
    const crownGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.2, 12);
    const crownMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.9 });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.rotation.z = Math.PI / 2;
    crown.position.set(0.72, 0.05, 0);
    group.add(crown);
    
    // Strap/bracelet (simple bands)
    const strapMat = new THREE.MeshStandardMaterial({ color: 0x442200, roughness: 0.6, metalness: 0.1 });
    const topStrap = new THREE.BoxGeometry(0.55, 0.08, 0.9);
    const strapTop = new THREE.Mesh(topStrap, strapMat);
    strapTop.position.set(0, -0.12, 0);
    group.add(strapTop);
    
    const bottomStrap = new THREE.BoxGeometry(0.55, 0.08, 0.9);
    const strapBottom = new THREE.Mesh(bottomStrap, strapMat);
    strapBottom.position.set(0, -0.28, 0);
    group.add(strapBottom);
    
    // Add floating particles around high-end watches (unique sparkle)
    const particleCount = 30;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        particlePositions[i*3] = (Math.random() - 0.5) * 1.6;
        particlePositions[i*3+1] = Math.random() * 0.8;
        particlePositions[i*3+2] = (Math.random() - 0.5) * 1.6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xffaa55, size: 0.012, transparent: true });
    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);
    
    group.userData = { brand, index, particles, originalY: 0, floatSpeed: 0.5 + Math.random() * 0.5 };
    return group;
}

// Create all watches and position them in a semi-circle
for (let i = 0; i < watchNames.length; i++) {
    const watch = createWatchModel(watchNames[i], watchColors[i], i);
    watch.position.x = positions[i].x;
    watch.position.z = positions[i].z;
    watch.position.y = positions[i].y;
    watch.rotation.y = Math.sin(i) * 0.5;
    scene.add(watch);
    watches.push(watch);
}

// --- CSS2D TEXT LABELS (floating above watches) ---
watchNames.forEach((name, idx) => {
    const div = document.createElement('div');
    div.textContent = name;
    div.style.color = '#ffdd99';
    div.style.fontSize = '14px';
    div.style.fontWeight = 'bold';
    div.style.textShadow = '1px 1px 0px black';
    div.style.backgroundColor = 'rgba(0,0,0,0.6)';
    div.style.padding = '4px 12px';
    div.style.borderRadius = '20px';
    div.style.borderLeft = `3px solid ${new THREE.Color(watchColors[idx]).getStyle()}`;
    div.style.fontFamily = 'monospace';
    div.style.backdropFilter = 'blur(4px)';
    div.style.pointerEvents = 'none';
    
    const label = new CSS2DObject(div);
    label.position.copy(watches[idx].position);
    label.position.y += 0.85;
    scene.add(label);
    watches[idx].userData.label = label;
});

// --- UNIQUE FEATURE 1: Real-time lighting based on actual time ---
function updateLightingByTime() {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    let intensity = 1.0;
    let colorHue = 0.55; // default daylight
    
    if (hour < 6 || hour > 18) {
        intensity = 0.25;
        colorHue = 0.6; // moon tint
    } else if (hour < 8 || hour > 16) {
        intensity = 0.7;
        colorHue = 0.1; // sunrise/sunset
    } else {
        intensity = 1.0;
        colorHue = 0.55;
    }
    
    sunLight.intensity = intensity;
    const color = new THREE.Color().setHSL(colorHue, 0.8, 0.6);
    sunLight.color = color;
    
    document.getElementById('watch-info').innerHTML = `🕐 ${now.toLocaleTimeString()} | 🌞 Light: ${Math.round(intensity*100)}% | 🕶️ ${watches.length} Ultra-Luxury Watches`;
}
setInterval(updateLightingByTime, 1000);
updateLightingByTime();

// --- UNIQUE FEATURE 2: Floating animation & rotating LED light ---
let time = 0;
function animateWatches() {
    time += 0.016;
    watches.forEach((watch, i) => {
        // Gentle floating
        watch.position.y = positions[i].y + Math.sin(time * 1.5 + i) * 0.03;
        // Subtle rotation
        watch.rotation.z = Math.sin(time * 0.8 + i) * 0.05;
        // Rotate particles
        if (watch.userData.particles) {
            watch.userData.particles.rotation.y += 0.01;
        }
    });
    
    // Rotating colored light
    const lightRadius = 3.5;
    colorLight.position.x = Math.sin(time * 0.7) * lightRadius;
    colorLight.position.z = Math.cos(time * 0.5) * lightRadius;
    const hue = (time * 0.1) % 1;
    colorLight.color.setHSL(hue, 1, 0.5);
}

// --- UNIQUE FEATURE 3: VOICE CONTROL ---
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    let currentWatchIndex = 0;
    
    function focusWatch(index) {
        if (index < 0) index = watches.length - 1;
        if (index >= watches.length) index = 0;
        currentWatchIndex = index;
        const targetPos = watches[currentWatchIndex].position;
        controls.target.set(targetPos.x, targetPos.y + 0.3, targetPos.z);
        
        // Flash effect on selected watch
        watches.forEach((w, i) => {
            w.children.forEach(child => {
                if (child.material && child.material.emissive) {
                    child.material.emissiveIntensity = (i === currentWatchIndex) ? 0.6 : 0;
                }
            });
        });
        
        document.getElementById('watch-info').innerHTML = `✨ SELECTED: ${watchNames[currentWatchIndex]} | Say "next" or brand name`;
    }
    
    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        document.getElementById('voice-status').innerHTML = `🎤 You said: "${command}"`;
        
        if (command.includes('next') || command.includes('switch')) {
            focusWatch(currentWatchIndex + 1);
        } else if (command.includes('previous') || command.includes('back')) {
            focusWatch(currentWatchIndex - 1);
        } else {
            // Try to match brand name
            const matchedIndex = watchNames.findIndex(name => command.includes(name.toLowerCase()));
            if (matchedIndex !== -1) {
                focusWatch(matchedIndex);
            } else {
                document.getElementById('voice-status').innerHTML = `🎤 Command not recognized: "${command}"`;
                setTimeout(() => {
                    document.getElementById('voice-status').innerHTML = `🎤 Voice ready: Say "next", "previous", or a brand name`;
                }, 2000);
            }
        }
    };
    
    recognition.onerror = () => {
        document.getElementById('voice-status').innerHTML = `🎤 Voice error - click to retry`;
    };
    
    // Start voice recognition loop
    function startVoice() {
        try {
            recognition.start();
        } catch(e) {}
        setTimeout(startVoice, 5000);
    }
    startVoice();
    focusWatch(0);
} else {
    document.getElementById('voice-status').innerHTML = `🎤 Voice not supported in this browser`;
}

// --- UNIQUE FEATURE 4: AR preview (WebXR) ---
// (Simplified - would need HTTPS and user gesture)
const arButton = document.createElement('button');
arButton.textContent = '🔍 AR PREVIEW (beta)';
arButton.style.position = 'absolute';
arButton.style.bottom = '20px';
arButton.style.right = '20px';
arButton.style.zIndex = '200';
arButton.style.padding = '10px 20px';
arButton.style.background = '#ff3366';
arButton.style.color = 'white';
arButton.style.border = 'none';
arButton.style.borderRadius = '30px';
arButton.style.fontWeight = 'bold';
arButton.style.cursor = 'pointer';
document.body.appendChild(arButton);
arButton.onclick = () => {
    alert('AR mode would activate here on HTTPS. In 2026, this uses WebXR to place the selected watch in your real environment.');
};

// --- RENDER LOOP ---
function render() {
    animateWatches();
    controls.update(); // only needed if autoRotate or damping
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
    requestAnimationFrame(render);
}
render();

// --- HANDLE RESIZE ---
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

// Console welcome
console.log('%c🔥 3D Watch Collector v2026 | Unique features: Voice control, Time-based lighting, Floating animations, AR ready', 'color: gold; font-size: 16px');