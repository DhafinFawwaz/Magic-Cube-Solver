import { CubeState } from './magic-cube/cube-state'
import { Solver } from './magic-cube/solver'
import { StochasticSolver } from './magic-cube/solver/stochastic-solver'
import { SteepestAscentSolver } from './magic-cube/solver/steepestascent-solver'
import { SidewaysMoveSolver } from './magic-cube/solver/sidwaysmove-solver'
import { SimulatedAnnealingSolver } from './magic-cube/solver/simulatedannealing-solver'
import { GeneticSolver } from "./magic-cube/solver/genetic-solver";
import { RandomRestartHillClimbingSolver } from './magic-cube/solver/randomrestarthillclimbing-solver'
import { SolverAnimator } from './magic-cube-animator/solver-animator'
import { LoadingSpinner as LoadingSpinner } from './components/loading-spinner'
import { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement } from 'chart.js'
import { MagicLinePlot } from './components/magic-line-plot'

function readDegree() {return Number.parseInt((document.getElementById("degree") as HTMLInputElement).value);}
function createCube(degree: number) {return CubeState.createRandomCube(degree);}
function readAlgorithmIdx() {return Number.parseInt((document.getElementById("algorithm-select") as HTMLSelectElement).value);}
function readCurrentParam(idx: number) {
  const parent = algorithmParamContainer!.children[readAlgorithmIdx()];
  const input: HTMLInputElement = parent!.children[idx].children[1] as HTMLInputElement;
  return Number.parseInt(input.value);
}

let currentCube = createCube(5);
const solverAnimator = new SolverAnimator(document.getElementById("3d-view")!);
solverAnimator.load(() => {
  solverAnimator.setCube(currentCube);
});

const solverList = [
  () => new SteepestAscentSolver(currentCube, (e) => solverAnimator.onStateChange(e)),
  () => new SidewaysMoveSolver(currentCube, (e) => solverAnimator.onStateChange(e)),
  () => new RandomRestartHillClimbingSolver(currentCube, (e) => solverAnimator.onStateChange(e)),
  () => new StochasticSolver(currentCube, (e) => solverAnimator.onStateChange(e)),
  () => new SimulatedAnnealingSolver(currentCube, (e) => solverAnimator.onStateChange(e)),
  () => new GeneticSolver(readDegree(), readCurrentParam(0), readCurrentParam(1), (e) => solverAnimator.onStateChange(e)),
];

let selectedSolver = solverList[0]();

const sliderContainer = document.getElementById("slider-container");
const playpauseCheckbox: HTMLInputElement = document.getElementById("playpause") as HTMLInputElement;
const slider: HTMLInputElement = document.getElementById("slider")! as HTMLInputElement;
solverAnimator.slider = slider;
const loadingSpinner = new LoadingSpinner(document.getElementById("loading-container")!); 
const algorithmParamContainer = document.getElementById("algorithm-param-container");

document.getElementById("algorithm-select")?.addEventListener("change", () => {
  const idx = readAlgorithmIdx();
  selectedSolver = solverList[idx]();
  for (let i = 0; i < algorithmParamContainer!.children.length; i++) {
    const child = algorithmParamContainer!.children[i];
    child.classList.remove("grid")
    child.classList.add("hidden")
  }
  algorithmParamContainer!.children[idx].classList.remove("hidden");
  algorithmParamContainer!.children[idx].classList.add("grid");

});

document.getElementById("start-button")?.addEventListener("click", async () => {
  sliderContainer?.classList.remove("flex");
  sliderContainer?.classList.add("hidden");
  playpauseCheckbox.checked = true;
  slider.value = "0";
  solverAnimator.clearAnimationStateList();
  loadingSpinner.setActive(true);

  setTimeout(() => {
    console.log("Problem:");
    console.log(currentCube);
    const solver: Solver = solverList[readAlgorithmIdx()]();
    const result = solver.solve()
    console.log("Solution:")
    console.log(result)
    solverAnimator.setCube(result);
  
    sliderContainer?.classList.remove('hidden');
    sliderContainer?.classList.add('flex');
    slider?.setAttribute('value', '0');
    loadingSpinner.setActive(false);
  }, 10)
})
document.getElementById('generate-button')?.addEventListener('click', () => {
  const degree = readDegree();
  if (degree < 2) {
    alert("Degree must be greater than 1");
    return;
  }

  currentCube = createCube(readDegree());
  solverAnimator.setCube(currentCube);
  solverAnimator.clearAnimationStateList();
  selectedSolver = solverList[readAlgorithmIdx()]();

  setTimeout(() => {
    sliderContainer?.classList.add("hidden");
    sliderContainer?.classList.remove("flex");
  }, 10);

  solverAnimator.load(() => {
    solverAnimator.setCube(currentCube);
  });
});

playpauseCheckbox?.addEventListener("change", (event) => {
  if ((event.target as HTMLInputElement).checked) {
    solverAnimator.pause();
  } else {
    solverAnimator.play();
  }
});

slider.addEventListener("input", () => {
  if (solverAnimator.isPlaying) solverAnimator.pause();
  const normalizedValue = Number.parseFloat(slider.value);
  solverAnimator.setNormalizedTime(normalizedValue);
});

// On space click, click the start-button
document.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    document.querySelector(".playpause")?.dispatchEvent(new Event("click"));
  }
});

document.getElementById("playbackspeed")?.addEventListener("change", (e: any) => {
  const val = e!.target!.value;

  if(val <= 0) {
    alert("Playback Speed must be bigger than 0");
    e.target.value = solverAnimator.playbackSpeed;
  }
  solverAnimator.setPlaybackSpeed(val);
})


const canvas: HTMLCanvasElement = document.getElementById("chart-canvas") as HTMLCanvasElement;
const magicLinePlot = new MagicLinePlot(canvas);
magicLinePlot.data.labels = ["bruh", "bruh", "bruh", "bruh", "bruh", "bruh"];
magicLinePlot.update();

const chartContainer = document.getElementById("chart-container");
document.getElementById("plot-close-button")?.addEventListener("click", () => {
  // chartContainer?.classList.add("hidden");
  chartContainer?.classList.add("invisible");
  chartContainer?.classList.remove("visible");

  chartContainer?.classList.remove("opacity-100");
  chartContainer?.classList.add("opacity-0");
})

document.getElementById("show-plot-button")?.addEventListener("click", () => {
  // chartContainer?.classList.remove("hidden");
  chartContainer?.classList.remove("invisible");
  chartContainer?.classList.add("visible");
  
  chartContainer?.classList.remove("opacity-0");
  chartContainer?.classList.add("opacity-100");
})