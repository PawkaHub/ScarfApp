(function() {
	'use strict';

	function DishDrawerDirective($log) {
		return {
			restrict: 'E',
			controller: 'dishDrawerController',
			link: function($scope, $element, $attr, ctrl) {
				$element.addClass($attr.side);
				$scope.openDrawer = function() {
					//$log.log('open');
					ctrl.open();
				};
				$scope.closeDrawer = function() {
					//$log.log('close');
					ctrl.close();
				};
			}
		}
	}

	function DishDrawerCloseDirective($log) {
		return {
			restrict: 'A',
			link: function($scope, $element) {
				//$log.log('element', $element);
				$element.bind('click', function() {
					$scope.closeDrawer();
				});
			}
		}
	}

	function DishDrawerOpenDirective($log) {
		return {
			restrict: 'A',
			link: function($scope, $element, $attr, ctrl) {
				$element.bind('click', function() {
					$scope.openDrawer();
				});
			}
		}
	}

	DishDrawerDirective.$inject = ['$log'];
	DishDrawerCloseDirective.$inject = ['$log'];
	DishDrawerOpenDirective.$inject = ['$log'];

	angular.module('dish.drawer')
		.directive('dishDrawer', DishDrawerDirective)
		.directive('dishDrawerClose', DishDrawerCloseDirective)
		.directive('dishDrawerOpen', DishDrawerOpenDirective);
})();