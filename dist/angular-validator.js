/**
 * @name angular-validator
 *
 * @fileoverview This is an Angular module that provide form validation
 * by extending ngModelController. It allows us to define our validation rules
 * and added them as angular custom validators. It extends formController to have
 * error messages along with the status of validation.
 *
 * This module gives us the ability to leverage the flexibility of angular's custom synchronus
 * and asynchronous validators. It allows to define rules as normal functions which return
 * a JSON object with status of validation and the errorMessage, if there is.
 *
 * @author Vinit Kumar Rai
 */
'use strict';
/*jshint multistr: true */
var validator = angular.module('hiComponents.validator', []);
validator.service('hiValidatorService', [
  '$templateCache',
  function ($templateCache) {
    /**
   * This Service should act as intermediary between directive
   * and model. Model will have the validations and they register
   * their validation rules with the service, validator directive will
   * in turn ask service to trigger those validations and give back the
   * result.
   */
    var _validators = {}, defaultTemplateKey = 'hiValidatorErrorTemplate';
    /**
   * @description - Function to register validators.
   *
   * @param validator - Function object - A function object which validates the  given value.
   * @param validatorName - String - A unique name for the registered validator.
   * @param context - Object - Context in which this validator function will be invoked.
   * @param overide - Boolean - If there is already an existing validator registered with the given name,
   * should we override or throw exception. By default it will throw excception.
   */
    var _registerValidator = function (validator, validatorName, context, async, override) {
      if (validatorName in _validators && !override) {
        throw 'A validator with same name already exists. Either provide a unique name or specify override true';
      }
      _validators[validatorName] = {
        fn: validator,
        context: context,
        async: async || false
      };
    };
    /**
   * Getter function for registered validator.
   *
   * @param  {String} validator Name of registered validator
   * @return {Object}           Validator Object
   */
    var _getValidatorByName = function (validator) {
      if (validator in _validators) {
        return _validators[validator];
      }
      return null;
    };
    /**
   * Initializer function, which get executed on service initialization.
   * Here we are adding a default error template if there is no such template
   * registered in $templateCache.
   */
    var _initialize = function () {
      if (!$templateCache.get(defaultTemplateKey)) {
        $templateCache.put('hiValidatorErrorTemplate', '<div ng-repeat="(key, value) in errors" class="text-danger">' + '<span ng-bind="value.errorMessage"></span>' + '</div>');
      }
    };
    _initialize();
    return {
      register: _registerValidator,
      getValidator: _getValidatorByName
    };
  }
]);
validator.directive('hiValidate', [
  'hiValidatorService',
  '$log',
  function (hiValidatorService, $log) {
    /**
   * Angular Directive, that should be used on input element which needs to be validated.
   * You have to specify a validator name(that you have registered) using which you want
   * to validate view values.
   *
   * NOTE: You can specify more than one validator name.
   * NOTE: You can specify a mix of synchronus and asynchronous validators.
   * NOTE: All synchronus validators will be executed before any asynchronous validators.
   * NOTE: Validators will be executed in same order as you have specified in html.
   * NOTE: If any synchronus validator fails then it will stop the execution of other validators in sequence.
   */
    return {
      require: 'ngModel',
      scope: {},
      link: function (scope, element, attrs, ctrl) {
        var validators = null, forEach = angular.forEach;
        var initialize = function () {
          validators = getValidators();
          forEach(validators, function (validatorName) {
            var validator = hiValidatorService.getValidator(validatorName);
            if (validator) {
              registerValidator(validatorName, validator);
            } else {
              $log.error('No validator with name ' + validatorName + ' has been registered');
            }
          });
        };
        var registerValidator = function (validatorName, validator) {
          var validatorFn = validator.fn, context = validator.context;
          var syncValidateFn = function (modalValue, viewValue) {
            var result = validatorFn.call(context, modalValue || viewValue);
            ctrl.$error.messages[validatorName] = ctrl.$dirty ? result : {};
            return result.isValid;
          };
          var asyncValidateFn = function (modalValue, viewValue) {
            var result = validatorFn.call(context, modalValue || viewValue);
            result.then(function (resp) {
              ctrl.$error.messages[validatorName] = ctrl.$dirty ? resp : {};
            }, function (resp) {
              ctrl.$error.messages[validatorName] = ctrl.$dirty ? resp : {};
            });
            return result;
          };
          var validatorType = validator.async ? '$asyncValidators' : '$validators';
          var fn = validator.async ? asyncValidateFn : syncValidateFn;
          ctrl[validatorType][validatorName] = fn;
          ctrl.$error.messages = {};
        };
        var getValidators = function () {
          return attrs.hiValidate.split(',').map(function (v) {
            return v.trim();
          });
        };
        initialize();
      }
    };
  }
]);
validator.directive('hiValidatorMessage', function () {
  /**
   * Directive to display error message for the model specified on form.
   *
   * NOTE: You can also specify a `tpl` attribute that will be used to get an
   * already registered template from cache.
   * This means you can also specify a custom validation template.
   */
  return {
    replace: true,
    restrict: 'E',
    require: '^form',
    scope: { model: '@model' },
    templateUrl: function (elem, attrs) {
      return attrs.tpl || 'hiValidatorErrorTemplate';
    },
    link: function (scope, element, attrs, formCtrl) {
      scope.errors = formCtrl[scope.model].$error.messages;
    }
  };
});