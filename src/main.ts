import { CubeState } from "./magic-cube/cube-state";
import { Solver } from "./magic-cube/solver";
import { StochasticSolver } from "./magic-cube/solver/stochastic-solver";
import { SteepestAscentSolver } from "./magic-cube/solver/steepestascent-solver";
import { SidewaysMoveSolver } from "./magic-cube/solver/sidwaysmove-solver";
import { SimulatedAnnealingSolver } from "./magic-cube/solver/simulatedannealing-solver";
import { GeneticSolver } from "./magic-cube/solver/genetic-solver";
import { RandomRestartHillClimbingSolver } from "./magic-cube/solver/randomrestarthillclimbing-solver";
import { SolverAnimator } from "./magic-cube-animator/solver-animator";
import { LoadingSpinner as LoadingSpinner } from "./components/loading-spinner";
import { MagicLinePlot } from "./components/magic-line-plot";
import { MagicCubeData } from "./magic-cube-animator/magic-cube-data";

function readDegree() {
  return Number.parseInt(degreeInput.value);
}
function setDegree(degree: number) {
  if (degree < 2) {
    alert("Degree must be greater than 1");
    return;
  }
  degreeInput.value = degree.toString();
}
function createCube(degree: number) {
  return CubeState.createRandomCube(degree);
}
function readAlgorithmIdx() {
  return Number.parseInt(
    (document.getElementById("algorithm-select") as HTMLSelectElement).value
  );
}
function setAlgorithmIdx(idx: number) {
  (document.getElementById("algorithm-select") as HTMLSelectElement).value =
    idx.toString();
}
function readCurrentParam(idx: number) {
  try {
    const parent = algorithmParamContainer!.children[readAlgorithmIdx()];
    const input: HTMLInputElement = parent!.children[idx]
      .children[1] as HTMLInputElement;
    return Number.parseInt(input.value);
  } catch (e) {}
  return -1;
}
function setCurrentParam(idx: number, value: number) {
  const parent = algorithmParamContainer!.children[readAlgorithmIdx()];
  const input: HTMLInputElement = parent!.children[idx]
    .children[1] as HTMLInputElement;
  input.value = value.toString();
}
function generateArrayNumbers(from: number, to: number) {
  const arr = [];
  for (let i = from; i < to; i++) arr.push(i);
  return arr;
}

let currentCube = createCube(5);
const solverAnimator = new SolverAnimator(document.getElementById("3d-view")!);
solverAnimator.load(() => {
  solverAnimator.setCube(currentCube);
});

const solverList = [
  () => new SteepestAscentSolver(currentCube, (e) => solverAnimator.onStateChange(e)),
  () => new SidewaysMoveSolver(currentCube, readCurrentParam(0), (e) => solverAnimator.onStateChange(e)),
  () => new RandomRestartHillClimbingSolver(currentCube, readCurrentParam(0), (e) => solverAnimator.onStateChange(e)),
  () => new StochasticSolver(currentCube, readCurrentParam(0), (e) => solverAnimator.onStateChange(e), (e) => solverAnimator.cubeStateSecondaryList.push(e)),
  () => new SimulatedAnnealingSolver(currentCube, (e) => solverAnimator.onStateChange(e), (e) => solverAnimator.cubeProbabilityList.push(e)),
  () => new GeneticSolver(readDegree(), readCurrentParam(0), readCurrentParam(1), (e) => solverAnimator.onStateChange(e)),
];

let selectedSolver = solverList[0]();

const sliderContainer = document.getElementById("slider-container");
const playpauseCheckbox: HTMLInputElement = document.getElementById(
  "playpause"
) as HTMLInputElement;
const slider: HTMLInputElement = document.getElementById(
  "slider"
)! as HTMLInputElement;
solverAnimator.slider = slider;
const loadingSpinner = new LoadingSpinner(
  document.getElementById("loading-container")!
);
const algorithmParamContainer = document.getElementById(
  "algorithm-param-container"
);
const resultContainer = document.getElementById("result-container");
const statusInfo = document.getElementById("status-info");
const degreeInput = document.getElementById("degree") as HTMLInputElement;
let lastMagicCubeData: MagicCubeData;

