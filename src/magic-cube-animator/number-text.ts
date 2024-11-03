import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as THREE from 'three';

export class NumberText {
    static font: any;
    static fontOutline: any;
    static fontParam: any;
    static fontOutlineParam: any;
    
    static fontSize = 0.15;
    static fontDepth = 0.01;
    static fontCurveSegments = 3;
    static fontPath = "font/Outfit_Regular.json";
    static fontOutlinePath = "font/Outfit_ExtraBold.json";

    static isLoaded = false;

    static textMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
    static tintedTextFromMaterial = new THREE.MeshLambertMaterial({color: 0x00ffff});
    static tintedTextToMaterial = new THREE.MeshLambertMaterial({color: 0x0000ff});
    static transparentMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.15});
    static outlineMaterial = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.BackSide, transparent: true, opacity: 0.5});

    public static load(onLoaded: () => void) {
        const loader = new FontLoader();
        let fontLoaded = false;
        let outlineFontLoaded = false;
        loader.load(this.fontPath, (response) => {
            fontLoaded = true;
            this.font = response;
            this.fontParam = {
                font: this.font,
                size: this.fontSize,
                depth: this.fontDepth,
                curveSegments: this.fontCurveSegments,
                bevelThickness: 0,
                bevelSize: 0,
                bevelEnabled: true
            };
            if(outlineFontLoaded) {
                this.isLoaded = true;
                onLoaded();
            }
        });
        loader.load(this.fontOutlinePath, (response) => {
            outlineFontLoaded = true;
            this.fontOutline = response;
            this.fontOutlineParam = {
                font: this.fontOutline,
                size: this.fontSize,
                depth: this.fontDepth,
                curveSegments: this.fontCurveSegments,
                bevelThickness: 0,
                bevelSize: 0,
                bevelEnabled: true
            };
            if(fontLoaded) {
                this.isLoaded = true;
                onLoaded();
            }
        });
        
    }


    static cachedTexts: {[key: string]: THREE.Mesh} = {};
    static cachedOutlines: {[key: string]: THREE.Mesh} = {};
    public static get(textContent: string) {
        if (this.cachedTexts[textContent]) {
            return this.cachedTexts[textContent];
        }
        const textGeometry = new TextGeometry(textContent, this.fontParam);
        textGeometry.center();
        const text = new THREE.Mesh(textGeometry, this.textMaterial);
        
        const outlineGeometry = new TextGeometry(textContent, this.fontOutlineParam);
        outlineGeometry.center();
        const outline = new THREE.Mesh(outlineGeometry, this.outlineMaterial);

        text.add(outline);

        this.cachedTexts[textContent] = text;
        this.cachedOutlines[textContent] = outline;
        return text;
    }
    
}