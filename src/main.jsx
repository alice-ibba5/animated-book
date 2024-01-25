import * as THREE from "three";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './App.css'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("canvas"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(33);
camera.position.setX(0);
camera.position.setY(14);

renderer.render(scene, camera);

let mixer = new THREE.AnimationMixer(scene);


const loader = new GLTFLoader();
loader.load("libro-rosso.glb", function (gltf) {

  const objectGltf = gltf.scene;

  // Scala l'oggetto raddoppiandone le dimensioni
  objectGltf.scale.set(20, 20, 20);

  // Aggiungi l'oggetto alla scena
  scene.add(objectGltf);

  const bookTexture = new THREE.TextureLoader().load("libro.jpg");
  const normal2Texture = new THREE.TextureLoader().load("pagina-libro.jpg");
  const sideBookTexture = new THREE.TextureLoader().load("book-side.jpg");

  console.log("GLTF Scene:", gltf.scene);

  // // Traversa l'oggetto GLTF e assegna i materiali alle mesh corrispondenti
  // objectGltf.traverse((child) => {
  //   if (child.isMesh) {

  //     // Stampa le informazioni sul materiale
  //     console.log("Material Index:", child.materialIndex);
  //     console.log("Material Name:", child.material.name);  // Puoi anche stampare altre proprietà del materiale
  //     console.log("Material Properties:", child.material);
  //     // Supponendo che il modello ha solo due materiali, puoi assegnarli in base all'indice del materiale
  //     if (child.materialIndex === 0) {
  //       child.material = material1;
  //     } else if (child.materialIndex === 1) {
  //       child.material = material2;
  //     }
  //   }
  // });

  objectGltf.traverse((child) => {
    if (child.isMesh && child.material.name.toLowerCase() === "cover") {
      child.material.emissive.setHex(0x000000);  // Imposta emissive su nero
      child.material.metalness = 0;  // Disattiva metalness
      child.material.roughness = 1;  // Disattiva roughness
      // ... altre proprietà ...
    }
  });

  objectGltf.traverse((child) => {
    if (child.isMesh) {
      console.log("Mesh Material:", child.material);
      console.log("Material Name:", child.material.name);
      console.log("Material Properties:", child.material);

      // Controlla il nome del materiale in modo case-insensitive
      const materialName = child.material.name.toLowerCase();
      child.material.map = bookTexture;
      // Assegna la texture in base al nome del materiale
      switch (materialName) {
        case "side":
          child.material.map = sideBookTexture;
          child.material.normalMap = sideBookTexture;
          break;
        case "page":
          child.material.map = normal2Texture;
          child.material.normalMap = normal2Texture;
          break;
        case "inner":
          child.material.map = sideBookTexture;
          child.material.normalMap = sideBookTexture;
          break;
        case "cover":
          console.log("Assigning texture to cover material");
          child.material.map = bookTexture;
          break;
        default:
          // Gestisci altri materiali se necessario
          break;
      }
      // Prova a forzare l'aggiornamento della texture
      child.material.needsUpdate = true;
    }
  });

  // Ottieni tutte le animazioni dall'oggetto GLTF
  const animations = gltf.animations;

  // Aggiungi tutte le animazioni al mixer
  animations.forEach((animation) => {
    const action = mixer.clipAction(animation)

    // Imposta il numero di ripetizioni a 1 (una volta)
    action.setLoop(THREE.LoopOnce);

    // Fai in modo che l'animazione rimanga ferma al termine
    action.clampWhenFinished = true;

    action.play(); // Avvia l'animazione
  });
});



const geometry = new THREE.TorusGeometry(10, 3, 16, 100)
const material = new THREE.MeshStandardMaterial({ color: 0xFF6347 });
const torus = new THREE.Mesh(geometry, material);

//scene.add(torus);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 20, 5);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(pointLight, ambientLight);

const lightHelper = new THREE.PointLightHelper(pointLight);
// const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper);



const moonTexture = new THREE.TextureLoader().load("moon.jpg");
const normalTexture = new THREE.TextureLoader().load("normal.jpg");
const bookTexture = new THREE.TextureLoader().load("libro.jpg");

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(15, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture
  })
);

// scene.add(moon);
moon.position.set(50, 15, -30);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100))

  star.position.set(x, y, z);
  // scene.add(star);
}

Array(200).fill().forEach(addStar);

const spaceTexture = new THREE.TextureLoader().load("libreria.jpg");
scene.background = spaceTexture;


const controls = new OrbitControls(camera, renderer.domElement);

const stopPosition = new THREE.Vector3(5, 5, 0);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  mixer.update(clock.getDelta());



  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  controls.update();

  renderer.render(scene, camera);
}

animate()