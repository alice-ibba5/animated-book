import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";

import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';

window.addEventListener("error", e => {
    alert("Error!\n" + e.name + ":\n" + e.message);
});


class App {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(45, innerWidth / (innerHeight), .1, 100);
        this.camera.position.set(.7, 1.1, .8);
        this.initRenderer();


        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target = new THREE.Vector3(0, 1, 0);
        this.controls.autoRotate = true;
        this.scene = new THREE.Scene();
        // this.scene.add(new THREE.GridHelper(10,10));

        setTimeout(() => {
            this.initHDR();
        }, 500);

        this.initVR();

        var pagePivot = new THREE.Object3D();
        this.scene.add(pagePivot);
        pagePivot.rotation.y = Math.PI / 2;
        pagePivot.scale.setScalar(0.125);
        pagePivot.position.y = 1.125;
        pagePivot.position.z = 0.16;

        var steelBase = new THREE.Mesh(new RoundBox(2.2, .35, .1, 0.0325), new THREE.MeshStandardMaterial({ metalness: 1, roughness: 0.1 }));
        steelBase.position.x = 1.04;
        steelBase.position.y = -1.05;
        pagePivot.add(steelBase);
        for (var i = 0; i < 30; i++) {

            pagePivot.add(this.addPage(i));
        }

