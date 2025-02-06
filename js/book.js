let bookMode = "glue";

function reloadBook() {
    elms.bookContent.textContent = "";
    for (let section of book.sections) {
        if (section.type == "grid") {
            let grid;
            elms.bookContent.append(grid = makeStampGrid());

            for (let stamp of section.stamps) {
                let s = makeStamp(stamp, section.stamps);
                grid.append(s);
            }
        
            if (bookMode == "glue") {
                let slot;
                grid.append(slot = makeSlot((button) => {
                    let buttonElm = makeStamp(button, section.stamps);
                    doAnimation(buttonElm, [
                        ["add", 0.5],
                        ["shake", 0.3],
                    ]);
                    grid.append(buttonElm);
                    grid.append(slot);
                    section.stamps.push(button);
                    saveBook();
                }));    
            }
        }
    }
}

function makeStampGrid() {
    let grid = document.createElement("div");
    grid.className = "stamp-grid";
    return grid;
}

function makeSlot(onButtonDrop) {
    let slot = document.createElement("button");
    slot.className = "stamp-slot";
    slot.textContent = "+";
    slot.ondragover = (e) => {
        e.preventDefault();
    }
    slot.ondrop = (e) => {
        e.preventDefault();
        console.log(e);
        let types = e.dataTransfer.types;
        console.log(types);
        let button;
        (async () => {
            if (types.includes("text/html")) {
                let html = e.dataTransfer.getData("text/html");
                button = extractButton(html);
            } else if (types.includes("text/plain")) {
                let text = e.dataTransfer.getData("text/plain").trim();
                if (text.startsWith("<")) button = extractButton(text);
            }
            try {
                if ((image = e.dataTransfer.files[0]) && image.type.startsWith("image/")) {
                    let name = makeID();
                    await saveImage(name, image);
                    button ??= {};
                    button.name ??= image.name.substring(0, image.name.lastIndexOf("."));
                    button.file = name;
                }   
            } catch (er) {
                console.error(er);
                console.log(e.dataTransfer.files);
            }
            if (!button) return null;
            return button;
        })().then((button) => {
            if (button) onButtonDrop(button);
        });
    }
    slot.onclick = (e) => {
        let input = document.createElement("input");
        input.accept = "image/*";
        input.type = "file";
        input.oninput = async (e) => {
            let button, image;
            console.log(e);
            if ((image = e.target.files[0]) && image.type.startsWith("image/")) {
                let name = makeID();
                await saveImage(name, image);
                button ??= {};
                button.name ??= image.name.substring(0, image.name.lastIndexOf("."));
                button.file = name;
            }
            if (button) onButtonDrop(button);
        }
        input.click();
    }
    registerTooltip(slot, elm => {
        elm.innerHTML = `
            <h3><i>(empty slot)</i></h3>
            <hr>
            <small>
                Drop an image or a 1990s style link-me-button here to add a stamp<br>
                or click this slot to upload an image using your browser's file picker.
            </small>
        `
    })
    return slot;
}

function makeStamp(stamp, list) {
    let img;
    if (stamp.file) {
        img = loadImage(stamp.file);
    } else {
        img = document.createElement("img");
        img.src = stamp.img;
    }

    let parent;
    if (stamp.href) {
        parent = document.createElement("a");
        parent.className = "stamp stamp-link";
        parent.href = stamp.href;
        parent.append(img);
    } else {
        parent = document.createElement("div");
        parent.className = "stamp";
        parent.append(img);
    }
    registerTooltip(parent, elm => {
        elm.innerHTML = `
            <h3>
                ${sanitizeText(stamp.name)}
                ${stamp.href ? "<br><i style='font-weight:normal'>" + sanitizeText(stamp.href) + "</i>" : ""}
            </h3>
            ${(bookMode == "glue" || stamp.description) ? "<hr>" : ""}
            ${stamp.description ? "<blockquote>" + sanitizeText(stamp.description) + "</blockquote>" : ""}
            ${(bookMode == "glue") ? `<small>
                Click to edit this stamp.
            </small>` : ``}
        `
    })
    parent.onclick = (e) => {
        if (bookMode == "glue") {
            e.preventDefault();
            editStamp(stamp, list, parent);
        }
    }
    return parent;
}

