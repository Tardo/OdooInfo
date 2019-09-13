// Copyright 2019 Alexandre Díaz


(function () {
    "use strict";

    const BrowserObj = typeof chrome !== 'undefined' ? chrome : browser;
    let _lastOdooInfo = false;

    /* Refresh browser action icon */
    function refreshOdooInfo (tabId, changeInfo, tabInfo) {
        BrowserObj.browserAction.setIcon({path: 'icons/odoo-info-disabled-16.png'});
        BrowserObj.browserAction.setBadgeText({text: ''});
        /* Query for active tab */
        BrowserObj.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs.length) {
                /* Request Odoo Info */
                BrowserObj.tabs.sendMessage(tabs[0].id, {
                    message: 'update_odoo_info',
                });
            }
        });
    }

    function _updateBadgeInfo (odooInfo) {
        let icon = `icons/odoo-info${odooInfo.isOdoo && '-' || '-disabled-'}16.png`;
        let text = odooInfo.version;
        BrowserObj.browserAction.setIcon({path: icon});
        BrowserObj.browserAction.setBadgeText({text: text});

        _lastOdooInfo = odooInfo;
    }

    BrowserObj.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.message === 'update_badge_info') {
            _updateBadgeInfo(request.odooInfo);
        } else if (request.message === 'get_odoo_info') {
            sendResponse(_lastOdooInfo);
        }
    });

    BrowserObj.tabs.onUpdated.addListener(refreshOdooInfo);

})();
