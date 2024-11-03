import { CubeState } from "../cube-state";
import { CubeStateChangeCallback, Evaluator, Solver } from "../solver";

export class SteepestAscentSolver extends Solver {
    public initialCube: CubeState;

    public constructor(cube: CubeState, onStateChange?: CubeStateChangeCallback, evaluator: Evaluator = Solver.evaluateDeviationSqrt) {
        super(onStateChange, evaluator);
        this.initialCube = cube;

        // Init cached stuff
        this.initialCube.calculateMagicNumber();
        this.initialCube.maxAmountOfMagic;
        CubeState.getCubeSwapPairs(cube.content.length);
    }

    public process(): CubeState {
        let startTime = performance.now()
        const { evaluator, onStateChange } = this;

        let current = this.initialCube.getCopy()
        while (!current.isMagicCube()) {
            const neighbor = SteepestAscentSolver.getHighestSuccessorByPairs(current, evaluator)
            
            if (evaluator(neighbor) <= evaluator(current)) {
                this.log(startTime, current, evaluator, 0, 0)
                return current
            }
            current = neighbor.getCopy();
            onStateChange?.(neighbor)

            this.log(startTime, current, evaluator)
        }

        return current
    }

    
    public static getHighestSuccessorByPairs(cube: CubeState, evaluator: Evaluator): CubeState {
        const pairs = CubeState.getCubeSwapPairs(cube.content.length);
        let highestValue = evaluator(cube);
        let highestPair = pairs[0];
        for(let pair of pairs) {
            cube.swap(pair[0][0], pair[0][1], pair[0][2], pair[1][0], pair[1][1], pair[1][2]);
            let value = evaluator(cube);
            if(value > highestValue) {
                highestValue = value;
                highestPair = pair;
            }

            // Undo swap
            cube.swap(pair[0][0], pair[0][1], pair[0][2], pair[1][0], pair[1][1], pair[1][2]);
        }
        let highestCube = cube.getCopy();
        highestCube.swap(highestPair[0][0], highestPair[0][1], highestPair[0][2], highestPair[1][0], highestPair[1][1], highestPair[1][2]);
        return highestCube;
    }
}