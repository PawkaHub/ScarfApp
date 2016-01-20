/*
 * angular-read-more v1.0.0
 * (c) 2014-2015 Hitesh Modha
 * License: MIT
 */

'use strict';

angular
	.module('dish.more', ['ngAnimate'])
	.directive('readMore', readMore)
	.config(function($logProvider) {
		$logProvider.debugEnabled(false);
	});

/** @ngInject */
function readMore($templateCache) {
	var directive = {
		restrict: 'AE',
		scope: {
			text: '@',
			limit: '@',
			dotsClass: '@'
		},
		template: $templateCache.get('readmore.template.html'),
		controller: ReadMoreController,
		controllerAs: 'vm',
		bindToController: true
	};

	return directive;

	/** @ngInject */
	// "bindToController: true" binds scope variables to Controller
	function ReadMoreController($filter, $scope, $log) {
		var vm = this;
		vm.toggle = {
			dots: '...',
			dotsClass: vm.dotsClass
		}

		function setShowToggle() {
			$log.debug('setShowToggle');
			vm.toggle.show = vm.moreText && vm.moreText.length > 0;
		}

		$scope.$watch('vm.dotsClass', function(newValue, oldValue) {
			if (newValue != oldValue) {
				$log.debug('DotsClass changed');
				vm.toggle.dotsClass = vm.dotsClass;
			}
		});

		// ----------

		// If negative number, set to undefined
		function validateLimit() {
			$log.debug('validateLimit');
			vm.limit = (vm.limit && vm.limit <= 0) ? undefined : vm.limit;
		}

		function getMoreTextLimit() {
			$log.debug('getMoreTextLimit');
			return vm.limit && vm.limit < vm.text.length ? vm.limit - vm.text.length : 0;
		}

		function setLessAndMoreText() {
			vm.lessText = $filter('limitTo')(vm.text, vm.limit);
			vm.moreText = $filter('limitTo')(vm.text, getMoreTextLimit());
			$log.debug('setLessAndMoreText', vm.text, vm.limit, vm.lessText, vm.moreText);
		}

		function initialize() {
			$log.debug('initialize');
			validateLimit();
			setLessAndMoreText();
			setShowToggle();
		}

		initialize();

		$scope.$watch('vm.text', function(newValue, oldValue) {
			$log.debug('vm.text', vm.text, newValue, oldValue);
			$log.debug('Text changed');
			validateLimit();
			setLessAndMoreText();
			setShowToggle();
		});

		$scope.$watch('vm.limit', function(newValue, oldValue) {
			$log.debug('vm.limit', vm.limit);
			if (newValue != oldValue) {
				$log.debug('Limit changed');
				validateLimit();
				setLessAndMoreText();
				setShowToggle();
			}
		});
	}
};

angular.module("dish.more").run(["$templateCache", function($templateCache) {
	$templateCache.put("readmore.template.html", "<span name=\"text\">\n	<span>{{ vm.lessText }}</span><span ng-show=\"vm.showMoreText\" class=\"more-show-hide\">{{ vm.moreText }}</span>\n</span>\n\n<span class=\"more\" name=\"toggle\" ng-show=\"vm.toggle.show\">\n	<span ng-class=\"vm.toggle.dotsClass\" ng-show=\"!vm.toggle.state\">{{ vm.toggle.dots }}</span>\n	<a ng-class=\"vm.toggle.linkClass\" ng-click=\"vm.doToggle()\">{{ vm.toggle.text }}</a>\n</span>\n");
}]);