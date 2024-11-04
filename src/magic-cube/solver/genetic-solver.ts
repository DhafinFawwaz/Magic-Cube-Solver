import { CubeState } from "../cube-state";
import { CubeStateChangeCallback, Evaluator, Solver } from "../solver";

export class GeneticSolver extends Solver {
    degree: number;
    populationSize: number;
    maxIteration: number;

    bestInitialState?: CubeState;

    onAnyIteration?: CubeStateChangeCallback;

    public constructor(degree: number, maxIteration: number, populationSize: number, onStateChange?: CubeStateChangeCallback, onAnyIteration?: CubeStateChangeCallback, evaluator: Evaluator = Solver.evaluateDeviationSqrt) {
        super(onStateChange, evaluator);
        this.degree = degree;
        this.maxIteration = maxIteration;
        this.populationSize = populationSize;

        // Init cached stuff
        this.onAnyIteration = onAnyIteration;
    }

    public process(): CubeState {
        // Control variables
        const populationSize: number = this.populationSize;
        const maxIteration: number = this.maxIteration;
        const mutationRate: number = 0.05;

        const degree: number = this.degree;
        let population: CubeState[] = Array.from({ length: populationSize }, () => CubeState.createRandomCube(degree));

        //
        this.bestInitialState = population.reduce((best, current) => this.evaluator(current) > this.evaluator(best) ? current : best);
        //

        let iteration: number = 0;
        while (true) {
            const [parent1, parent2] = GeneticSolver.chooseRandomPair(population, this.evaluator);
            const [parent3, parent4] = GeneticSolver.chooseRandomPair(population, this.evaluator);

            let [child1, child2] = GeneticSolver.reproduce(parent1, parent2);
            let [child3, child4] = GeneticSolver.reproduce(parent3, parent4);

            const uniqueParents = new Set([parent1, parent2, parent3, parent4]);
            population = population.filter(individual => !uniqueParents.has(individual));

            if (Math.random() < mutationRate) GeneticSolver.mutate(child1);
            if (Math.random() < mutationRate) GeneticSolver.mutate(child2);
            if (Math.random() < mutationRate) GeneticSolver.mutate(child3);
            if (Math.random() < mutationRate) GeneticSolver.mutate(child4);

            population.push(child1, child2, child3, child4);

            // const bestCube: CubeState = population.reduce((best, current) =>
            //     this.evaluator(current) > this.evaluator(best) ? current : best
            // );

            const cubeArr = [];
            for (let i = 0; i < population.length; i++) {
                cubeArr.push({
                    cube: population[i],
                    score: this.evaluator(population[i])
                });
            }
            cubeArr.sort((a, b) => b.score - a.score);
            const bestCube = cubeArr[0].cube;
            const medianCube = cubeArr[Math.floor(populationSize / 2)].cube;
            // const medianCube = cubeArr[cubeArr.length-1].cube;
            this.onStateChange?.(bestCube);
            this.onAnyIteration?.(medianCube);


            if (bestCube.isMagicCube()) {
                return bestCube;
            }

            iteration += 1;
            if (iteration >= maxIteration) {
                console.log("Total:", Solver.evaluateMagicAmount(bestCube));
                return bestCube;
            }
        }
    }


    public static chooseRandomPair(population: CubeState[], evaluator: Evaluator = Solver.evaluateDeviationSqrt): [CubeState, CubeState] {
        const totalScore = population.reduce((sum, cube) => sum + evaluator(cube), 0);

        const selectRandom = (): CubeState => {
            const randomValue = Math.random() * totalScore;
            let cumulativeScore = 0;
            for (const cube of population) {
                cumulativeScore += evaluator(cube);

                if (cumulativeScore <= randomValue) {
                    return cube;
                }
            }
            return population[population.length - 1];
        };

        const first = selectRandom();
        const second = selectRandom();

        return [first, second];
    }

