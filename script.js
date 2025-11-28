// ---- SONG SELECT PAGE ----
const songButtons = document.querySelectorAll(".song-option");

if (songButtons) {
    songButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            let selectedSong = btn.getAttribute("data-file");
            localStorage.setItem("chosenSong", selectedSong);
            window.location.href = "mainpg.html"; // go to main page
        });
    });
}

// ---- GLOBAL MUSIC PLAYER ----
let audio;
let musicBtn = document.getElementById("musicButton");
let musicIcon = document.getElementById("musicIcon");

function startMusic() {
    let selected = localStorage.getItem("chosenSong");

    if (!selected) return; // if not selected yet do nothing

    if (!audio) {
        audio = new Audio("media/" + selected);
        audio.loop = true;
    }

    audio.play();
    if (musicIcon) musicIcon.className = "fa-solid fa-pause";
}

function toggleMusic() {
    if (!audio) return;

    if (audio.paused) {
        audio.play();
        musicIcon.className = "fa-solid fa-pause";
    } else {
        audio.pause();
        musicIcon.className = "fa-solid fa-play";
    }
}

if (musicBtn) {
    musicBtn.addEventListener("click", toggleMusic);
}

// Auto-play when a page loads
window.addEventListener("load", () => {
    if (localStorage.getItem("chosenSong")) startMusic();
});


// Music bubble handler
const musicWidget = document.getElementById("musicWidget");

let isPaused = false;
musicWidget.addEventListener("click", () => {
    if (!audio) return;

    if (isPaused) {
        audio.play();
        musicWidget.classList.remove("music-paused");
        isPaused = false;
    } else {
        audio.pause();
        musicWidget.classList.add("music-paused");
        isPaused = true;
    }
});
