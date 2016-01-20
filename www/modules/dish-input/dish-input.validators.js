(function() {
	'use strict';

	function DishInputValidators($log, $window, $q, $timeout) {
		var invalid;
		return {
			restrict: 'AE',
			require: '?ngModel',
			link: function(scope, elm, attrs, ctrl) {
				//We have to wrap this in a timeout so that we can have a digest cycle pass to update the attr values from the dish-input
				elm.bind('keypress', function(e) {
					//Handle text character input limits
					if (attrs.name === 'phone') {
						if (elm.val().length >= 10) {
							e.preventDefault();
						}
					}
				});
				$timeout(function() {
					//This allows us to overwrite the default email validation for all inputs in angular, so that we can be sure we're having the same email validation app-wide
					if (attrs.type === 'email') {
						var pattern = /.+\@.+\..+/;
						ctrl.$validators.email = function(modelValue, viewValue) {
							if (pattern.test(viewValue)) {
								//$log.log('email is great', viewValue);
								return true;
							}
							return false;
						};
					}


					//$log.log('attrs.name', attrs);

					if (attrs.name === 'postalCode') {
						var pattern = /(^\d{5}(-\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$)/i;
						ctrl.$validators.postalCode = function(modelValue, viewValue) {
							//$log.log('postalCode');
							if (pattern.test(viewValue)) {
								//$log.log('postalCode is great', viewValue);
								return true;
							}
							return false;
						};
					}

					//This allows for us to check the age limits
					if (attrs.name === 'experience') {
						var maxValue = 99;
						ctrl.$validators.count = function(modelValue, viewValue) {
							//$log.log('experience validating', modelValue, viewValue);
							if (viewValue <= maxValue) {
								return true;
							}
							return false;
						}
					}
				});
			}
		};
	}

	DishInputValidators.$inject = ['$log', '$window', '$q', '$timeout'];

	angular.module('dish.input')
		.directive('input', DishInputValidators);
})();