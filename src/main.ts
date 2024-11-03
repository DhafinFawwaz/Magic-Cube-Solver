import './style.css'
import { CubeState } from './magic-cube/cube-state'
import { Solver } from './magic-cube/solver'
import { StochasticSolver } from './magic-cube/solver/stochastic-solver'
import { SteepestAscentSolver } from './magic-cube/solver/steepestascent-solver'
import { SidewaysMoveSolver } from './magic-cube/solver/sidwaysmove-solver'
import { SimulatedAnnealingSolver } from './magic-cube/solver/simulatedannealing-solver'
import { RandomRestartHillClimbingSolver } from './magic-cube/solver/randomrestarthillclimbing-solver'
import { SolverAnimator } from './magic-cube-animator/solver-animator'


const solverAnimator = new SolverAnimator(document.getElementById("3d-view")!);

function readDegree() {
  const degree = Number.parseInt(( document.getElementById('degree') as HTMLInputElement ).value);
  return degree
}

function createCube(degree: number) {
  const cube = CubeState.createRandomCube(degree)
  return cube
}

const solverList = [
  () => new SteepestAscentSolver(createCube(readDegree())),
  () => new SidewaysMoveSolver(createCube(readDegree())),
  () => new RandomRestartHillClimbingSolver(createCube(readDegree())),
  () => new StochasticSolver(createCube(readDegree()), (e) => solverAnimator.onStateChange(e)),
  () => new SimulatedAnnealingSolver(createCube(readDegree())),
  () => undefined, // () => new GeneticSolver(readDegree()),
]
let selectedSolver = solverList[0]();

// const logMessageDiv = document.getElementById('log-message');
// Solver.logConsoleEnabled = false;
// Solver.onLog = (msg: string[]) => {
//   logMessageDiv!.textContent = msg.join("");
// }
const sliderContainer = document.getElementById('slider-container');
const playpauseCheckbox: HTMLInputElement = document.getElementById('playpause') as HTMLInputElement;
const slider: HTMLInputElement = document.getElementById('slider')! as HTMLInputElement;
solverAnimator.slider = slider;

document.getElementById('algorithm-select')?.addEventListener('change', (event) => {
  const algorithmIdx: number = Number.parseInt((event.target as HTMLSelectElement).value)
  selectedSolver = solverList[algorithmIdx]();
});


document.getElementById('start-button')?.addEventListener('click', async() => {
  sliderContainer?.classList.remove('flex');
  sliderContainer?.classList.add('hidden');
  playpauseCheckbox.checked = true;
  slider.value = '0';
  solverAnimator.clearAnimationStateList();

  setTimeout(() => {
    const solver: Solver = selectedSolver!;
    const result = solver.solve()
    console.log("\nSolution:")
    console.log(result)
  
    sliderContainer?.classList.remove('hidden');
    sliderContainer?.classList.add('flex');
    slider?.setAttribute('value', '0');
  }, 10)
})
document.getElementById('generate-button')?.addEventListener('click', () => {
  const degree = readDegree();
  if(degree < 2) {
    alert("Degree must be greater than 1");
    return;
  }
  const cube = createCube(readDegree());
  solverAnimator.setCube(cube);
  solverAnimator.clearAnimationStateList();
})
solverAnimator.load(() => {
  solverAnimator.setCube(createCube(5));
});

playpauseCheckbox?.addEventListener('change', (event) => {
  if((event.target as HTMLInputElement).checked) {
    solverAnimator.pause();
  } else {
    solverAnimator.play();
  }
});

slider.addEventListener('input', () => {
  if(solverAnimator.isPlaying) solverAnimator.pause();
  const normalizedValue = Number.parseFloat(slider.value);
  solverAnimator.setNormalizedTime(normalizedValue);
})
