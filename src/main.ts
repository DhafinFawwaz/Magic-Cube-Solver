import './style.css'
import { CubeState } from './magic-cube/cube-state'
import { Solver } from './magic-cube/solver'

function start() {
  const degree = 5
  const cube = CubeState.createRandomCube(degree)
  const magicNumber = cube.calculateMagicNumber()
  
  console.log("Problem:")
  console.log(cube)
  console.log("Magic Number:")
  console.log(magicNumber)
  
  console.log("\nSolution:")
  const result = Solver.solveSteepestAscent(cube) // Just swap this with any of the other solvers, can also pass custom evaluator
  console.log(result)
}

document.getElementById('start-button')?.addEventListener('click', start)


