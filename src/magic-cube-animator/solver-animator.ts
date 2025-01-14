import { OrbitControls } from "three/examples/jsm/Addons.js";
import { CubeState } from "../magic-cube/cube-state";
import * as THREE from 'three';
import { NumberText } from "./number-text";
import { inverseLerp } from "three/src/math/MathUtils.js";
import { MagicLine } from "./magic-line";


export class SolverAnimator {
    gap = 0.5;
    iterationDuration = 0.5;

    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    directionalLight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
    controls: OrbitControls;
    textList: THREE.Mesh[] = [];

    currentCubeState?: CubeState;
    cubeStateList: CubeState[] = [];
    cubeStateSecondaryList: CubeState[] = [];
    cubeProbabilityList: number[] = [];

    view: HTMLElement;
    slider?: HTMLInputElement;

    lineGroup: THREE.Group = new THREE.Group();
    lightGroup: THREE.Group = new THREE.Group();
    cubeGroup: THREE.Group = new THREE.Group();

    isDrawGreenLine: boolean = true;
    isDrawRedLine: boolean = false;

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
        this.lineGroup = new THREE.Group();

        this.scene.add(this.lineGroup);
        this.scene.add(this.lightGroup);
        this.scene.add(this.cubeGroup);

        this.lightGroup.add(this.directionalLight);
        this.lightGroup.add(this.ambientLight);

        this.camera.position.set(0, 1, 5);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = false;
        this.animate = this.animate.bind(this);
        this.animate();

        this.view = view;
    }

    public get playbackSpeed() {
        return 1/this.iterationDuration;
    }
    public setPlaybackSpeed(multiplier: number) {
        this.iterationDuration = 1/multiplier;
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
                const t = (currentTime - this.startTime) / 1000 / this.cubeStateList.length / this.iterationDuration;
                this.slider.value = t.toString();
                this.setNormalizedTime(t);
            }
        }
    }

    handleWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth-20, window.innerHeight-20);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    public onStateChange(cube: CubeState) {
        this.cubeStateList.push(cube);
    }

    public clearAnimationStateList() {
        this.cubeStateList = [];
    }


    public setCube(cubeState: CubeState) {
        // this.currentCubeState = cubeState;
        this.textList = [];
        this.cubeGroup.clear();
        for(let i = 0; i < cubeState.content.length; i++) {
            for(let j = 0; j < cubeState.content.length; j++) {
                for(let k = 0; k < cubeState.content.length; k++) {
                    const text = NumberText.get(cubeState!.content[i][j][k].toString());
                    text.material = NumberText.textMaterial;
                    const [x,y,z] = this.ijkToWorldPosition(i, j, k, cubeState);
                    text.position.set(x,y,z);
                    this.cubeGroup.add(text);
                    this.textList.push(text);
                }
            }
        }


        this.applyMagicLine(cubeState);
    }


    isPlaying = false;
    startTime = -1;
    public play() {
        this.isPlaying = true;
        this.startTime = performance.now() - this.slider!.valueAsNumber * 1000 * this.cubeStateList.length * this.iterationDuration;
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

    public setTransparentCube(cubeState: CubeState) {
        for(let i = 0; i < cubeState.content.length; i++) {
            for(let j = 0; j < cubeState.content.length; j++) {
                for(let k = 0; k < cubeState.content.length; k++) {
                    const key = cubeState!.content[i][j][k].toString();
                    const text = NumberText.get(key);
                    text.material = NumberText.transparentMaterial;
                    const [x,y,z] = this.ijkToWorldPosition(i, j, k, cubeState);
                    text.position.set(x,y,z);
                }
            }
        }
    }

    public setTemporaryCube(cubeState: CubeState) {
        for(let i = 0; i < cubeState.content.length; i++) {
            for(let j = 0; j < cubeState.content.length; j++) {
                for(let k = 0; k < cubeState.content.length; k++) {
                    const key = cubeState!.content[i][j][k].toString();
                    const text = NumberText.get(key);
                    text.material = NumberText.textMaterial;
                    const [x,y,z] = this.ijkToWorldPosition(i, j, k, cubeState);
                    text.position.set(x,y,z);
                }
            }
        }

        this.applyMagicLine(cubeState);
    }


    lastCubeState?: CubeState;
    applyMagicLine(cubeState: CubeState){
        if(this.lastCubeState === cubeState) return;
        this.lastCubeState = cubeState;

        this.lineGroup.clear();
        const magicNumber = cubeState.calculateMagicNumber()
        const ctx = this;
        cubeState.iterateAndDo((arr: number[]) => {
            let total = arr.reduce((a, b) => a + b, 0)
            if(this.isDrawGreenLine && total === magicNumber) {
                const a = NumberText.get(arr[0].toString());
                const b = NumberText.get(arr[arr.length-1].toString());
                const line = MagicLine.createGreen(a.position, b.position);
                ctx.lineGroup.add(line);
            }
            if(this.isDrawRedLine && total !== magicNumber) {
                const a = NumberText.get(arr[0].toString());
                const b = NumberText.get(arr[arr.length-1].toString());
                const line = MagicLine.createRed(a.position, b.position);
                ctx.lineGroup.add(line);
            }
        })
    }



    public setNormalizedTime(t: number){

        const currentIdx = Math.floor(t * this.cubeStateList.length);
        if(currentIdx >= this.cubeStateList.length) return;
        if(currentIdx < 0) return;

        const cubeState = this.cubeStateList[currentIdx];
        const from = cubeState.from!;
        const to = cubeState.to!;

        if(!cubeState || !from || !to) return;

        this.setTransparentCube(cubeState);

        this.applyMagicLine(cubeState);

        
        const fromVal = cubeState.content[from[0]][from[1]][from[2]];
        const toVal = cubeState.content[to[0]][to[1]][to[2]];

        const fromText = NumberText.get(fromVal.toString());
        const toText = NumberText.get(toVal.toString());

        fromText.material = NumberText.tintedTextFromMaterial;
        toText.material = NumberText.tintedTextToMaterial;

        const [fromX, fromY, fromZ] = this.ijkToWorldPosition(from[0], from[1], from[2], cubeState);
        const [toX, toY, toZ] = this.ijkToWorldPosition(to[0], to[1], to[2], cubeState);

        const startTime = (currentIdx-1) / this.cubeStateList.length;
        const endTime = (currentIdx) / this.cubeStateList.length;
        const tProgress = inverseLerp(startTime, endTime, t)-1;
        fromText.position.lerpVectors(new THREE.Vector3(toX, toY, toZ), new THREE.Vector3(fromX, fromY, fromZ), this.easeOutQuart(tProgress));
        toText.position.lerpVectors(new THREE.Vector3(fromX, fromY, fromZ), new THREE.Vector3(toX, toY, toZ), this.easeOutQuart(tProgress));
    }

}