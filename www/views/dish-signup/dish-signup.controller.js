(function() {
	'use strict';

	function DishSignupController($log, dishSignup) {
		var vm = this;
		vm.user = {};

		vm.signupActive = function() {
			return dishSignup.active;
		};

		vm.signup = function() {
			$log.log('signup');
		}
	};

	DishSignupController.$inject = ['$log', 'dishSignup'];

	angular.module('dish.signup')
		.controller('dishSignupController', DishSignupController);
})();