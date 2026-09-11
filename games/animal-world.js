import * as THREE from 'https://esm.sh/three@0.160.0';
import { MTLLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const speech = document.querySelector('#speech');
const sceneHost = document.querySelector('#animalScene');
let audioContext;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#79cfe0');
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0, 5.6, 13);
camera.lookAt(0, 1.1, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneHost.appendChild(renderer.domElement);

const animals = [];
const clock = new THREE.Clock();

function playTone(frequency, duration, type = 'sine', delay = 0) {
    audioContext ??= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + delay);
    gain.gain.setValueAtTime(0.001, audioContext.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.22, audioContext.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(audioContext.currentTime + delay);
    oscillator.stop(audioContext.currentTime + delay + duration);
}

function playAnimalSound(sound) {
    if (sound === 'mouse') {
        playTone(620, 0.09, 'square');
        playTone(760, 0.12, 'square', 0.11);
    } else if (sound === 'cat') {
        audioContext ??= new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(520, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(260, audioContext.currentTime + 0.42);
        gain.gain.setValueAtTime(0.001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.3, audioContext.currentTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.45);
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.46);
    } else {
        playTone(420, 0.12, 'triangle');
        playTone(300, 0.22, 'triangle', 0.14);
    }
}

function speakAnimalSound(sound) {
    const utterance = new SpeechSynthesisUtterance(sound === 'mouse' ? 'Piip piip!' : 'Miau!');
    utterance.lang = 'fi-FI';
    utterance.rate = 0.75;
    utterance.pitch = sound === 'mouse' ? 1.35 : 1.05;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

function finishLoading(model, settings) {
    model.traverse((part) => {
        if (!part.isMesh) return;
        part.castShadow = true;
        part.receiveShadow = true;
        settings.material?.(part.material);
    });

    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = settings.maxSize / Math.max(size.x, size.y, size.z);
    model.position.sub(center);
    model.scale.setScalar(scale);
    model.position.y = (size.y * scale) / 2;

    const animal = new THREE.Group();
    animal.add(model);
    animal.position.set(...settings.position);
    animal.rotation.y = settings.rotation;
    animal.userData = {
        name: settings.name,
        sound: settings.sound,
        baseX: settings.position[0],
        baseY: settings.position[1],
        baseZ: settings.position[2],
        action: 0,
        motionTime: 0,
        focusTarget: 0,
        mixer: settings.animations?.length ? new THREE.AnimationMixer(model) : null,
        walkAction: null
    };

    if (animal.userData.mixer && settings.animations.length) {
        const clip = settings.animations.find((item) => /walk|run|step/i.test(item.name)) || settings.animations[0];
        animal.userData.walkAction = animal.userData.mixer.clipAction(clip);
    }

    animal.traverse((part) => { part.userData.animal = animal; });
    scene.add(animal);
    animals.push(animal);
    speech.textContent = 'Paina eläintä!';
}

const remoteMousePath = 'https://raw.githubusercontent.com/ChiKirk/Daniels-World/main/Mouse/';
const remoteMouseModel = 'https://media.githubusercontent.com/media/ChiKirk/Daniels-World/main/Mouse/model.obj';
const mtlLoader = new MTLLoader();
const objLoader = new OBJLoader();
mtlLoader.setPath(remoteMousePath);
mtlLoader.load('material.mtl', (materials) => {
    materials.preload();
    objLoader.setMaterials(materials);
    objLoader.load(remoteMouseModel, (model) => {
        finishLoading(model, {
            name: 'Hiiri', sound: 'mouse', maxSize: 3.9,
            position: [-1.7, 0, -1.1], rotation: 0.35,
            material: (value) => {
                const list = Array.isArray(value) ? value : [value];
                list.forEach((material) => {
                    material.color.set('#d8d8d8');
                    material.roughness = 0.88;
                    material.metalness = 0;
                    material.emissive.set('#252525');
                    material.emissiveIntensity = 0.28;
                });
            }
        });
    }, undefined, () => { speech.textContent = 'Hiiren mallia ei voitu ladata.'; });
}, undefined, () => { speech.textContent = 'Hiiren materiaaleja ei voitu ladata.'; });

const catLoader = new GLTFLoader();
catLoader.load('siberian%20cat/siberian.glb', (gltf) => {
    finishLoading(gltf.scene, {
        name: 'Kissa', sound: 'cat', maxSize: 3.1,
        position: [1.8, 0, -1.5], rotation: -Math.PI / 2,
        animations: gltf.animations
    });
}, undefined, () => { speech.textContent = 'Kissan mallia ei voitu ladata.'; });

const ground = new THREE.Mesh(
    new THREE.CircleGeometry(7.8, 48),
    new THREE.MeshStandardMaterial({ color: '#64aa5d', roughness: 1 })
);
ground.position.set(0, -0.12, -0.2);
ground.scale.set(1, 1, 0.68);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
scene.add(new THREE.HemisphereLight('#f4fcff', '#477d49', 2.6));
const sunLight = new THREE.DirectionalLight('#fff5d7', 3.2);
sunLight.position.set(-4, 8, 6);
sunLight.castShadow = true;
scene.add(sunLight);
const fillLight = new THREE.DirectionalLight('#b8d9ff', 1.4);
fillLight.position.set(5, 4, 2);
scene.add(fillLight);
const frontLight = new THREE.PointLight('#fff4df', 2.4, 9, 2);
frontLight.position.set(-1.5, 3.5, 6);
scene.add(frontLight);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown', (event) => {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(animals, true)[0];
    if (!hit) return;

    const animal = hit.object.userData.animal;
    animals.forEach((item) => {
        item.userData.action = item === animal ? 1 : 0;
        item.userData.motionTime = item === animal ? 1.35 : 0;
        item.userData.focusTarget = item === animal ? 1 : 0;
        if (item.userData.walkAction) {
            if (item === animal) item.userData.walkAction.reset().fadeIn(0.12).play();
            else item.userData.walkAction.fadeOut(0.12);
        }
    });
    speech.textContent = `${animal.userData.name} sanoo hei!`;
    playAnimalSound(animal.userData.sound);
    speakAnimalSound(animal.userData.sound);
});

