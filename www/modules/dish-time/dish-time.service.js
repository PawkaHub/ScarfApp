(function() {
	'use strict';

	function DishTimeService($log) {
		var self = this;
		self.active = false;

		self.show = function() {
			self.active = true;
		}

		self.hide = function() {
			self.active = false;
		}
	};

	DishTimeService.$inject = ['$log'];

	angular.module('dish.time')
		.service('dishTimeSelect', DishTimeService);
})();