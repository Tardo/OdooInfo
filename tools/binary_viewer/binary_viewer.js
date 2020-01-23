/* global Map */
// Copyright 2019-2020 Alexandre Díaz

(function () {
    "use strict";

    const INITIAL_LOAD_RECORDS_NUM = 200;
    const STEP_LOAD_RECORDS_NUM = 50;

    let origin = '';
    let model = '';
    let field = '';

    function clearAllChilds (parent) {
        let child = false;
        while ((child = parent.firstChild) !== undefined) {
            parent.removeChild(child);
        }
    }

    function safeInnerHTML (elm, html) {
        clearAllChilds(elm);
        const parser = new DOMParser();
        const parsed = parser.parseFromString(html, 'text/html');
        const elms = parsed.getElementsByTagName('body');
        for (const el of elms) {
            elm.appendChild(el);
        }
    }

    let imageID = 0;
    let numImgFailed = 0;
    function loadImages (maxImagesToLoad) {
        if (!origin || !model || !field) {
            return;
        }
        const container = document.querySelector('#images');
        for (let i=0; i<maxImagesToLoad; ++i) {
            const img = document.createElement('img');
            img.src = `${origin}/web/binary/image?model=${model}` +
                      `&field=${field}&id=${imageID+i}`;
            img.addEventListener('error', (ev) => {
                const parent = ev.target.parentElement;
                const elfile = document.createElement('a');
                elfile.href = ev.target.src;
                elfile.classList.add('file');
                safeInnerHTML(
                    elfile,
                    `<span>- ERROR -<br/>#${numImgFailed++}<br/><br/>` +
                    `¯\\_(ツ)_/¯</span>`);
                parent.removeChild(ev.target);
                parent.appendChild(elfile);
            });
            container.appendChild(img);
        }
        imageID += maxImagesToLoad;
        document.querySelector('#img-id').value = imageID;
    }

    function onScroll () {
        if (document.scrollingElement.scrollTop ===
                document.scrollingElement.scrollTopMax) {
            loadImages(STEP_LOAD_RECORDS_NUM);
        }
    }


    window.onload = () => {
        // Get origin domain
        const search_map = new Map(
            window.location.hash.substr(1).split('&')
                .map(function (item) {
                    return item.split('=');
                })
        );
        origin = search_map.get('origin');
        model = search_map.get('model');
        field = search_map.get('field');
        document.querySelector('#origin').textContent = origin;
        document.querySelector('#model').textContent = model;

        // Events
        document.querySelector("#img-id").addEventListener("change", (ev) => {
            imageID = Number(ev.target.value);
            if (isNaN(imageID)) {
                imageID = 0;
                ev.target.value = imageID;
            }
            loadImages(STEP_LOAD_RECORDS_NUM);
        }, false);

        // Load images
        loadImages(INITIAL_LOAD_RECORDS_NUM);
    };
    window.addEventListener("scroll", onScroll);
}());
