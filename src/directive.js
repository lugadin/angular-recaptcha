/*global angular, Recaptcha */
(function (ng) {
    'use strict';

    function throwNoKeyException() {
        throw new Error('You need to set the "key" attribute to your public reCaptcha key. If you don\'t have a key, please get one from https://www.google.com/recaptcha/admin/create');
    }

    var app = ng.module('vcRecaptcha');

    app.directive('vcRecaptcha', ['$document', '$timeout', 'vcRecaptchaService', 'vcReCaptcha',  function ($document, $timeout, vcRecaptcha, vcReCaptcha) {

            return {
                restrict: 'A',
                require: "?^^form",
                scope: {
                    response: '=?ngModel',
                    key: '=',
                    stoken: '=?',
                    theme: '=?',
                    size: '=?',
                    type: '=?',
                    tabindex: '=?',
                    required: '=?',
                    onCreate: '&',
                    onSuccess: '&',
                    onExpire: '&'
                },
                link: function (scope, elm, attrs, ctrl) {

                    scope.widgetId = null;

                    if (ctrl && angular.isDefined(attrs.required)) {
                        scope.$watch('required', validate);
                    }

                    var removeCreationListener = scope.$watch('key', function (key) {
                        key = key || vcReCaptcha.siteKey;
                      
                        if (!key) {
                            return;
                        }

                        if (key.length !== 40) {
                            throwNoKeyException();
                        }

                        var callback = function (gRecaptchaResponse) {
                            // Safe $apply
                            $timeout(function () {
                                scope.response = gRecaptchaResponse;
                                validate();

                                // Notify about the response availability
                                scope.onSuccess({response: gRecaptchaResponse, widgetId: scope.widgetId});
                            });
                        };

                        vcRecaptcha.create(elm[0], key, callback, {
                            stoken: scope.stoken || attrs.stoken || null,
                            theme: scope.theme || attrs.theme || vcReCaptcha.theme || null,
                            type: scope.type || attrs.type || null,
                            tabindex: scope.tabindex || attrs.tabindex || null,
                            size: scope.size || attrs.size || vcReCaptcha.size || null,
                            'expired-callback': expired

                        }).then(function (widgetId) {
                            // The widget has been created
                            validate();
                            scope.widgetId = widgetId;
                            scope.onCreate({widgetId: widgetId});

                            scope.$on('$destroy', destroy);

                        });

                        // Remove this listener to avoid creating the widget more than once.
                        removeCreationListener();
                    });

                    function destroy() {
                        if (ctrl) {
                            // reset the validity of the form if we were removed
                            ctrl.$setValidity('recaptcha', null);
                        }

                        cleanup();
                    }

                    function expired() {
                        scope.response = "";
                        validate();

                        // Notify about the response availability
                        scope.onExpire({widgetId: scope.widgetId});
                    }

                    function validate() {
                        if (ctrl) {
                            ctrl.$setValidity('recaptcha', scope.required === false ? null : Boolean(scope.response));
                        }
                    }

                    function cleanup() {
                        // removes elements reCaptcha added.
                        angular.element($document[0].querySelectorAll('.pls-container')).parent().remove();
                    }
                }
            };
        }]);

}(angular));