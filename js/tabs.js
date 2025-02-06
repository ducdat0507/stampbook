let tabs = {};

function initTabs() {
    elms.modes = {};
    elms.modes.browse = makeTabButton("res/icons/browse-mode.png", (elm) => {
        elm.innerHTML = `
            <h3>Browse mode</h3>
            <hr>
            <small>
                Tamper-proof view-only mode.<br>
                If a link is attached to a stamp, clicking it will navigate to that link.
            </small>
        `
    }, () => {
        if (window.innerWidth <= 960) closeMenu();
        setBookMode("browse"); 
    })
    elms.modes.glue = makeTabButton("res/icons/glue-mode.png", (elm) => {
        elm.innerHTML = `
            <h3>Glue mode</h3>
            <hr>
            <small>
                Add, move, modify, or delete stamps.<br>
                Click on a stamp will bring up an edit prompt.
            </small>
        `
    }, () => {
        if (window.innerWidth <= 960) closeMenu();
        setBookMode("glue"); 
    })
    /*
    elms.modes.layout = makeTabButton("res/icons/layout-mode.png", (elm) => {
        elm.innerHTML = `
            <h3>Layout mode</h3>
            <hr>
            <small>
                Change the layout of your stamp book.<br>
                Drag sections around to rearrange them or click on + buttons to add new ones.
            </small>
        `
    }, () => {
        if (window.innerWidth <= 960) closeMenu();
        setBookMode("layout"); 
    })
        */

    elms.tabHolder.insertAdjacentHTML("beforeend", `<div class="flexible-space"></div>`);

    elms.tabs = {};
    elms.tabs.prefs = makeTabButton("res/icons/prefs-tab.png", (elm) => {
        elm.innerHTML = `
            <h3>Preferences</h3>
            <hr>
            <small>
                Tweak this website's settings.
            </small>
        `
    }, () => {
        navigateMenu("prefs", tabs.prefs);
    })

    updateTabStates();
}

function updateTabStates() {
    for (let mode in elms.modes) {
        let btn = elms.modes[mode];
        btn.classList.toggle("active", bookMode == mode && !currentTab);
        btn.classList.toggle("mode-active", bookMode == mode);
    }
    for (let tab in elms.tabs) {
        let btn = elms.tabs[tab];
        btn.classList.toggle("active", currentTab == tab);
    }
}

function makeTabButton(image, onTooltip, onClick) {
    let button = document.createElement("button");
    button.className = "tab";
    button.onclick = (e) => {
        onClick(e);
        updateTabStates();
    }

    let img = document.createElement("img");
    img.src = image;
    button.append(img);

    registerTooltip(button, onTooltip);
    elms.tabHolder.append(button);
    return button;
}

let currentTab = null;
function navigateMenu(name, populateFunc) {
    if (currentTab == name) return;
    currentTab = name;
    elms.menuContent.classList.add("active");
    populateFunc(elms.menuContent);
    updateTabStates();
}

function closeMenu() {
    currentTab = null;
    elms.menuContent.classList.remove("active");
    updateTabStates();
}