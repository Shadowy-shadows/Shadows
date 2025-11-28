// global audio
let audio = new Audio();
audio.loop = true;

// play selected song
function setSong(filename) {
    localStorage.setItem("selectedSong", filename);
}

// auto play if selected
window.addEventListener("load", () => {
    const song = localStorage.getItem("selectedSong");
    if (song) {
        audio.src = "media/" + song;
        audio.play().catch(() => {});
    }
});
