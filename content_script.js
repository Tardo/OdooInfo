// Copyright 2019 Alexandre Díaz


(function() {
    "use strict";

    /* Flag to run the script once */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    /* Helper function to inject an script */
    function _injectPageScript(script) {
        let script_page = document.createElement('script');
        (document.head || document.documentElement).appendChild(script_page);
        script_page.onload = () => {
            script_page.parentNode.removeChild(script_page);
        };
        script_page.src = browser.extension.getURL(script);
    }

    /* Shared function to update badge info */
    function update_badge_info(odooInfo) {
        _sendSanitezBackgroundMessage(odooInfo);
    }
    /* Firefox */
    exportFunction(update_badge_info, window, {defineAs:'update_badge_info'});
    /* End Firefox */

    /* Send santized message to background */
    function _sendSanitezBackgroundMessage(odooInfo) {
        browser.runtime.sendMessage({
            message: 'update_badge_info',
            odooInfo: odooInfo,
        });
    }

    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.message === 'update_odoo_info') {
            _injectPageScript('page_script.js');
        }
    });
})();
