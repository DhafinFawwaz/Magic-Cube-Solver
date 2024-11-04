import { CubeState } from "../magic-cube/cube-state";

export class MagicCubeData {
    public algorithmIdx: number = 0;
    public param: number[] = [];
    public degree: number = 5;
    public statusInfo: string = "";
    public cubeStateList: CubeState[] = []; 
    public finalState: CubeState;

    public constructor(algorithmIdx: number, param: number[], degree: number, statusInfo: string, cubeStateList: CubeState[], finalState: CubeState) {
        this.algorithmIdx = algorithmIdx;
        this.param = param;
        this.degree = degree;
        this.statusInfo = statusInfo;
        this.cubeStateList = cubeStateList;
        this.finalState = finalState;
    }

    public download() {
        const data = JSON.stringify(this);
        const blob = new Blob([data], { type: "application/json" });
        const jsonObjectUrl = URL.createObjectURL(blob);

        const filename = "example.json";
        const anchorEl = document.createElement("a");
        anchorEl.href = jsonObjectUrl;
        anchorEl.download = filename;

        anchorEl.click();
        URL.revokeObjectURL(jsonObjectUrl);
    }
}