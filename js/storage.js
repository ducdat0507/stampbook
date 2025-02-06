let meta, book;
let opfsRoot, metaDir, bookDir;
let localImages = {};

function newMeta() {
    return {
        current: null,
        books: {},
        prefs: {

        }
    }
}

function newBook() {
    return {
        id: makeID(),
        title: "New book",
        sections: [
            {
                type: "grid",
                stamps: [],
            }
        ],
    }
}

function makeID() {
    let alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
    let id = "";
    for (let a = 0; a < 32; a++) id += alphabet[Math.floor(Math.random() * alphabet.length)];
    return id;
}

function saveBook() {
    localStorage.setItem("stampbook-" + meta.current, JSON.stringify(book));
    meta.books[meta.current] = {
        name: book.name,
    }
    localStorage.setItem("stampbook", JSON.stringify(meta));
}

function loadMeta() {
    meta = null;
    try { meta = JSON.parse(localStorage.getItem("stampbook")); } finally {}
    if (meta) {
        deepCopy(meta, newMeta());
        loadBook();
    } else {
        meta = newMeta();
        book = newBook();
        book.title = "My first book!";
        meta.current = book.id;
    }
}

function loadBook() {
    book = null;
    try { book = JSON.parse(localStorage.getItem("stampbook-" + meta.current)); } finally {}
    if (book) {
        deepCopy(book, newBook());
    } else {
        book = newBook();
        book.id = meta.current;
    }
}

function deepCopy(target, source) {
    for (let id in source) {
        if (typeof source[id] == "object") deepCopy(target[id], source[id]);
        else target[id] ??= source[id];
    }
}

async function initFileSystem() {
    opfsRoot = await navigator.storage.getDirectory();
    metaDir = await opfsRoot.getDirectoryHandle("stampbook", {create: true});
    bookDir = await metaDir.getDirectoryHandle(meta.current, {create: true});
}

let bookDirPromise;
async function waitForBookDir() {
    if (bookDir) {
        return bookDir;
    } else if (bookDirPromise) {
        await bookDirPromise;
        return bookDir;
    }
    else {
        bookDirPromise = initFileSystem();
        await bookDirPromise;
        return bookDir;
    }
}

function loadImage(name) {
    if (localImages[name]) return localImages[name];
    let image = new Image();
    localImages[name] = image;
    waitForBookDir().then(dir => dir.getFileHandle(name)).then(han => han.getFile()).then(file => {
        if (!file) return;
        let url = URL.createObjectURL(file);
        image.onload = () => URL.revokeObjectURL(url);
        image.src = url;
    })
    return image;
}

async function saveImage(name, file) {
    const dir = await waitForBookDir();
    const file_1 = await dir.getFileHandle(name, {create: true});
    const fstream = await file_1.createWritable();
    await fstream.write(file);
    await fstream.close();
}

async function deleteImage(name) {
    delete localImages[name];
    const dir = await waitForBookDir();
    await dir.removeEntry(name);
}