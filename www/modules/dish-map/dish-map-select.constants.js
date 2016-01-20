(function() {
	'use strict';

	function DishMapSelectDirective($log) {
		return {
			restrict: 'E',
			replace: true,
			scope: {},
			controller: 'dishMapController',
			controllerAs: 'vm',
			templateUrl: 'modules/dish-map/dish-map-select.html'
		}
	};

	DishMapSelectDirective.$inject = ['$log'];

	angular.module('dish.map')
		.directive('dishMapSelect', DishMapSelectDirective);
})();