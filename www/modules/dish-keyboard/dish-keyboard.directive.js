(function() {
	'use strict';

	function DishKeyboardDirective($log, $q, $timeout, DEBUG) {
		return {
			restrict: 'E',
			replace: true,
			link: function(scope, elm, attrs) {
				var keyboardOpen = false;
				var checkActiveElement = function() {
					var activeElement = document.activeElement;
					var attributes = activeElement.attributes;
					var type = attributes.type;
					if (type) {
						var typeValue = type.value;
						//$log.log('type', typeValue);
						if (typeValue && typeValue === 'text') {
							return true;
						}
					}
				};

				var tick = function() {
					var keyboardActive = checkActiveElement();
					//$log.log('boom', keyboardActive);
					//Add the active class if it's true, and remove it if it's false
					if (keyboardActive) {
						if (!elm.hasClass('active')) {
							//$log.log('add active');
							elm.addClass('active');
						}
					} else {
						if (elm.hasClass('active')) {
							//$log.log('remove active');
							elm.removeClass('active');
						}
					}
					ionic.requestAnimationFrame(tick);
				};

				if (DEBUG) {
					if (ionic.Platform.isAndroid()) return;
					if (ionic.Platform.isIOS()) return;
					ionic.requestAnimationFrame(tick);
				}
			},
			template: '<div class="dish-keyboard"></div>'
		};
	};

	DishKeyboardDirective.$inject = ['$log', '$q', '$timeout', 'DEBUG'];

	angular.module('dish.keyboard')
		.directive('dishKeyboard', DishKeyboardDirective);
})();