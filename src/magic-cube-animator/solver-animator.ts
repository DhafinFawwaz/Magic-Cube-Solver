import { OrbitControls } from "three/examples/jsm/Addons.js";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { CubeState } from "../magic-cube/cube-state";
import * as THREE from 'three';
import { NumberText } from "./number-text";
import { inverseLerp, lerp } from "three/src/math/MathUtils.js";




export class SolverAnimator {
    gap = 0.5;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    directionalLight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
    controls: OrbitControls;
    textList: THREE.Mesh[] = [];

    currentCubeState?: CubeState;
    cubeStateList: CubeState[] = [];
    view: HTMLElement;
    slider?: HTMLInputElement;

    public constructor(view: HTMLElement) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        window.addEventListener('resize', this.handleWindowResize.bind(this));

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.scene.background = new THREE.Color(0x27272a);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(5, 10, 7.5);
        this.ambientLight = new THREE.AmbientLight(0xffffff, 2);
        this.scene.add(this.directionalLight);
        this.scene.add(this.ambientLight);
        this.camera.position.set(0, 1, 5);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = false;
        this.animate = this.animate.bind(this);
        this.animate();

        this.view = view;
    }
    public load(onLoaded: () => void) {
        NumberText.load(() => {
            this.view.appendChild(this.renderer.domElement);
            onLoaded();
        });
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.update();
        this.renderer.render(this.scene, this.camera);
    }

    update() {
        if(!NumberText.isLoaded) return;
        for(let i = 0; i < this.textList!.length; i++) {
            this.textList[i].lookAt(this.camera.position);
        }

        if(this.isPlaying) {
            if(this.slider !== undefined) {
                const currentTime = performance.now();
                const t = (currentTime - this.startTime) / 1000;
                this.slider.value = t.toString();
                this.setNormalizedTime(t);
            }
        }
    }

    handleWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    public onStateChange(cube: CubeState) {
        this.cubeStateList.push(cube);
    }

    public clearAnimationStateList() {
        this.cubeStateList = [];
    }

    public setCube(cubeState: CubeState) {
        this.currentCubeState = cubeState;
        this.textList = [];
        const gap = this.gap;
        for(let i = 0; i < this.currentCubeState.content.length; i++) {
            for(let j = 0; j < this.currentCubeState.content.length; j++) {
                for(let k = 0; k < this.currentCubeState.content.length; k++) {
                    const text = NumberText.get(cubeState!.content[i][j][k].toString());
                    const [x,y,z] = this.ijkToWorldPosition(i, j, k, cubeState);
                    text.position.set(x,y,z);
                    this.scene.add(text);
                    this.textList.push(text);
                }
            }
        }
    }
    public removeCube() {
    }

    isPlaying = false;
    startTime = -1;
    public play() {
        this.isPlaying = true;
        this.startTime = performance.now();
    }

    public pause() {
        this.isPlaying = false;
    }

    easeOutQuart(t: number) {
        const tMin1 = t - 1;
        return 1 - tMin1 * tMin1 * tMin1 * tMin1;
    }

    ijkToWorldPosition(i: number, j: number, k: number, cubeState: CubeState) {
        const gap = this.gap;
        const x = (i - Math.floor(cubeState.content.length / 2)) * (gap);
        const y = (j - Math.floor(cubeState.content.length / 2)) * (gap);
        const z = (k - Math.floor(cubeState.content.length / 2)) * (gap);
        return [x, y, z];
    }

    public syncCube(cubeState: CubeState) {
        const gap = this.gap;
        for(let i = 0; i < cubeState.content.length; i++) {
            for(let j = 0; j < cubeState.content.length; j++) {
                for(let k = 0; k < cubeState.content.length; k++) {
                    const text = NumberText.get(cubeState!.content[i][j][k].toString());
                    const [x,y,z] = this.ijkToWorldPosition(i, j, k, cubeState);
                    text.position.set(x,y,z);
                }
            }
        }
    }


    public setNormalizedTime(t: number){
        if(this.currentCubeState === undefined) return;

        const currentIdx = Math.floor(t * this.cubeStateList.length);
        if(currentIdx >= this.cubeStateList.length) return;
        if(currentIdx <= 0) return;

        const cubeState = this.cubeStateList[currentIdx];
        const from = cubeState.from!;
        const to = cubeState.to!;
        this.syncCube(cubeState);
        
        const fromVal = cubeState.content[from[0]][from[1]][from[2]];
        const toVal = cubeState.content[to[0]][to[1]][to[2]];

        const fromText = NumberText.get(fromVal.toString());
        const toText = NumberText.get(toVal.toString());

        const [fromX, fromY, fromZ] = this.ijkToWorldPosition(from[0], from[1], from[2], cubeState);
        const [toX, toY, toZ] = this.ijkToWorldPosition(to[0], to[1], to[2], cubeState);

        const startTime = (currentIdx-1) / this.cubeStateList.length;
        const endTime = (currentIdx) / this.cubeStateList.length;
        const tProgress = inverseLerp(startTime, endTime, t);
        fromText.position.lerpVectors(new THREE.Vector3(fromX, fromY, fromZ), new THREE.Vector3(toX, toY, toZ), this.easeOutQuart(tProgress));
        toText.position.lerpVectors(new THREE.Vector3(toX, toY, toZ), new THREE.Vector3(fromX, fromY, fromZ), this.easeOutQuart(tProgress));
    }

}