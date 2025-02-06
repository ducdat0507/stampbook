var elms;

function init() {
    elms = {
        menuContent: document.getElementById("menu-content"),
        bookContent: document.getElementById("book-content"),
        tooltip: document.getElementById("tooltip"),
        tabHolder: document.getElementById("tab-holder"),
    }

    document.body.ondragover = (e) => {
        e.preventDefault();
    }

    window.onresize = (e) => {
        document.body.style.setProperty("--inner-width", window.innerWidth + "px");
        document.body.style.setProperty("--inner-height", window.innerHeight + "px");
        elms.bookContent.style.setProperty("--book-scale", Math.min((window.innerWidth - 84) / 398, 1));
    }
    window.onresize();

    loadMeta();
    initTabs();
    reloadBook();
}

function doAnimation(elm, list) {
    let offset = 0;
    for (let item of list) {
        setTimeout(() => elm.classList.add(item[0] + "-animation"), (offset) * 1000)
        setTimeout(() => elm.classList.remove(item[0] + "-animation"), (offset + item[1]) * 1000);
        offset += item[1];
    }
}

function isSafeLink(url) {
    return !url.toLowerCase().trim().startsWith("javascript:");
}

function sanitizeText(notHTML) {
    return String(notHTML).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br>");
}


document.addEventListener("DOMContentLoaded", init);