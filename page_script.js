/* global Map */
// Copyright 2019-2020 Alexandre Díaz
// NOTE: Use underscore only if the page is and Odoo instance


(function () {
    "use strict";

    const OdooObj = window.odoo || window.openerp;
    const odooInfo = {};

    /* Listen messages from page script */
    window.addEventListener("message", (event) => {
        // We only accept messages from ourselves
        if (event.source !== window) {
            return;
        }
        if (event.data.type === "OBTAIN_ODOO_INFO") {
            refreshOdooInfo();
        }
    }, false);

    function _updateBadgeInfo () {
        // Send odooInfo to content script
        window.postMessage({
            type: "UPDATE_BAGDE_INFO",
            odooInfo: odooInfo,
        }, "*");
    }

    function _createRpc (url, fct_name, params, onFulfilled, onRejected) {
        if (!('args' in params)) {
            params.args = {};
        }

        $.ajax(url, {
            url: url,
            dataType: 'json',
            type: 'POST',
            data: JSON.stringify({
                jsonrpc: "2.0",
                method: fct_name,
                params: params,
                id: Math.floor(Math.random() * 1000 * 1000 * 1000),
            }),
            contentType: 'application/json',
        }).then(onFulfilled, onRejected);
    }

    function _createServiceRpc (params, onFulfilled, onRejected) {
        _createRpc('/jsonrpc', 'service', params, onFulfilled, onRejected);
    }

    function _forceOdooServerVersionDetection () {
        _createServiceRpc({
            'service': 'db',
            'method': 'server_version',
        }, (rpc_response) => {
            const version = rpc_response.result;
            if (!_.isUndefined(version) && typeof version === 'string') {
                odooInfo.version = version;
                _updateBadgeInfo();
            }
        });
    }

    function _forceOdooServerDatabases () {
        // Do rpc
        _createServiceRpc({
            'service': 'db',
            'method': 'list',
        }, (rpc_response) => {
            const databases = rpc_response.result;
            // Check rpc response
            if (!_.isUndefined(databases) && Array.isArray(databases)) {
                if (databases.length === 1) {
                    // If only one, use it instead of use the array
                    odooInfo.database = databases[0];
                } else {
                    odooInfo.database = databases;
                }
                _updateBadgeInfo();
            }
        });
    }

    function _getDebugState () {
        const search_map = new Map(
            window.location.search.substring(1).split('&')
                .map(function (item) {
                    return item.split('=');
                })
        );
        let debug = search_map.get('debug');
        if (typeof debug === 'undefined') {
            return false;
        } else if (debug !== 'assets') {
            debug = 'normal';
        }
        return debug.charAt(0).toUpperCase() + debug.substring(1).toLowerCase();
    }

    const sessionMap = new Map([
        ['server_version', 'version'],
        ['db', 'database'],
        ['username', 'username'],
        ['name', 'name'],
        ['is_system', 'isSystem'],
        ['is_admin', 'isAdmin'],
        ['is_superuser', 'isAdmin'],
    ]);
    const persistedKeys = ['server_version', 'db'];

    function refreshOdooInfo() {
        if (typeof OdooObj !== 'undefined') {
            Object.assign(odooInfo, JSON.parse(sessionStorage.getItem("odooinfo_obj", "value") || "{}"), {
                'debugMethod': _getDebugState() || OdooObj.debug || false,
                'isOdoo': true,
                'isOpenERP': Boolean('openerp' in window),
            });
            const odoo_session = OdooObj.session_info || OdooObj.session || odoo.__DEBUG__.services['web.session'] || {};
            const sessionMapKeys = sessionMap.keys();
            for (const key of sessionMapKeys) {
                const key2 = sessionMap.get(key);
                if (key in odoo_session) {
                    odooInfo[key2] = odoo_session[key];
                } else if (persistedKeys.indexOf(key) === -1) {
                    odooInfo[key2] = undefined;
                }
            }
            
            const forceDectection = () => {
                if (!odooInfo.version) {
                    _forceOdooServerVersionDetection();
                }
                if (!odooInfo.database) {
                    _forceOdooServerDatabases();
                }
            };

            try {
                OdooObj.define(0, (require) => {
                    require('web.core');
                    forceDectection();
                });
            } catch (exception) {
                forceDectection();
            }

            sessionStorage.setItem("odooinfo_obj", JSON.stringify(odooInfo));
        }
        _updateBadgeInfo();
    }
    refreshOdooInfo();
}());
