/* global browser, chrome */
// Copyright 2019-2020 Alexandre Díaz


(function () {
    "use strict";

    const BrowserObj = typeof chrome === 'undefined' ? browser : chrome;

    /* Helper function to change popup information */
    function _updateValue (selector, value, valueNotDefined) {
        let cval = false;
        if (typeof value === 'boolean') {
            cval = value ? "Yes" : "No";
        } else {
            cval = value;
        }
        document.querySelector(selector).textContent =
            cval || valueNotDefined || 'Unknown';
    }

    /* Helper function to change element visibility **/
    function _changeVisibility (selector, isVisible) {
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
        BrowserObj.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs.length) {
                const curURL = new URL(tabs[0].url);
                BrowserObj.tabs.update(tabs[0].id, {
                    url: curURL.origin + '/web',
                });
            }
        });
    }, false);

    /* Request Odoo Info */
    BrowserObj.runtime.sendMessage({message: 'get_odoo_info'}, (response) => {
        document.querySelector("#iversion").textContent = response;
        if (BrowserObj.runtime.lastError) {
            var elm_error = document.querySelector("#error-content");
            elm_error.textContent = "Unexpected error has ocurred. " +
                                    "Please, refresh the page.";
            elm_error.classList.remove("hidden");
            document.querySelector("#popup-content").classList.add("hidden");
        } else if (response) {
            if (response.isOdoo) {
                // Common Instance Values
                _updateValue("#iversion", response.version);
                _updateValue("#idebug", response.debugMethod);
                if (typeof response.database === 'object') {
                    const title = document.querySelector('#pdatabase strong');
                    title.textContent = 'Databases:';
                    _updateValue("#idatabase",
                        response.database.reverse().join(' - '));
                } else {
                    _updateValue("#idatabase", response.database);
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

                if (!response.database) {
                    _changeVisibility("#no-login", true);
                }
                _changeVisibility("#popup-content", true);
            } else {
                _changeVisibility("#error-content", true);
            }
        }
    });

}());
