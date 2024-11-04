import * as THREE from 'three';

export class MagicLine {
    static thickness = 10;
    static lineGreenMaterial = new THREE.LineBasicMaterial({color: 0x00ff00});
    static lineRedMaterial = new THREE.LineBasicMaterial({color: 0xff0000});

    static cachedLines: {[key: string]: THREE.Mesh} = {};

    public static createGreen(from: THREE.Vector3, to: THREE.Vector3) {
        const points = [from, to];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, MagicLine.lineGreenMaterial);
        return line;
    }

    public static createRed(from: THREE.Vector3, to: THREE.Vector3) {
        const points = [from, to];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, MagicLine.lineRedMaterial);
        return line;
    }
}