    public static reproduce(parent1: CubeState, parent2: CubeState): [CubeState, CubeState] {
        const n = parent1.content.length;
        let child1 = parent1.getCopy();
        let child2 = parent2.getCopy();

        const fixedNumbers1 = GeneticSolver.getFixedNumbers(parent1);
        const notFixedList1 = GeneticSolver.getNonFixedNumbers(parent1, parent2);

        const fixedNumbers2 = GeneticSolver.getFixedNumbers(parent2);
        const notFixedList2 = GeneticSolver.getNonFixedNumbers(parent2, parent1);

        let count1 = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                for (let k = 0; k < n; k++) {
                    if (fixedNumbers1.has(child1.content[i][j][k])) continue;
                    child1.content[i][j][k] = notFixedList1[count1++];
                }
            }
        }

        let count2 = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                for (let k = 0; k < n; k++) {
                    if (fixedNumbers2.has(child2.content[i][j][k])) continue;
                    child2.content[i][j][k] = notFixedList2[count2++];
                }
            }
        }

        return [child1, child2];
    }

    public static mutate(cube: CubeState) {
        cube.swapRandom();
    }

    public static getFixedNumbers(cube: CubeState): Set<number> {
        const n = cube.content.length;
        const possibleLocations = GeneticSolver.getSpaceDiagonalLocations(n)
            .concat(GeneticSolver.getFaceDiagonalLocations(n))
            .concat(GeneticSolver.getParallelSideLocations(n));

        const fixedNumbers = new Set<number>();
        for (const location of possibleLocations) {
            const locationSum = location.reduce((sum, [i, j, k]) => sum + cube.content[i][j][k], 0);
            if (locationSum === CubeState.calculateMagicNumber(n)) {
                for (const [i, j, k] of location) {
                    fixedNumbers.add(cube.content[i][j][k]);
                }
            }
        }

        return fixedNumbers;
    }
    public static getNonFixedNumbers(cube: CubeState, otherCube: CubeState): number[] {
        const fixedNumbers = GeneticSolver.getFixedNumbers(cube);
        const nonFixedList: number[] = [];

        for (const row of otherCube.content) {
            for (const subRow of row) {
                for (const value of subRow) {
                    if (!fixedNumbers.has(value)) {
                        nonFixedList.push(value);
                    }
                }
            }
        }

        return nonFixedList;
    }
    public static getSpaceDiagonalLocations(n: number): Array<Array<[number, number, number]>> {
        const diagonals: Array<Array<[number, number, number]>> = [];

        diagonals.push(Array.from({ length: n }, (_, i) => [i, i, i] as [number, number, number]));
        diagonals.push(Array.from({ length: n }, (_, i) => [i, i, n - 1 - i] as [number, number, number]));
        diagonals.push(Array.from({ length: n }, (_, i) => [i, n - 1 - i, i] as [number, number, number]));
        diagonals.push(Array.from({ length: n }, (_, i) => [i, n - 1 - i, n - 1 - i] as [number, number, number]));

        return diagonals;
    }

    public static getFaceDiagonalLocations(n: number): Array<Array<[number, number, number]>> {
        const diagonals: Array<Array<[number, number, number]>> = [];

        for (let x = 0; x < n; x++) {
            diagonals.push(Array.from({ length: n }, (_, i) => [x, i, i] as [number, number, number]));
            diagonals.push(Array.from({ length: n }, (_, i) => [x, i, n - 1 - i] as [number, number, number]));
        }

        for (let y = 0; y < n; y++) {
            diagonals.push(Array.from({ length: n }, (_, i) => [i, y, i] as [number, number, number]));
            diagonals.push(Array.from({ length: n }, (_, i) => [i, y, n - 1 - i] as [number, number, number]));
        }

        for (let z = 0; z < n; z++) {
            diagonals.push(Array.from({ length: n }, (_, i) => [i, i, z] as [number, number, number]));
            diagonals.push(Array.from({ length: n }, (_, i) => [i, n - 1 - i, z] as [number, number, number]));
        }

        return diagonals;
    }

    public static getParallelSideLocations(n: number): Array<Array<[number, number, number]>> {
        const sides: Array<Array<[number, number, number]>> = [];

        for (let y = 0; y < n; y++) {
            for (let z = 0; z < n; z++) {
                sides.push(Array.from({ length: n }, (_, i) => [i, y, z] as [number, number, number]));
            }
        }

        for (let x = 0; x < n; x++) {
            for (let z = 0; z < n; z++) {
                sides.push(Array.from({ length: n }, (_, i) => [x, i, z] as [number, number, number]));
            }
        }

        for (let x = 0; x < n; x++) {
            for (let y = 0; y < n; y++) {
                sides.push(Array.from({ length: n }, (_, i) => [x, y, i] as [number, number, number]));
            }
        }

        return sides;
    }

}