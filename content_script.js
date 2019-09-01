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
    function update_badge_info(rawData) {
        _sendSanitezBackgroundMessage(rawData);
    }
    exportFunction(update_badge_info, window, {defineAs:'update_badge_info'});

    /* Send santized message to background */
    function _sendSanitezBackgroundMessage(rawData) {
        /* Helper function that converts value to boolean */
        let value2Bool = (value) => {
            return value === "1";
        };
        browser.runtime.sendMessage({
            message: 'update_badge_info',
            odooInfo: {
                'type': rawData.type,
                'version': rawData.version,
                'username': rawData.username,
                'name': rawData.name,
                'is_system': value2Bool(rawData.isSystem),
                'is_admin': value2Bool(rawData.isAdmin),
                'database': rawData.database,
                'is_debug': value2Bool(rawData.isDebug),
                'is_testing': value2Bool(rawData.isTesting),
                'is_odoo': value2Bool(rawData.isOdoo)
            }
        });
    }

    /* Run Magin */
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.message === 'update_odoo_info') {
            _injectPageScript('page_script.js');
        }
    });
})();
