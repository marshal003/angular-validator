# angular-validator

**Angular Validator** - Right way to do validation in AngularJs. This module provides a very clean and efficient way of doing Form validation by extending `ngModelController` and `ngFormController`.

# Getting Started

Download the [production version][min] or the [development version][max]

[min]: https://raw.githubusercontent.com/marshal003/angular-validator/master/dist/angular-validator.min.js

[max]: https://raw.githubusercontent.com/marshal003/angular-validator/master/dist/angular-validator.js

In your web page:

```html
<script src="angular.js"></script>
<script src="dist/angular-validator.min.js"></script>
```

OR

### Install Using Bower

```js
bower install angular-form-validator

OR from github as

bower install marshal003/git@github.com:marshal003/angular-validator.git
```

# How to use it

1. Install component by following one of the above mentioned step.
2. Inject `hiComponents.validator` module as dependency in your angular app. eg.
   ```js
   var app = angular.module('myApp', ['hiComponents.validator'])
   ```
3. Thats all, now you can define your validation rules and register them with validator component and directly use them in HTML. e.g.

  Register Your Validation Rules
  ```js

  app.controller('mainCtrl', ['$scope', 'hiValidatorService', function($scope, hiValidatorService){
    $scope.user = {};

    // My Validation Rules
    var passwordValidation = function(value) {
      var passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if(!passRegex.test(password)) {
        return {isValid: false, errorMessage: "Password must have minimum 8 characters with at least 1 alphabet & 1 numeric"};
      }
      return {isValid: true};
    }

    // Register this rule with service
    hiValidatorService.register(passwordValidation, 'validatePassword');
  }]);
  ```
  Now, you can use the registered validation in HTML as -
  ```html

  <div ng-controller='mainCtrl'>
    <form name='sampleForm'>
      <div class='form-group'>
        <input type='password' hi-validate='validatePassword' class='form-control' ng-model='user.pasword'>
        <hi-validator-message data-model='password'></hi-validator-message>
      </div>
    </form>
  </div>
  ```

# Example

1. [Simple example with synchronous validators](http://codepen.io/marshal003/pen/rxBemN).
2. [Simple example with asynchronous validators](http://codepen.io/marshal003/pen/GoKZwG?editors=101)

Other Examples are coming soon...
