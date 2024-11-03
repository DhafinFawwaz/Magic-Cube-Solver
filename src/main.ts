import './style.css'
import { CubeState } from './magic-cube/cube-state'
import { Solver } from './magic-cube/solver'
import { StochasticSolver } from './magic-cube/solver/stochastic-solver'
import { SteepestAscentSolver } from './magic-cube/solver/steepestascent-solver'
import { SidewaysMoveSolver } from './magic-cube/solver/sidwaysmove-solver'
import { SimulatedAnnealingSolver } from './magic-cube/solver/simulatedannealing-solver'
import { RandomRestartHillClimbingSolver } from './magic-cube/solver/randomrestarthillclimbing-solver'


function readDegree() {
  const degree = Number.parseInt(( document.getElementById('degree') as HTMLInputElement ).value);
  console.log(`Degree: ${degree}`)
  return degree
}

function createCube(degree: number) {
  const cube = CubeState.createRandomCube(degree)
  console.log("Problem:")
  console.log(cube)
  return cube
}

const solverList = [
  () => new SteepestAscentSolver(createCube(readDegree())),
  () => new SidewaysMoveSolver(createCube(readDegree())),
  () => new RandomRestartHillClimbingSolver(createCube(readDegree())),
  () => new StochasticSolver(createCube(readDegree())),
  () => new SimulatedAnnealingSolver(createCube(readDegree())),
  () => undefined, // () => new GeneticSolver(readDegree()),
]
let selectedSolver = solverList[0]();


document.getElementById('algorithm-select')?.addEventListener('change', (event) => {
  const algorithmIdx: number = Number.parseInt((event.target as HTMLSelectElement).value)
  selectedSolver = solverList[algorithmIdx]();
  console.log(`Selected algorithm: ${selectedSolver!.constructor.name}`)
});

document.getElementById('start-button')?.addEventListener('click', () => {
  console.log("\nSolution:")
  const solver: Solver = selectedSolver!;
  const result = solver.solve()
  console.log(result)
})


