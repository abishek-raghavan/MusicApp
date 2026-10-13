/* ===========================
   Guitar Practice Trainer
   chords.js
=========================== */

const chords = [
    // Major
    { name: "C", type: "major" },
    { name: "D", type: "major" },
    { name: "E", type: "major" },
    { name: "F", type: "major" },
    { name: "G", type: "major" },
    { name: "A", type: "major" },
    { name: "B", type: "major" },

    // Minor
    { name: "Am", type: "minor" },
    { name: "Bm", type: "minor" },
    { name: "Cm", type: "minor" },
    { name: "Dm", type: "minor" },
    { name: "Em", type: "minor" },
    { name: "Fm", type: "minor" },
    { name: "Gm", type: "minor" },

    // Seventh
    { name: "A7", type: "7th" },
    { name: "B7", type: "7th" },
    { name: "C7", type: "7th" },
    { name: "D7", type: "7th" },
    { name: "E7", type: "7th" },
    { name: "F7", type: "7th" },
    { name: "G7", type: "7th" },

    // Suspended
    { name: "Asus2", type: "sus" },
    { name: "Asus4", type: "sus" },
    { name: "Dsus2", type: "sus" },
    { name: "Dsus4", type: "sus" },
    { name: "Gsus4", type: "sus" },

    // Power
    { name: "A5", type: "power" },
    { name: "C5", type: "power" },
    { name: "D5", type: "power" },
    { name: "E5", type: "power" },
    { name: "G5", type: "power" }
];

const grid = document.getElementById("chordGrid");
const counter = document.getElementById("count");
const search = document.getElementById("search");
const filter = document.getElementById("filter");

let selected = JSON.parse(localStorage.getItem("selectedChords")) || [];

function saveSelection() {
    localStorage.setItem("selectedChords", JSON.stringify(selected));
}

function updateCounter() {
    counter.textContent = selected.length;
}

function createCard(chord) {

    const card = document.createElement("div");
    card.className = "chord-card";

    const checked = selected.includes(chord.name);

    card.innerHTML = `
        <h2>${chord.name}</h2>

        <div class="diagram">
            🎸
        </div>

        <p>${chord.type.toUpperCase()}</p>

        <label>

            <input
                type="checkbox"
                ${checked ? "checked" : ""}
            >

            I know this chord

        </label>
    `;

    const checkbox = card.querySelector("input");

    checkbox.addEventListener("change", function () {

        if (this.checked) {

            if (!selected.includes(chord.name))
                selected.push(chord.name);

        } else {

            selected = selected.filter(c => c !== chord.name);

        }

        saveSelection();
        updateCounter();

    });

    return card;

}

function render() {

    grid.innerHTML = "";

    const keyword = search.value.toLowerCase();

    const category = filter.value;

    chords
        .filter(chord => {

            const matchesSearch =
                chord.name.toLowerCase().includes(keyword);

            const matchesCategory =
                category === "all" ||
                chord.type === category;

            return matchesSearch && matchesCategory;

        })
        .forEach(chord => {

            grid.appendChild(createCard(chord));

        });

}

search.addEventListener("input", render);

filter.addEventListener("change", render);

document
.getElementById("clearBtn")
.addEventListener("click", () => {

    if (!confirm("Clear all selected chords?"))
        return;

    selected = [];

    saveSelection();

    render();

    updateCounter();

});

document
.getElementById("practiceBtn")
.addEventListener("click", () => {

    if (selected.length < 2) {

        alert("Please select at least two chords.");

        return;

    }

    window.location.href = "practice.html";

});

updateCounter();

render();
