// Copyright 2019 Alexandre Díaz


(function () {
    "use strict";

    /* Helper function to change popup information */
    function _updateValue(selector, value, valueNotDefined) {
        if (typeof value === 'boolean') {
            value = value & "Yes" || "No";
        }
        document.querySelector(selector).textContent = value || valueNotDefined || 'Unknown';
    }

    /* Click event to login in the active instance */
    document.querySelector("#popup-login").addEventListener("click", (ev) => {
        ev.preventDefault();
        browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs.length) {
                let curURL = new URL(tabs[0].url);
                browser.tabs.update(tabs[0].id, {url: curURL.origin + '/web'});
            }
        });
    }, false);

    /* Request Odoo Info */
    browser.runtime.sendMessage({message: 'get_odoo_info'}, (response) => {
        document.querySelector("#iversion").textContent = response;
        if (browser.runtime.lastError) {
            var elm_error = document.querySelector("#error-content");
            elm_error.textContent = "Unexpected error has ocurred. Please, refresh the page.";
            elm_error.classList.remove("hidden");
            document.querySelector("#popup-content").classList.add("hidden");
        }
        else if (response) {
            if (response.is_odoo) {
                // Instance Values
                _updateValue("#iversion", response.version);
                _updateValue("#itype", `(${response.type})`);
                _updateValue("#idatabase", response.database);
                _updateValue("#idebug", response.is_debug);
                _updateValue("#itesting", response.is_testing);

                if (response.username) {
                    // Session Values
                    _updateValue("#iusername", response.username);
                    _updateValue("#iname", response.name);
                    _updateValue("#iadmin", response.is_admin);
                    _updateValue("#isystem", response.is_system);
                } else {
                    document.querySelector("#popup-content-session").classList.add("hidden");
                }

                if (!response.username) {
                    document.querySelector("#no-login").classList.remove("hidden");
                }
                document.querySelector("#popup-content").classList.remove("hidden");
            } else {
                document.querySelector("#error-content").classList.remove("hidden");
            }
        }
    });

})();
