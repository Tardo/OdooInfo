"use strict";

let origin = '';
let model = '';
let field = '';

let imageID = 0;
let numImgFailed = 0;
function loadImages (maxImagesToLoad) {
    if (!origin || !model || !field) {
        return;
    }
    const container = document.querySelector('#images');
    for (let i=0; i<maxImagesToLoad; ++i) {
        const img = document.createElement('img');
        img.src = `${origin}/web/binary/image?model=${model}&field=${field}&id=${imageID+i}`;
        img.addEventListener('error', (ev) => {
            const parent = ev.target.parentElement;
            const elfile = document.createElement('a');
            elfile.href = ev.target.src;
            elfile.classList.add('file');
            parent.removeChild(ev.target);
            const failed_html = `<span>- ERROR -<br/>#${numImgFailed++}<br/><br/>¯\\_(ツ)_/¯</span>`;
            const parser = new DOMParser();
            const parsed = parser.parseFromString(failed_html, 'text/html');
            const elms = parsed.getElementsByTagName('body');
            for (const el of elms) {
                elfile.appendChild(el);
            }
            parent.appendChild(elfile);
        });
        container.appendChild(img);
    }
    imageID += maxImagesToLoad;
    document.querySelector('#img-id').value = imageID;
}

function onScroll (ev) {
    if (document.scrollingElement.scrollTop === document.scrollingElement.scrollTopMax) {
        loadImages(50);
    }
}


window.onload = () => {
    // Get origin domain
    const search_map = new Map(
        window.location.hash.substr(1).split('&')
            .map((item) => { return item.split('='); })
        );
    origin = search_map.get('origin');
    model = search_map.get('model');
    field = search_map.get('field');
    document.querySelector('#origin').textContent = origin;
    document.querySelector('#model').textContent = model;

    // Events
    document.querySelector("#img-id").addEventListener("change", (ev) => {
        imageID = +ev.target.value;
        if (isNaN(imageID)) {
            imageID = 0;
            ev.target.value = imageID;
        }
        loadImages(50);
    }, false);

    // Load images
    loadImages(200);
}
window.addEventListener("scroll", onScroll);
