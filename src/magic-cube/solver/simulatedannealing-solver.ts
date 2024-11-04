import { CubeState } from "../cube-state";
import { CubeStateChangeCallback, Evaluator, Solver } from "../solver";

export class SimulatedAnnealingSolver extends Solver {
  public initialCube: CubeState;
  private initialTemperature: number;
  private finalTemperature: number;
  private temperature?: number;
  private coolingRate: number;
  private current?: CubeState;
  private currentScore?: number;
  private onDeltaEIteration?: (probability: number) => void;
  private stuckFrequency = 0;

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
    onDeltaEIteration?: (probability: number) => void,
    evaluator: Evaluator = Solver.evaluateDeviationSqrt
  ) {
    super(onStateChange, evaluator);
    this.initialCube = cube;
    this.initialTemperature = 1000;
    this.finalTemperature = 1e-20;
    this.coolingRate = 0.999;
    this.onDeltaEIteration = onDeltaEIteration;

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
    const { evaluator } = this;

    this.current = this.initialCube.getCopy();
    this.currentScore = evaluator(this.current);

    this.temperature = this.initialTemperature;

    let iteration = 0;
    this.stuckFrequency = 0;

    while (
      this.temperature > this.finalTemperature &&
      !this.current.isMagicCube()
    ) {
      iteration++;

      // Generate a random neighbor
      let neighbor = this.current.getRandomSuccessor();
      let neighborScore = evaluator(neighbor);
      let delta = neighborScore - this.currentScore;

      if (delta > 0) {
        this.accept(neighbor, neighborScore);
      } else {
        // Accept the worse neighbor with a probability
        let probability = Math.exp(delta / this.temperature);
        this.onDeltaEIteration?.(probability);

        if (Math.random() < probability) {
          // Assume: stuck frequncy is the number of times it gets to here
          this.stuckFrequency++;

          this.accept(neighbor, neighborScore);
        }
      }

      this.cooldown();
      this.log(startTime, this.current, evaluator, iteration);
    }

    this.log(startTime, this.current, evaluator, iteration);

    return this.current;
  }

  private accept(neighbor: CubeState, neighborScore: number) {
    const { onStateChange } = this;

    this.current = neighbor.getCopy();
    this.currentScore = neighborScore;
    onStateChange?.(this.current);
  }

  private cooldown() {
    if (!this.temperature) return;
    this.temperature = this.temperature * this.coolingRate;
  }

  public getAdditionalInformation(): Object {
    return {
      stuckFrequency: this.stuckFrequency,
    };
  }
}
