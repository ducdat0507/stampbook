function showPopup(header, content, actions, onAction = null) {
    let container = document.createElement("div");
    container.className = "popup-container";
    container.innerHTML = `
        <div class="popup">
            <h2 class="popup-header"></h2>
            <div class="popup-content"></div>
            <div class="popup-actions"></div>
        </div>
    `

    container.querySelector(".popup-header").textContent = header;
    container.querySelector(".popup-content").innerHTML = content;
    let actionBox = container.querySelector(".popup-actions");
    for (let act in actions) {
        let button = document.createElement("button");
        button.textContent = actions[act];
        button.onclick = () => {
            onAction?.(act);
            closePopup(container);
        }
        actionBox.append(button);
    }

    doAnimation(container, [["popup-show", 0.5]]);
    setTimeout(() => document.body.append(container), 0);
    return container;
}

function closePopup(container) {
    doAnimation(container, [["popup-hide", 0.5]]);
    setTimeout(() => container.remove(), 300);
}

function alert(...args) {
    let content = args.length >= 2 ? args[1] : args[0];
    let header = args.length >= 2 ? args[0] : "Notice";
    
    showPopup(header, content, ["Ok"]);
}

function showCookieDisclaimer() {
    alert("Cookie Disclaimer", `<small><article>
        <p>
            This website stores data solely for the function of the website, for example to save the contents of your stamp book
            so it won't get lost when you close your browser tab or navigate to a different page.
            <b>This website does not utilize any cross-site user tracking or advertising (I hate it just like everyone else).</b>
        </p>
        <p>
            All of your data are stored locally on your browser's storage.
        </p>
        <p>
            To prevent browsers from randomly delete the stored data of the website, 
            <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria#does_browser-stored_data_persist">persistent storage</a>
            can be requested. You might be prompted for manual approval on browsers such as Firefox.
        </p>
    </article></small>`)
}