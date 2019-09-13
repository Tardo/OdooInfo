// Copyright 2019 Alexandre Díaz


(function() {
    "use strict";

    /* Flag to run the script once */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    const BrowserObj = typeof chrome !== 'undefined' ? chrome : browser;
    let OdooInfoObj = {
        'type': '',
        'version': '',
        'username': '',
        'name': '',
        'isSystem': false,
        'isAdmin': false,
        'database': '',
        'isDebug': false,
        'isTesting': false,
        'isOdoo': false,
        'isLoaded': false,
    };

    /* Helper function to inject an script */
    function _injectPageScript(script) {
        let script_page = document.createElement('script');
        (document.head || document.documentElement).appendChild(script_page);
        script_page.onload = () => {
            script_page.parentNode.removeChild(script_page);
        };
        script_page.src = BrowserObj.extension.getURL(script);
    }

    /* Listen messages from page script */
    window.addEventListener("message", (event) => {
        // We only accept messages from ourselves
        if (event.source !== window) {
            return;
        }
        if (event.data.odooInfo && event.data.type === "UPDATE_BAGDE_INFO") {
            _updateOdooInfo(event.data.odooInfo);
        }
    }, false);

    /* Listen messages from background */
    BrowserObj.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.message === 'update_odoo_info') {
            if (OdooInfoObj.isLoaded) {
                _sendOdooInfoToBackground();
            } else {
                _injectPageScript('page_script.js');
            }
        }
    });

    /* Send Odoo Info to background */
    function _sendOdooInfoToBackground() {
        BrowserObj.runtime.sendMessage({
            message: 'update_badge_info',
            odooInfo: OdooInfoObj,
        });
    }

    /* Update Odoo Info */
    function _updateOdooInfo(odooInfo) {
        if (typeof odooInfo !== 'object') {
            return;
        }
        Object.assign(OdooInfoObj, odooInfo, {isLoaded: true});
        _sendOdooInfoToBackground();
    }
})();
