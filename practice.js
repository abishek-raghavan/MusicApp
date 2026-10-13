/* =====================================
   Guitar Practice Trainer
   practice.js
=====================================*/

// ---------- DOM ----------

const bpmSlider = document.getElementById("bpmSlider");
const bpmValue = document.getElementById("bpmValue");

const timeSignature = document.getElementById("timeSignature");
const chordDuration = document.getElementById("changeBeat");

const currentChord = document.getElementById("currentChord");
const nextChord = document.getElementById("nextChord");

const beatNumber = document.getElementById("beatNumber");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

const metronome = document.getElementById("metronome");

// ---------- DATA ----------

let selectedChords =
    JSON.parse(localStorage.getItem("selectedChords")) ||
    ["C","G","Am","Em"];

// ---------- STATE ----------

let timer = null;

let audioContext = null;

let currentBeat = 1;

let beatCounter = 0;

let currentChordIndex = 0;

let nextChordIndex = 1;

let isRunning = false;

// ---------- BPM ----------

bpmValue.innerText = bpmSlider.value + " BPM";

bpmSlider.addEventListener("input",()=>{

    bpmValue.innerText = bpmSlider.value + " BPM";

});
/* =====================================
   PART 2
   Chord Engine
=====================================*/

// Generate a random chord index
function getRandomChordIndex(exclude = -1) {

    if (selectedChords.length <= 1)
        return 0;

    let index;

    do {

        index = Math.floor(Math.random() * selectedChords.length);

    } while (index === exclude);

    return index;

}

// Initialize first two chords
function initializeChords() {

    currentChordIndex = getRandomChordIndex();

    nextChordIndex = getRandomChordIndex(currentChordIndex);

    updateChordDisplay();

}

// Update UI
function updateChordDisplay() {

    currentChord.textContent =
        selectedChords[currentChordIndex];

    nextChord.textContent =
        selectedChords[nextChordIndex];

}

// Move to next chord
function changeChord() {

    currentChordIndex = nextChordIndex;

    nextChordIndex = getRandomChordIndex(currentChordIndex);

    updateChordDisplay();

    currentChord.classList.add("flash");

    setTimeout(() => {

        currentChord.classList.remove("flash");

    },250);

}

/* =====================================
   BEAT LOGIC
=====================================*/

function processBeat() {

    beatCounter++;

    // Update beat display
    beatNumber.textContent = currentBeat;

    highlightCurrentBeat();

    // Change chord after every X beats

    if (beatCounter >= Number(chordDuration.value)) {

        changeChord();

        beatCounter = 0;

    }

    currentBeat++;

    if (currentBeat > Number(timeSignature.value)) {

        currentBeat = 1;

    }

}

/* =====================================
   Beat Indicator
=====================================*/

function highlightCurrentBeat() {

    for (let i = 1; i <= 6; i++) {

        const circle = document.getElementById("b" + i);

        if (!circle)
            continue;

        if (i <= Number(timeSignature.value))
            circle.style.display = "flex";
        else
            circle.style.display = "none";

        circle.classList.remove("active");

    }

    const active =
        document.getElementById("b" + currentBeat);

    if (active)
        active.classList.add("active");

}

// Initialize display

initializeChords();

highlightCurrentBeat();

/* =====================================
   PART 3
   Metronome & Practice Timer
=====================================*/

/* ---------- METRONOME ---------- */

function playClick() {

    if (!metronome.checked)
        return;

    if (!audioContext) {

        audioContext = new (window.AudioContext || window.webkitAudioContext)();

    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.type = "square";

    // Accent the first beat
    oscillator.frequency.value =
        currentBeat === 1 ? 1000 : 700;

    gain.gain.value = 0.08;

    oscillator.start();

    oscillator.stop(audioContext.currentTime + 0.05);

}

/* ---------- TIMER ---------- */

function tick() {

    playClick();

    beatNumber.textContent = currentBeat;

    highlightCurrentBeat();

    if (beatCounter < Number(chordDuration.value)) {

        beatCounter++;

    } else {

        changeChord();

        beatCounter = 1;

    }

    currentBeat++;

    if (currentBeat > Number(timeSignature.value)) {

        currentBeat = 1;

    }

}

/* ---------- START ---------- */

function startPractice() {

    if (isRunning)
        return;

    isRunning = true;

    clearInterval(timer);

    currentBeat = 1;
    beatCounter = 0;

    initializeChords();

    beatNumber.textContent = "1";

    highlightCurrentBeat();

    const bpm = Number(bpmSlider.value);

    const intervalTime = 60000 / bpm;

    timer = setInterval(tick, intervalTime);

}

/* ---------- STOP ---------- */

function stopPractice() {

    isRunning = false;

    clearInterval(timer);

    timer = null;

}

/* ---------- BUTTON EVENTS ---------- */

startBtn.addEventListener("click", startPractice);

stopBtn.addEventListener("click", stopPractice);

/* ---------- SPACE BAR ---------- */

document.addEventListener("keydown", (event) => {

    if (event.code !== "Space")
        return;

    event.preventDefault();

    if (isRunning) {

        stopPractice();

    } else {

        startPractice();

    }

});

/* ---------- ESC ---------- */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        stopPractice();

    }

});
/* =====================================
   PART 4
   Countdown & Animations
=====================================*/

