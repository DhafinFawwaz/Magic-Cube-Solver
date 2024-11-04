import { CubeState } from "../cube-state";
import { CubeStateChangeCallback, Evaluator, Solver } from "../solver";
import { SteepestAscentSolver } from "./steepestascent-solver";

export class RandomRestartHillClimbingSolver extends Solver {
  public initialCube: CubeState;
  private maxRestarts: number;

  /**
   * Constructs a RandomRestartHillClimbingSolver.
   * @param cube The initial CubeState.
   * @param onStateChange Optional callback invoked on state changes.
   * @param evaluator The heuristic function to evaluate CubeStates.
   * @param maxRestarts Maximum number of random restarts (default: 1000).
   * @param maxIterationsPerRestart Maximum iterations per restart (default: 1000).
   */
  public constructor(
    cube: CubeState,
    maxRestarts: number = 1000,
    onStateChange?: CubeStateChangeCallback,
    evaluator: Evaluator = Solver.evaluateDeviationSqrt,
  ) {
    super(onStateChange, evaluator);
    this.initialCube = cube;
    this.maxRestarts = maxRestarts;

    // Initialize cached properties
    this.initialCube.calculateMagicNumber();
    this.initialCube.maxAmountOfMagic;
    CubeState.getCubeSwapPairs(cube.content.length);
  }

  /**
   * Executes the Random Restart Hill Climbing algorithm.
   * @returns The best CubeState found.
   */
  public process(): CubeState {
    let startTime = performance.now();
    const { evaluator, onStateChange } = this;

    let best = this.initialCube.getCopy();
    let bestScore = evaluator(best);

    for (let restart = 0; restart < this.maxRestarts; restart++) {
      // Create a new random cube
      let randomCube = CubeState.createRandomCube(
        this.initialCube.content.length
      );

      // Perform Steepest Ascent from the random cube
      const solver = new SteepestAscentSolver(
        randomCube,
        onStateChange,
        evaluator
      );
      let current = solver.process();

      let currentScore = evaluator(current);

      // Update the best solution found so far
      if (currentScore > bestScore) {
        best = current;
        bestScore = currentScore;
        console.log(`Restart ${restart + 1}: New best score ${bestScore}`);
      }

      // Check if a magic cube is found
      if (best.isMagicCube()) {
        console.log(`Magic cube found at restart ${restart + 1}`);
        break;
      }

      console.log(`Restart ${restart + 1}: Best score so far ${bestScore}`);
    }

    this.log(startTime, best, evaluator, this.maxRestarts, this.maxRestarts);
    return best;
  }
}
