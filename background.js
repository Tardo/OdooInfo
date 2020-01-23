/* global browser, chrome */
// Copyright 2019-2020 Alexandre Díaz


(function () {
    "use strict";

    const BrowserObj = typeof chrome === 'undefined' ? browser: chrome;
    let _lastOdooInfo = false;

    /* Refresh browser action icon */
    function refreshOdooInfo (tabId) {
        BrowserObj.browserAction.setIcon({
            path: 'icons/odoo-info-disabled-16.png',
        });
        BrowserObj.browserAction.setBadgeText({text: ''});
        // Request Odoo Info
        BrowserObj.tabs.sendMessage(tabId, {
            message: 'update_odoo_info',
        });
    }

    function _updateBadgeInfo (odooInfo) {
        const icon = 'icons/odoo-info' +
                     (odooInfo.isOdoo ? '-' : '-disabled-') +
                     '16.png';
        const text = odooInfo.version;
        BrowserObj.browserAction.setIcon({path: icon});
        BrowserObj.browserAction.setBadgeText({text: text});

        _lastOdooInfo = odooInfo;
    }

    BrowserObj.runtime.onMessage.addListener(
        (request, sender, sendResponse) => {
            if (request.message === 'update_badge_info') {
                _updateBadgeInfo(request.odooInfo);
            } else if (request.message === 'get_odoo_info') {
                sendResponse(_lastOdooInfo);
            }
        });

    BrowserObj.tabs.onUpdated.addListener(refreshOdooInfo);

}());
