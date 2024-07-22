document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
}, false);

// Disable specific key combinations
document.addEventListener('keydown', function(e) {
    // F12 key
    if (e.keyCode === 123) {
        e.preventDefault();
    }
    // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
    }
    // Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
    }
    // Ctrl+U
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
    }
}, false);



document.fonts.load("1rem Roboto");

let $bannerImg, $imgPreview, $imgDownload, $imgPreviewContainer, $imgPreviewContainerDownload, actbtn, first_form, context, downloadable, imageInput;
let cropme, hRatio, vRatio;
let cropperInclude = true;
let base_image = new Image();

function addClassBasedOnScreenSize() {
    const body = document.querySelector("#first_class");
    if (window.innerWidth < 768) {
        body.classList.add("min-h-svh");
    } else {
        body.classList.remove("min-h-svh");
    }
}

function initialize() {
    $bannerImg = document.querySelector("#banner-img");
    $imgPreview = document.querySelector("#preview-canvas");
    $imgDownload = document.querySelector("#preview-canvas-download");
    $imgPreviewContainer = document.querySelector("#preview-canvas-container");
    $imgPreviewContainerDownload = document.querySelector("#preview-canvas-container-download");
    actbtn = document.querySelector("#btn-action-group");
    first_form = document.querySelector("#first_form");
    context = $imgPreview.getContext("2d");
    downloadable = $imgDownload.getContext("2d");
    imageInput = document.querySelector("#dropzone-file");
    base_image.src = "./image-min.jpg";
    base_image.onload = function () {
        $imgPreview.setAttribute("width", base_image.width);
        $imgPreview.setAttribute("height", base_image.height);
        hRatio = $imgPreview.width / base_image.width;
        vRatio = $imgPreview.height / base_image.height;
        ratio = Math.min(hRatio, vRatio);
    };
    if (cropperInclude) {
        initializeCropme(153, 153);
    }
    setupFormListener();
    addClassBasedOnScreenSize();
}

function toggleBorder(isError) {
    const imgInputContainer = document.querySelector("#dropzone-file-container");
    imgInputContainer.classList.remove(isError ? "border-gray-300" : "border-red-500");
    imgInputContainer.classList.add(isError ? "border-red-500" : "border-gray-300");
}

function initializeCropme(Width, Height) {
    const containerAspectRatio = Width / Height;
    const cropmeConfig = {
        container: {
            width: 250,
            height: 9,
        },
        viewport: {
            width: containerAspectRatio >= 1 ? 115 : 115 * containerAspectRatio,
            height: containerAspectRatio < 1 ? 115 : 115 / containerAspectRatio,
            type: "circle",
            border: {
                width: 2.5,
                enable: true,
                color: "red",
            },
        },
        zoom: {
            enable: true,
            mouseWheel: true,
            slider: true,
            position: "right",
        },
        rotation: {
            slider: false,
            enable: false,
        },
        transformOrigin: "viewport",
    };
    const element = document.querySelector("#container");
    cropme = new Cropme(element, cropmeConfig);
    cropme.bind({ url: "../user.jpg" });
}

function calcRatio(value) {
    return (value * base_image.width) / 500;
}

function drawText(Text, x, y, fontSize, fontFamily, fontColor, textAlign, weight, style) {
    const size = calcRatio(fontSize);
    context.textBaseline = "hanging";
    context.font = `${style} ${weight} ${size}px '${fontFamily}'`;
    context.fillStyle = fontColor;
    context.textAlign = textAlign;
    context.fillText(Text, calcRatio(x) + size / 10, calcRatio(y) + size / 10);
}


async function drawCroppedImage(output) {
    return new Promise((resolve) => {
        const append_image = new Image();
        append_image.src = output;
        append_image.onload = () => {
            context.drawImage(append_image, calcRatio(160), calcRatio(169));
            resolve();
        };
    });
}

function toggleElementVisibility() {
    [$imgPreviewContainer, $bannerImg, first_form, actbtn].forEach((el) => el.classList.toggle("hidden"));
    window.scrollTo(0, 0);
}

function handleBack() {
    toggleElementVisibility();
    context.clearRect(0, 0, $imgPreview.width, $imgPreview.height);
}

function downloadCanvas() {
    const link = document.createElement("a");
    link.download = (document.querySelector('input[type="text"]').value || "post maker") + ".jpeg";
    link.href = $imgDownload.toDataURL("image/jpeg");
    link.click();
}

function shareCanvas() {
    $imgDownload.toBlob(async (blob) => {
        const file = new File([blob], (document.querySelector('input[type="text"]').value || "post maker") + ".jpeg", { type: blob.type });
        await navigator.share({ files: [file] });
    });
}

function readURL(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            cropme.bind({ url: e.target.result });
            toggleBorder(false);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function drawOnBaseImage(output) {
    context.drawImage(base_image, 0, 0, base_image.width, base_image.height, 0, 0, base_image.width * ratio, base_image.height * ratio);
    if (cropperInclude) {
        await drawCroppedImage(output, base_image);
    }
    drawText(document.querySelector('#text1').value, 250, 350, 40, 'Dancing Script', '#1F5A6E', 'center', 'bold', 'italic'); // Change the coordinates and styles here for text

    const download_image = new Image();
    download_image.src = $imgPreview.toDataURL("image/jpeg");
    download_image.onload = function () {
        $imgDownload.setAttribute("width", download_image.width);
        $imgDownload.setAttribute("height", download_image.height);
        downloadable.drawImage(download_image, 0, 0);
    };
    toggleElementVisibility();
}

function setupFormListener() {
    first_form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (cropperInclude) {
            const imageBlank = imageInput.value === "";
            toggleBorder(imageBlank);
            if (!imageBlank) {
                cropme.crop({ width: calcRatio(180) }).then(async (output) => {
                    await drawOnBaseImage(output);
                });
            }
        } else {
            await drawOnBaseImage(null);
        }
    });
}

window.addEventListener("load", initialize);
window.addEventListener("resize", addClassBasedOnScreenSize);