let countdownTimer = null;

/* ---------- COUNTDOWN ---------- */

function startCountdown(callback) {

    if (countdownTimer) {
        clearInterval(countdownTimer);
    }

    stopPractice();

    let count = 3;

    currentChord.textContent = "Ready";
    nextChord.textContent = "";

    beatNumber.textContent = count;

    countdownTimer = setInterval(() => {

        count--;

        if (count > 0) {

            beatNumber.textContent = count;

        }
        else if (count === 0) {

            beatNumber.textContent = "GO!";

        }
        else {

            clearInterval(countdownTimer);

            countdownTimer = null;

            callback();

        }

    }, 1000);

}

/* ---------- CHORD FLASH ---------- */

function flashChord() {

    currentChord.classList.remove("flash");

    void currentChord.offsetWidth;

    currentChord.classList.add("flash");

}

/* ---------- BEAT PULSE ---------- */

function pulseBeat() {

    const circle =
        document.getElementById("b" + currentBeat);

    if (!circle)
        return;

    circle.classList.remove("active");

    void circle.offsetWidth;

    circle.classList.add("active");

}

/* ---------- OVERRIDE PROCESSBEAT ---------- */

const originalProcessBeat = processBeat;

processBeat = function () {

    pulseBeat();

    originalProcessBeat();

};

/* ---------- OVERRIDE CHANGECHORD ---------- */

const originalChangeChord = changeChord;

changeChord = function () {

    originalChangeChord();

    flashChord();

};

/* ---------- OVERRIDE START BUTTON ---------- */

startBtn.removeEventListener("click", startPractice);

startBtn.addEventListener("click", () => {

    if (isRunning)
        return;

    startCountdown(() => {

        startPractice();

    });

});
/* =====================================
   PART 5
   Settings & Statistics
=====================================*/

let sessionStartTime = null;
let totalChordChanges = 0;

/* ---------- SETTINGS ---------- */

function saveSettings() {

    const settings = {
        bpm: bpmSlider.value,
        timeSignature: timeSignature.value,
        chordDuration: chordDuration.value,
        metronome: metronome.checked
    };

    localStorage.setItem(
        "practiceSettings",
        JSON.stringify(settings)
    );

}

function loadSettings() {

    const settings = JSON.parse(
        localStorage.getItem("practiceSettings")
    );

    if (!settings)
        return;

    bpmSlider.value = settings.bpm || 80;
    bpmValue.textContent = bpmSlider.value + " BPM";

    timeSignature.value = settings.timeSignature || 4;

    chordDuration.value = settings.chordDuration || 2;

    metronome.checked =
        settings.metronome !== false;

}

bpmSlider.addEventListener("change", saveSettings);

timeSignature.addEventListener("change", saveSettings);

chordDuration.addEventListener("change", saveSettings);

metronome.addEventListener("change", saveSettings);

loadSettings();

/* ---------- STATS ---------- */

function savePracticeStats() {

    if (!sessionStartTime)
        return;

    const stats = JSON.parse(
        localStorage.getItem("practiceStats")
    ) || {

        sessions: 0,
        totalMinutes: 0,
        chordChanges: 0

    };

    stats.sessions++;

    const minutes =
        Math.round(
            (Date.now() - sessionStartTime)
            / 60000
        );

    stats.totalMinutes += minutes;

    stats.chordChanges += totalChordChanges;

    localStorage.setItem(
        "practiceStats",
        JSON.stringify(stats)
    );

}

function printStats() {

    const stats = JSON.parse(
        localStorage.getItem("practiceStats")
    );

    if (!stats)
        return;

    console.log("========== Practice Stats ==========");

    console.log(
        "Sessions :",
        stats.sessions
    );

    console.log(
        "Minutes :",
        stats.totalMinutes
    );

    console.log(
        "Chord Changes :",
        stats.chordChanges
    );

    console.log("===================================");

}

/* ---------- TRACK CHORD CHANGES ---------- */

const previousChangeChord = changeChord;

changeChord = function () {

    previousChangeChord();

    totalChordChanges++;

};

/* ---------- TRACK START ---------- */

const previousStartPractice = startPractice;

startPractice = function () {

    totalChordChanges = 0;

    sessionStartTime = Date.now();

    previousStartPractice();

};

/* ---------- TRACK STOP ---------- */

const previousStopPractice = stopPractice;

stopPractice = function () {

    previousStopPractice();

    savePracticeStats();

    printStats();

};