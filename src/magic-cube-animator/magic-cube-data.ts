import { CubeState } from "../magic-cube/cube-state";

export class MagicCubeData {
    public algorithmIdx: number = 0;
    public param: number[] = [];
    public degree: number = 5;
    public statusInfo: string = "";
    public cubeStateList: CubeState[] = []; 
    public finalState: CubeState;
    
    public cubeStateSecondaryList: CubeState[] = [];
    public cubeProbablityList: number[] = [];

    public initialState: CubeState;

    public constructor(algorithmIdx: number, param: number[], degree: number, statusInfo: string, cubeStateList: CubeState[], finalState: CubeState, cubeStateSecondaryList: CubeState[] = [], cubeProbablityList: number[] = [], initialState: CubeState) {
        this.algorithmIdx = algorithmIdx;
        this.param = param;
        this.degree = degree;
        this.statusInfo = statusInfo;
        this.cubeStateList = cubeStateList;
        this.finalState = finalState;

        this.cubeStateSecondaryList = cubeStateSecondaryList;
        this.cubeProbablityList = cubeProbablityList;

        this.initialState = initialState;
    }

  public download() {
    const data = JSON.stringify(this);
    const blob = new Blob([data], { type: "application/json" });
    const jsonObjectUrl = URL.createObjectURL(blob);

    const filename = "export.json";
    const anchorEl = document.createElement("a");
    anchorEl.href = jsonObjectUrl;
    anchorEl.download = filename;

    anchorEl.click();
    URL.revokeObjectURL(jsonObjectUrl);
  }
}
