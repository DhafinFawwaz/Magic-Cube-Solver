import { CubeState } from "../cube-state";
import { CubeStateChangeCallback, Evaluator, Solver } from "../solver";

export class GeneticSolver extends Solver {
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
        // Control variables
        const populationSize: number = 25;
        const maxIteration: number = 10;

        // Fixed
        const mutationRate: number = 0.5;

        const degree: number = this.initialCube.content.length;
        let population: CubeState[] = Array.from({ length: populationSize }, () => CubeState.createRandomCube(degree));

        let iteration: number = 0;
        while (true) {

            let newPopulation: CubeState[] = [];
            for (let i = 0; i < populationSize; i++) {
                const [firstParent, secondParent] = GeneticSolver.chooseRandomPair(population, this.evaluator);
                let child = GeneticSolver.reproduce(firstParent, secondParent);
                if (Math.random() < mutationRate) {
                    GeneticSolver.mutate(child);
                }
                newPopulation.push(child);
            }
            population = newPopulation;

            const bestCube: CubeState = population.reduce((best, current) =>
                this.evaluator(current) > this.evaluator(best) ? current : best
            );            

            if (bestCube.isMagicCube()) {
                return bestCube;
            }

            iteration += 1;
            if (iteration >= maxIteration) {
                console.log(Solver.evaluateMagicAmount(bestCube));
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
                if (cumulativeScore >= randomValue) {
                    return cube;
                }
            }
            return population[population.length - 1];
        };

        const first = selectRandom();
        const second = selectRandom();

        return [first, second];
    }

    public static reproduce(parent1: CubeState, parent2: CubeState, evaluator: Evaluator = Solver.evaluateDeviationSqrt): CubeState {
        if (evaluator(parent2) > evaluator(parent1)) {
            [parent1, parent2] = [parent2, parent1];
        }

        const n = parent1.content.length;
        const child: CubeState = parent1.getCopy();
        const possibleLocations = GeneticSolver.getSpaceDiagonalLocations(n)
            .concat(GeneticSolver.getFaceDiagonalLocations(n))
            .concat(GeneticSolver.getParallelSideLocations(n));

        const fixedNumbers = new Set<number>();
        for (const location of possibleLocations) {

            const locationSum = location.reduce((sum, [i, j, k]) => sum + parent1.content[i][j][k], 0);
            if (locationSum === CubeState.calculateMagicNumber(n)) {
                for (const [i, j, k] of location) {
                    fixedNumbers.add(parent1.content[i][j][k]);
                }
            }
        }

        const notFixedList: number[] = [];
        for (let i = 1; i <= n ** 3; i++) {
            if (!fixedNumbers.has(i)) {
                notFixedList.push(i);
            }
        }

        notFixedList.sort(() => Math.random() - 0.5);

        let count = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                for (let k = 0; k < n; k++) {
                    if (fixedNumbers.has(child.content[i][j][k])) {
                        continue;
                    }
                    child.content[i][j][k] = notFixedList[count];
                    count++;
                }
            }
        }

        return child;
    }

    public static mutate(cube: CubeState) {
        cube.swapRandom();
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