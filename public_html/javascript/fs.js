/**
 * Creates a file in which will be downloaded by user
 * @param {string} data Content to write to filedownload
 * @param {string} filename name of file
 * @param {string} type type of file
 */
export function download(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob)
        // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else {
        // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

/**
 * Opens a file selector window in which the user will select a file to upload to browser. The content of file will be returned
 * @returns {Promise<string>} The content of file
 */
export function openFromFileSelector() {
    let fileSelector = document.querySelector("#file-selector");
    if (fileSelector == null) {
        fileSelector = createFileSelector();
    }
    fileSelector.click();

    return new Promise((resolve, reject) => {
        fileSelector.addEventListener("change", async event => {
            const fileList = event.target.files;
            const text = await fileList[0].text();

            if (text == null) {
                reject("The file is empty");
            }
            resolve(text);
        });
    });
}

/**
 * Create an input element and append to document body
 * @returns {HTMLInputElement} The input element that was created
 */
function createFileSelector() {
    var elm = document.createElement("input");
    elm.type = "file";
    elm.id = "file-selector";
    elm.multiple = false;
    elm.style.display = "none";

    return document.body.appendChild(elm);
}