document.getElementById("algorithm-select")?.addEventListener("change", () => {
  const idx = readAlgorithmIdx();
  selectedSolver = solverList[idx]();
  for (let i = 0; i < algorithmParamContainer!.children.length; i++) {
    const child = algorithmParamContainer!.children[i];
    child.classList.remove("grid");
    child.classList.add("hidden");
  }
  algorithmParamContainer!.children[idx].classList.remove("hidden");
  algorithmParamContainer!.children[idx].classList.add("grid");
});

function applyMagicLinePlot(solver: Solver) {
  switchPlotButton?.classList.add("hidden");

    if(solver instanceof StochasticSolver) {
      magicLinePlot.setX(generateArrayNumbers(1, solverAnimator.cubeStateSecondaryList.length + 1));
      magicLinePlot.setY(solverAnimator.cubeStateSecondaryList.map(state => solver.evaluator(state)));
      magicLinePlot.update();

    } else if(solver instanceof SimulatedAnnealingSolver) {
      magicLinePlot.setX(generateArrayNumbers(1, solverAnimator.cubeStateList.length + 1));
      magicLinePlot.setY(solverAnimator.cubeStateList.map(state => solver.evaluator(state)));
      magicLinePlot.update();

      magicLinePlot2.setX(generateArrayNumbers(1, solverAnimator.cubeProbabilityList.length + 1));
      magicLinePlot2.setY(solverAnimator.cubeProbabilityList);
      magicLinePlot2.update();

      switchPlotButton?.classList.remove("hidden");

    } else {
      magicLinePlot.setX(generateArrayNumbers(1, solverAnimator.cubeStateList.length + 1));
      magicLinePlot.setY(solverAnimator.cubeStateList.map(state => solver.evaluator(state)));
      magicLinePlot.update();
    }
}

