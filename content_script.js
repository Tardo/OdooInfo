/* global browser, chrome */
// Copyright 2019-2020 Alexandre Díaz


(function () {
    "use strict";

    /* Flag to run the script once */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    const BrowserObj = typeof chrome === 'undefined' ? browser : chrome;
    const OdooInfoObj = {
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

    /* Send Odoo Info to background */
    function _sendOdooInfoToBackground () {
        BrowserObj.runtime.sendMessage({
            message: 'update_badge_info',
            odooInfo: OdooInfoObj,
        });
    }

    /* Update Odoo Info */
    function _updateOdooInfo (odooInfo) {
        if (typeof odooInfo !== 'object') {
            return;
        }
        Object.assign(OdooInfoObj, odooInfo, {isLoaded: true});
        _sendOdooInfoToBackground();
    }

    /* Helper function to inject an script */
    function _injectPageScript (script) {
        const script_page = document.createElement('script');
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
    BrowserObj.runtime.onMessage.addListener((request) => {
        if (request.message === 'update_odoo_info') {
            if (OdooInfoObj.isLoaded) {
                window.postMessage({
                    type: "OBTAIN_ODOO_INFO",
                }, "*");
            } else {
                _injectPageScript('page_script.js');
            }
        }
    });
}());
