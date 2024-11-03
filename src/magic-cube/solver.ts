import { CubeState } from "./cube-state";

type Evaluator = (cube: CubeState) => number;
type CubeStateChangeCallback = (cube: CubeState) => void;

export class Solver {

    static evaluateDeviationSqrt(cube: CubeState): number {
        let magicNumber = cube.calculateMagicNumber()
        let d = 0
    
        cube.iterateAndDo((arr: number[]) => {
            let total = arr.reduce((a, b) => a + b, 0)
            d += Math.abs(Math.sqrt(Math.abs(total - magicNumber)))
        })
    
        return -d
    }

    static evaluateMagicAmount(cube: CubeState): number {
        const magicNumber = cube.calculateMagicNumber()
        let magicCount = 0

        cube.iterateAndDo((arr: number[]) => {
            let total = arr.reduce((a, b) => a + b, 0)
            if(total === magicNumber) magicCount++
        })

        return magicCount
    }

    static log(startTime: number, current: CubeState, evaluator: Evaluator, iteration?: number, nMax?: number) {
        const msg = ["Time:", (performance.now() - startTime).toFixed(2) + " ms", "| Magic:", this.evaluateMagicAmount(current) + "/" + current.maxAmountOfMagic, "| Score:", evaluator(current).toFixed(2)];
        if(iteration !== undefined && nMax !== undefined) 
            msg.push("| Iteration:", iteration + "/" + nMax);
        console.log(...msg);
    }

    static stochasticNMax = 100000;
    public static solveStochastic(cube: CubeState, onStateChange?: CubeStateChangeCallback, evaluator: Evaluator = this.evaluateDeviationSqrt): CubeState {
        let startTime = performance.now()

        let current = cube.getCopy()
        let nMax = this.stochasticNMax
        let iteration = 0
        while (!current.isMagicCube() && iteration < nMax) {
            iteration++;
            const neighbor = current.getRandomSuccessor()
            
            if (evaluator(neighbor) > evaluator(current)) {
                current = neighbor
                onStateChange?.(neighbor)
                this.log(startTime, current, evaluator, iteration, nMax)
            }
        }

        this.log(startTime, current, evaluator, iteration, nMax)
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
    public static solveSteepestAscent(cube: CubeState, onStateChange?: CubeStateChangeCallback, evaluator: Evaluator = this.evaluateDeviationSqrt): CubeState {
        let startTime = performance.now()

        let current = cube.getCopy()
        while (!current.isMagicCube()) {
            const neighbor = this.getHighestSuccessorByPairs(current, evaluator)
            
            if (evaluator(neighbor) <= evaluator(current)) {
                this.log(startTime, current, evaluator, 0, 0)
                return current
            }
            current = neighbor
            onStateChange?.(neighbor)
            this.log(startTime, current, evaluator)
        }

        return current
    }
}