function resizeScene() {
    const width = sceneHost.clientWidth;
    const height = sceneHost.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

new ResizeObserver(resizeScene).observe(sceneHost);
resizeScene();

function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);
    const time = clock.elapsedTime;

    animals.forEach((animal, index) => {
        if (animal.userData.mixer) animal.userData.mixer.update(delta);
        if (animal.userData.motionTime > 0) animal.userData.motionTime -= delta;
        if (animal.userData.motionTime <= 0) {
            animal.userData.action = 0;
            animal.userData.focusTarget = 0;
            if (animal.userData.walkAction) animal.userData.walkAction.fadeOut(0.18);
        }
        const progress = animal.userData.motionTime > 0 ? 1 - animal.userData.motionTime / 1.35 : 1;
        const forward = animal.userData.motionTime > 0 ? Math.sin(Math.min(progress, 1) * Math.PI) * 1.1 : 0;
        const targetX = animal.userData.focusTarget ? 0 : animal.userData.baseX;
        const targetZ = animal.userData.focusTarget ? 4.25 : animal.userData.baseZ;
        const targetScale = animal.userData.focusTarget ? 1.2 : 1;
        animal.position.x += (targetX - animal.position.x) * Math.min(delta * 8, 1);
        animal.position.z += (targetZ + forward - animal.position.z) * Math.min(delta * 8, 1);
        animal.position.y += (animal.userData.baseY + Math.sin(time * 1.4 + index) * 0.018 - animal.position.y) * Math.min(delta * 8, 1);
        animal.scale.x += (targetScale - animal.scale.x) * Math.min(delta * 8, 1);
        animal.scale.y = animal.scale.x;
        animal.scale.z = animal.scale.x;
    });

    renderer.render(scene, camera);
}

animate();
