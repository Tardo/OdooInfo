// Copyright 2019 Alexandre Díaz


(function () {
    "use strict";

    function _writeDataset (data) {
        /* Helper function to parse value */
        const _parseValue = (value) => {
            switch (typeof value) {
                case 'boolean':
                    return value && "1" || "0";
                case 'undefined':
                    return '';
                default:
                    return value;
            }
        }

        let dataset = {};
        // Sanitize var name (is_example -> IsExample)
        for (let key of Object.keys(data)) {
            let name = key.charAt(0).toLowerCase();
            for (var i=1; i<key.length; ++i) {
                let curChar = key.charAt(i);
                if  (curChar === '_') {
                    name += key.charAt(++i).toUpperCase();
                    continue;
                }
                name += curChar;
            }
            dataset[name] = _parseValue(data[key]);
        }

        // Send data to content script
        window.update_badge_info(dataset);
    }

    function _forceOdooServerVersionDetection (data) {
        odoo.define('odooInfo.extension', function(require) {
            require('web.ajax').rpc('/jsonrpc', {
                'service': 'db',
                'method': 'server_version',
                'args': {}
            }).always(function (res) {
                if (!_.isUndefined(res)) {
                    data.version = res;
                    _writeDataset(data);
                }
            });
        });
    }


    let odooInfo = {
        'type': '',
        'version': '',
        'username': '',
        'name': '',
        'is_system': false,
        'is_admin': false,
        'database': '',
        'is_debug': false,
        'is_testing': false,
        'is_odoo': false
    };
    let sessionMap = new Map([
        ['server_version', 'version'],
        ['username', 'username'],
        ['name', 'name'],
        ['is_system', 'is_system'],
        ['is_admin', 'is_admin'],
        ['db', 'database']
    ]);

    if ('odoo' in window && 'odooVersion' in window) {
        Object.assign(odooInfo, {
            'type': window.odooVersion || '',
            'is_debug': window.odoo.debug,
            'is_testing': window.odoo.testing,
            'is_odoo': true
        });
        const odoo_session = window.odoo.session_info;
        if (odoo_session) {
            for (let key of Object.keys(odoo_session)) {
                if (sessionMap.has(key)) {
                    const key2 = sessionMap.get(key);
                    odooInfo[key2] = odoo_session[key];
                }
            }
            if (!('server_version' in odoo_session)
                    || !odoo_session.server_version) {
                _forceOdooServerVersionDetection(odooInfo);
            }
        } else {
            _forceOdooServerVersionDetection(odooInfo);
        }
    }
    _writeDataset(odooInfo);
})();
