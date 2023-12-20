import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import './App.css'


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("canvas"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render(scene, camera);

const loader = new THREE.GLTFLoader();

loader.load('./assets/book.gltf', function (gltf) {
    // Aggiungi il modello alla scena
    scene.add(gltf.scene);
});

const geometry = new THREE.TorusGeometry(10, 3, 16, 100)


