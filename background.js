// Copyright 2019 Alexandre Díaz


(function () {
    "use strict";

    let _lastOdooInfo = false;
    let running = false;

    /* Refresh browser action icon */
    function refresh_odoo_info (odooInfo) {
        if (running) {
            return;
        }
        running = true;
        browser.browserAction.setIcon({path: 'icons/odoo-info-disabled-16.png'});
        browser.browserAction.setBadgeText({text: ''});
        /* Query for active tab */
        browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs.length) {
                let fallback = setTimeout(() => { running = false; }, 800);
                /* Request Odoo Info */
                browser.tabs.sendMessage(tabs[0].id, {message: 'update_odoo_info'}, (response) => {
                    clearTimeout(fallback);
                    running = false;
                });
            }
        });
    }

    function _updateBadgeInfo (odooInfo) {
        let icon = `icons/odoo-info${odooInfo.is_odoo && '-' || '-disabled-'}16.png`;
        let text = odooInfo.version;
        browser.browserAction.setIcon({path: icon});
        browser.browserAction.setBadgeText({text: text});

        _lastOdooInfo = odooInfo;
    }

    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.message === 'update_badge_info') {
            _updateBadgeInfo(request.odooInfo);
        } else if (request.message === 'get_odoo_info') {
            sendResponse(_lastOdooInfo);
        }
    });

    browser.tabs.onActivated.addListener(refresh_odoo_info);
    browser.tabs.onUpdated.addListener(refresh_odoo_info);
    browser.windows.onFocusChanged.addListener(refresh_odoo_info);

})();
