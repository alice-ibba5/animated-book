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

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Tipo di mappa ombra
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(20);
camera.position.setX(20);
camera.position.setY(2);

renderer.render(scene, camera);

let mixer = new THREE.AnimationMixer(scene);


const loader = new GLTFLoader();
loader.load("libro-rosso.glb", function (gltf) {

  const objectGltf = gltf.scene;

  // Scala l'oggetto raddoppiandone le dimensioni
  objectGltf.scale.set(20, 20, 20);
  objectGltf.position.set(0, -11, 20);

  // Aggiungi l'oggetto alla scena
  scene.add(objectGltf);

  const bookTexture = new THREE.TextureLoader().load("libro.jpg");
  const normal2Texture = new THREE.TextureLoader().load("pagina-libro.jpg");
  const sideBookTexture = new THREE.TextureLoader().load("book-side.jpg");

  console.log("GLTF Scene:", gltf.scene);

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




  //Importo la libreria
  const loader2 = new GLTFLoader();
  loader2.load("solo-libreria.glb", function (gltf2) {

    const objectGltf2 = gltf2.scene;

    // Scala l'oggetto raddoppiandone le dimensioni
    objectGltf2.scale.set(20, 20, 20);
    objectGltf2.position.set(-30, -20, 20);

    // Aggiungi l'oggetto alla scena
    scene.add(objectGltf2);

    // Calcola il bounding box dell'oggetto
    const boundingBox = new THREE.Box3().setFromObject(objectGltf2);

    // Calcola il centro del bounding box
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    // Imposta la posizione della camera in modo che sia davanti all'oggetto
    camera.position.copy(center.clone().add(new THREE.Vector3(0, 2, 37)));

    // Fai in modo che la camera guardi verso il centro dell'oggetto
    camera.lookAt(center);

    const legnoTexture = new THREE.TextureLoader().load("legno.jpg", (texture) => {
      // Callback chiamato quando la texture è stata caricata con successo
      // Assegna la texture ai materiali qui
      console.log("Texture 'legno.jpg' caricata con successo");
      console.log("Dimensioni della texture:", texture.image.width, texture.image.height);

    });
    const pelleTexture = new THREE.TextureLoader().load("pelle.jpg");
    const sideBookTexture2 = new THREE.TextureLoader().load("book-side.jpg");

    console.log("GLTF Scene:", gltf2.scene);

    objectGltf2.traverse((child) => {
      if (child.isMesh && child.material.name.toLowerCase() === "_1") {
        child.material.emissive.setHex(0x000000);  // Imposta emissive su nero
        child.material.metalness = 0;  // Disattiva metalness
        child.material.roughness = 1;  // Disattiva roughness
        // ... altre proprietà ...
      }
    });

    objectGltf2.traverse((child) => {
      if (child.isMesh) {
        console.log("Mesh Material2:", child.material);
        console.log("Material Name2:", child.material.name);
        console.log("Material Properties2:", child.material);

        // Controlla il nome del materiale in modo case-insensitive
        const materialName2 = child.material.name.toLowerCase();

        // Assegna la texture in base al nome del materiale
        switch (materialName2) {
          case "_1":
            child.material.map = legnoTexture;
            child.material.normalMap = legnoTexture;
            child.material.needsUpdate = true;
            break;
          case "Sumele_Skin":
            child.material.map = pelleTexture;
            child.material.normalMap = pelleTexture;
            child.material.needsUpdate = true;
            break;
          case "M_0010_Snow":
            child.material.map = sideBookTexture2;
            child.material.normalMap = sideBookTexture2;
            child.material.needsUpdate = true;
            break;
          case "material":
            child.material.map = legnoTexture;
            child.material.normalMap = legnoTexture;
            child.material.needsUpdate = true;
            break;
          default:
            // Gestisci altri materiali se necessario
            break;
        }
        // Prova a forzare l'aggiornamento della texture
        child.material.needsUpdate = true;
      }
    });

    //Importo i libri
    const loader3 = new GLTFLoader();
    loader3.load("solo-libri.glb", function (gltf3) {

      const objectGltf3 = gltf3.scene;

      // Scala l'oggetto raddoppiandone le dimensioni
      objectGltf3.scale.set(20, 20, 20);
      objectGltf3.position.set(-102, -20, 20);

      // Aggiungi l'oggetto alla scena
      scene.add(objectGltf3);

      const legnoTexture = new THREE.TextureLoader().load("legno.jpg", (texture) => {
        // Callback chiamato quando la texture è stata caricata con successo
        // Assegna la texture ai materiali qui
        console.log("Texture 'legno.jpg' caricata con successo");
        console.log("Dimensioni della texture:", texture.image.width, texture.image.height);

      });
      const pelleTexture = new THREE.TextureLoader().load("pelle.jpg");
      const sideBookTexture2 = new THREE.TextureLoader().load("book-side.jpg");

      console.log("GLTF Scene:", gltf3.scene);

      objectGltf3.traverse((child) => {
        if (child.isMesh && child.material.name.toLowerCase() === "_1") {
          child.material.emissive.setHex(0x000000);  // Imposta emissive su nero
          child.material.metalness = 0;  // Disattiva metalness
          child.material.roughness = 1;  // Disattiva roughness
          // ... altre proprietà ...
        }
      });

      objectGltf2.traverse((child) => {
        if (child.isMesh) {
          console.log("Mesh Material3:", child.material);
          console.log("Material Name3:", child.material.name);
          console.log("Material Properties3:", child.material);

          // Controlla il nome del materiale in modo case-insensitive
          const materialName3 = child.material.name.toLowerCase();

          // Assegna la texture in base al nome del materiale
          switch (materialName3) {
            case "_1":
              child.material.map = legnoTexture;
              child.material.normalMap = legnoTexture;
              child.material.needsUpdate = true;
              break;
            case "Sumele_Skin":
              child.material.map = pelleTexture;
              child.material.normalMap = pelleTexture;
              child.material.needsUpdate = true;
              break;
            case "M_0010_Snow":
              child.material.map = sideBookTexture2;
              child.material.normalMap = sideBookTexture2;
              child.material.needsUpdate = true;
              break;
            case "material":
              child.material.map = legnoTexture;
              child.material.normalMap = legnoTexture;
              child.material.needsUpdate = true;
              break;
            default:
              // Gestisci altri materiali se necessario
              break;
          }
          // Prova a forzare l'aggiornamento della texture
          child.material.needsUpdate = true;
        }
      });

    });
  })
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
pointLight.position.set(5, 20, 30);
pointLight.castShadow = true; // Abilita la generazione di ombre

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(pointLight, ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);
directionalLight.castShadow = true; // Abilita la generazione di ombre

const lightHelper = new THREE.PointLightHelper(pointLight);
// const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper);



const moonTexture = new THREE.TextureLoader().load("moon.jpg");
const normalTexture = new THREE.TextureLoader().load("normal.jpg");


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
  const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(200))

  star.position.set(x, y, z);
  //scene.add(star);
}

Array(200).fill().forEach(addStar);

const spaceTexture = new THREE.TextureLoader().load("space.jpg");
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
