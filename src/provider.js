/*global angular, Recaptcha */
(function (ng) {
    'use strict';

    var app = ng.module('vcRecaptcha');

    app.provider('vcReCaptcha', [function () {
            var siteKey, theme, size;

            this.setSiteKey = function (_siteKey) {
                siteKey = _siteKey;
            };
            this.setSize = function (_size) {
                size = _size;
            };

            this.setTheme = function (_theme) {
                theme = _theme;
            };

            this.$get = ['$document', function ($document) {

                    var s = $document[0].createElement('script');
                    var src = 'https://www.google.com/recaptcha/api.js?onload=vcRecaptchaApiLoaded&render=explicit';
                    s.type = 'application/javascript';
                    s.src = src;
                    $document[0].body.appendChild(s);

                    return {
                        theme: theme,
                        siteKey: siteKey,
                        size: size
                    };
                }];
        }])
}(angular));