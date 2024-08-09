function CookieAccept(settings) {
    if (settings.hasOwnProperty('cookies')) {
        for (var cookie in settings.cookies) {
            if (settings.cookies.hasOwnProperty(cookie)) {
                settings.cookies[cookie] = settings.cookies[cookie] === 'y';
            }
        }
    }

    this.settings = settings;

    this.language = {
        enabled: 'Enabled',
        declined: 'Disabled'
    };
}

CookieAccept.prototype = {
    toggle: function (accept, allowed, declined) {
        if (accept) {
            Cookies.set('exp_cookies_accepted', 'y');
            this.settings.status = this.language.enabled;
            this.callAsyncAction(this.settings.actions.set_cookies_accepted);
        } else {
            Cookies.remove('exp_cookies_accepted');
        }

        if (allowed) {
            Cookies.set('exp_cookies_allow', 'y');
            this.settings.status = this.language.enabled;
        } else {
            Cookies.remove('exp_cookies_allow');
        }

        if (declined) {
            Cookies.set('exp_cookies_declined', 'y');
            this.settings.status = this.language.declined;
            this.callAsyncAction(this.settings.actions.set_cookies_declined);
            this.deleteCookies();
        } else {
            Cookies.remove('exp_cookies_declined');
        }

        this.hide();
        this.setButtons();
    },

    callAsyncAction: function (actId) {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                return true;
            }
        };

        xhttp.open('GET', '/?ACT=' + actId);
        xhttp.send();
    },

    deleteCookies: function () {
        var document_cookies = document.cookie;
        var cookies = document_cookies.split(';');

        for (var i in cookies) {
            var cookie = cookies[i].split('=');

            if (cookie[0].trim() !== 'exp_cookies_declined') {
                Cookies.remove(cookie[0].trim());
            }
        }
    },

    hide: function () {
        var cookie = document.getElementById('cookie_accept');
        var overlay = document.getElementById('cookie_accept_settings_overlay');

        if (typeof overlay !== null) {
            overlay.style.display = 'none';
        }

        if (typeof cookie !== null) {
            cookie.style.display = 'none';
        }

        return true;
    },

    setButtons: function () {
        var buttons = [];

        var cookie = {
            accepted: Cookies.get('exp_cookies_accepted') || 'n',
            allowed: Cookies.get('exp_cookies_allow') || 'n',
            declined: Cookies.get('exp_cookies_declined') || 'n'
        };

        if (cookie.accepted === 'n' && cookie.declined === 'n') {
            buttons.push('<a href="' + this.settings.link + '" class="ca_btn">Accept</a><a href="' + this.settings.disabled_link + '" class="ca_btn_secondary">Disable</a>');
        }

        if (cookie.allowed === 'y' && cookie.declined === 'y') {
            buttons.push('<a href="' + this.settings.link + '" class="ca_btn">Enable</a>');
        }

        if (cookie.declined === 'y') {
            buttons.push('<a href="' + this.settings.link + '" class="ca_btn">Enable</a>');
        }

        if (cookie.accepted === 'y') {
            buttons.push('<a href="' + this.settings.disabled_link + '" class="ca_btn_secondary">Disable</a>');
        }

        var button_string = '';

        for (var i = 0; i < buttons.length; i++) {
            button_string += buttons[i];
        }

        var button_group = document.getElementById('ca_button_group');
        button_group.innerHTML = button_string;

        var status_button = document.getElementById('ca_status');
        status_button.innerHTML = this.settings.status;

        addButtonEventHandlers(this);

        return true;
    }
};

document.addEventListener('DOMContentLoaded', function () {
    var settings = window.ca_lang || {
        cookies: {
            accepted: false
        }
    };

    var cookie_accept = new CookieAccept(settings);

    var cookie_accept_element = document.createElement('div');
    cookie_accept_element.setAttribute('id', 'cookie_accept');
    cookie_accept_element.innerHTML = '<p><strong>Cookie Policy: </strong>' + settings.message + ' <a href="' + settings.url + '">Tell me more</a></p><p class="ca_controls"><a href="' + settings.link + '" class="ca_btn" id="ca_accept">Accept</a>&nbsp;<a href="#" class="ca_settings">Cookie Preferences</a></p><a href="#" class="ca_close" aria-label="Close cookie preferences window"></a></div>';

    var cookie_accept_overlay = document.createElement('div');
    cookie_accept_overlay.setAttribute('id', 'cookie_accept_settings_overlay');
    cookie_accept_overlay.innerHTML = '<div id="cookie_accept_settings"><h3>Cookie Preferences</h3><p>' + settings.message + '</p><div class="ca_box"><h4>Strictly Necessary Cookies (Always Enabled)</h4><p>These cookies are used to record your cookie preferences. <a href="' + settings.url + '" target="_blank">Tell me more</a></p></div><div class="ca_box"><h4>Functional &amp; Performance Cookies (<span id="ca_status"></span>)</h4><p>These cookies are used to analyse usage and to give you the best possible experience. <a href="' + settings.url + '" target="_blank">Tell me more</a></p><p class="ca_buttons" id="ca_button_group"></p></div><a href="#" class="ca_settings_close" aria-label="Close cookie settings window"></a></div>';

    document.body.appendChild(cookie_accept_element);
    document.body.appendChild(cookie_accept_overlay);

    cookie_accept.setButtons();

    if (!settings.cookies.allowed && !settings.cookies.accepted && !settings.cookies.declined) {
        $('#cookie_accept').css({
            'bottom': '-' + $(this).height()
        }).animate({
            bottom: '0'
        }, 2000);
    }

    var cookie_close = document.querySelector('.ca_close');
    cookie_close.addEventListener('click', function (event) {
        event.preventDefault();

        var cookie_accept = document.getElementById('cookie_accept');
        cookie_accept.remove();
    });

    var settings_overlay = document.getElementById('cookie_accept_settings_overlay');
    document.addEventListener('click', function (event) {
        if (event.target.id === 'cookie_accept_settings_overlay') {
            settings_overlay.style.display = 'none';
        }
    });

    var settings_button = document.querySelectorAll('.ca_settings');
    for (var i = 0; i < settings_button.length; i++) {
        settings_button[i].addEventListener('click', function (event) {
            event.preventDefault();

            settings_overlay.style.display = 'block';
            document.body.classList.add('ca_open');
        })
    }

    var settings_close_button = document.querySelector('.ca_settings_close');
    if (typeof settings_close_button != null) {
        settings_close_button.addEventListener('click', function (event) {
            event.preventDefault();
            settings_overlay.style.display = 'none';
            document.body.classList.remove('ca_open');
        })
    }

    addButtonEventHandlers(cookie_accept);
});

function addButtonEventHandlers(obj) {
    var that = obj;

    var accept_button = document.querySelectorAll('.ca_btn');
    if (typeof accept_button != null) {
        for (var i = 0; i < accept_button.length; i++) {
            accept_button[i].addEventListener('click', function (event) {
                event.preventDefault();
                that.toggle(true, false, false);
            });
        }
    }

    var decline_button = document.querySelectorAll('.ca_btn_secondary');

    if (typeof decline_button != null) {
        for (var i = 0; i < decline_button.length; i++) {
            decline_button[i].addEventListener('click', function (event) {
                event.preventDefault();
                that.toggle(false, false, true)
            })
        }
    }
}