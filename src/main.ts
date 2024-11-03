import './style.css'
import { CubeState } from './magic-cube/cube-state'
import { Solver } from './magic-cube/solver'
import { StochasticSolver } from './magic-cube/solver/stochastic-solver'
import { SteepestAscentSolver } from './magic-cube/solver/steepestascent-solver'

function start() {
  const degree = 5
  const cube = CubeState.createRandomCube(degree)
  const magicNumber = cube.calculateMagicNumber()
  
  console.log("Problem:")
  console.log(cube)
  console.log("Magic Number:")
  console.log(magicNumber)
  
  console.log("\nSolution:")
  const solver: Solver = new SteepestAscentSolver(cube);  // Just swap this with any of the other solvers, can also pass custom evaluator. constructor parameter for genetic is very different which is just the degree of the cube, which is why we're doing it like this.
  const result = solver.solve()
  console.log(result)
}

document.getElementById('start-button')?.addEventListener('click', start)


