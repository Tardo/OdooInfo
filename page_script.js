// Copyright 2019 Alexandre Díaz
// NOTE: Use underscore only if the page is and Odoo instance


(function () {
    "use strict";

    const OdooObj = window.odoo || window.openerp;
    let odooInfo = {};

    function _updateBadgeInfo () {
        // Send odooInfo to content script
        window.postMessage({
            type: "UPDATE_BAGDE_INFO",
            odooInfo: odooInfo
        }, "*");
    }

    function _createRpc (url, fct_name, params, onFulfilled, onRejected) {
        if (!('args' in params)) {
            params.args = {};
        }
        if (odooInfo.isOpenERP) {
            if ('jsonRpc' in OdooObj) {
                OdooObj.jsonRpc(url, fct_name, params).then(onFulfilled, onRejected);
            } else if ('webclient' in OdooObj && 'rpc' in OdooObj.webclient) {
                OdooObj.webclient.rpc(url, params).then(onFulfilled, onRejected);
            } else if ('client' in OdooObj && 'rpc' in OdooObj.client) {
                OdooObj.client.rpc(url, params).then(onFulfilled, onRejected);
            }
        } else if ('define' in OdooObj) {
            OdooObj.define(0, function(require) {
                var ajax = require('web.ajax');
                if ('rpc' in ajax) {
                    ajax.rpc(url, params).then(onFulfilled, onRejected);
                } else if ('jsonRpc' in ajax) {
                    ajax.jsonRpc(url, fct_name, params).then(onFulfilled, onRejected);
                }
            });
        }
    }

    // function _createModelRpc (params, onFulfilled, onRejected) {
    //     _createRpc('/web/dataset/call_kw', 'call', params, onFulfilled, onRejected);
    // }

    function _createServiceRpc (params, onFulfilled, onRejected) {
        _createRpc('/jsonrpc', 'service', params, onFulfilled, onRejected);
    }

    function _forceOdooServerVersionDetection () {
        _createServiceRpc({
            'service': 'db',
            'method': 'server_version',
        }, (version) => {
            if (!_.isUndefined(version) && typeof version === 'string') {
                odooInfo.version = version;
                _updateBadgeInfo();
            }
        });
    }

    const orig_console_error_func = console.error;
    function _forceOdooServerDatabases () {
        // Monkey Patch to hide access denied error
        console.error = () => {};
        // Do rpc
        _createServiceRpc({
            'service': 'db',
            'method': 'list',
        }, (databases) => {
            // Revert Monkey Patch
            console.error = orig_console_error_func;
            // Check rpc response
            if (!_.isUndefined(databases) && typeof databases === 'object') {
                if (databases.length === 1) {
                    // If only one, use it instead of use the array
                    databases = databases[0];
                }
                odooInfo.database = databases;
                _updateBadgeInfo();
            }
        }, () => {
            // Revert Monkey Patch
            console.error = orig_console_error_func;
        });
    }

    function _getDebugState () {
        const search_map = new Map(
            window.location.search.substr(1).split('&')
                .map((item) => { return item.split('='); })
        );
        let debug = search_map.get('debug');
        if (typeof debug === 'undefined') {
            return false;
        } else if (debug !== 'assets') {
            debug = 'normal';
        }
        return debug.charAt(0).toUpperCase() + debug.substr(1).toLowerCase();
    }

    let sessionMap = new Map([
        ['server_version', 'version'],
        ['username', 'username'],
        ['name', 'name'],
        ['is_system', 'isSystem'],
        ['is_admin', 'isAdmin'],
        ['db', 'database'],
        ['is_superuser', 'isAdmin'],
    ]);

    if (typeof OdooObj !== 'undefined') {
        Object.assign(odooInfo, {
            'isTesting': OdooObj.testing,
            'debugMethod': _getDebugState() || OdooObj.debug || false,
            'isOdoo': true,
            'isOpenERP': Boolean('openerp' in window),
        });
        const odoo_session = OdooObj.session_info;
        if (odoo_session) {
            for (let key of Object.keys(odoo_session)) {
                if (sessionMap.has(key)) {
                    const key2 = sessionMap.get(key);
                    odooInfo[key2] = odoo_session[key];
                }
            }
        }
        if (!odooInfo.version) {
            _forceOdooServerVersionDetection();
        }
        if (!odooInfo.database) {
            _forceOdooServerDatabases();
        }
    }

    _updateBadgeInfo();
})();
