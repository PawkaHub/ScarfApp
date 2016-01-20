(function() {
	'use strict';

	function DishKeyboardFocusDirective($log) {
		return {
			restrict: 'A',
			link: function(scope, elm, attrs) {
				//Maintain focus whenever it gets lost
				elm[0].addEventListener('focusout', function(e) {
					if (window.disableConstantFocus) {
						return;
					}
					//$log.log('focus lost', e);
					if (e.relatedTarget && e.relatedTarget.tagName === 'INPUT') {
						//$log.log('don\'t refocus');
						return;
					} else {
						//$log.log('refocus');
						elm[0].focus();
					}
				});
			}
		};
	};

	DishKeyboardFocusDirective.$inject = ['$log'];

	angular.module('dish.keyboard')
		.directive('constantFocus', DishKeyboardFocusDirective);
})();