function extractButton(html) {
    console.log(html);
    let dom = (new DOMParser()).parseFromString(html, "text/html");
    let firstChild = dom.body.firstElementChild;
    if (!firstChild) return null;
    let button = {};
    if (!["a", "img"].includes(firstChild.tagName.toLowerCase())) {
        firstChild = firstChild.firstElementChild;
        if (!firstChild) return null;
    }
    if (firstChild.tagName.toLowerCase() == "a") {
        if (firstChild.href && isSafeLink(firstChild.href)) {
            button.href = firstChild.href;
        }
        let secondChild = firstChild.querySelector("img");
        if (secondChild?.src && isSafeLink(secondChild.src)) {
            button.img = secondChild.src;
            button.name = secondChild.alt || secondChild.src.substring(secondChild.src.lastIndexOf("/") + 1, secondChild.src.lastIndexOf("."));
            button.description = secondChild.title;
        }

        if (button.img) return button;
    } else if (firstChild.tagName.toLowerCase() == "img") {
        if (firstChild?.src && isSafeLink(firstChild.src)) {
            button.img = firstChild.src;
            button.name = firstChild.alt || firstChild.src.substring(firstChild.src.lastIndexOf("/") + 1, firstChild.src.lastIndexOf("."));
            button.description = firstChild.title;
        }

        if (button.img) return button;
    }
    return null;
}

function editStamp(stamp, list, elm) {
    let nameInput, hrefInput, srcInput, descInput;
    let popup = showPopup("Edit stamp", `
        <div class="popup-form"></div>
    `, ["Cancel", "Remove", "Save"], (e) => {
        if (e == 2) {
            stamp.name = nameInput.value;
            stamp.href = hrefInput.value || undefined;
            stamp.img = srcInput.value || undefined;
            stamp.description = descInput.value || undefined;

            elm.insertAdjacentElement("afterend", makeStamp(stamp));
            elm.remove();

            saveBook();
        }
    })

    let actions = popup.querySelector(".popup-actions");
    actions.children[1].classList.add("dangerous");
    actions.children[1].onclick = () => {
        let cPopup = showPopup("Remove stamp?", `
            <small>This stamp will be lost forever!
        `, ["Cancel", "Remove"], e => {
            if (e == 1) {
                list.splice(list.indexOf(stamp, 1), 1);
                elm.remove();
                if (stamp.file) deleteImage(stamp.file);
                saveBook();
                closePopup(popup);
            }
        });
        let actions = cPopup.querySelector(".popup-actions");
        actions.children[1].classList.add("dangerous");
        let flexSpace = document.createElement("div");
        flexSpace.classList.add("flexible-space");
        actions.insertBefore(flexSpace, actions.children[1]);
    }
    let flexSpace = document.createElement("div");
    flexSpace.classList.add("flexible-space");
    actions.insertBefore(flexSpace, actions.children[1]);

    let form = popup.querySelector(".popup-form");
    
    form.insertAdjacentHTML("beforeend", `
        <h5 id="stamp-name-header"><label for="stamp-name">Name</label></h5>    
        <input id="stamp-name" type="text">
    `);
    nameInput = popup.querySelector("#stamp-name");
    nameInput.value = stamp.name;
    
    form.insertAdjacentHTML("beforeend", `
        <div style="height: 10px"></div>
        <h5 id="stamp-href-header"><label for="stamp-href">Link</label></h5>    
        <input id="stamp-href" type="text">
    `);
    hrefInput = popup.querySelector("#stamp-href");
    hrefInput.value = stamp.href ?? "";
    
    form.insertAdjacentHTML("beforeend", `
        <div style="height: 10px"></div>
        <h5 id="stamp-src-header"><label for="stamp-src">Source</label></h5>    
        <input id="stamp-src-file" type="text" readonly value="${stamp.file ? "SAVED" : "NOT SAVED"}" style="margin-bottom: 2px">
        <input id="stamp-src" type="text">
    `);
    srcInput = popup.querySelector("#stamp-src");
    srcInput.value = stamp.img ?? "";
    
    form.insertAdjacentHTML("beforeend", `
        <div style="height: 10px"></div>
        <h5 id="stamp-desc-header"><label for="stamp-desc">Description</label></h5>    
        <textarea id="stamp-desc"></textarea>
    `);
    descInput = popup.querySelector("#stamp-desc");
    descInput.value = stamp.description ?? "";
}

function setBookMode(mode) {
    if (bookMode == mode) return;
    bookMode = mode;
    reloadBook();
}