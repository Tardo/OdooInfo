// Copyright 2019 Alexandre Díaz


(function() {
    "use strict";

    /* Flag to run the script once */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    const BrowserObj = typeof chrome !== 'undefined' ? chrome : browser;

    /* Helper function to inject an script */
    function _injectPageScript(script) {
        let script_page = document.createElement('script');
        (document.head || document.documentElement).appendChild(script_page);
        script_page.onload = () => {
            script_page.parentNode.removeChild(script_page);
        };
        script_page.src = BrowserObj.extension.getURL(script);
    }

    /* Shared event to update badge info */
    window.addEventListener("message", (event) => {
        // We only accept messages from ourselves
        if (event.source !== window) {
            return;
        }
        if (event.data.odooInfo && event.data.type === "UPDATE_BAGDE_INFO") {
            _sendBackgroundMessage(event.data.odooInfo);
        }
    }, false);

    /* Send santized message to background */
    function _sendBackgroundMessage(odooInfo) {
        if (typeof odooInfo !== 'object') {
            return;
        }
        BrowserObj.runtime.sendMessage({
            message: 'update_badge_info',
            odooInfo: odooInfo,
        });
    }

    BrowserObj.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.message === 'update_odoo_info') {
            _injectPageScript('page_script.js');
        }
    });
})();
