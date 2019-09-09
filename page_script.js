// Copyright 2019 Alexandre Díaz


(function () {
    "use strict";

    const OdooObj = window.openerp || window.odoo;

    let odooInfo = {
        'type': '',
        'version': '',
        'username': '',
        'name': '',
        'isSystem': false,
        'isAdmin': false,
        'database': '',
        'isDebug': false,
        'isResting': false,
        'isOdoo': false,
        'isOpenERP': Boolean('openerp' in window),
    };

    function _updateBadgeInfo () {
        // Send odooInfo to content script
        window.postMessage({ type: "UPDATE_BAGDE_INFO", odooInfo: odooInfo }, "*");
    }

    function _forceOdooServerVersionDetection () {
        var done_method = (res) => {
            if (!_.isUndefined(res)) {
                odooInfo.version = res;
                _updateBadgeInfo();
            }
        }
        const rpc_params = {
            'service': 'db',
            'method': 'server_version',
            'args': {}
        };
        if (odooInfo.isOpenERP) {
            if ('jsonRpc' in OdooObj) {
                OdooObj.jsonRpc('/jsonrpc', 'service', rpc_params)
                    .then(done_method);
            } else if ('webclient' in OdooObj && 'rpc' in OdooObj.webclient) {
                OdooObj.webclient.rpc('/jsonrpc', rpc_params)
                    .then(done_method);
            } else if ('client' in OdooObj && 'rpc' in OdooObj.client) {
                OdooObj.client.rpc('/jsonrpc', rpc_params).then(done_method);
            }
        } else if ('define' in OdooObj) {
            OdooObj.define(0, function(require) {
                require('web.ajax').rpc('/jsonrpc', rpc_params)
                    .then(done_method);
            });
        }
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
        if (!odoo_session || !('server_version' in odoo_session)
                || !odoo_session.server_version) {
            _forceOdooServerVersionDetection();
        }
    }

    _updateBadgeInfo();
})();
