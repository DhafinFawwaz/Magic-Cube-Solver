import { CubeState } from "./cube-state";

export type Evaluator = (cube: CubeState) => number;
export type CubeStateChangeCallback = (cube: CubeState) => void;

export abstract class Solver {
  public static logConsoleEnabled = true;
  public evaluator: Evaluator;
  protected onStateChange?: CubeStateChangeCallback;
  public constructor(
    onStateChange?: CubeStateChangeCallback,
    evaluator: Evaluator = Solver.evaluateDeviationSqrt
  ) {
    this.onStateChange = onStateChange;
    this.evaluator = evaluator;
  }

  static evaluateDeviationSqrt(cube: CubeState): number {
    let magicNumber = cube.calculateMagicNumber();
    let d = 0;

    cube.iterateAndDo((arr: number[]) => {
      let total = arr.reduce((a, b) => a + b, 0);
      d += Math.abs(Math.sqrt(Math.abs(total - magicNumber)));
    });

    return -d;
  }

  static evaluateMagicAmount(cube: CubeState): number {
    const magicNumber = cube.calculateMagicNumber();
    let magicCount = 0;

    cube.iterateAndDo((arr: number[]) => {
      let total = arr.reduce((a, b) => a + b, 0);
      if (total === magicNumber) magicCount++;
    });

    return magicCount;
  }

  static onLog: (msg: string[]) => void = () => {};

  protected log(
    startTime: number,
    current: CubeState,
    evaluator: Evaluator,
    iteration?: number,
    nMax?: number
  ) {
    const msg = [
      "Time:",
      (performance.now() - startTime).toFixed(2) + " ms",
      "| Magic:",
      Solver.evaluateMagicAmount(current) + "/" + current.maxAmountOfMagic,
      "| Score:",
      evaluator(current).toFixed(2),
    ];
    if (iteration !== undefined && nMax !== undefined)
      msg.push("| Iteration:", iteration + "/" + nMax);

    Solver.onLog(msg);

    if (!Solver.logConsoleEnabled) return;
    console.log(...msg);
  }

  public solve(): CubeState {
    // In case we may do something here in the future
    return this.process();
  }

  abstract process(): CubeState;

  public getAdditionalInformation(): any {
    return {};
  }
}
