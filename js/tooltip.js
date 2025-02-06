let tooltipTimeout;
let mouseX, mouseY;

function registerTooltip(elm, tooltipFunc) {
    elm.addEventListener('pointerenter', (e) => {
        tooltipTimeout = setTimeout(() => {
            elms.tooltip.classList.add("active");
            elms.tooltip.textContent = "";

            elms.tooltip.style.left = mouseX + "px";
            elms.tooltip.style.right = "";
            elms.tooltip.style.top = mouseY + "px";
            elms.tooltip.style.bottom = "";

            tooltipFunc(elms.tooltip);

            let rect = elms.tooltip.getBoundingClientRect();
            if (rect.right + 20 > window.innerWidth) {
                elms.tooltip.style.left = "";
                elms.tooltip.style.right = (window.innerWidth - mouseX) + "px";
            }
            if (rect.bottom + 20 > window.innerHeight) {
                elms.tooltip.style.top = "";
                elms.tooltip.style.bottom = (window.innerHeight - mouseY) + "px";
            }
        }, 500)
    })
    elm.addEventListener('pointerleave', (e) => {
        elms.tooltip.classList.remove("active");
        clearTimeout(tooltipTimeout);
    })
    elm.addEventListener('pointerdown', (e) => {
        elms.tooltip.classList.remove("active");
        clearTimeout(tooltipTimeout);
    })
}

document.addEventListener("pointermove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
})