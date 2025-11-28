const widget = document.getElementById("musicWidget");

if (widget) {
    widget.addEventListener("click", () => {
        if (audio.paused) { audio.play(); widget.classList.remove("paused"); }
        else { audio.pause(); widget.classList.add("paused"); }
    });

    setInterval(() => {
        if (!audio.paused) widget.classList.remove("paused");
        else widget.classList.add("paused");
    }, 300);
}
