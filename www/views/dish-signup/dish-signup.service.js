(function() {
	'use strict';

	function DishSignupService($log, $timeout, dishKeyboard) {
		var self = this;
		self.active = false;

		self.show = function() {
			$log.log('show!');
			self.active = true;
			$timeout(function() {
				dishKeyboard.focusInput('firstName');
			}, 500);
		};

		self.hide = function() {
			dishKeyboard.close();
			self.active = false;
		};

		window.dishKeyboard = dishKeyboard;
	};

	DishSignupService.$inject = ['$log', '$timeout', 'dishKeyboard'];

	angular.module('dish.signup')
		.service('dishSignup', DishSignupService);
})();