import { CubeState } from "../cube-state";
import { CubeStateChangeCallback, Evaluator, Solver } from "../solver";

export class StochasticSolver extends Solver {
  public initialCube: CubeState;
  stochasticNMax = 100000;

  private iterationCount = 0;

  public constructor(
    cube: CubeState,
    stochasticNMax: number,
    onStateChange?: CubeStateChangeCallback,
    evaluator: Evaluator = Solver.evaluateDeviationSqrt
  ) {
    super(onStateChange, evaluator);
    this.initialCube = cube;

    // Init cached stuff
    this.stochasticNMax = stochasticNMax;
    this.initialCube.calculateMagicNumber();
    this.initialCube.maxAmountOfMagic;
    CubeState.getCubeSwapPairs(cube.content.length);
  }

  public process(): CubeState {
    let startTime = performance.now();
    const { evaluator, onStateChange } = this;

    let current = this.initialCube.getCopy();
    let nMax = this.stochasticNMax;
    let iteration = 0;
    while (!current.isMagicCube() && iteration < nMax) {
      iteration++;
      const neighbor = current.getRandomSuccessor();

      if (evaluator(neighbor) > evaluator(current)) {
        current = neighbor;
        onStateChange?.(neighbor);
        this.log(startTime, current, evaluator, iteration, nMax);
      }
    }

    this.iterationCount = iteration;

    this.log(startTime, current, evaluator, iteration, nMax);
    return current;
  }

  public getAdditionalInformation() {
    return {
      numIteration: this.iterationCount,
    };
  }
}