document.getElementById("start-button")?.addEventListener("click", () => {
  sliderContainer?.classList.remove("flex");
  sliderContainer?.classList.add("hidden");
  playpauseCheckbox.checked = true;
  slider.value = "0";
  solverAnimator.clearAnimationStateList();
  loadingSpinner.setActive(true);
  solverAnimator.pause();
  solverAnimator.setNormalizedTime(0);

  setTimeout(() => {
    console.log("Problem:");
    console.log(currentCube);
    const solver: Solver = solverList[readAlgorithmIdx()]();

    const startTime = performance.now();
    const result = solver.solve();
    const executionTime = performance.now() - startTime;
    const magicAmount = Solver.evaluateMagicAmount(result);

    console.log("Solution:");
    console.log(result);
    solverAnimator.setCube(result);
    applyMagicLinePlot(solver);

    let mandatoryMessage = `Time: ${executionTime.toFixed(
      2
    )} ms<br>Magic: ${magicAmount}/${result.maxAmountOfMagic}<br>Score: ${solver
      .evaluator(result)
      .toFixed(2)}`;
    let additionalMessage = "";

    if (solver.getAdditionalInformation()["numIteration"]) {
      additionalMessage +=
        "<br>Iteration Count: " +
        solver.getAdditionalInformation()["numIteration"];
    }
    if (solver.getAdditionalInformation()["stuckFrequency"]) {
      additionalMessage +=
        "<br>Stuck frequency: " +
        solver.getAdditionalInformation()["stuckFrequency"];
    }
    if (solver.getAdditionalInformation()["iterationCounter"]) {
      additionalMessage +=
        "<br>Iteration Count: " +
        solver.getAdditionalInformation()["iterationCounter"];
    }
    if (solver.getAdditionalInformation()["iterationPerRestart"]) {
      let temp = solver.getAdditionalInformation()["iterationPerRestart"];
      for (let i = 0; i < temp.length; i++) {
        additionalMessage +=
          "<br>Iteration Count on " + i + "-th restart: " + temp[i];
      }
    }

    statusInfo!.innerHTML = mandatoryMessage + additionalMessage;
  
    resultContainer?.classList.remove("hidden");
    sliderContainer?.classList.remove("hidden");
    sliderContainer?.classList.add("flex");
    slider?.setAttribute("value", "0");
    loadingSpinner.setActive(false);
    enablePlot1();


    // for saving
    const firstParam = readCurrentParam(0);
    const secondParam = readCurrentParam(1);
    const param = [];
    if (firstParam !== -1) param.push(firstParam);
    if (secondParam !== -1) param.push(secondParam);
    lastMagicCubeData = new MagicCubeData(
      readAlgorithmIdx(),
      param,
      readDegree(),
      statusInfo!.innerHTML,
      solverAnimator.cubeStateList,
      result
    );
  }, 10);
});
document.getElementById("generate-button")?.addEventListener("click", () => {
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
    resultContainer?.classList.add("hidden");
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

document
  .getElementById("playbackspeed")
  ?.addEventListener("change", (e: any) => {
    const val = e!.target!.value;

    if (val <= 0) {
      alert("Playback Speed must be bigger than 0");
      e.target.value = solverAnimator.playbackSpeed;
    }
    solverAnimator.setPlaybackSpeed(val);
  });

const canvas: HTMLCanvasElement = document.getElementById(
  "chart-canvas"
) as HTMLCanvasElement;
const magicLinePlot = new MagicLinePlot(canvas);

const canvas2: HTMLCanvasElement = document.getElementById("chart-canvas-2") as HTMLCanvasElement;
const magicLinePlot2 = new MagicLinePlot(canvas2);

const chartContainer = document.getElementById("chart-container");
document.getElementById("plot-close-button")?.addEventListener("click", () => {
  chartContainer?.classList.add("invisible");
  chartContainer?.classList.remove("visible");

  chartContainer?.classList.remove("opacity-100");
  chartContainer?.classList.add("opacity-0");
});
const showPlotButton = document.getElementById("show-plot-button");
showPlotButton?.addEventListener("click", () => {
  chartContainer?.classList.remove("invisible");
  chartContainer?.classList.add("visible");

  chartContainer?.classList.remove("opacity-0");
  chartContainer?.classList.add("opacity-100");
});

document.getElementById("export-button")?.addEventListener("click", () => {
  lastMagicCubeData.download();
});

document.getElementById("import-input")?.addEventListener("change", (e) => {
  const file = (e.target as HTMLInputElement).files![0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = e.target!.result;
    const json = JSON.parse(data as string);
    const magicCubeData: MagicCubeData = json;

    selectedSolver = solverList[magicCubeData.algorithmIdx]();
    setAlgorithmIdx(magicCubeData.algorithmIdx);
    for (let i = 0; i < magicCubeData.param.length; i++)
      setCurrentParam(i, magicCubeData.param[i]);
    setDegree(magicCubeData.degree);
    statusInfo!.innerHTML = magicCubeData.statusInfo;
    solverAnimator.cubeStateList = magicCubeData.cubeStateList.map(state => {
      const stateObj = new CubeState();
      stateObj.content = state.content;
      stateObj.from = state.from;
      stateObj.to = state.to;
      return stateObj;
    });
    solverAnimator.cubeStateSecondaryList = magicCubeData.cubeStateSecondaryList.map(state => {
      const stateObj = new CubeState();
      stateObj.content = state.content;
      stateObj.from = state.from;
      stateObj.to = state.to;
      return stateObj;
    });
    solverAnimator.cubeProbabilityList = magicCubeData.cubeProbablityList;
    solverAnimator.setCube(magicCubeData.finalState);

    lastMagicCubeData = new MagicCubeData(magicCubeData.algorithmIdx, magicCubeData.param, magicCubeData.degree, magicCubeData.statusInfo, magicCubeData.cubeStateList, magicCubeData.finalState, magicCubeData.cubeStateSecondaryList, magicCubeData.cubeProbablityList);

    magicLinePlot.update();
    statusInfo!.innerHTML = magicCubeData.statusInfo;
    applyMagicLinePlot(selectedSolver);
    
  
    resultContainer?.classList.remove("hidden");
    sliderContainer?.classList.remove("hidden");
    sliderContainer?.classList.add("flex");
    slider?.setAttribute("value", "0");
    loadingSpinner.setActive(false);
  };
  reader.readAsText(file);
});






// plot switch
const switchPlotButton = document.getElementById("switch-plot-button");
const plot1Container = document.getElementById("plot-1-container");
const plot2Container = document.getElementById("plot-2-container");
function enablePlot1() {
  plot1Container?.classList.remove("hidden");
  plot2Container?.classList.add("hidden");
  console.log("enable plot 1")
}
function enablePlot2() {
  plot1Container?.classList.add("hidden");
  plot2Container?.classList.remove("hidden");
  console.log("enable plot 2")
}

switchPlotButton?.addEventListener("click", () => {
  if(plot1Container?.classList.contains("hidden")) {
    enablePlot1();
  } else {
    enablePlot2();
  }
})