// Copyright 2019 Alexandre Díaz


(function () {
    "use strict";

    /* Helper function to change popup information */
    function _updateValue(selector, value, valueNotDefined) {
        if (typeof value === 'boolean') {
            value = value && "Yes" || "No";
        }
        document.querySelector(selector).textContent = value || valueNotDefined || 'Unknown';
    }

    /* Helper function to change element visibility **/
    function _changeVisibility(selector, isVisible) {
        const elm = document.querySelector(selector);
        if (isVisible) {
            elm.classList.remove("hidden");
        } else {
            elm.classList.add("hidden");
        }
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
            if (response.isOdoo) {
                // Common Instance Values
                _updateValue("#iversion", response.version);
                _updateValue("#idatabase", response.database);
                _updateValue("#idebug", response.debugMethod);

                // Version Instance Values
                if (response.isOpenERP) {
                    _changeVisibility("#ptesting", false);
                    _changeVisibility("#itype", false);
                } else {
                    _updateValue("#itype", `(${response.type})`);
                    _updateValue("#itesting", response.isTesting);
                }

                if (response.username) {
                    // Session Values
                    _updateValue("#iusername", response.username);
                    _updateValue("#iname", response.name);
                    _updateValue("#iadmin", response.isAdmin);
                    _updateValue("#isystem", response.isSystem);
                } else {
                    _changeVisibility("#popup-content-session", false);
                }

                if (!response.username) {
                    _changeVisibility("#no-login", true);
                }
                _changeVisibility("#popup-content", true);
            } else {
                _changeVisibility("#error-content", true);
            }
        }
    });

})();
