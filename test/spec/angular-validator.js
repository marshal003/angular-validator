'use strict';

/*jshint multistr: true */
describe('hiComponents.validator', function() {

  var ele, scope, validators={};
  beforeEach(function() {
    module('hiComponents.validator', function($provide) {

    });
  });

  beforeEach(inject(function($rootScope, $compile, hiValidatorService, $templateCache) {
    scope = $rootScope.$new();
    $templateCache.put('hiValidatorErrorTemplate', '<span ng-bind="errors|json"></span>');

    var validatePassword = function(value) {
      if(!value || value.length < 5)
        return {isValid: false, errorMessage: 'Password must be of 5 character'};
      return {isValid: true};
    };

    validators.validatePassword = validatePassword;

    hiValidatorService.register(validatePassword, 'password');

    ele = angular.element('\
    <form name="testForm">\
      <div class="form-group">\
        <input type="password" name="password" ng-model="password" hi-validate="password">\
        <hi-validator-message data-model="password"></hi-validator-message>\
      </div>\
    </form>\
   ');
    $compile(ele)(scope);
    scope.$digest();
  }));

  describe('Using angular validator', function() {

    it('hi-validator-message should be replaced with span', function() {
      var errorElement = ele.find('span'); // JQLite's find is limited to tag only.
      expect(errorElement.length).toEqual(1);
    });

    it('registered password validation report erorr for password length less than 5', function() {
      var inputElement = angular.element(ele.find('input'));
      inputElement.val('pass');
      inputElement.triggerHandler('input');
      var errorElement = ele.find('span'); // JQLite's find is limited to tag only.

      expect(angular.fromJson(errorElement.text()).password.errorMessage).toEqual('Password must be of 5 character');
      console.log(angular.fromJson(errorElement.text()));
    });

    it('registered password validation report okay for password length more than 5', function() {
      var inputElement = angular.element(ele.find('input'));
      inputElement.val('passw');
      inputElement.triggerHandler('input');
      var errorElement = ele.find('span'); // JQLite's find is limited to tag only.

      expect(angular.fromJson(errorElement.text()).password.isValid).toEqual(true);
      console.log(angular.fromJson(errorElement.text()));
    });

  });
});
