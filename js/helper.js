function formatData(bytes) {
    let mag = Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024));
    let div = 1024 ** mag;
    if (bytes / div >= 1000) {
        mag++;
        div *= 1024;
    }
    return (bytes / div).toFixed(mag ? 2 : 0) + " "
         + ["", "Ki", "Mi", "Gi", "Ti", "Pi", "Ei"][mag] + "B";
}