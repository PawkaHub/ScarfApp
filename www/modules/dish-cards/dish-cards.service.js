(function() {
	'use strict';

	function DishCardsService($log) {
		var self = this;

		self.disabled = false;
		self.activeCard = false;

		self.disable = function() {
			//$log.log('disableCards');
			self.disabled = true;
		};

		self.enable = function() {
			//$log.log('enableCards');
			self.disabled = false;
		};

		self.setActiveCard = function(active) {
			self.activeCard = active;
		}
	};

	DishCardsService.$inject = ['$log'];

	angular.module('dish.cards')
		.service('dishCards', DishCardsService);
})();