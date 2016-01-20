(function() {
	'use strict';

	function DishMapService($log) {
		var self = this;
		self.active = false;

		self.show = function() {
			self.active = true;
		}

		self.hide = function() {
			self.active = false;
		}

		self.setLocation = function(location) {
			self.location = location;
		}
	};

	DishMapService.$inject = ['$log'];

	angular.module('dish.map')
		.service('dishMapSelect', DishMapService);
})();