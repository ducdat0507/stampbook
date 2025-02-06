tabs.prefs = (elm) => {
    elm.innerHTML = `
        <h2 class="menu-header">
            <button class="menu-close-button"></button>
            Preferences
        </h2>
    `
    let close = elm.querySelector(".menu-close-button");
    close.onclick = closeMenu;
    registerTooltip(close, x => { x.innerHTML = "<h2>Close drawer</h2>" });

    elm.insertAdjacentHTML("beforeend", `
        <details class="pull-accordion">
            <summary>Storage manager</summary>
            <h5>Usage</h5>
            <div class="storage-info">Estimating...</div>
            <div class="storage-bar"></div>
            <small>
                Note: The storage limit is enforced by your browser and may increase or decrease
                depending on your usage of this site and your device's physical storage capacity. It is also possible that
                your browser only allows storing less data than the reported limit.
                <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria#how_much_data_can_be_stored">Learn more</a>
            </small>
            <hr style="margin-block:10px">
            <h5>Persistence</h5>
            <div class="storage-persistance">Estimating...</div>
            <small>
                Request persistent storage to prevent your data from being automatically deleted by browsers.
                <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria#when_is_data_evicted">Learn more</a>
            </small>
            <div style="margin-bottom: 4px"></div>
        </details>
    `);
    navigator.storage.estimate().then((value) => {
        let storageInfo = elm.querySelector(".storage-info");
        storageInfo.innerHTML = `
            <span>${formatData(value.usage)} <small><i>used</i></small></span>
            <span class="flexible-space"></span><span>&nbsp;&sol;&nbsp;</span><span class="flexible-space"></span>
            <span>${formatData(value.quota)} <small><i>limit</i></small></span>
        `
        let storageBar = elm.querySelector(".storage-bar");
        storageBar.style.setProperty("--used", (value.usage / value.quota * 100) + "%");
    })
    navigator.storage.persisted().then((value) => {
        let storageInfo = elm.querySelector(".storage-persistance");
        storageInfo.innerHTML = `
            <span>Data is ${value ? `
                <span style="color: green">persistent</span>
            ` : `
                <span style="color: red">not persistent</span>
            `}</span>
        `
        if (!value) {
            storageInfo.insertAdjacentHTML("beforeend", "<div class='flexible-space'></div>");
            let button = document.createElement("button");
            button.onclick = () => {
                navigator.storage.persist().then(value2 => {
                    if (value2) storageInfo.innerHTML = `<span>Data is <span style="color: green">persistent</span></span>`;
                });
            }
            button.textContent = "Request persistence";
            storageInfo.append(button);
        }
    })

    elm.insertAdjacentHTML("beforeend", `
        <details class="pull-accordion">
            <summary>About</summary>
            <div style="text-align:center;margin-block:4px">
                <img style="pointer-events: none" src="res/logo.png">
                <hr style="margin-bottom:10px">
                a website by <a href="https://ducdat0507.github.io/">duducat</a>
                <hr style="margin-block:10px">
                Give feedback:<br>
                <a class="button" href="https://neocities.org/site/stampbook">Neocities profile page</a>
                <hr style="margin-block:10px">
                <button onclick="showCookieDisclaimer()">Cookie disclaimer</button>
                <hr style="margin-block:10px">
                Link to this site:<br>
                <small>(stampbook-compatible buttons&mdash;drag stamps to your favorite editor to get HTML code)</small>
                <div class="about-stamps" style="margin-block:10px">
                    <a class="stamp" href="https://ducdat0507.github.io/stampbook/"><img alt="stampbook button" src="res/share/88x31.png"></a>
                </div>
            </div>
        </details>
    `);

    elm.querySelectorAll(".about-stamps .stamp").forEach(elm => {
        elm.onclick = (e) => {
            e.preventDefault();
        }
        elm.ondragstart = (e) => {
            e.dataTransfer.clearData();
            e.target.classList.remove("stamp");
            e.dataTransfer.setData("text/plain", e.target.outerHTML);
            e.dataTransfer.setData("text/html", e.target.outerHTML);
            e.target.classList.add("stamp");
        }
    });
}