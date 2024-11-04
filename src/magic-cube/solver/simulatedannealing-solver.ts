import { CubeState } from "../cube-state";
import { CubeStateChangeCallback, Evaluator, Solver } from "../solver";

export class SimulatedAnnealingSolver extends Solver {
  public initialCube: CubeState;
  private initialTemperature: number;
  private finalTemperature: number;
  private coolingRate: number;

  /**
   * Constructs a SimulatedAnnealingSolver.
   * @param cube The initial CubeState.
   * @param onStateChange Optional callback invoked on state changes.
   * @param evaluator The heuristic function to evaluate CubeStates.
   * @param initialTemperature Starting temperature (default: 1e5).
   * @param finalTemperature Temperature at which to stop the algorithm (default: 1).
   * @param coolingRate Rate at which the temperature decreases (default: 0.99).
   */
  public constructor(
    cube: CubeState,
    onStateChange?: CubeStateChangeCallback,
    evaluator: Evaluator = Solver.evaluateDeviationSqrt
  ) {
    super(onStateChange, evaluator);
    this.initialCube = cube;
    this.initialTemperature = 2000;
    this.finalTemperature = 0;
    this.coolingRate = 0.999;

    // Initialize cached properties
    this.initialCube.calculateMagicNumber();
    this.initialCube.maxAmountOfMagic;
    CubeState.getCubeSwapPairs(cube.content.length);
  }

  /**
   * Executes the Simulated Annealing algorithm.
   * @returns The final CubeState after solving.
   */
  public process(): CubeState {
    let startTime = performance.now();
    const { evaluator, onStateChange } = this;

    let current = this.initialCube.getCopy();
    let currentScore = evaluator(current);
    let temperature = this.initialTemperature;
    let iteration = 0;

    while (temperature > this.finalTemperature && !current.isMagicCube()) {
      iteration++;
      // Generate a random neighbor
      let neighbor = current.getRandomSuccessor();
      let neighborScore = evaluator(neighbor);
      let delta = neighborScore - currentScore;

      if (delta > 0) {
        // Accept the better neighbor
        current = neighbor;
        currentScore = neighborScore;
        onStateChange?.(current);
        console.log(
          `Iteration ${iteration}: Accepted,  better score ${currentScore}`
        );
      } else {
        // Accept the worse neighbor with a probability
        let probability = Math.exp(delta / temperature);
        if (Math.random() < probability) {
          current = neighbor;
          currentScore = neighborScore;
          onStateChange?.(current);
          console.log(
            `Iteration ${iteration}: Accepted, worse score ${currentScore} with probability ${probability.toFixed(
              4
            )}`
          );
        }
      }

      // Cool down the temperature
      temperature *= this.coolingRate;
      this.log(startTime, current, evaluator, iteration);
    }

    if (current.isMagicCube()) {
      console.log(`Magic cube found in ${iteration} iterations.`);
    } else {
      console.log(
        `Simulated Annealing completed after ${iteration} iterations with score ${currentScore}.`
      );
    }

    this.log(startTime, current, evaluator, iteration);
    return current;
  }
}
