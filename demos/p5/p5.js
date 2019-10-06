const colors = ['red','yellow','orange','green','blue','purple','grey','pink','cyan','magenta']
const frequencies = [400, 420, 440, 460, 480, 500, 520, 540, 560, 580];
const canvasW = 1900;
const canvasH = 1000;
const ellipseStates = {};
let clearTrace = false;
let randomColors = true;

function setup() {
  background(0);
  createCanvas(canvasW, canvasH);

  const patternElem = document.querySelector('#pattern');
  numCycles = document.querySelector('#numCycles');
  pattern = Pattern(patternElem.value).query(0, 1);

  pattern.forEach((elt) => {
    ellipseStates[frequencies[elt.value]] = {
      state: false,
      value: canvasH,
      x: 0
    };
  });
}

function draw() {
  if (clearTrace){
    background(0);
  }
  pattern.forEach((elt) => {
    const diameter = (elt.arc.end - elt.arc.start)*1000;
    const position = (elt.arc.start)*canvasW + diameter;
    if (randomColors){
      fill(colors[Math.floor(Math.random() * 10)]);
    }
    else {
      fill(colors[elt.value]);
    }

    if (ellipseStates[frequencies[elt.value]].state){
      ellipseStates[frequencies[elt.value]].x += random(-5, 5);
      ellipseStates[frequencies[elt.value]].value -= 5;
    }
    if (ellipseStates[frequencies[elt.value]].value <= 0){
      ellipseStates[frequencies[elt.value]].value = canvasH;
    }

    ellipse(position+ellipseStates[frequencies[elt.value]].x, ellipseStates[frequencies[elt.value]].value, diameter, diameter);
  })
}


/**
 * WEB-AUDIO-SCHEDULER FROM: https://github.com/mohayonao/web-audio-scheduler
 */


const audioContext = new AudioContext();
const sched = new WebAudioScheduler({ context: audioContext });
let masterGain = null;

function metronome(e) {
  t0 = e.playbackTime;

  pattern.forEach((elt, idx) => {
    sched.insert(t0 + elt.arc.start, ticktack, { frequency: frequencies[elt.value], duration: 1.0});
  });

  sched.insert(t0 + 1.0, metronome);
}

function ticktack(e) {
  const t0 = e.playbackTime;
  const t1 = t0 + e.args.duration;
  const osc = audioContext.createOscillator();
  const amp = audioContext.createGain();

  Object.keys(ellipseStates).forEach((key) => {
    ellipseStates[key].state = false;
  })
  ellipseStates[e.args.frequency].state = true;

  osc.frequency.value = e.args.frequency;
  osc.start(t0);
  osc.stop(t1);
  osc.connect(amp);

  amp.gain.setValueAtTime(0.5, t0);
  amp.gain.exponentialRampToValueAtTime(1e-6, t1);
  amp.connect(masterGain);

  sched.nextTick(t1, () => {
    osc.disconnect();
    amp.disconnect();
  });
}

sched.on("start", () => {
  masterGain = audioContext.createGain();
  masterGain.connect(audioContext.destination);
});

sched.on("stop", () => {
  masterGain.disconnect();
  masterGain = null;
});


/**
 * BUTTON LISTENERS
 */

document.getElementById("start-button").addEventListener("click", () => {
  clearTrace = true;
  const patternElem = document.querySelector('#pattern');
  numCycles = document.querySelector('#numCycles');
  pattern = Pattern(patternElem.value).query(0, 1);
  sched.stop(true);
  sched.start(metronome);
});

document.getElementById("stop-button").addEventListener("click", () => {
  sched.stop(true);
  Object.keys(ellipseStates).forEach((key) => {
    ellipseStates[key].state = false;
  })
});

document.getElementById("clearTrace").addEventListener("click", () => {
  clearTrace = !clearTrace
});

document.getElementById("randomColors").addEventListener("click", () => {
  randomColors = !randomColors;
})
