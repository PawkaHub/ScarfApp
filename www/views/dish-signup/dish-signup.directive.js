(function() {
	'use strict';

	function DishSignupDirective($log) {
		return {
			restrict: 'E',
			replace: true,
			scope: {},
			controller: 'dishSignupController',
			controllerAs: 'vm',
			templateUrl: 'views/dish-signup/dish-signup.html'
		};
	};

	DishSignupDirective.$inject = ['$log'];

	angular.module('dish.signup')
		.directive('dishSignup', DishSignupDirective);
})();