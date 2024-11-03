import { CubeState } from "./cube-state";

type Evaluator = (cube: CubeState) => number;

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

    static log(startTime: number, current: CubeState, evaluator: Evaluator, iteration: number, nMax: number) {
        console.log("Time:", (performance.now() - startTime).toFixed(2) + " ms", "| Magic:", this.evaluateMagicAmount(current) + "/" + current.maxAmountOfMagic, "| Score:", evaluator(current).toFixed(2), "| Iteration:", iteration + "/" + nMax)
    }

    static stochasticNMax = 100000;
    public static solveStochastic(cube: CubeState, evaluator: Evaluator = this.evaluateDeviationSqrt): CubeState {
        let startTime = performance.now()

        let current = cube.getCopy()
        let nMax = this.stochasticNMax
        let iteration = 0
        while (!current.isMagicCube() && iteration < nMax) {
            iteration++;
            let neighbor = current.getRandomSuccessor()

            if (evaluator(neighbor) > evaluator(current)) {
                current = neighbor
                this.log(startTime, current, evaluator, iteration, nMax)
            }
        }

        this.log(startTime, current, evaluator, iteration, nMax)
        return current
    }

}