        //let's make a bookshelf!
        this.addShelf();
    }

    addShelf() {
        var o = {
            thickness: 0.026,
            height: 1.6,
            width: 0.92,
            depth: 0.33,
            shelfSpans: 5,
            cornerRadius: 0.0015
        };

        const normalMap = this.getWoodMap();
        const shelfMaterial = new THREE.MeshStandardMaterial({ color: 'black', roughness: 1, roughnessMap: this.noiseMap(), normalMap });
        var side = new THREE.Mesh(new RoundBox(o.thickness, o.depth, o.height + o.thickness, o.cornerRadius), shelfMaterial);
        side.rotation.x = Math.PI / 2;
        var shelfPivot = new THREE.Object3D();
        shelfPivot.add(side);
        side.position.x = o.width / 2 + o.thickness / 2;
        side = side.clone();
        side.position.x *= -1;
        shelfPivot.add(side);
        var basePlank = new THREE.Mesh(new RoundBox(o.width, o.thickness, o.depth, o.cornerRadius), shelfMaterial);
        for (var i = 0; i <= o.shelfSpans; i++) {
            var plank = basePlank.clone();
            shelfPivot.add(plank);
            plank.material = plank.material.clone();
            plank.material.roughnessMap = this.noiseMap();
            plank.material.normalMap = this.getWoodMap();
            plank.position.y = (i / o.shelfSpans - 0.5) * o.height;
        }
        shelfPivot.position.y = o.height / 2;
        this.scene.add(shelfPivot);
    }


    noiseMap() {
        const c = document.createElement('canvas');
        c.width = c.height = 1024;
        const g = c.getContext('2d');
        g.fillStyle = "gray";
        g.fillRect(0, 0, 1024, 1024);
        g.globalAlpha = 0.3;
        for (var i = 0; i < 1e4; i++) {
            g.fillStyle = `hsl(0, 100%, ${Math.floor(Math.random() * 10 + 70)}%)`;
            g.fillRect(Math.random() * 1024, Math.random() * 1024, 100, 20);

        }

        return new THREE.CanvasTexture(c);
    }


    bumpToNormal(canvas, offset = 1, intensity = 1) {
        const g = canvas.getContext('2d');
        const src = g.getImageData(0, 0, canvas.width, canvas.height);
        const dest = g.getImageData(0, 0, canvas.width, canvas.height);


        for (var i = 0; i < src.data.length; i += 4) {

            //TODO this doens't resolve over the width boundary!
            var red = (src.data[i + 0] - src.data[i + 4 * offset]) * intensity;
            var green = (src.data[i + 0] - src.data[i + 4 * offset * canvas.width]) * intensity;
            var blue = 255 - Math.abs(red) - Math.abs(green);

            dest.data[i + 0] = 128 + red;
            dest.data[i + 1] = 128 + green;
            dest.data[i + 2] = blue;
            dest.data[i + 3] = 255;
        }

        g.putImageData(dest, 0, 0);
        return canvas;
    }

    getWoodMap() {
        const c = document.createElement('canvas');
        c.width = c.height = 1024;
        const g = c.getContext('2d');

        const grad = g.createLinearGradient(0, 0, 0, 1024);
        for (var i = 0; i < 50; i++) {

            grad.addColorStop(Math.random(), `hsl(0, 100%, ${Math.floor(Math.random() * 100)}%)`);
        }
        g.fillStyle = grad;
        g.fillRect(0, 0, 1024, 1024);


        return new THREE.CanvasTexture(this.bumpToNormal(c, 1, 1));
    }

    addPage(n) {

        const segmentHeight = 6;
        const segmentCount = 20;
        const height = segmentHeight * segmentCount;
        const halfHeight = height * 0.5;

        const sizing = {
            segmentHeight: segmentHeight,
            segmentCount: segmentCount,
            height: height,
            halfHeight: halfHeight
        };

        const geometry = this.createGeometry(sizing);
        const bones = this.createBones(sizing);
        const mesh = this.createMesh(geometry, bones);

        mesh.onBeforeRender = () => {
            var sT = Math.sin(Date.now() / 10000);
            var amt = 0.8 * sT;
            bones.forEach((b, i) => {
                // b.scale.setScalar(Math.pow(1.2, -i/10));
                b.rotation.x = 0.3 * Math.sin(performance.now() / 1300 + i / 10 + n / 5) * amt;
                amt *= 1.04;
                // b.rotation.x = 0.3*Math.cos(performance.now()/310+i/10);

            });
        };
        mesh.scale.multiplyScalar(0.015);
        mesh.position.x = n / 14
        return mesh;
    }


    createMesh(geometry, bones) {

        const material = new THREE.MeshStandardMaterial({
            color: 0x156289,

            side: THREE.DoubleSide,
            roughness: 0.2,
            metalness: 1
        });

        const mesh = new THREE.SkinnedMesh(geometry, material);
        const skeleton = new THREE.Skeleton(bones);

        mesh.add(bones[0]);

        mesh.bind(skeleton);

        const skeletonHelper = new THREE.SkeletonHelper(mesh);
        skeletonHelper.material.linewidth = 2;

        return mesh;

    }
    createBones(sizing) {

        const bones = [];

        let prevBone = new THREE.Bone();
        bones.push(prevBone);
        prevBone.position.y = - sizing.halfHeight;

        for (let i = 0; i < sizing.segmentCount; i++) {

            const bone = new THREE.Bone();
            bone.position.y = sizing.segmentHeight;
            bones.push(bone);
            prevBone.add(bone);
            prevBone = bone;

        }

        return bones;

    }
    createGeometry(sizing) {

        const geometry = new THREE.PlaneGeometry(5, sizing.height, 2, sizing.segmentCount * 5);


        const position = geometry.attributes.position;

        const vertex = new THREE.Vector3();

        const skinIndices = [];
        const skinWeights = [];

        for (let i = 0; i < position.count; i++) {

            vertex.fromBufferAttribute(position, i);

            const y = (vertex.y + sizing.halfHeight);

            const skinIndex = Math.floor(y / sizing.segmentHeight);
            const skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight;

            skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
            skinWeights.push(1 - skinWeight, skinWeight, 0, 0);

        }

        geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
        geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));

        return geometry;

    }
    addSkinnedPage() {

        let geo = new THREE.PlaneGeometry(2, 3, 10, 10);

        const oG = new Geometry().fromBufferGeometry(geo);
        //do the processing for skinning!
        //for a start, let's move everything over so the left side is the origin.

        debugger;
        const bones = this.buildSkeleton(5, 2);
        oG.vertices.forEach((v, i) => {
            v.x += 1;
            // oG.skinIndices[i] = 
        });

        geo = oG.toBufferGeometry();


        const material = new THREE.MeshStandardMaterial({ color: "white", wireframe: false });
        const skeleton = new THREE.Skeleton(bones);

        const mesh = new THREE.SkinnedMesh(geo, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = 1;
        this.scene.add(mesh);


    }

    buildSkeleton(boneCount, length) {
        const bone = new THREE.Bone();
        let parent = bone;
        const bones = [];
        bones.push(bone);
        bone.position.z = -0.5;
        for (var i = 0; i < boneCount; i++) {
            const newBone = new THREE.Bone();
            newBone.position.z = boneCount / length;
            parent.add(newBone);
            parent = newBone;
            bones.push(newBone);
        }
        return bones;
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(innerWidth, innerHeight);
        this.renderer.setClearColor(0x202020);
        this.renderer.setAnimationLoop(e => this.update(e));
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.xr.enabled = true;
        document.body.appendChild(this.renderer.domElement);
    }

    initVR() {
        const controllerModelFactory = new XRControllerModelFactory();
        const handModelFactory = new XRHandModelFactory().setPath("https://threejs.org/examples/models/fbx/");

        const addControls = number => {
            const controller = this.renderer.xr.getController(number);
            this.scene.add(controller);
            const grip = this.renderer.xr.getControllerGrip(number);
            grip.add(controllerModelFactory.createControllerModel(grip));
            this.scene.add(grip);
            const hand = this.renderer.xr.getHand(number);

            hand.add(handModelFactory.createHandModel(hand));

            this.scene.add(hand);
            return { controller, grip, hand };
        };
        this.zero = addControls(0);
        this.one = addControls(1);
        this.vrButton = VRButton.createButton(this.renderer);
        document.body.appendChild(this.vrButton);
    }

    update(e) {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    initHDR() {
        this.renderer.physicallyCorrectLights = true;
        this.renderer.toneMapping = THREE.LinearToneMapping;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMappingExposure = 0.8;

        new RGBELoader()
            .setDataType(THREE.HalfFloatType)
            .setPath('https://threejs.org/examples/textures/equirectangular/')
            .load('royal_esplanade_1k.hdr', texture => {
                //   .load( 'b515_IBL.hdr', texture=> {
                const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
                pmremGenerator.compileEquirectangularShader();
                const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                this.scene.environment = envMap;
                texture.dispose();
                pmremGenerator.dispose();
            });
    }
}

class RoundBox extends THREE.BufferGeometry {

    constructor(width = 1, height = 1, depth = 1, radius = 1, spans = 5) {

        super();
        this.root = new THREE.Object3D();

        this.width = width;
        this.height = height;
        this.depth = depth;
        this.radius = radius;
        this.spans = spans;
        var xyz = [(this.width / 2 - this.radius), (this.height / 2 - this.radius), (this.depth / 2 - this.radius)];

        var plane = this._plane(0, 1, xyz);
        plane.position.set(0, 0, this.depth / 2);

        plane = this._plane(0, 1, xyz);
        plane.position.set(0, 0, -this.depth / 2);
        plane.rotation.x = Math.PI;

        plane = this._plane(2, 1, xyz);
        plane.position.set(this.width / 2, 0, 0);
        plane.rotation.y = Math.PI / 2;

        plane = this._plane(2, 1, xyz);
        plane.position.set(-this.width / 2, 0, 0);
        plane.rotation.y = -Math.PI / 2;

        plane = this._plane(0, 2, xyz);
        plane.position.set(0, (this.height / 2), 0);
        plane.rotation.x = -Math.PI / 2;

        plane = this._plane(0, 2, xyz);
        plane.position.set(0, (-this.height / 2), 0);
        plane.rotation.x = Math.PI / 2;

        var coefsA = [[1, 0, 1], [1, 0, -1], [-1, 0, -1], [-1, 0, 1]];
        var coefsB = [[0, 1, 1], [0, 1, -1], [0, -1, -1], [0, -1, 1]];
        var coefsC = [[1, -1, 0], [1, 1, 0], [-1, 1, 0], [-1, -1, 0]];

        for (var i = 0; i < coefsA.length; i++) {
            var cyl = this._cyl(this.height, i);
            this._setPos(cyl, coefsA[i], xyz);

            cyl = this._cyl(this.width, i);
            this._setPos(cyl, coefsB[i], xyz);
            cyl.rotation.z = Math.PI / 2;

            cyl = this._cyl(this.depth, i);
            this._setPos(cyl, coefsC[i], xyz);
            cyl.rotation.x = Math.PI / 2;
        }

        coefsA = [[-1, -1, 1], [1, -1, 1], [1, -1, -1], [-1, -1, -1]];
        coefsB = [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]];
        for (var i = 0; i < coefsA.length; i++) {
            var spCorner = this._spCorner(i, 1);
            this._setPos(spCorner, coefsA[i], xyz);
            spCorner = this._spCorner(i);
            this._setPos(spCorner, coefsB[i], xyz);
        }

        const positions = [];
        const normals = [];

        this.root.traverse(e => {
            if (e.isMesh && e.geometry) {
                e.updateMatrix();

                // Clona la geometria della mesh
                const geometry = e.geometry.clone();

                // Applica la matrice di trasformazione della mesh
                geometry.applyMatrix4(e.matrix);

                // Estrai le posizioni e normali dalla geometria
                positions.push(...geometry.attributes.position.array);
                normals.push(...geometry.attributes.normal.array);
            }
        });

        // Crea una nuova BufferGeometry e imposta le posizioni e normali
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));

        // Ora puoi utilizzare 'geo' come geometria buffer unica
    }

    _plane(xi, yi, xyz) {
        var m = new THREE.Mesh(new THREE.PlaneGeometry(2 * xyz[xi], 2 * xyz[yi]));
        this.root.add(m);
        return m;
    }

    _setPos(mesh, coefs, xyz) {
        mesh.position.set(coefs[0] * xyz[0], coefs[1] * xyz[1], coefs[2] * xyz[2]);
    }

    _spCorner(i, j) {
        var m = new THREE.Mesh(new THREE.SphereGeometry(this.radius, this.spans, this.spans,
            i * Math.PI / 2, Math.PI / 2,
            (j || 0) * Math.PI / 2, Math.PI / 2
        ));
        this.root.add(m);
        return m;

    }

    _cyl(l, i) {
        var m = new THREE.Mesh(new THREE.CylinderGeometry(
            this.radius, this.radius, l - 2 * this.radius, this.spans,
            1, true, i * Math.PI / 2, Math.PI / 2));
        this.root.add(m);
        return m;
    };

}



var app = window.app = new App();